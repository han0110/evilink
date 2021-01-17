import { gql, QueryResult, SubscriptionResult } from '@apollo/client'
// Type
import { FlipCoin, Player } from '~/type/flipcoin'

export type QueryAllData = {
  flipCoins: FlipCoin[]
  players: Player[]
}

export type QueryAllResult = QueryResult<QueryAllData>

export const QUERY_ALL = gql`
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
      playLoseCount
    }
  }
`

export type SubscribePlayerData = {
  players: Player[]
}

export type SubscribePlayerResult = SubscriptionResult<SubscribePlayerData>

export const SUBSCRIBE_PLAYER = gql`
  subscription {
    players {
      id
      address
      balance
      netReward
      playCount
      playWinCount
      playLoseCount
    }
  }
`
