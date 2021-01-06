/* eslint-disable eqeqeq, prefer-const, @typescript-eslint/no-use-before-define, import/prefer-default-export, import/no-extraneous-dependencies */

import { BigInt } from '@graphprotocol/graph-ts'

import {
  OwnershipTransferred,
  Subsidized,
  Played,
} from '../generated/FlipCoin/FlipCoin'
import { FlipCoin, Player, PlayEvent } from '../generated/schema'

const GENESIS_ADDRESS = '0x0000000000000000000000000000000000000000'

let ZERO = BigInt.fromI32(0)
let ONE = BigInt.fromI32(1)
let TWO = BigInt.fromI32(2)
let ONE_HUNDRED = BigInt.fromI32(100)
let TWO_HUNDRED = ONE_HUNDRED.times(TWO)

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let flipCoin = FlipCoin.load(event.address.toHex())
  if (flipCoin == null) {
    flipCoin = new FlipCoin(event.address.toHex())
  }

  flipCoin.owner = event.params.newOwner
  if (event.params.previousOwner.toHex() == GENESIS_ADDRESS) {
    flipCoin.jackpot = ZERO
  }

  flipCoin.save()
}

export function handleSubsidized(event: Subsidized): void {
  let flipCoin = FlipCoin.load(event.address.toHex())
  if (flipCoin == null) return // Unexpected

  flipCoin.jackpot = flipCoin.jackpot.plus(event.params.amount)

  flipCoin.save()
}

export function handlePlayed(event: Played): void {
  let flipCoin = FlipCoin.load(event.address.toHex())
  if (flipCoin == null) return // Unexpected

  handlePlayEvent(event)

  let player = Player.load(event.params.player.toHex())
  if (player == null) {
    player = new Player(event.params.player.toHex())
  }

  player.playCount = player.playCount.plus(ONE)
  if (event.params.side) {
    flipCoin.jackpot = flipCoin.jackpot.minus(TWO_HUNDRED)
    player.netReward = player.balance.plus(TWO_HUNDRED)
    player.netReward = player.netReward.plus(ONE_HUNDRED)
    player.playWinCount = player.playWinCount.plus(ONE)
  } else {
    flipCoin.jackpot = flipCoin.jackpot.plus(ONE_HUNDRED)
    player.netReward = player.netReward.minus(ONE_HUNDRED)
    player.playLostCount = player.playLostCount.plus(ONE)
  }

  flipCoin.save()
  player.save()
}

function handlePlayEvent(event: Played): void {
  let playEvent = new PlayEvent(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
  )
  playEvent.player = event.params.player
  playEvent.side = event.params.side
  playEvent.save()
}
