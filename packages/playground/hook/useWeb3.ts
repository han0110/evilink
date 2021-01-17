import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

const useEther = () => useWeb3React<Web3Provider>()

type UseWeb3 = ReturnType<typeof useEther> & {
  account?: string
  connected: boolean
}

const useWeb3 = (): UseWeb3 => {
  const { account: accountDirty, ...web3 } = useWeb3React<Web3Provider>()
  const account = accountDirty?.toLowerCase()
  return {
    ...web3,
    account,
    connected: useMemo(() => !!account, [account]),
  }
}

export default useWeb3
