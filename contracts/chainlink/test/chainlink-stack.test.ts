import { expect, use } from 'chai'
import { MockProvider, solidity } from 'ethereum-waffle'
import { Contract } from '@ethersproject/contracts'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { generateProof, publicKey } from '@evilink/chainlink-vrf'
import { deployChainlinkStack } from '../src/chainlink-stack'
import { vrfConsumerFactory } from './artifact'

use(solidity)

describe('chainlink stack', () => {
  const privateKey =
    '0x0fdcdb4f276c1b7f6e3b17f6c80d6bdd229cee59955b0b6a0c69f67cbf3943fa'
  const { x, y, hash: keyHash } = publicKey(privateKey)
  const oracleAddress = hexlify(randomBytes(20))
  const jobId = hexlify(randomBytes(32))
  const fee = 0

  const [deployer] = new MockProvider().getWallets()

  let mockLinkToken: Contract
  let vrfCoordinator: Contract
  let vrfConsumer: Contract

  beforeEach(async () => {
    ;({ mockLinkToken, vrfCoordinator } = await deployChainlinkStack(deployer))
    expect(mockLinkToken.address).to.properAddress
    expect(vrfCoordinator.address).to.properAddress

    await expect(
      vrfCoordinator.registerProvingKey(fee, oracleAddress, [x, y], jobId),
    )
      .to.emit(vrfCoordinator, 'NewServiceAgreement')
      .withArgs(keyHash, fee)

    vrfConsumer = await vrfConsumerFactory.deploy(
      deployer,
      mockLinkToken.address,
      vrfCoordinator.address,
      keyHash,
    )
    expect(vrfConsumer.address).to.properAddress
  })

  it('should consume randomness', async () => {
    const userSeed =
      '0xa4e7cb8c8b7e26212584dc75d56a52dd86f17a9fc1024d03b73b6b8db2976844'

    const tx = await vrfConsumer.consume(userSeed)
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

    const { randomness, packedForContractInput } = generateProof(
      privateKey,
      preSeed,
      blockHash,
      blockNumber,
    )
    await expect(
      vrfCoordinator.fulfillRandomnessRequest(packedForContractInput),
    ).to.emit(vrfCoordinator, 'RandomnessRequestFulfilled')
    expect(await vrfConsumer.randomness()).to.equal(randomness)
  })
})
