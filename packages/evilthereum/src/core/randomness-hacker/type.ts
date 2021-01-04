import VM from 'ethereumjs-vm'
import { BigNumber } from 'ethers'

export type VictimKind = 'flipcoin'

export type Victim = {
  address: string
  kind: VictimKind
}

export type RandomnessRequestLogData = {
  keyHash: string
  preSeed: string
  senderAddress: string
  fee: BigNumber
  requestId: string
}

export abstract class ResultChecker {
  abstract checkResult(
    vm: VM,
    futureVm: VM,
    victim: Victim,
    logData: RandomnessRequestLogData,
  ): Promise<boolean>
}
