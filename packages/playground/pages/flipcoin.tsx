import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import { useQuery, useSubscription, gql } from '@apollo/client'

const QUERY_ALL = gql`
  query {
    flipCoins {
      id
      owner
      jackpot
    }
    players {
      id
      address
      balance
      netReward
      playCount
      playWinCount
      playLostCount
    }
  }
`

const SUBSCRIBE_PLAYER = gql`
  subscription {
    players {
      id
      address
      balance
      netReward
      playCount
      playWinCount
      playLostCount
    }
  }
`

const FlipCoinPage = () => {
  const query = useQuery(QUERY_ALL)
  const subscription = useSubscription(SUBSCRIBE_PLAYER)

  if (query.loading || subscription.loading) return <Box>Loading...</Box>
  if (query.error || subscription.error) return <Box>Error :(</Box>

  return (
    <Box>
      <Heading>Query</Heading>
      <Box>{JSON.stringify(query.data, null, 2)}</Box>
      <Heading>Subscription</Heading>
      <Box>{JSON.stringify(subscription.data, null, 2)}</Box>
    </Box>
  )
}

export default FlipCoinPage
