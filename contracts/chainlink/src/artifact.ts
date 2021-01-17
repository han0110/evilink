import {
  createContractFactory,
  StandardContractOutput,
  ContractFactory,
} from '@evilink/artifact-util'

import * as VRFCoordinator from '@chainlink/contracts/abi/v0.6/VRFCoordinator.json'
import * as BlockhashStore from '@chainlink/contracts/abi/v0.6/BlockhashStore.json'
import * as MockLinkToken from '../contract-artifact/MockLinkToken.json'

export const artifact = {
  MockLinkToken: MockLinkToken as StandardContractOutput,
  VRFCoordinator: VRFCoordinator.compilerOutput as StandardContractOutput,
  BlockhashStore: BlockhashStore.compilerOutput as StandardContractOutput,
}

export const mockLinkTokenFactory = createContractFactory(
  artifact.MockLinkToken,
)
export const vrfCoordinatorFactory = createContractFactory(
  artifact.VRFCoordinator,
)
export const blockhashStoreFactory = createContractFactory(
  artifact.BlockhashStore,
)

export { StandardContractOutput, ContractFactory }
