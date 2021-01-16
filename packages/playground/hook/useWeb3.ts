import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

type UseWeb3 = ReturnType<typeof useWeb3React> & {
  account?: string
  connected: boolean
}

const useWeb3 = (): UseWeb3 => {
  const { account, ...web3 } = useWeb3React()
  return {
    ...web3,
    connected: useMemo(() => !!account, [account]),
    ...(account && { account: account.toLowerCase() }),
  }
}

export default useWeb3
