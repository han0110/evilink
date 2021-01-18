import { expect, use } from 'chai'
import { MockProvider, solidity } from 'ethereum-waffle'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { mockLinkTokenFactory } from '../src/artifact'

use(solidity)

describe('MockLinkToken', () => {
  const [deployer, alice, bob] = new MockProvider().getWallets()

  let mockLinkToken: Contract

  beforeEach(async () => {
    mockLinkToken = await mockLinkTokenFactory.deploy(deployer)
    expect(mockLinkToken.address).to.properAddress
  })

  it('should give UNCONDITIONAL_BALANCE to anyone who triggers the transferAndCall for the first time', async () => {
    mockLinkToken = mockLinkToken.connect(alice)

    const UNCONDITIONAL_BALANCE = await mockLinkToken.UNCONDITIONAL_BALANCE()

    const initialBalance = await mockLinkToken.balanceOf(alice.address)
    expect(initialBalance).to.equal(0)

    const amount = BigNumber.from(10).pow(18)
    await expect(() =>
      mockLinkToken.transferAndCall(bob.address, amount, '0x'),
    ).to.changeTokenBalances(
      mockLinkToken,
      [alice, bob],
      [UNCONDITIONAL_BALANCE.sub(amount), amount],
    )
  })
})
