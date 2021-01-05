/* eslint-disable no-await-in-loop, no-constant-condition */
import { Wallet } from '@ethersproject/wallet'
import { CONTRACT_ADDRESS } from '@evilink/constant'
import { vrfCoordinatorFactory } from '@evilink/contracts-chainlink'
import { publicKey, compressed } from '@evilink/chainlink-vrf'
import { ChainlinkOrm, IChainlinkOrm } from '@evilink/chainlink-orm'
import {
  ChainlinkClient,
  IChainlinkClient,
  JobSpecReq,
  SessionReq,
} from '@evilink/chainlink-client'
import { IChainlink } from './type'
import { retryUntilSuccess } from '../../util/retry'
import logger from '../../util/logger'

export type ChainlinkOptions = {
  apiDsn?: string
  apiAuth?: SessionReq
  databaseDsn?: string
  vrfKeyPassphrase?: string
}

export class Chainlink extends IChainlink {
  static logger = logger.child({ prefix: Chainlink.name })

  static readonly VRF_KEY_PASSPHREASE_PREFIX = `don't mix VRF and Ethereum keys!`

  static readonly RANDOMNESS_JOB_SPEC_NAME = 'evilink_randomness'

  private options: ChainlinkOptions

  private orm: IChainlinkOrm

  private client: IChainlinkClient

  constructor(options: ChainlinkOptions) {
    super()
    this.options = options
  }

  async initialize(): Promise<void> {
    await retryUntilSuccess(() => this.stealPrivateKey(), 3e3, {
      beforeEach: () =>
        Chainlink.logger.info(
          'try connect to chainlink database to steal private key',
        ),
      afterFailure: (error) => {
        Chainlink.logger.debug(`stealPrivateKey error: ${error}`)
        Chainlink.logger.info(
          'failed to connect to chainlink database, retry 3 seconds later...',
        )
      },
    })
    await retryUntilSuccess(() => this.ensureJobSpec(), 3e3, {
      beforeEach: () =>
        Chainlink.logger.info('try connect to chainlink api to ensure job id'),
      afterFailure: (error) => {
        Chainlink.logger.debug(`ensureJobSpec error: ${error}`)
        Chainlink.logger.info(
          'failed to connect to chainlink api, retry 3 seconds later...',
        )
      },
    })
  }

  private async stealPrivateKey(): Promise<Wallet> {
    // Steal key from chainlink database
    if (!this.orm) {
      this.orm = await ChainlinkOrm.connect(this.options.databaseDsn)
    }

    const keys = await this.orm.listEncryptedVRFKeys()
    if (keys.length === 0) {
      throw new Error('failed to find any encrypted vrf keys')
    }

    const wallet = Wallet.fromEncryptedJsonSync(
      keys[0].vrf_key,
      `${Chainlink.VRF_KEY_PASSPHREASE_PREFIX}${this.options.vrfKeyPassphrase}`,
    )

    this._key = wallet.privateKey
    return wallet
  }

  private async ensureJobSpec() {
    // Retrieve randomness service jobId
    if (!this.client) {
      this.client = await ChainlinkClient.authenticate(
        this.options.apiDsn,
        this.options.apiAuth,
      )
    }
    const { data: jobSpecs } = await this.client.listJobSpec()
    let jobId = jobSpecs.find(
      ({ attributes }) =>
        attributes.name === Chainlink.RANDOMNESS_JOB_SPEC_NAME,
    )?.id
    if (!jobId) {
      jobId = (
        await this.client.createJobSpec(this.generateRandomnessJobSpec())
      )?.data?.id
    }

    this._jobId = jobId
  }

  private generateRandomnessJobSpec(): JobSpecReq {
    return {
      name: Chainlink.RANDOMNESS_JOB_SPEC_NAME,
      initiators: [
        {
          type: 'RandomnessLog',
          params: {
            address: CONTRACT_ADDRESS.VRF_COORDINATOR,
          },
        },
      ],
      tasks: [
        {
          type: 'Random',
          params: {
            publicKey: compressed(publicKey(this._key)),
          },
          confirmations: 0,
        },
        {
          type: 'EthTx',
          params: {
            address: CONTRACT_ADDRESS.VRF_COORDINATOR,
            functionSelector: vrfCoordinatorFactory.interface.getSighash(
              'fulfillRandomnessRequest',
            ),
            format: 'preformatted',
          },
          confirmations: 0,
        },
      ],
    }
  }
}

export { IChainlink } from './type'
export { ChainlinkMocker } from './mocker'
