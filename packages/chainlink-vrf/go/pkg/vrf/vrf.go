package vrf

import (
	"crypto/ecdsa"
	"math/big"

	"github.com/alangpierce/go-forceexport"
	"github.com/ethereum/go-ethereum/accounts/keystore"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/pkg/errors"
	"github.com/smartcontractkit/chainlink/core/services/signatures/secp256k1"
	"github.com/smartcontractkit/chainlink/core/services/vrf"
	"github.com/smartcontractkit/chainlink/core/store/models/vrfkey"
)

var (
	fromGethKey func(gethKey *keystore.Key) *vrfkey.PrivateKey
	emptyHash   = common.Hash{}
)

func init() {
	if err := forceexport.GetFunc(&fromGethKey, "github.com/smartcontractkit/chainlink/core/store/models/vrfkey.fromGethKey"); err != nil {
		panic(err)
	}
}

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

// PreSeedData defines the randomness request payload
type PreSeedData struct {
	PreSeed     common.Hash
	BlockHash   common.Hash
	BlockNumber uint64
}

// GenerateRandomness generates VRF randomness from provided pre-seed data
func (key *Key) GenerateRandomness(preSeedData PreSeedData) (common.Hash, error) {
	privateKey := fromGethKey(&keystore.Key{PrivateKey: &ecdsa.PrivateKey{D: key.D}})

	vrfPreSeedData := vrf.PreSeedData{
		PreSeed:   vrf.Seed(preSeedData.PreSeed),
		BlockHash: preSeedData.BlockHash,
		BlockNum:  preSeedData.BlockNumber,
	}

	proofBytes, err := privateKey.MarshaledProof(vrfPreSeedData)
	if err != nil {
		return emptyHash, errors.Wrap(err, "failed to generate proof bytes")
	}

	proofRes, err := vrf.UnmarshalProofResponse(proofBytes)
	if err != nil {
		return emptyHash, errors.Wrap(err, "failed to unmarshal proof response")
	}

	proof, err := proofRes.CryptoProof(vrfPreSeedData)
	if err != nil {
		return emptyHash, errors.Wrap(err, "failed to validate proof")
	}

	return common.BigToHash(proof.Output), nil
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
