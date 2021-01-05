import {
  createContractFactory,
  StandardContractOutput,
  ContractFactory,
} from '@evilink/contracts-artifact-util'

import * as MockVRFConsumer from '../contract-artifact/MockVRFConsumer.json'

export const artifact = {
  MockVRFConsumer: MockVRFConsumer as StandardContractOutput,
}

export const mockVrfConsumerFactory = createContractFactory(
  artifact.MockVRFConsumer,
)

export { StandardContractOutput, ContractFactory }
