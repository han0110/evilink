package vrf

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
)

var (
	keyD    = common.HexToHash("0x0fdcdb4f276c1b7f6e3b17f6c80d6bdd229cee59955b0b6a0c69f67cbf3943fa").Big()
	keyHash = common.HexToHash("0x9fe62971ada37edbdab3582f8aec660edf7c59b4659d1b9cf321396b73918b56")
)

func TestKeyHash(t *testing.T) {
	publicKey := (&Key{keyD}).PublicKey()
	assert.Equal(t, publicKey.Hash, keyHash, "invalid key hash generated")
}

func TestGenerateRandomness(t *testing.T) {
	proof, err := (&Key{keyD}).GenerateProof(PreSeedData{
		PreSeed:     common.HexToHash("0xb3fb0f766b15159704d515f5e17f813a85d784bcc39ce982af38f0e997aef007"),
		BlockHash:   common.HexToHash("0xda2f81c1e0a64897c37fe16a8d0dce7ea5c2a0de03c9a629277cdd925b3ac228"),
		BlockNumber: 777,
	})

	expectedRandomness := common.HexToHash("0x3c050221596be1d77aecba25186a0b1bcbf131d6fd5846c07f5c2ffb107b2f9b")
	assert.Nil(t, err, "failed to generate randomness")
	assert.Equal(t, proof.Randomness, expectedRandomness, "invalid randomness generated")
}
