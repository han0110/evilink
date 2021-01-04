import VM from 'ethereumjs-vm'
import Block from 'ethereumjs-block'
import { Transaction } from 'ethereumjs-tx'
import { RunBlockResult } from 'ethereumjs-vm/dist/runBlock'
import GanacheBlockchain from 'ganache-core/lib/blockchain_double'
import RandomnessHacker from './randomness-hacker'
import { IChainlink } from './chainlink'
import { doecdeReceiptLog, copyVm } from '../util/ethereum'
import logger from '../util/logger'

type ProcessBlockResult = RunBlockResult & {
  transactions: Transaction[]
}

class Blockchain extends GanacheBlockchain {
  private randomnessHacker: RandomnessHacker

  constructor(options, randomnessHacker: RandomnessHacker) {
    super(options)
    this.randomnessHacker = randomnessHacker
  }

  async processBlock(
    vm: VM,
    block: Block,
    commit: boolean,
    callback: (...args: any[]) => any,
  ) {
    logger.trace(`processBlock: ${JSON.stringify(block, null, 2)}`)

    const originalVm = copyVm(vm)

    try {
      const result = await new Promise<ProcessBlockResult>((resolve, reject) =>
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
              resolve({ transactions, ...runBlockResult })
            }
          },
        ),
      )

      if (result.receipts.length === 0) {
        throw new Error('unexpected empty receipt')
      }
      if (result.receipts.length > 1) {
        throw new Error(
          'multiple transaction in single block is not supported yet',
        )
      }

      const receipt = {
        ...result.receipts[0],
        logs: result.receipts[0].logs?.map(doecdeReceiptLog) ?? [],
      }

      const logs = receipt.logs.filter(
        ({ topics: [topic] }) => topic === IChainlink.TOPIC_RANDOMNESS_REQUEST,
      )
      if (logs.length > 1) {
        throw new Error(
          'multiple randomness reuqested in single transaction is not supported yet',
        )
      }
      if (logs.length === 1) {
        // eslint-disable-next-line no-underscore-dangle, no-param-reassign
        block.header.stateRoot = vm.stateManager._trie.root
        await this.randomnessHacker.hack(copyVm(vm), block.header, logs[0])
      }
    } catch (error) {
      logger.error(`processBlock: ${error}`)
    }

    await super.processBlock(originalVm, block, commit, callback)
  }
}

export default Blockchain
