import React, { useCallback, useEffect, useState } from 'react'
import { AspectRatio, Box, VStack, Heading, Text } from '@chakra-ui/react'
import { PanInfo } from 'framer-motion'
import { flipCoinFactory } from '@evilink/contracts-flipcoin'
import { CONTRACT_ADDRESS } from '@evilink/constant'
import { keccak256 } from '@ethersproject/keccak256'
// Hook
import useBool from '~/hook/useBool'
import useWeb3 from '~/hook/useWeb3'
// Component
import FlippingCoin, {
  FlippingCoinInteractStage,
} from '~/component/UI/Animation/FlippingCoin'
import DotsSpinner from '~/component/UI/Animation/DotsSpinner'
// Type
import { Player } from '~/type/flipcoin'
import { SubscribePlayerResult } from '~/context/apollo/query/flipcoin'

type FlipCoinResultProps = {
  showResult: boolean
  connected: boolean
  interactStage: FlippingCoinInteractStage
}

const FlipCoinResult = ({
  showResult = false,
  connected = false,
  interactStage,
}: FlipCoinResultProps) => {
  if (showResult) {
    return (
      <Heading variant="mono" size="xs">
        {interactStage === 'to-head' ? 'Congratulations!!!' : 'Bad Luck :('}
      </Heading>
    )
  }
  if (interactStage === 'ready') {
    return (
      <VStack>
        <Heading variant="mono" size="xs">
          Flip the Coin!
        </Heading>
        {connected ? null : (
          <Text fontSize="12px" mt="1em">
            connect wallet to play real money
          </Text>
        )}
      </VStack>
    )
  }
  if (interactStage === 'to-ready') {
    return (
      <Heading variant="mono" size="xs">
        Rejected :(
      </Heading>
    )
  }
  return (
    <Heading variant="mono" size="xs">
      Drawing
      <DotsSpinner />
    </Heading>
  )
}

type FlipCoinProps = {
  subscription: SubscribePlayerResult
}

const FlipCoin = ({ subscription }: FlipCoinProps) => {
  // Global state
  const { connected, account, library } = useWeb3()
  // Local state
  const [interactStage, setInteractStage] = useState<FlippingCoinInteractStage>(
    'ready',
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>()
  const [showResult, setShowResult, unsetShowResult] = useBool()
  // Event
  const onFlip = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (connected) {
        if (library) {
          setInteractStage('flipping')
          const flipCoin = flipCoinFactory
            .attach(CONTRACT_ADDRESS.FLIP_COIN)
            .connect(library.getSigner())
          try {
            await flipCoin.play(
              keccak256(Buffer.from(JSON.stringify(info), 'utf-8')),
              { value: 100, gasPrice: 0 },
            )
          } catch {
            setInteractStage('to-ready')
          }
        } else {
          throw new Error('unexpected empty library')
        }
      } else {
        let nextInteractStage: FlippingCoinInteractStage = 'to-head'
        if (Math.random() > 0.5) {
          nextInteractStage = 'to-tail'
        }
        setInteractStage(nextInteractStage)
      }
    },
    [connected, library, setInteractStage],
  )
  const onFlipEnd = useCallback(() => {
    if (interactStage === 'to-ready') {
      setInteractStage('ready')
    } else {
      setShowResult()
      setTimeout(() => {
        setInteractStage('ready')
        unsetShowResult()
      }, 3000)
    }
  }, [interactStage, setInteractStage, setShowResult, unsetShowResult])
  // Effect
  useEffect(() => {
    if (account) {
      const player = subscription.data?.players?.find(
        ({ address }) => address === account,
      )
      if (player) {
        if (player.playCount > (currentPlayer?.playCount ?? 0)) {
          setCurrentPlayer(currentPlayer)
          if (player.playWinCount > (currentPlayer?.playWinCount ?? 0)) {
            setInteractStage('to-head')
          } else if (
            player.playLoseCount > (currentPlayer?.playLoseCount ?? 0)
          ) {
            setInteractStage('to-tail')
          } else {
            throw new Error('unexpected play situation')
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription])
  // Render
  return (
    <VStack
      spacing={10}
      w="250px"
      mx={['auto', 'auto', 0]}
      mt={['10vh', '10vh', 'calc(50vh - 250px)']}
      mb={['0', '0', 'auto']}
    >
      <AspectRatio width="100%" ratio={1}>
        <Box>
          <FlippingCoin
            size="xl"
            variant="interactive"
            interactStage={interactStage}
            onFlip={onFlip}
            onFlipEnd={onFlipEnd}
          />
        </Box>
      </AspectRatio>
      <FlipCoinResult
        showResult={showResult}
        connected={connected}
        interactStage={interactStage}
      />
    </VStack>
  )
}

export default FlipCoin
