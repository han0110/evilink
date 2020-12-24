import { StandardContractOutput } from 'ethereum-types'
import { ContractFactory, Wallet } from 'ethers'

export const createContractFactory = (artifact: StandardContractOutput) => {
  const factory = new ContractFactory(artifact.abi, artifact.evm.bytecode)
  return {
    deploy: async (deployer: Wallet, ...args: Array<any>) =>
      factory
        .connect(deployer)
        .deploy(...args)
        .then((contract) => contract.deployed()),
    attach: (address: string) => factory.attach(address),
  }
}

export { StandardContractOutput }
