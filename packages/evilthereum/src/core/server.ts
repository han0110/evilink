import ganache from 'ganache-core'
import {
  ONE_MILLION_ETHER,
  GENESIS_PRIVATE_KEY,
  GAS_LIMIT,
} from '@evilink/constant'
import StateManager from './state-manager'
import Blockchain from './blockchain'
import Migration from './migration'
import RandomnessHacker from './randomness-hacker'
import {
  Chainlink,
  ChainlinkMocker,
  ChainlinkOptions,
  IChainlink,
} from './chainlink'
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
    gasPrice: 0,
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
    // @ts-ignore
    state: new StateManager({
      ...ganacheOptions,
      accounts: [
        {
          secretKey: GENESIS_PRIVATE_KEY,
          balance: ONE_MILLION_ETHER.toString(),
        },
      ],
      blockchain,
    }),
  })

  const success = chainlink
    .initialize(server.provider)
    .then(() => new Migration(server.provider, chainlink).migrate())

  if (chainlink instanceof ChainlinkMocker) {
    await success
    blockchain.onRandomnessRequest((randomnessRequest) =>
      (chainlink as ChainlinkMocker).onRandomnessRequest(randomnessRequest),
    )
  }

  return server
}
