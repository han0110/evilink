import {
  createContractFactory,
  StandardContractOutput,
} from '@evilink/contracts-artifact-util'

import * as VRFConsumer from '../contract-artifact/VRFConsumer.json'

export const artifact = {
  VRFConsumer: VRFConsumer as StandardContractOutput,
}

export const vrfConsumerFactory = createContractFactory(artifact.VRFConsumer)

export { StandardContractOutput }
