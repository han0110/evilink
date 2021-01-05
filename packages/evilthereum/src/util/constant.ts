import { Wallet } from '@ethersproject/wallet'
import { WeiPerEther } from '@ethersproject/constants'

export const ONE_MILLION_ETHER = WeiPerEther.mul(1e6)

export const GAS_LIMIT = 1e7

export const PRIVATE_KEY_GENESIS =
  '0xe2f6e93e87143eefce3f0f1be1a05efb6faef4991a8f0b63abdc81b75e2def05'

export const ADDRESS_GENESIS = new Wallet(PRIVATE_KEY_GENESIS).address
export const ADDRESS_FAUCET = '0xec8f6a7ebea05fe6bcfce2c0e186f8351ea07281'
export const ADDRESS_LINK = '0x87cc55e4e3b0a7f8f34cee3a3b39c674b9501ef3'
export const ADDRESS_VRF_COORDINATOR =
  '0x4b02650cff1d485bf710b09d6ab52af90d77f922'
