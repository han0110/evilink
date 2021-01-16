import React from 'react'
import { Box, VStack, HStack, Heading, Text } from '@chakra-ui/react'
// Component
import JazzIcon from '~/component/UI/Icon/Jazz'

const LeaderBoard = ({ query, subscription }: any) => (
  <VStack alignItems="stretch" my="5" spacing="5">
    {query?.data?.players?.map((player: any) => (
      <HStack key={player.address}>
        <JazzIcon address={player.address} size="1.5em" />
        <Text>
          {player.address} win count {player.playWinCount}
        </Text>
      </HStack>
    ))}
    <Heading>Query</Heading>
    <Box>{JSON.stringify(query.data, null, 2)}</Box>
    <Heading>Subscription</Heading>
    <Box>{JSON.stringify(subscription.data, null, 2)}</Box>
  </VStack>
)

export default LeaderBoard
