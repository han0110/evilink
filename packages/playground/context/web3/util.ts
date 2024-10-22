import { Web3ReactContextInterface } from '@web3-react/core/dist/types'

export type GetLibrary = (
  provider?: any,
  connector?: Required<Web3ReactContextInterface>['connector'],
) => any

export const getLibraryAsync = async (): Promise<GetLibrary> => {
  const { Web3Provider } = await import('@ethersproject/providers')
  return (provider?: any) => {
    if (!provider) {
      return undefined
    }
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
  }
}
