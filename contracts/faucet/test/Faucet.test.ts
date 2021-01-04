import { expect, use } from 'chai'
import { Contract, constants } from 'ethers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { faucetFactory } from '../src'

use(solidity)

describe('Faucet', () => {
  const [walletA, walletB] = new MockProvider().getWallets()

  let faucet: Contract

  beforeEach(async () => {
    faucet = await faucetFactory.deploy(walletA)
    expect(faucet.address).to.be.properAddress
    await walletA.sendTransaction({
      to: faucet.address,
      value: constants.WeiPerEther.mul(50),
    })
  })

  it('should withdraw', async () => {
    await expect(
      await faucet.withdraw(constants.WeiPerEther),
    ).to.changeEtherBalances(
      [walletA, faucet],
      [constants.WeiPerEther, constants.WeiPerEther.mul(-1)],
    )
  })

  it('should withdrawTo', async () => {
    await expect(
      await faucet.withdrawTo(walletB.address, constants.WeiPerEther),
    ).to.changeEtherBalances(
      [walletA, walletB, faucet],
      [0, constants.WeiPerEther, constants.WeiPerEther.mul(-1)],
    )
  })
})
