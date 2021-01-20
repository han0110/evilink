import {
  createContractFactory,
  StandardContractOutput,
  ContractFactory,
} from '@evilink/artifact-util'

import * as MockUpgradeableVRFConsumer from '../contract-artifact/MockUpgradeableVRFConsumer.json'
import * as MockThresholdVRFConsumer from '../contract-artifact/MockThresholdVRFConsumer.json'

export const artifact = {
  MockUpgradeableVRFConsumer: MockUpgradeableVRFConsumer as StandardContractOutput,
  MockThresholdVRFConsumer: MockThresholdVRFConsumer as StandardContractOutput,
}

export const mockUpgradeableVrfConsumerFactory = createContractFactory(
  artifact.MockUpgradeableVRFConsumer,
)
export const mockThresholdVrfConsumerFactory = createContractFactory(
  artifact.MockThresholdVRFConsumer,
)

export { StandardContractOutput, ContractFactory }
