import {
  createContractFactory,
  StandardContractOutput,
} from '@evilink/contracts-artifact-util'
import { ContractFactory } from 'ethers'

import * as FlipCoin from '../contract-artifact/FlipCoin.json'

export const artifact = {
  FlipCoin: FlipCoin as StandardContractOutput,
}

export const flipCoinFactory = createContractFactory(artifact.FlipCoin)

export { StandardContractOutput, ContractFactory }
