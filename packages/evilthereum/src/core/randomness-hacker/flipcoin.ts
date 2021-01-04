import VM from 'ethereumjs-vm'
import { BigNumber, utils } from 'ethers'
import { Victim, RandomnessRequestLogData, ResultChecker } from './type'
import {
  hexStripZeros,
  encodeCalldata,
  genTxOptsFromRandom,
} from '../../util/ethereum'

class Flipcoin implements ResultChecker {
  private static FN_SIG_OWNER = '0x8da5cb5b'

  private static FN_SIG_REWARD_OF = '0x1d62ebd9'

  private static FN_SIG_PLAYER_OF = '0xa19ab2f5'

  // eslint-disable-next-line class-methods-use-this
  async checkResult(
    vm: VM,
    futureVm: VM,
    victim: Victim,
    logData: RandomnessRequestLogData,
  ): Promise<boolean> {
    const state = await Flipcoin.getState(vm, victim, logData)
    const futureState = await Flipcoin.getState(futureVm, victim, logData)

    return (
      (state.ownerAddress === state.playerAddress &&
        futureState.rewardOfPlayer.gt(state.rewardOfPlayer)) ||
      (state.ownerAddress !== state.playerAddress &&
        futureState.rewardOfPlayer.eq(state.rewardOfPlayer))
    )
  }

  static async getState(
    vm: VM,
    victim: Victim,
    logData: RandomnessRequestLogData,
  ) {
    let result = await vm.runTx(
      await genTxOptsFromRandom(
        Flipcoin.FN_SIG_OWNER,
        victim.address,
        vm.opts.common,
      ),
    )
    const ownerAddress = hexStripZeros(
      utils.hexlify(result.execResult.returnValue),
      20,
    )

    result = await vm.runTx(
      await genTxOptsFromRandom(
        encodeCalldata(
          Flipcoin.FN_SIG_PLAYER_OF,
          ['bytes32'],
          [logData.requestId],
        ),
        victim.address,
        vm.opts.common,
      ),
    )
    const playerAddress = hexStripZeros(
      utils.hexlify(result.execResult.returnValue),
      20,
    )

    result = await vm.runTx(
      await genTxOptsFromRandom(
        encodeCalldata(Flipcoin.FN_SIG_REWARD_OF, ['address'], [playerAddress]),
        victim.address,
        vm.opts.common,
      ),
    )
    const rewardOfPlayer = BigNumber.from(result.execResult.returnValue)

    return {
      ownerAddress,
      playerAddress,
      rewardOfPlayer,
    }
  }
}

export default Flipcoin
