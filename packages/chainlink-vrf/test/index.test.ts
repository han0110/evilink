import { expect } from 'chai'

import { generateProof, publicKey } from '../src'

describe('generateProof', () => {
  const [privateKey, preSeed, blockHash, blockNumber] = [
    '0x0fdcdb4f276c1b7f6e3b17f6c80d6bdd229cee59955b0b6a0c69f67cbf3943fa',
    '0xb3fb0f766b15159704d515f5e17f813a85d784bcc39ce982af38f0e997aef007',
    '0xda2f81c1e0a64897c37fe16a8d0dce7ea5c2a0de03c9a629277cdd925b3ac228',
    777,
  ]

  it('should succeed to call generateProof', () => {
    const proof = generateProof(privateKey, preSeed, blockHash, blockNumber)
    const expectedRandomness =
      '0x3c050221596be1d77aecba25186a0b1bcbf131d6fd5846c07f5c2ffb107b2f9b'
    expect(proof.randomness).to.equal(expectedRandomness)
    expect(proof.packed).to.length(2 + 13 * 64)
    expect(proof.packedForContractInput).to.length(2 + 14 * 64)
  })

  it('should fail to call generateProof with invalid argument', () => {
    expect(() =>
      generateProof(privateKey.substr(10), preSeed, blockHash, blockNumber),
    ).to.throw('expect privateKey in form of ^(0x)?[0-9a-f]{64}$')
    expect(() =>
      generateProof(privateKey, preSeed.substr(10), blockHash, blockNumber),
    ).to.throw('expect preSeed in form of ^(0x)?[0-9a-f]{64}$')
    expect(() =>
      generateProof(privateKey, preSeed, blockHash.substr(10), blockNumber),
    ).to.throw('expect blockHash in form of ^(0x)?[0-9a-f]{64}$')
    expect(() =>
      generateProof(privateKey, preSeed, blockHash, -blockNumber),
    ).to.throw('expect blockNumber greater than 0')
  })
})

describe('publicKey', () => {
  const privateKey =
    '0x0fdcdb4f276c1b7f6e3b17f6c80d6bdd229cee59955b0b6a0c69f67cbf3943fa'

  it('should succeed to call publicKey', () => {
    const expectedPublicKey = {
      x: '0x846c38f26b8d5500182d2a6f772088779f8486640a90b2de0c9f591f3176608a',
      y: '0xdd6914234c8294d54e7d88e95db89869b8e7dc11607fef7eed0419323f157411',
      hash:
        '0x9fe62971ada37edbdab3582f8aec660edf7c59b4659d1b9cf321396b73918b56',
    }
    expect(publicKey(privateKey)).to.eql(expectedPublicKey)
  })

  it('should fail to call publicKey with invalid argument', () => {
    expect(() => publicKey(privateKey.substr(10))).to.throw(
      'expect privateKey in form of ^(0x)?[0-9a-f]{64}$',
    )
  })
})
