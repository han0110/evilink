import { StandardContractOutput } from 'ethereum-types'
import { ContractFactory } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'

export const createContractFactory = (artifact: StandardContractOutput) => {
  const factory = new ContractFactory(artifact.abi, artifact.evm.bytecode)
  return {
    interface: factory.interface,
    deploy: async (wallet: Wallet, ...args: Array<any>) =>
      factory
        .connect(wallet)
        .deploy(...args)
        .then((contract) => contract.deployed()),
    attach: (address: string) => factory.attach(address),
  }
}

export { StandardContractOutput, ContractFactory }
