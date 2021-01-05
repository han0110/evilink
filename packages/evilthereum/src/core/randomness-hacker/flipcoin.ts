import VM from 'ethereumjs-vm'
import { BigNumber } from '@ethersproject/bignumber'
import { hexlify } from '@ethersproject/bytes'
import { flipCoinFactory } from '@evilink/contracts-flip-coin'
import { Victim, ResultChecker } from './type'
import { RandomnessRequest } from '../chainlink/type'
import { hashToAddress, genTxOptsFromRandom } from '../../util/ethereum'

class Flipcoin implements ResultChecker {
  // eslint-disable-next-line class-methods-use-this
  async checkResult(
    vm: VM,
    futureVm: VM,
    victim: Victim,
    randomnessRequest: RandomnessRequest,
  ): Promise<boolean> {
    const player = await Flipcoin.getPlayer(vm, victim, randomnessRequest)
    const rewardOfPlayer = await Flipcoin.getRewardOfPlayer(
      vm,
      victim,
      player.address,
    )
    const futureRewardOfPlayer = await Flipcoin.getRewardOfPlayer(
      futureVm,
      victim,
      player.address,
    )

    return (
      (player.isOwner && futureRewardOfPlayer.gt(rewardOfPlayer)) ||
      (!player.isOwner && futureRewardOfPlayer.eq(rewardOfPlayer))
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

  static async getRewardOfPlayer(
    vm: VM,
    victim: Victim,
    playerAddress: string,
  ) {
    const result = await vm.runTx(
      await genTxOptsFromRandom(
        flipCoinFactory.interface.encodeFunctionData(
          flipCoinFactory.interface.getFunction('rewardOf'),
          [playerAddress],
        ),
        victim.address,
        vm.opts.common,
      ),
    )
    const rewardOfPlayer = BigNumber.from(result.execResult.returnValue)

    return rewardOfPlayer
  }
}

export default Flipcoin
