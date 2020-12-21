package vrf

import (
	"fmt"
	"io/ioutil"

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

// Store wraps private function of chainlink's vrf package.
type Store struct {
	keyDir           string
	passphrase       string
	privateKeyByHash map[common.Hash]*vrfkey.PrivateKey
}

// NewStore creates Store with key directory and passphrase.
// Currently it only supports the same passphrase.
func NewStore(keyDir, passphrase string) Store {
	return Store{
		keyDir:           keyDir,
		passphrase:       passphrase,
		privateKeyByHash: make(map[common.Hash]*vrfkey.PrivateKey),
	}
}

// PreSeedData defines the randomness request payload
type PreSeedData struct {
	PreSeed   common.Hash
	BlockHash common.Hash
	BlockNum  uint64
}

// GenerateRandomness generates randomness from payload by corresponding private key
func (store *Store) GenerateRandomness(keyHash common.Hash, preSeedData PreSeedData) (common.Hash, error) {
	vrfPreSeedData := vrf.PreSeedData{
		PreSeed:   vrf.Seed(preSeedData.PreSeed),
		BlockHash: preSeedData.BlockHash,
		BlockNum:  preSeedData.BlockNum,
	}

	privateKey, err := store.privateKey(keyHash)
	if err != nil {
		return emptyHash, errors.Wrap(err, "failed to find private key")
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

func (store *Store) privateKey(keyHash common.Hash) (*vrfkey.PrivateKey, error) {
	if key, ok := store.privateKeyByHash[keyHash]; ok {
		return key, nil
	}

	keyBytes, err := ioutil.ReadFile(fmt.Sprintf("%s/%s", store.keyDir, keyHash.Hex()))
	if err != nil {
		return nil, errors.Wrap(err, "failed to read key file")
	}

	gethKey, err := keystore.DecryptKey(keyBytes, store.passphrase)
	if err != nil {
		return nil, errors.Wrap(err, "failed to decrypt key")
	}

	return fromGethKey(gethKey), nil
}
