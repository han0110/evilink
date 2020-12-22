import { expect } from 'chai'

import { genVRFRandomness } from '../src'

describe('genVRFRandomness', () => {
  const [privateKey, preSeed, blockHash, blockNumber] = [
    '0x0fdcdb4f276c1b7f6e3b17f6c80d6bdd229cee59955b0b6a0c69f67cbf3943fa',
    '0xb3fb0f766b15159704d515f5e17f813a85d784bcc39ce982af38f0e997aef007',
    '0xda2f81c1e0a64897c37fe16a8d0dce7ea5c2a0de03c9a629277cdd925b3ac228',
    777,
  ]

  it('should succeed to call genVRFRandomness', () => {
    const randomness = genVRFRandomness(
      privateKey,
      preSeed,
      blockHash,
      blockNumber,
    )
    const expectedRandomness =
      '0x3c050221596be1d77aecba25186a0b1bcbf131d6fd5846c07f5c2ffb107b2f9b'
    expect(randomness).to.equal(expectedRandomness)
  })

  it('should fail to call genVRFRandomness with invalid argument', () => {
    expect(() =>
      genVRFRandomness(privateKey.substr(10), preSeed, blockHash, blockNumber),
    ).to.throw('expect privateKey in form of ^(0x)?[0-9a-f]{64}$')
    expect(() =>
      genVRFRandomness(privateKey, preSeed.substr(10), blockHash, blockNumber),
    ).to.throw('expect preSeed in form of ^(0x)?[0-9a-f]{64}$')
    expect(() =>
      genVRFRandomness(privateKey, preSeed, blockHash.substr(10), blockNumber),
    ).to.throw('expect blockHash in form of ^(0x)?[0-9a-f]{64}$')
    expect(() =>
      genVRFRandomness(privateKey, preSeed, blockHash, -blockNumber),
    ).to.throw('expect blockNumber greater than 0')
  })
})
