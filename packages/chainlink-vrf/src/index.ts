import assert from 'assert'
import build from 'node-gyp-build'

const addon = build(`${__dirname}/..`)

const hashRegExp = new RegExp('^(0x)?[0-9a-f]{64}$', 'i')

export const genVRFRandomness = (
  privateKey: string,
  preSeed: string,
  blockHash: string,
  blockNumber: number,
): string => {
  assert(
    hashRegExp.test(privateKey),
    `expect privateKey in form of ${hashRegExp.source}`,
  )
  assert(
    hashRegExp.test(preSeed),
    `expect preSeed in form of ${hashRegExp.source}`,
  )
  assert(
    hashRegExp.test(blockHash),
    `expect blockHash in form of ${hashRegExp.source}`,
  )
  assert(blockNumber > 0, 'expect blockNumber greater than 0')

  return addon.genVRFRandomness(
    Buffer.from(privateKey.replace('0x', ''), 'hex'),
    Buffer.from(preSeed.replace('0x', ''), 'hex'),
    Buffer.from(blockHash.replace('0x', ''), 'hex'),
    blockNumber,
  )
}

interface PublicKey {
  x: string
  y: string
  hash: string
}

export const publicKey = (privateKey: string): PublicKey => {
  assert(
    hashRegExp.test(privateKey),
    `expect privateKey in form of ${hashRegExp.source}`,
  )

  return addon.publicKey(Buffer.from(privateKey.replace('0x', ''), 'hex'))
}
