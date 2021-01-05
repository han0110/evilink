import ganache from 'ganache-core'
import Block from 'ethereumjs-block'
import GanacheGethApiDouble from 'ganache-core/lib/subproviders/geth_api_double'
import { generateProof, publicKey, Proof } from '@evilink/chainlink-vrf'
import { vrfCoordinatorFactory } from '@evilink/contracts-chainlink'
import { BigNumber } from '@ethersproject/bignumber'
import { hexlify } from '@ethersproject/bytes'
import { ContractReceipt } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { randomBytes } from '@ethersproject/random'
import { toUtf8String } from '@ethersproject/strings'
import { Wallet } from '@ethersproject/wallet'
import { ADDRESS_LINK, ADDRESS_VRF_COORDINATOR } from '../../util/constant'
import logger from '../../util/logger'

export type RandomnessRequestEvent = {
  keyHash: string
  preSeed: string
  senderAddress: string
  fee: BigNumber
  requestId: string
}

export type RandomnessRequest = {
  block: Block
  event: RandomnessRequestEvent
}

export type IChainlinkOptions = {
  key: string
  jobId: string
}

export abstract class IChainlink {
  static logger = logger.child({ prefix: IChainlink.name })

  protected key: string

  protected jobId: string

  initialized: boolean

  constructor(options?: IChainlinkOptions) {
    this.key = options?.key
    this.jobId = options?.jobId
  }

  keyHash(): string {
    return publicKey(this.key).hash
  }

  generateProof(
    preSeed: string,
    blockHash: string,
    blockNumber: number,
  ): Proof {
    if (!this.key) {
      throw new Error('unexpected usage before initizlie')
    }
    return generateProof(this.key, preSeed, blockHash, blockNumber)
  }

  async initialize(ganacheProvider: ganache.Provider) {
    if (this.initialized) {
      return
    }

    if (!this.jobId) {
      throw new Error('jobId has not been set yet')
    }

    const { hash: keyHash, x: publicKeyX, y: publicKeyY } = publicKey(this.key)

    // @ts-ignore
    const provider = new Web3Provider(ganacheProvider)
    const wallet = Wallet.createRandom().connect(provider)
    const vrfCoordinator = vrfCoordinatorFactory
      .attach(ADDRESS_VRF_COORDINATOR)
      .connect(wallet)
    const { jobID } = await vrfCoordinator.serviceAgreements(keyHash)
    if (this.jobId !== toUtf8String(jobID)) {
      const receipt: ContractReceipt = await (
        await vrfCoordinator.registerProvingKey(
          0,
          hexlify(randomBytes(20)),
          [publicKeyX, publicKeyY],
          Buffer.from(this.jobId, 'utf-8'),
          { gasPrice: 0 },
        )
      ).wait()

      if (!receipt.status) {
        throw new Error(`failed to register proving key, receipt: ${receipt}`)
      }

      IChainlink.logger.debug('successfully register proving key')
    }

    const rpcChainlinkRandomServiceRes = JSON.stringify({
      linkAddress: ADDRESS_LINK,
      vrfCoordinatorAddress: ADDRESS_VRF_COORDINATOR,
      jobId: this.jobId,
      keyHash,
    })
    GanacheGethApiDouble.prototype.chainlink_randomService = (callback) => {
      callback(null, rpcChainlinkRandomServiceRes)
    }

    this.initialized = true

    IChainlink.logger.info(
      `chainlink initialized with keyHash ${keyHash} and jobId ${this.jobId}`,
    )
  }
}

export default IChainlink
