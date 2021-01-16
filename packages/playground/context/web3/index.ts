import { useRef, useEffect, createElement, PropsWithChildren } from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { GetLibrary, getLibraryAsync } from './util'

export const Web3Provider = ({ children }: PropsWithChildren<{}>) => {
  const getLibraryRef = useRef<GetLibrary>(() => ({}))

  useEffect(() => {
    getLibraryAsync().then((getLibrary) => {
      getLibraryRef.current = getLibrary
    })
  }, [])

  return createElement(Web3ReactProvider, {
    getLibrary: getLibraryRef.current,
    children,
  })
}

export { UnsupportedChainIdError } from '@web3-react/core'
export * from './connector'
