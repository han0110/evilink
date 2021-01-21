/* eslint-disable import/no-extraneous-dependencies, no-param-reassign */

import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { Contract } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'
import { generateProof, publicKey, Proof } from '@evilink/chainlink-vrf'
import { deployChainlinkStack } from '../src/chainlink-stack'

use(solidity)

export type VRFService = {
  idx: number
  privateKey: string
  keyHash: string
  x: string
  y: string
  oracleAddress: string
  jobId: string
  fee: number
  generateProof: (
    preSeed: string,
    blockHash: string,
    blockNumber: number,
  ) => Proof
}

export const deployChainlinkStackWithServices = async (
  wallets: Wallet[],
): Promise<{
  mockLinkToken: Contract
  vrfCoordinator: Contract
  vrfServices: Array<VRFService>
}> => {
  const { mockLinkToken, vrfCoordinator } = await deployChainlinkStack(
    wallets[0],
  )
  expect(mockLinkToken.address).to.properAddress
  expect(vrfCoordinator.address).to.properAddress

  // Random services
  const vrfServices = Array(5)
    .fill(undefined)
    .map((_, idx) => {
      const privateKey = hexlify(randomBytes(32))
      const { x, y, hash } = publicKey(privateKey)
      return {
        idx,
        privateKey,
        x,
        y,
        keyHash: hash,
        oracleAddress: hexlify(randomBytes(20)),
        jobId: hexlify(randomBytes(32)),
        fee: 0,
        generateProof: (
          preSeed: string,
          blockHash: string,
          blockNumber: number,
        ) => generateProof(privateKey, preSeed, blockHash, blockNumber),
      }
    })

  // Register services
  await Promise.all(
    vrfServices.map(({ fee, oracleAddress, x, y, keyHash, jobId }, idx) =>
      expect(
        vrfCoordinator
          .connect(wallets[idx + 1])
          .registerProvingKey(fee, oracleAddress, [x, y], jobId),
      )
        .to.emit(vrfCoordinator, 'NewServiceAgreement')
        .withArgs(keyHash, fee),
    ),
  )

  return {
    mockLinkToken,
    vrfCoordinator,
    vrfServices,
  }
}

export const shuffle = (array: Array<any>) => {
  array = [...array]
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}
