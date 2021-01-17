/* eslint-disable no-nested-ternary */

import React, { useCallback, useEffect } from 'react'
import {
  Button,
  Box,
  Text,
  Tag,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  AlertIcon,
  Spacer,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react'
import { Wallet } from '@ethersproject/wallet'
import { faucetFactory } from '@evilink/contracts-faucet'
import { CONTRACT_ADDRESS, ONE_ETHER } from '@evilink/constant'
// Context
import {
  connectors,
  ConnectorKind,
  Connector,
  UnsupportedChainIdError,
} from '~/context/web3'
// Hook
import useBool from '~/hook/useBool'
import useWeb3 from '~/hook/useWeb3'
// Component
import MetamaskIcon from '~/component/UI/Icon/Metamask'
// Config
import config from '~/config'

const walletIcon: Record<ConnectorKind, JSX.Element> = {
  injected: <MetamaskIcon w="2.5em" />,
}

type ConnectModalProps = {
  isOpen: boolean
  onClose: () => void
}

const ConnectModal = ({ isOpen, onClose }: ConnectModalProps) => {
  // Global state
  const {
    account,
    library,
    activate,
    deactivate,
    connected,
    connector: currentConnector,
  } = useWeb3()
  // Local state
  const [connecting, setConnecting, unsetConnecting] = useBool()
  const [invalidChainId, setInvalidChainId, unsetInvalidChainId] = useBool()
  // Event
  const onConnect = useCallback(
    async ({ init }: Connector) => {
      try {
        setConnecting()
        await new Promise((resolve, reject) => {
          init()
            .then((connector) =>
              activate(connector, (error) => {
                reject(error)
              }),
            )
            .then(resolve)
        })
        unsetInvalidChainId()
      } catch (error) {
        if (error instanceof UnsupportedChainIdError) setInvalidChainId()
      } finally {
        unsetConnecting()
      }
    },
    [
      activate,
      setConnecting,
      unsetConnecting,
      setInvalidChainId,
      unsetInvalidChainId,
    ],
  )
  const ensureSufficientBalance = useCallback(async () => {
    if (account && library) {
      const balance = await library.getBalance(account)
      if (balance?.isZero()) {
        try {
          await faucetFactory
            .attach(CONTRACT_ADDRESS.FAUCET)
            .connect(Wallet.createRandom().connect(library))
            .withdrawTo(account, ONE_ETHER)
        } catch {
          // noop
        }
      }
    }
  }, [account, library])
  // Effect
  useEffect(() => {
    ensureSufficientBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])
  // Render
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Wallet</ModalHeader>
        <ModalBody>
          <VStack alignItems="stretch" spacing={5}>
            {connectors.map((connector) => {
              const isCurrentConnector =
                connected && connector.instance === currentConnector
              return (
                <Button
                  key={connector.id}
                  display="flex"
                  justifyContent="flex-start"
                  padding="0.5em 1em"
                  height="auto"
                  onClick={() =>
                    isCurrentConnector ? deactivate() : onConnect(connector)
                  }
                  disabled={!connector.available || connecting}
                >
                  <HStack spacing={3} flex={1}>
                    {walletIcon[connector.id]}
                    <Text>{connector.id}</Text>
                    <Spacer />
                    {!connector.available ? (
                      <Tag colorScheme="red">not found</Tag>
                    ) : invalidChainId ? (
                      <Tag colorScheme="red">wrong chain id</Tag>
                    ) : isCurrentConnector ? (
                      <Tag colorScheme="green">connected</Tag>
                    ) : null}
                  </HStack>
                </Button>
              )
            })}
            <Alert status="info" borderRadius="0.5em">
              <AlertIcon />
              <VStack>
                <Text>Remember to checkout to network</Text>
                <Box pl="1em">
                  <UnorderedList>
                    <ListItem>
                      Chain ID:{' '}
                      <Box as="span" color="blue.600">
                        {config.ethereum.chainId}
                      </Box>{' '}
                    </ListItem>
                    <ListItem>
                      RPC URL:{' '}
                      <Box as="span" color="blue.600">
                        {config.ethereum.rpcEndpoint}
                      </Box>{' '}
                    </ListItem>
                  </UnorderedList>
                </Box>
              </VStack>
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}

export default ConnectModal
