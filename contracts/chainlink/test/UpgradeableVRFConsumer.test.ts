import { expect, use } from 'chai'
import { MockProvider, solidity } from 'ethereum-waffle'
import { Contract } from '@ethersproject/contracts'
import { mockUpgradeableVrfConsumerFactory } from './artifact'
import { deployChainlinkStackWithServices, VRFService } from './util'

use(solidity)

describe('UpgradeableVRFConsumer', () => {
  const [deployer, ...wallets] = new MockProvider().getWallets()

  let mockLinkToken: Contract
  let vrfCoordinator: Contract
  let vrfService: VRFService
  let mockUpgradeableVrfConsumer: Contract

  beforeEach(async () => {
    ;({
      mockLinkToken,
      vrfCoordinator,
      vrfServices: [vrfService],
    } = await deployChainlinkStackWithServices(wallets))

    mockUpgradeableVrfConsumer = await mockUpgradeableVrfConsumerFactory.deploy(
      deployer,
      vrfCoordinator.address,
      mockLinkToken.address,
      vrfService.keyHash,
    )
    expect(mockUpgradeableVrfConsumer.address).to.properAddress
  })

  it('should consume randomness', async () => {
    const userSeed =
      '0xa4e7cb8c8b7e26212584dc75d56a52dd86f17a9fc1024d03b73b6b8db2976844'

    const tx = await mockUpgradeableVrfConsumer.consume(userSeed)
    await expect(Promise.resolve(tx)).to.emit(
      vrfCoordinator,
      'RandomnessRequest',
    )

    const {
      blockHash,
      blockNumber,
      logs,
    } = await deployer.provider.getTransactionReceipt(tx.hash)
    const preSeed = `0x${logs[2].data.substr(66, 64)}`

    const { randomness, packedForContractInput } = vrfService.generateProof(
      preSeed,
      blockHash,
      blockNumber,
    )
    await expect(
      vrfCoordinator.fulfillRandomnessRequest(packedForContractInput),
    ).to.emit(vrfCoordinator, 'RandomnessRequestFulfilled')
    expect(await mockUpgradeableVrfConsumer.randomness()).to.equal(randomness)
  })
})
