import ganache from 'ganache-core'
import logger from '../util/logger'
import StateManager from './state-manager'

const DEFAULT_OPTION = {
  debug: process.env.NODE_ENV !== 'production',
  logger: {
    log(msg) {
      logger.trace(msg)
    },
  },
  ws: true,
}

export interface CreateServerOption {
  chainId: Number
  chainDbPath: String
}

export const createServer = (options: CreateServerOption) => {
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
    state: new StateManager(ganacheOptions, {
      get send() {
        return server.provider.send
      },
    }),
  })

  return server
}
