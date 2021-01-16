import React from 'react'
import { useQuery, useSubscription, gql } from '@apollo/client'
import { Grid, GridItem } from '@chakra-ui/react'
// Component
import Layout from '~/component/Layout'
import FlipCoin from '~/component/FlipCoin/FlipCoin'
import LeaderBoard from '~/component/FlipCoin/LeaderBoard'

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
  // Render
  return (
    <Layout
      mainProps={{
        maxW: ['90vw', '80rem'],
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <Grid
        my="5"
        flex={1}
        templateRows={['0 max-content 1fr', '0 max-content 1fr', 'auto']}
        templateColumns={['auto', 'auto', '1fr minmax(200px, max-content) 1fr']}
        gap={[4, 4, 10]}
      >
        <GridItem />
        <GridItem alignSelf="center">
          <FlipCoin />
        </GridItem>
        <GridItem>
          <LeaderBoard query={query} subscription={subscription} />
        </GridItem>
      </Grid>
    </Layout>
  )
}

export default FlipCoinPage
