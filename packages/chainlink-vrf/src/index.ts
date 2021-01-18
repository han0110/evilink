import assert from 'assert'
import build from 'node-gyp-build'

const addon = build(`${__dirname}/..`)

const hashRegExp = new RegExp('^(0x)?[0-9a-f]{64}$', 'i')

export type Proof = {
  randomness: string
  packed: string
  packedForContractInput: string
}

export const generateProof = (
  privateKey: string,
  preSeed: string,
  blockHash: string,
  blockNumber: number,
): Proof => {
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

  return addon.generateProof(
    Buffer.from(privateKey.replace('0x', ''), 'hex'),
    Buffer.from(preSeed.replace('0x', ''), 'hex'),
    Buffer.from(blockHash.replace('0x', ''), 'hex'),
    blockNumber,
  )
}

export type PublicKey = {
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

export const compressed = ({ x, y }: PublicKey): string =>
  `${x}${parseInt(y.slice(-1), 16) % 2 ? '01' : '00'}`
