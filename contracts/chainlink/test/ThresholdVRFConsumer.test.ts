import { expect, use } from 'chai'
import { MockProvider, solidity } from 'ethereum-waffle'
import { Contract } from '@ethersproject/contracts'
import { hexlify } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bignumber'
import { randomBytes } from '@ethersproject/random'
import { generateProof, publicKey } from '@evilink/chainlink-vrf'
import { deployChainlinkStack } from '../src/chainlink-stack'
import { vrfCoordinatorFactory } from '../src/artifact'
import { mockThresholdVrfConsumerFactory } from './artifact'
import { shuffle } from './util'

use(solidity)

describe('ThresholdVRFConsumer', () => {
  const [deployer, ...wallets] = new MockProvider().getWallets()
  const vrfServices = Array(5)
    .fill(undefined)
    .map((_, idx) => {
      const privateKey = hexlify(randomBytes(32))
      return {
        idx,
        privateKey,
        ...publicKey(privateKey),
        oracleAddress: hexlify(randomBytes(20)),
        jobId: hexlify(randomBytes(32)),
        fee: 0,
      }
    })

  let mockLinkToken: Contract
  let vrfCoordinator: Contract
  let mockThresholdVrfConsumer: Contract

  beforeEach(async () => {
    ;({ mockLinkToken, vrfCoordinator } = await deployChainlinkStack(deployer))
    expect(mockLinkToken.address).to.properAddress
    expect(vrfCoordinator.address).to.properAddress

    // Register services
    await Promise.all(
      vrfServices.map(
        ({ fee, oracleAddress, x, y, hash: keyHash, jobId }, idx) =>
          expect(
            vrfCoordinator
              .connect(wallets[idx])
              .registerProvingKey(fee, oracleAddress, [x, y], jobId),
          )
            .to.emit(vrfCoordinator, 'NewServiceAgreement')
            .withArgs(keyHash, fee),
      ),
    )

    mockThresholdVrfConsumer = await mockThresholdVrfConsumerFactory.deploy(
      deployer,
      vrfCoordinator.address,
      mockLinkToken.address,
    )
    expect(mockThresholdVrfConsumer.address).to.properAddress

    // Add services for ThresholdVRFConsumer
    await vrfServices.reduce(
      (promise, { fee, hash: keyHash }) =>
        promise.then(() =>
          expect(mockThresholdVrfConsumer.addService(keyHash, fee))
            .to.emit(mockThresholdVrfConsumer, 'ServiceAdded')
            .withArgs(keyHash, fee),
        ),
      Promise.resolve(),
    )
  })

  const expectConsume = async (threshold: number, totalRequest: number) => {
    const tx = await mockThresholdVrfConsumer.consume(
      randomBytes(32), // seed
      threshold,
      totalRequest,
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
    expect(preSeeds.length).to.eq(totalRequest)

    // Shuffle randomness orders
    const results = shuffle(vrfServices.slice(0, totalRequest))
      .slice(0, threshold)
      .map(({ idx, privateKey }) =>
        generateProof(privateKey, preSeeds[idx], blockHash, blockNumber),
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

  it('should consume randomness of (threshold, totalRequest) = (1, 1)', () =>
    expectConsume(1, 1))

  it('should consume randomness of (threshold, totalRequest) = (5, 5)', () =>
    expectConsume(5, 5))

  it('should consume randomness of (threshold, totalRequest) = (3, 5)', () =>
    expectConsume(3, 5))
})
