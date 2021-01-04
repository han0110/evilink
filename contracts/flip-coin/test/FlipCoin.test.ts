// import MockLinkToken from '@evilink/contracts-chainlink/build/MockLinkToken.json'
import { expect, use } from 'chai'
import { Contract } from 'ethers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { deployChainlinkStack } from '@evilink/contracts-chainlink'

use(solidity)

describe('FlipCoin', () => {
  const [wallet] = new MockProvider().getWallets()

  let mockLinkToken: Contract

  beforeEach(async () => {
    ;({ mockLinkToken } = await deployChainlinkStack(wallet))
    expect(mockLinkToken).equal(0)
  })

  it('should play FlipCoin', async () => {})
})
