import GanacheBlockchain from 'ganache-core/lib/blockchain_double'
import VM from 'ethereumjs-vm'
import Block from 'ethereumjs-block'
import { Transaction } from 'ethereumjs-tx'
import { RunBlockResult } from 'ethereumjs-vm/dist/runBlock'
import { CONTRACT_ADDRESS } from '@evilink/constant'
import { vrfCoordinatorFactory } from '@evilink/contracts-chainlink'
import { hexZeroPad } from '@ethersproject/bytes'
import Emittery from 'emittery'
import RandomnessHacker from './randomness-hacker'
import { RandomnessRequestEvent, RandomnessRequest } from './chainlink/type'
import { decodeRawReceiptLog, copyVm } from '../util/ethereum'
import logger from '../util/logger'

type ProcessBlockResult = RunBlockResult & {
  transactions: Transaction[]
}

type ProcessBlockDryRunResult = ProcessBlockResult & {
  dryRanVm: VM
}

class Blockchain extends GanacheBlockchain {
  static logger = logger.child({ prefix: Blockchain.name })

  static TOPIC_RANDOMNESS_REQUEST = vrfCoordinatorFactory.interface.getEventTopic(
    'RandomnessRequest',
  )

  static findRandomnessRequestEvent(
    result: ProcessBlockResult,
  ): RandomnessRequestEvent | undefined {
    if (result.receipts.length === 0) {
      throw new Error('unexpected empty receipt')
    }
    if (result.receipts.length > 1) {
      throw new Error(
        'multiple transaction in single block is not supported yet',
      )
    }

    const logs = result.receipts[0].logs
      ?.map(decodeRawReceiptLog)
      .filter(
        ({ address, topics: [topic] }) =>
          address === CONTRACT_ADDRESS.VRF_COORDINATOR &&
          topic === Blockchain.TOPIC_RANDOMNESS_REQUEST,
      )
    if (logs.length > 1) {
      throw new Error(
        'multiple randomness reuqested in single transaction is not supported yet',
      )
    }

    if (logs.length === 1) {
      const { args: event } = vrfCoordinatorFactory.interface.parseLog(logs[0])
      return {
        keyHash: event[0],
        preSeed: hexZeroPad(event[1], 32),
        senderAddress: event[3].toLowerCase(),
        fee: event[4],
        requestId: event[5],
      }
    }

    return undefined
  }

  private randomnessHacker: RandomnessHacker

  private emittery: Emittery<{
    randomnessRequest: RandomnessRequest
  }>

  constructor(options, randomnessHacker: RandomnessHacker) {
    super(options)
    this.randomnessHacker = randomnessHacker
    this.emittery = new Emittery()
  }

  async processBlock(
    vm: VM,
    block: Block,
    commit: boolean,
    callback: (...args: any[]) => any,
  ) {
    Blockchain.logger.trace(`processBlock: ${JSON.stringify(block, null, 2)}`)

    try {
      const { dryRanVm, ...result } = await this.processBlockDryRun(
        copyVm(vm),
        block,
      )

      const randomnessRequestEvent = Blockchain.findRandomnessRequestEvent(
        result,
      )
      if (randomnessRequestEvent) {
        // eslint-disable-next-line no-param-reassign
        block.header.stateRoot = dryRanVm.stateManager._trie.root
        const randomnessRequest = {
          block,
          event: randomnessRequestEvent,
        }

        await this.randomnessHacker.hack(dryRanVm, randomnessRequest)

        this.emittery.emit('randomnessRequest', randomnessRequest)
      }
    } catch (error) {
      Blockchain.logger.error(`processBlock: ${error}`)
    }

    await super.processBlock(vm, block, commit, callback)
  }

  async processBlockDryRun(
    vm: VM,
    block: Block,
  ): Promise<ProcessBlockDryRunResult> {
    return new Promise<ProcessBlockDryRunResult>((resolve, reject) => {
      super.processBlock(
        vm,
        block,
        false,
        (
          vmerr: any,
          transactions: Transaction[],
          runBlockResult: RunBlockResult,
        ) => {
          if (vmerr) {
            reject(vmerr)
          } else {
            resolve({ dryRanVm: vm, transactions, ...runBlockResult })
          }
        },
      )
    })
  }

  onRandomnessRequest(callback: (data: RandomnessRequest) => void) {
    this.emittery.on('randomnessRequest', callback)
  }
}

export default Blockchain
