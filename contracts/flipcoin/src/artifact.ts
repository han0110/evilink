import {
  createContractFactory,
  StandardContractOutput,
  ContractFactory,
} from '@evilink/artifact-util'

import * as FlipCoin from '../contract-artifact/FlipCoin.json'
import * as FlipCoinUsingThresholdVRF from '../contract-artifact/FlipCoinUsingThresholdVRF.json'

export const artifact = {
  FlipCoin: FlipCoin as StandardContractOutput,
  FlipCoinUsingThresholdVRF: FlipCoinUsingThresholdVRF as StandardContractOutput,
}

export const flipCoinFactory = createContractFactory(artifact.FlipCoin)
export const flipCoinUsingThresholdVRFFactory = createContractFactory(
  artifact.FlipCoinUsingThresholdVRF,
)

export { StandardContractOutput, ContractFactory }
