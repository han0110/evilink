import VM from 'ethereumjs-vm'
import { RandomnessRequest } from '../chainlink/type'

export type VictimKind = 'flipcoin'

export type Victim = {
  address: string
  kind: VictimKind
}

export abstract class ResultChecker {
  abstract checkResult(
    vm: VM,
    futureVm: VM,
    victim: Victim,
    randomnessRequest: RandomnessRequest,
  ): Promise<boolean>
}
