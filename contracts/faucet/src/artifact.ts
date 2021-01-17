import {
  createContractFactory,
  StandardContractOutput,
  ContractFactory,
} from '@evilink/artifact-util'

import * as Faucet from '../contract-artifact/Faucet.json'

export const artifact = {
  Faucet: Faucet as StandardContractOutput,
}

export const faucetFactory = createContractFactory(artifact.Faucet)

export { StandardContractOutput, ContractFactory }
