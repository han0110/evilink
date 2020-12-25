import { existsSync } from 'fs'
import { Wallet, providers } from 'ethers'
import { mockLinkTokenFactory } from '@evilink/contracts-chainlink'
import { createServer } from '../core/server'
import logger from '../util/logger'
import { serializeInto, deserializeFrom } from '../util/env-serde'

const ENV_KEY_LINK_CONTRACT_ADDRESS = 'LINK_CONTRACT_ADDRESS'

const action = async (options) => {
  const {
    parent: { chainId, chainDbPath },
    chainlinkEnvFile,
  } = options

  let chainlinkEnv: { [key: string]: string } = {}
  if (existsSync(chainlinkEnvFile)) {
    chainlinkEnv = await deserializeFrom(chainlinkEnvFile)
    if (chainlinkEnv[ENV_KEY_LINK_CONTRACT_ADDRESS]) {
      logger.info(
        `MockLinkToken address: ${chainlinkEnv[ENV_KEY_LINK_CONTRACT_ADDRESS]}`,
      )
      return
    }
  }

  const server = createServer({ chainId, chainDbPath })
  const provider = new providers.Web3Provider(
    // @ts-ignore
    server.provider,
  )

  const contract = await mockLinkTokenFactory.deploy(
    Wallet.createRandom().connect(provider),
    { gasPrice: 0 },
  )
  logger.debug(
    `MockLinkToken deployed transaction receipt: \n${JSON.stringify(
      await provider.getTransactionReceipt(contract.deployTransaction.hash),
      null,
      2,
    )}`,
  )
  logger.info(`MockLinkToken address: ${contract.address}`)

  chainlinkEnv[ENV_KEY_LINK_CONTRACT_ADDRESS] = contract.address
  await serializeInto(chainlinkEnv, chainlinkEnvFile)
}

export default action
