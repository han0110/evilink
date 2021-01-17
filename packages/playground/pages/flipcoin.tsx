import React from 'react'
import { useSubscription } from '@apollo/client'
import { Grid, GridItem } from '@chakra-ui/react'
// Component
import Layout from '~/component/Layout'
import FlipCoin from '~/component/FlipCoin/FlipCoin'
import LeaderBoard from '~/component/FlipCoin/LeaderBoard'
// Query
import {
  SUBSCRIBE_PLAYER,
  SubscribePlayerData,
} from '~/context/apollo/query/flipcoin'

const FlipCoinPage = () => {
  const subscription = useSubscription<SubscribePlayerData>(SUBSCRIBE_PLAYER)
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
        templateRows={['0 80vh 1fr', '0 80vh 1fr', 'auto']}
        templateColumns={['auto', 'auto', '1fr minmax(200px, max-content) 1fr']}
        gap={[4, 4, 10]}
      >
        <GridItem />
        <GridItem display="flex">
          <FlipCoin subscription={subscription} />
        </GridItem>
        <GridItem display="flex" overflowX="hidden">
          <LeaderBoard subscription={subscription} />
        </GridItem>
      </Grid>
    </Layout>
  )
}

export default FlipCoinPage
