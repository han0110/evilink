import { useState, useEffect, createElement, PropsWithChildren } from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { GetLibrary, getLibraryAsync } from './util'

export const Web3Provider = ({ children }: PropsWithChildren<{}>) => {
  // Local state
  const [options, setOptions] = useState<{ getLibrary: GetLibrary }>({
    getLibrary: () => ({}),
  })
  // Effect
  useEffect(() => {
    getLibraryAsync().then((getLibrary) => {
      setOptions({ getLibrary })
    })
  }, [setOptions])
  // Render
  return createElement(Web3ReactProvider, {
    getLibrary: options.getLibrary,
    children,
  })
}

export { UnsupportedChainIdError } from '@web3-react/core'
export * from './connector'
