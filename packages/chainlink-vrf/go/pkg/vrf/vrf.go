package vrf

import (
	"crypto/ecdsa"

	"github.com/alangpierce/go-forceexport"
	"github.com/ethereum/go-ethereum/accounts/keystore"
	"github.com/ethereum/go-ethereum/common"
	"github.com/pkg/errors"
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

// PreSeedData defines the randomness request payload
type PreSeedData struct {
	PreSeed     common.Hash
	BlockHash   common.Hash
	BlockNumber uint64
}

func GenerateRandomness(ecdsaPrivateKey *ecdsa.PrivateKey, preSeedData PreSeedData) (common.Hash, error) {
	privateKey := fromGethKey(&keystore.Key{PrivateKey: ecdsaPrivateKey})

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
