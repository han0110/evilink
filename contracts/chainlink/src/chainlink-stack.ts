import { Contract, Wallet, providers } from 'ethers'
import {
  mockLinkTokenFactory,
  blockhashStoreFactory,
  vrfCoordinatorFactory,
} from './artifact'

export type ChainlinkStack = {
  mockLinkToken: Contract
  vrfCoordinator: Contract
}

export const deployChainlinkStack = async (
  deployer: Wallet,
  options?: providers.TransactionRequest,
): Promise<ChainlinkStack> => {
  const mockLinkToken = await mockLinkTokenFactory.deploy(
    deployer,
    options ?? {},
  )
  const blockhashStore = await blockhashStoreFactory.deploy(
    deployer,
    options ?? {},
  )
  const vrfCoordinator = await vrfCoordinatorFactory.deploy(
    deployer,
    mockLinkToken.address,
    blockhashStore.address,
    options ?? {},
  )

  return { mockLinkToken, vrfCoordinator }
}
