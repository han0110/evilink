import VM from 'ethereumjs-vm'
import { BigNumber } from '@ethersproject/bignumber'
import { hexlify } from '@ethersproject/bytes'
import { flipCoinFactory } from '@evilink/contracts-flipcoin'
import { Victim, ResultChecker } from './type'
import { RandomnessRequest } from '../chainlink/type'
import { hashToAddress, genTxOptsFromRandom } from '../../util/ethereum'

class FlipCoin implements ResultChecker {
  // eslint-disable-next-line class-methods-use-this
  async checkResult(
    vm: VM,
    futureVm: VM,
    victim: Victim,
    randomnessRequest: RandomnessRequest,
  ): Promise<boolean> {
    const player = await FlipCoin.getPlayer(vm, victim, randomnessRequest)
    const balanceOfPlayer = await FlipCoin.getBalanceOfPlayer(
      vm,
      victim,
      player.address,
    )
    const futureBalanceOfPlayer = await FlipCoin.getBalanceOfPlayer(
      futureVm,
      victim,
      player.address,
    )

    return (
      (player.isOwner && futureBalanceOfPlayer.gt(balanceOfPlayer)) ||
      (!player.isOwner && futureBalanceOfPlayer.eq(balanceOfPlayer))
    )
  }

  static async getPlayer(
    vm: VM,
    victim: Victim,
    randomnessRequest: RandomnessRequest,
  ) {
    let result = await vm.runTx(
      await genTxOptsFromRandom(
        flipCoinFactory.interface.getSighash('owner'),
        victim.address,
        vm.opts.common,
      ),
    )
    const ownerAddress = hashToAddress(hexlify(result.execResult.returnValue))

    result = await vm.runTx(
      await genTxOptsFromRandom(
        flipCoinFactory.interface.encodeFunctionData(
          flipCoinFactory.interface.getFunction('playerOf'),
          [randomnessRequest.event.requestId],
        ),
        victim.address,
        vm.opts.common,
      ),
    )
    const playerAddress = hashToAddress(hexlify(result.execResult.returnValue))

    return {
      address: playerAddress,
      isOwner: playerAddress === ownerAddress,
    }
  }

  static async getBalanceOfPlayer(
    vm: VM,
    victim: Victim,
    playerAddress: string,
  ) {
    const result = await vm.runTx(
      await genTxOptsFromRandom(
        flipCoinFactory.interface.encodeFunctionData(
          flipCoinFactory.interface.getFunction('balanceOf'),
          [playerAddress],
        ),
        victim.address,
        vm.opts.common,
      ),
    )
    const balanceOfPlayer = BigNumber.from(result.execResult.returnValue)

    return balanceOfPlayer
  }
}

export default FlipCoin
