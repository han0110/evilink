import { WeiPerEther, AddressZero, HashZero } from '@ethersproject/constants'

export const ZERO_ADDRESS = AddressZero
export const ZERO_HASH = HashZero

export const ONE_ETHER = WeiPerEther
export const ONE_MILLION_ETHER = WeiPerEther.mul(1e6)

export const GAS_LIMIT = 1e7

export const GENESIS_PRIVATE_KEY =
  '0xe2f6e93e87143eefce3f0f1be1a05efb6faef4991a8f0b63abdc81b75e2def05'

export { default as CONTRACT_ADDRESS } from './contract-address'
