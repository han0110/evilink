import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { deployChainlinkStack } from '@evilink/contracts-chainlink'
import { faucetFactory } from '@evilink/contracts-faucet'
import {
  ONE_MILLION_ETHER,
  PRIVATE_KEY_GENESIS,
  ADDRESS_FAUCET,
  ADDRESS_LINK,
  ADDRESS_VRF_COORDINATOR,
} from '../util/constant'
import rootLogger from '../util/logger'

const logger = rootLogger.child({ prefix: 'migration' })

const migration = async (ganacheProvider) => {
  // @ts-ignore
  const provider = new Web3Provider(ganacheProvider)
  const wallet = new Wallet(PRIVATE_KEY_GENESIS).connect(provider)

  if (
    (await provider.getCode(ADDRESS_FAUCET)) !== '0x' &&
    (await provider.getCode(ADDRESS_LINK)) !== '0x' &&
    (await provider.getCode(ADDRESS_VRF_COORDINATOR)) !== '0x'
  ) {
    return
  }

  const faucet = await faucetFactory.deploy(wallet, {
    gasPrice: 0,
  })
  const { mockLinkToken, vrfCoordinator } = await deployChainlinkStack(wallet, {
    gasPrice: 0,
  })

  await wallet.sendTransaction({
    to: faucet.address,
    value: ONE_MILLION_ETHER,
    gasPrice: 0,
  })

  if (
    !(
      ADDRESS_FAUCET === faucet.address.toLowerCase() &&
      ADDRESS_LINK === mockLinkToken.address.toLowerCase() &&
      ADDRESS_VRF_COORDINATOR === vrfCoordinator.address.toLowerCase()
    )
  ) {
    throw new Error(
      'unexpected well-known contracts address dismatching, please cleanup chaindb and restart again',
    )
  }

  logger.info('successfully initialized')
  logger.info(`Faucet address:         ${ADDRESS_FAUCET}`)
  logger.info(`MockLinkToken address:  ${ADDRESS_LINK}`)
  logger.info(`VRFCoordinator address: ${ADDRESS_VRF_COORDINATOR}`)
}

export default migration
