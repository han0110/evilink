import {
  createContractFactory,
  StandardContractOutput,
  ContractFactory,
} from '@evilink/artifact-util'

import * as FlipCoin from '../contract-artifact/FlipCoin.json'

export const artifact = {
  FlipCoin: FlipCoin as StandardContractOutput,
}

export const flipCoinFactory = createContractFactory(artifact.FlipCoin)

export { StandardContractOutput, ContractFactory }
