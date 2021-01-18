import * as R from 'ramda'
import React, { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
} from '@chakra-ui/react'
import { ZERO_ADDRESS } from '@evilink/constant'
// Hook
import useWeb3 from '~/hook/useWeb3'
// Component
import JazzIcon from '~/component/UI/Icon/Jazz'
// Util
import { ellipseAddress } from '~/util/string'
// Type
import { Player } from '~/type/flipcoin'
import { SubscribePlayerResult } from '~/context/apollo/query/flipcoin'

type RankedPlayer = Player & { rank: number }

const getNetRewardToRank = (players: Player[]): Record<number, number> =>
  R.sort<number>(
    (lhs, rhs) => rhs - lhs,
    R.compose(
      R.map<Player, number>(({ netReward }) => netReward),
      // @ts-ignore
      R.uniq,
      // @ts-ignore
    )(players),
  ).reduce(
    (acc, netReward, idx) => ({
      ...acc,
      [netReward]: idx + 1,
    }),
    {},
  )

const sortByWinCount = (players: Player[] = []): RankedPlayer[] => {
  const netRewardToRank = getNetRewardToRank(players)
  return R.sort(
    (lhs, rhs) => rhs.netReward - lhs.netReward,
    players.map((player) => ({
      ...player,
      rank: netRewardToRank[player.netReward],
    })),
  )
}

type LeaderBoardProps = {
  subscription: SubscribePlayerResult
}

const LeaderBoard = ({ subscription }: LeaderBoardProps) => {
  // Global state
  const { account } = useWeb3()
  // Local state
  const [players, setPlayers] = useState<RankedPlayer[]>([])
  // Effect
  useEffect(() => {
    setPlayers(sortByWinCount(subscription?.data?.players || []))
  }, [subscription])
  // Render
  return (
    <VStack
      alignItems="stretch"
      my="5"
      ml="auto"
      mr={['auto', 'auto', '0']}
      spacing="5"
      overflowX="hidden"
    >
      <Heading variant="mono" size="md">
        Leader Board
      </Heading>
      <Box overflow="scroll" maxH={['none', 'none', '425px']}>
        <Table size="sm" variant="unstyled" width="100%" overflowX="scroll">
          <Thead>
            <Tr>
              <Th fontFamily="inherit">Rank</Th>
              <Th fontFamily="inherit">Address</Th>
              <Th fontFamily="inherit">Head</Th>
              <Th fontFamily="inherit">Tail</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subscription.loading || players.length === 0 ? (
              <Tr>
                <Td textAlign="center">
                  <Skeleton w="100%" h="1em" />
                </Td>
                <Td>
                  <HStack>
                    <JazzIcon address={ZERO_ADDRESS} size="1em" />
                    <Text>
                      <Skeleton w="7.5em" h="1em" />
                    </Text>
                  </HStack>
                </Td>
                <Td textAlign="center">
                  <Skeleton w="100%" h="1em" />
                </Td>
                <Td textAlign="center">
                  <Skeleton w="100%" h="1em" />
                </Td>
              </Tr>
            ) : (
              players.map((player) => {
                const isCurrentUser = player.address === account
                return (
                  <Tr
                    key={player.address}
                    bgColor={isCurrentUser ? '#fbb041' : 'none'}
                  >
                    <Td
                      bgColor={isCurrentUser ? '#fbb041' : 'none'}
                      textAlign="center"
                      borderRadius="0.5em 0 0 0.5em"
                    >
                      {player.rank}
                    </Td>
                    <Td bgColor={isCurrentUser ? '#fbb041' : 'none'}>
                      <HStack>
                        <JazzIcon address={player.address} size="1em" />
                        <Text fontWeight={700}>
                          {ellipseAddress(player.address)}
                        </Text>
                      </HStack>
                    </Td>
                    <Td
                      bgColor={isCurrentUser ? '#fbb041' : 'none'}
                      textAlign="center"
                    >
                      {player.playWinCount}
                    </Td>
                    <Td
                      bgColor={isCurrentUser ? '#fbb041' : 'none'}
                      textAlign="center"
                      borderRadius="0 0.5em 0.5em 0"
                    >
                      {player.playLoseCount}
                    </Td>
                  </Tr>
                )
              })
            )}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  )
}

export default LeaderBoard
