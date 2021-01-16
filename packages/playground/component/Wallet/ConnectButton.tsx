import React from 'react'
import { useDisclosure, Button } from '@chakra-ui/react'
// Hook
import useWeb3 from '~/hook/useWeb3'
// Component
import ConnectModal from '~/component/Wallet/ConnectModal'

const ConnectButton = () => {
  // Global state
  const { connected } = useWeb3()
  // Local state
  const { isOpen, onOpen, onClose } = useDisclosure()
  // Render
  return (
    <>
      <Button onClick={onOpen}>{connected ? 'Connected' : 'Connect'}</Button>
      <ConnectModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default ConnectButton
