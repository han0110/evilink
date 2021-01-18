import GanacheGethApiDouble from 'ganache-core/lib/subproviders/geth_api_double'
import { Web3Provider, TransactionReceipt } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { HashZero, WeiPerEther } from '@ethersproject/constants'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { toUtf8String } from '@ethersproject/strings'
import {
  deployChainlinkStack,
  vrfCoordinatorFactory,
} from '@evilink/contracts-chainlink'
import { faucetFactory } from '@evilink/contracts-faucet'
import { flipCoinFactory } from '@evilink/contracts-flipcoin'
import {
  ONE_MILLION_ETHER,
  GENESIS_PRIVATE_KEY,
  CONTRACT_ADDRESS,
} from '@evilink/constant'
import { IChainlink } from './chainlink'
import logger from '../util/logger'

class Migration {
  static logger = logger.child({ prefix: Migration.name })

  static async ensureTxSuccess<
    Tx extends Promise<{ wait: () => Promise<TransactionReceipt> }>
  >(tx: Tx): Promise<void> {
    const receipt = await (await tx).wait()
    if (receipt.status !== 1) {
      throw new Error(`migration transaction failed, receipt: ${receipt}`)
    }
  }

  private provider: Web3Provider

  private wallet: Wallet

  private chainlink: IChainlink

  constructor(ganacheProvider, chainlink: IChainlink) {
    this.provider = new Web3Provider(ganacheProvider)
    this.wallet = new Wallet(GENESIS_PRIVATE_KEY).connect(this.provider)
    this.chainlink = chainlink
  }

  async migrate(): Promise<void> {
    await this.ensureGenesisContracts()
    await this.ensureProvingKeyRegistered()
    await this.ensureFlipCoinKeyHashSet()
  }

  async ensureGenesisContracts(): Promise<void> {
    const allDeployed = await Promise.all(
      Object.values(CONTRACT_ADDRESS).map((address) =>
        address ? this.provider.getCode(address) : Promise.resolve('0x'),
      ),
    ).then((codes) => codes.every((code) => code !== '0x'))

    if (!allDeployed) {
      await this.deployGenesisContracts()
    }
  }

  async deployGenesisContracts(): Promise<void> {
    // Deloy Faucet
    const faucet = await faucetFactory.deploy(this.wallet)

    // Deloy MockLinkToken, VRFCoordinator
    const { mockLinkToken, vrfCoordinator } = await deployChainlinkStack(
      this.wallet,
    )

    // Deloy FlipCoin
    const flipCoin = await flipCoinFactory.deploy(
      this.wallet,
      vrfCoordinator.address,
      mockLinkToken.address,
      HashZero,
    )

    // Send all ether to Faucet
    await Migration.ensureTxSuccess(
      this.wallet.sendTransaction({
        to: faucet.address,
        value: ONE_MILLION_ETHER,
      }),
    )

    // Withdraw 1 ether to FlipCoin
    await Migration.ensureTxSuccess(
      faucet.withdrawTo(flipCoin.address, WeiPerEther),
    )

    const addressesToCheck = {
      Faucet: {
        expectedAddress: CONTRACT_ADDRESS.FAUCET,
        address: faucet.address,
      },
      Link: {
        expectedAddress: CONTRACT_ADDRESS.LINK,
        address: mockLinkToken.address,
      },
      VRFCoordinator: {
        expectedAddress: CONTRACT_ADDRESS.VRF_COORDINATOR,
        address: vrfCoordinator.address,
      },
      FlipCoin: {
        expectedAddress: CONTRACT_ADDRESS.FLIP_COIN,
        address: flipCoin.address,
      },
    }
    const mismatched = Object.entries(addressesToCheck).find(
      ([, { expectedAddress, address }]) =>
        expectedAddress !== address.toLowerCase(),
    )
    if (mismatched) {
      throw new Error(
        `unexpected genesis contracts ${mismatched[0]} address mismatched, expected ${mismatched[1].expectedAddress} but got ${mismatched[1].address}, please cleanup chaindb and restart again`,
      )
    }

    Migration.logger.info('successfully deploy genesis contracts')
    Object.entries(addressesToCheck).forEach(
      ([contract, { expectedAddress }]) => {
        Migration.logger.info(`${contract} address: ${expectedAddress}`)
      },
    )
  }

  async ensureProvingKeyRegistered(): Promise<void> {
    const {
      hash: keyHash,
      x: publicKeyX,
      y: publicKeyY,
    } = this.chainlink.publicKey()
    const jobId = this.chainlink.jobId()

    const vrfCoordinator = vrfCoordinatorFactory
      .attach(CONTRACT_ADDRESS.VRF_COORDINATOR)
      .connect(this.wallet)
    const { jobID: registeredJobId } = await vrfCoordinator.serviceAgreements(
      keyHash,
    )
    if (registeredJobId === HashZero) {
      await Migration.ensureTxSuccess(
        vrfCoordinator.registerProvingKey(
          0,
          hexlify(randomBytes(20)),
          [publicKeyX, publicKeyY],
          Buffer.from(jobId, 'utf-8'),
        ),
      )
    } else if (jobId !== toUtf8String(registeredJobId)) {
      throw new Error(
        'unexpected key hash registered with different job id, please cleanup chaindb and restart again',
      )
    }

    const rpcChainlinkRandomServiceRes = JSON.stringify({
      vrfCoordinatorAddress: CONTRACT_ADDRESS.VRF_COORDINATOR,
      linkAddress: CONTRACT_ADDRESS.LINK,
      jobId,
      keyHash,
    })
    GanacheGethApiDouble.prototype.chainlink_randomService = (callback) => {
      callback(null, rpcChainlinkRandomServiceRes)
    }

    Migration.logger.info('successfully register proving key')
  }

  async ensureFlipCoinKeyHashSet(): Promise<void> {
    const flipCoin = flipCoinFactory
      .attach(CONTRACT_ADDRESS.FLIP_COIN)
      .connect(this.wallet)
    const keyHash = await flipCoin.keyHash()
    if (keyHash !== this.chainlink.keyHash()) {
      await Migration.ensureTxSuccess(
        flipCoin.setKeyHash(this.chainlink.keyHash()),
      )
    }

    Migration.logger.info('successfully set FlipCoin keyHash')
  }
}

export default Migration
