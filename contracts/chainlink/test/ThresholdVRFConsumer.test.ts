import { expect, use } from 'chai'
import { MockProvider, solidity } from 'ethereum-waffle'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { randomBytes } from '@ethersproject/random'
import { vrfCoordinatorFactory } from '../src/artifact'
import { mockThresholdVrfConsumerFactory } from './artifact'
import { deployChainlinkStackWithServices, shuffle, VRFService } from './util'

use(solidity)

describe('ThresholdVRFConsumer', () => {
  const [deployer, ...wallets] = new MockProvider().getWallets()

  let mockLinkToken: Contract
  let vrfCoordinator: Contract
  let vrfServices: Array<VRFService>
  let mockThresholdVrfConsumer: Contract

  beforeEach(async () => {
    ;({
      mockLinkToken,
      vrfCoordinator,
      vrfServices,
    } = await deployChainlinkStackWithServices(wallets))

    mockThresholdVrfConsumer = await mockThresholdVrfConsumerFactory.deploy(
      deployer,
      vrfCoordinator.address,
      mockLinkToken.address,
    )
    expect(mockThresholdVrfConsumer.address).to.properAddress

    // Add services for ThresholdVRFConsumer
    await vrfServices.reduce(
      (promise, { fee, keyHash }) =>
        promise.then(() =>
          expect(mockThresholdVrfConsumer.addService(keyHash, fee))
            .to.emit(mockThresholdVrfConsumer, 'ServiceAdded')
            .withArgs(keyHash, fee),
        ),
      Promise.resolve(),
    )

    expect(await mockThresholdVrfConsumer.totalService()).to.equal(
      vrfServices.length,
    )
  })

  const expectConsume = async (threshold: number) => {
    const tx = await mockThresholdVrfConsumer.consume(
      randomBytes(32), // seed
      threshold,
    )
    await expect(Promise.resolve(tx)).to.emit(
      vrfCoordinator,
      'RandomnessRequest',
    )

    const {
      blockHash,
      blockNumber,
      logs,
    } = await deployer.provider.getTransactionReceipt(tx.hash)
    const preSeeds = logs
      .filter(
        ({ topics: [topic] }) =>
          topic ===
          vrfCoordinatorFactory.interface.getEventTopic('RandomnessRequest'),
      )
      .map(({ data }) => `0x${data.substr(66, 64)}`)
    expect(preSeeds.length).to.eq(threshold)

    // Shuffle randomness orders
    const results = shuffle(vrfServices.slice(0, threshold)).map((vrfService) =>
      vrfService.generateProof(
        preSeeds[vrfService.idx],
        blockHash,
        blockNumber,
      ),
    )
    await Promise.all(
      results.map(({ packedForContractInput }, idx) =>
        expect(
          vrfCoordinator
            .connect(wallets[idx])
            .fulfillRandomnessRequest(packedForContractInput),
        ).to.emit(vrfCoordinator, 'RandomnessRequestFulfilled'),
      ),
    )

    expect(await mockThresholdVrfConsumer.randomness()).to.equal(
      results.reduce(
        (xoredRandomness, { randomness }) =>
          xoredRandomness.xor(BigNumber.from(randomness)),
        BigNumber.from(0),
      ),
    )
  }

  it('should consume randomness of threshold 1', () => expectConsume(1))
  it('should consume randomness of threshold 3', () => expectConsume(3))
  it('should consume randomness of threshold 5', () => expectConsume(5))
})
