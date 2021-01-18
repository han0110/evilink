import { expect, use } from 'chai'
import { MockProvider, solidity } from 'ethereum-waffle'
import { Contract } from '@ethersproject/contracts'
import { WeiPerEther } from '@ethersproject/constants'
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
      value: WeiPerEther.mul(50),
    })
  })

  it('should withdraw', async () => {
    await expect(await faucet.withdraw(WeiPerEther)).to.changeEtherBalances(
      [walletA, faucet],
      [WeiPerEther, WeiPerEther.mul(-1)],
    )
  })

  it('should withdrawTo', async () => {
    await expect(
      await faucet.withdrawTo(walletB.address, WeiPerEther),
    ).to.changeEtherBalances(
      [walletA, walletB, faucet],
      [0, WeiPerEther, WeiPerEther.mul(-1)],
    )
  })
})
