import { AbstractConnector } from '@web3-react/abstract-connector'
import config from '~/config'
import { isBrowser } from '~/util/env'

declare global {
  interface Window {
    ethereum: any
  }
}

// eslint-disable-next-line import/prefer-default-export
export const injectedConnector = {
  id: 'injected',
  init: async (): Promise<AbstractConnector> => {
    const { InjectedConnector } = await import('@web3-react/injected-connector')
    return new InjectedConnector({
      supportedChainIds: [config.ethereum.chainId],
    })
  },
  available: isBrowser() && window.ethereum,
}
