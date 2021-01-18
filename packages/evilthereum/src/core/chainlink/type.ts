import Block from 'ethereumjs-block'
import {
  generateProof,
  publicKey,
  Proof,
  PublicKey,
} from '@evilink/chainlink-vrf'
import { BigNumber } from '@ethersproject/bignumber'
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

  protected _key: string

  protected _jobId: string

  constructor(options?: IChainlinkOptions) {
    this._key = options?.key
    this._jobId = options?.jobId
  }

  jobId(): string {
    return this._jobId
  }

  publicKey(): PublicKey {
    return publicKey(this._key)
  }

  keyHash(): string {
    return publicKey(this._key).hash
  }

  generateProof(
    preSeed: string,
    blockHash: string,
    blockNumber: number,
  ): Proof {
    if (!this._key) {
      throw new Error('unexpected usage before initizlie')
    }
    return generateProof(this._key, preSeed, blockHash, blockNumber)
  }

  abstract initialize(ganacheProvider): Promise<void>
}

export default IChainlink
