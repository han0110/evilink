package vrf

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/pkg/errors"
	"github.com/smartcontractkit/chainlink/core/services/signatures/secp256k1"
	"github.com/smartcontractkit/chainlink/core/services/vrf"
)

// Key defines VRF private key
type Key struct {
	D *big.Int
}

// PublicKey defines VRF public key
type PublicKey struct {
	X    *big.Int
	Y    *big.Int
	Hash common.Hash
}

// PreSeedData defines randomness request payload
type PreSeedData struct {
	PreSeed     common.Hash
	BlockHash   common.Hash
	BlockNumber uint64
}

// Proof defines VRF proof
type Proof struct {
	Randomness             common.Hash
	Packed                 [vrf.ProofLength]byte
	PackedForContractInput [vrf.ProofLength + common.HashLength]byte
}

// PublicKey returns corresponding pubilc key coordinate (x, y) on secp256k1
// and keccack256(...x, ...y) as hash.
func (key *Key) PublicKey() PublicKey {
	zero := (&secp256k1.Secp256k1{}).Point()
	x, y := secp256k1.Coordinates(zero.Mul(secp256k1.IntToScalar(key.D), nil))
	return PublicKey{
		X:    x,
		Y:    y,
		Hash: crypto.Keccak256Hash(append(x.Bytes(), y.Bytes()...)),
	}
}

// GenerateProof generates proof from provided pre-seed data
func (key *Key) GenerateProof(preSeedData PreSeedData) (Proof, error) {
	seed := vrf.FinalSeed(vrf.PreSeedData{
		PreSeed:   vrf.Seed(preSeedData.PreSeed),
		BlockHash: preSeedData.BlockHash,
		BlockNum:  preSeedData.BlockNumber,
	})

	proof, err := vrf.GenerateProof(secp256k1.ScalarToHash(secp256k1.IntToScalar(key.D)), common.BigToHash(seed))
	if err != nil {
		return Proof{}, errors.Wrap(err, "failed to generate proof")
	}

	packed, err := proof.MarshalForSolidityVerifier()
	if err != nil {
		return Proof{}, errors.Wrap(err, "failed to pack proof for solidity verifier")
	}

	var packedForContractInput [vrf.ProofLength + common.HashLength]byte
	copy(packedForContractInput[:], packed[:])
	copy(packedForContractInput[6*common.HashLength:7*common.HashLength], preSeedData.PreSeed.Bytes())
	copy(packedForContractInput[vrf.ProofLength:], common.BigToHash(big.NewInt(int64(preSeedData.BlockNumber))).Bytes())

	return Proof{
		Randomness:             common.BigToHash(proof.Output),
		Packed:                 packed,
		PackedForContractInput: packedForContractInput,
	}, nil
}
