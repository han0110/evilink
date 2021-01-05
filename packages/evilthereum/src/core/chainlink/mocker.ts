import GanacheStateManager from 'ganache-core/lib/statemanager'
import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'
import { vrfCoordinatorFactory } from '@evilink/contracts-chainlink'
import { RandomnessRequest, IChainlink } from './type'
import { ADDRESS_VRF_COORDINATOR, GAS_LIMIT } from '../../util/constant'
import logger from '../../util/logger'

export class ChainlinkMocker extends IChainlink {
  static logger = logger.child({ prefix: ChainlinkMocker.name })

  private chainId: number

  private stateManager: GanacheStateManager

  constructor(key: string, chainId: number) {
    super({ key, jobId: '0'.repeat(32) })
    this.chainId = chainId
  }

  setStateManager(stateManager: GanacheStateManager) {
    this.stateManager = stateManager
  }

  async onRandomnessRequest(
    randomnessReqest: RandomnessRequest,
  ): Promise<void> {
    if (!this.stateManager) {
      throw new Error('unexpected called before setStateManager')
    }

    const { packedForContractInput: proof } = this.generateProof(
      randomnessReqest.event.preSeed,
      randomnessReqest.block.header.hash().toString('hex'),
      BigNumber.from(randomnessReqest.block.header.number).toNumber(),
    )

    const randomWallet = Wallet.createRandom()
    const signedTx = await randomWallet.signTransaction({
      from: randomWallet.address,
      nonce: 0,
      gasLimit: GAS_LIMIT,
      gasPrice: 0,
      value: 0,
      data: vrfCoordinatorFactory.interface.encodeFunctionData(
        vrfCoordinatorFactory.interface.getFunction('fulfillRandomnessRequest'),
        [proof],
      ),
      to: ADDRESS_VRF_COORDINATOR,
      chainId: this.chainId,
    })
    return new Promise((resolve, reject) => {
      this.stateManager.queueRawTransaction(signedTx, (error, txHash) => {
        if (error) {
          reject(error)
        }
        ChainlinkMocker.logger.info(
          `successfully fulfill randomness request in tx with hash ${txHash}`,
        )
        resolve(txHash)
      })
    })
  }
}

export default ChainlinkMocker
