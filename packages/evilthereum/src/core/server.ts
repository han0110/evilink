import ganache from 'ganache-core'
import StateManager from './state-manager'
import Blockchain from './blockchain'
import migration from './migration'
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
  GAS_LIMIT,
} from '../util/constant'
import rootLogger from '../util/logger'

const logger = rootLogger.child({ prefix: 'server' })

export type CreateServerOption = {
  chainId: number
  chainDbPath: string
  chainlink: ChainlinkOptions & { mockerKey?: string }
}

export const createServer = async (
  options: CreateServerOption,
): Promise<ganache.Server> => {
  const ganacheOptions = {
    debug: process.env.NODE_ENV !== 'production',
    logger: { log: (msg) => logger.trace(msg) },
    ws: true,
    db_path: options.chainDbPath,
    network_id: options.chainId,
    _chainId: options.chainId,
    _chainIdRpc: options.chainId,
    gasLimit: GAS_LIMIT,
  }

  let chainlink: IChainlink
  if (options.chainlink.mockerKey) {
    chainlink = new ChainlinkMocker(
      options.chainlink.mockerKey,
      options.chainId,
    )
  } else {
    chainlink = new Chainlink(options.chainlink)
  }

  const randomnessHacker = new RandomnessHacker(chainlink)
  const blockchain = new Blockchain(ganacheOptions, randomnessHacker)

  const server = ganache.server({
    ...ganacheOptions,
    gasPrice: '0x0',
    // @ts-ignore
    state: new StateManager({
      ...ganacheOptions,
      accounts: [
        {
          secretKey: PRIVATE_KEY_GENESIS,
          balance: ONE_MILLION_ETHER.toString(),
        },
      ],
      blockchain,
    }),
  })

  await migration(server.provider)

  const success = chainlink.initialize(server.provider)
  if (chainlink instanceof ChainlinkMocker) {
    // @ts-ignore
    chainlink.setStateManager(server.provider.manager.state)
    blockchain.onRandomnessRequest((randomnessRequest) =>
      (chainlink as ChainlinkMocker).onRandomnessRequest(randomnessRequest),
    )
    await success
  }

  return server
}
