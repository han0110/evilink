import { AbstractConnector } from '@web3-react/abstract-connector'
import config from '~/config'
import { isBrowser } from '~/util/env'

declare global {
  interface Window {
    ethereum: any
  }
}

export type ConnectorKind = 'injected'

export type Connector = {
  id: ConnectorKind
  available: boolean
  instance?: AbstractConnector
  init: () => Promise<AbstractConnector>
}

export const connectors = Array<Connector>({
  id: 'injected',
  init: async (): Promise<AbstractConnector> => {
    const { InjectedConnector } = await import('@web3-react/injected-connector')
    return new InjectedConnector({
      supportedChainIds: [config.ethereum.chainId],
    })
  },
  available: isBrowser() && window.ethereum,
}).map((connector: Connector) => {
  const { init } = connector
  // eslint-disable-next-line no-param-reassign
  connector.init = async () => {
    if (!connector.instance) {
      // eslint-disable-next-line no-param-reassign
      connector.instance = await init()
    }
    return connector.instance
  }
  return connector
})
