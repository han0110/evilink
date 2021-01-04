import { Wallet, providers } from 'ethers'
import ganache from 'ganache-core'
import { deployChainlinkStack } from '@evilink/contracts-chainlink'
import { faucetFactory } from '@evilink/contracts-faucet'
import StateManager from './state-manager'
import Blockchain from './blockchain'
import RandomnessHacker from './randomness-hacker'
import {
  Chainlink,
  ChainlinkMocker,
  ChainlinkOptions,
  IChainlink,
} from './chainlink'
import {
  ONE_MILLION_ETHER,
  PRIVATE_KEY_GENESIS,
  ADDRESS_FAUCET,
  ADDRESS_LINK,
  ADDRESS_VRF_COORDINATOR,
} from '../util/constant'
import logger from '../util/logger'

const DEFAULT_OPTION = {
  debug: process.env.NODE_ENV !== 'production',
  logger: {
    log(msg) {
      logger.trace(msg)
    },
  },
  ws: true,
}

export type CreateServerOption = {
  chainId: number
  chainDbPath: string
  chainlink: ChainlinkOptions & { mockerKey?: string }
}

const ensureInitialized = async (ganacheProvider) => {
  // @ts-ignore
  const provider = new providers.Web3Provider(ganacheProvider)
  const wallet = new Wallet(PRIVATE_KEY_GENESIS).connect(provider)

  if (
    (await provider.getCode(ADDRESS_FAUCET)) !== '0x' &&
    (await provider.getCode(ADDRESS_LINK)) !== '0x' &&
    (await provider.getCode(ADDRESS_VRF_COORDINATOR)) !== '0x'
  ) {
    return
  }

  const faucet = await faucetFactory.deploy(wallet, {
    gasPrice: 0,
  })
  const { mockLinkToken, vrfCoordinator } = await deployChainlinkStack(wallet, {
    gasPrice: 0,
  })

  await wallet.sendTransaction({
    to: faucet.address,
    value: ONE_MILLION_ETHER,
    gasPrice: 0,
  })

  if (
    !(
      ADDRESS_FAUCET === faucet.address.toLowerCase() &&
      ADDRESS_LINK === mockLinkToken.address.toLowerCase() &&
      ADDRESS_VRF_COORDINATOR === vrfCoordinator.address.toLowerCase()
    )
  ) {
    throw new Error(
      'unexpected well-known contracts address dismatching, please cleanup chaindb and restart again',
    )
  }

  logger.info('successfully initialized')
  logger.info(`Faucet address:         ${ADDRESS_FAUCET}`)
  logger.info(`MockLinkToken address:  ${ADDRESS_LINK}`)
  logger.info(`VRFCoordinator address: ${ADDRESS_VRF_COORDINATOR}`)
}

export const createServer = async (
  options: CreateServerOption,
): Promise<ganache.Server> => {
  let chainlink: IChainlink
  if (options.chainlink.mockerKey) {
    chainlink = new ChainlinkMocker(options.chainlink.mockerKey)
  } else {
    chainlink = new Chainlink(options.chainlink)
  }
  const randomnessHacker = new RandomnessHacker(chainlink)

  const ganacheOptions = {
    ...DEFAULT_OPTION,
    db_path: options.chainDbPath,
    network_id: options.chainId,
    _chainId: options.chainId,
    _chainIdRpc: options.chainId,
  }

  const server = ganache.server({
    ...ganacheOptions,
    gasPrice: '0x0',
    // @ts-ignore
    state: new StateManager(
      {
        ...ganacheOptions,
        accounts: [
          {
            secretKey: PRIVATE_KEY_GENESIS,
            balance: ONE_MILLION_ETHER.toString(),
          },
        ],
        blockchain: new Blockchain(ganacheOptions, randomnessHacker),
      },
      {
        get send() {
          return server.provider.send
        },
      },
    ),
  })

  await ensureInitialized(server.provider)

  const success = chainlink.initialize(server.provider)
  if (chainlink instanceof ChainlinkMocker) {
    await success
  }

  return server
}
