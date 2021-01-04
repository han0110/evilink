import {
  createContractFactory,
  StandardContractOutput,
} from '@evilink/contracts-artifact-util'
import { ContractFactory } from 'ethers'

import * as Faucet from '../contract-artifact/Faucet.json'

export const artifact = {
  Faucet: Faucet as StandardContractOutput,
}

export const faucetFactory = createContractFactory(artifact.Faucet)

export { StandardContractOutput, ContractFactory }
