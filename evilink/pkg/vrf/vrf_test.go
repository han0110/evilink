package vrf

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
)

var keyHash = common.HexToHash("0x9fe62971ada37edbdab3582f8aec660edf7c59b4659d1b9cf321396b73918b56")

func newTestVStore() Store {
	return NewStore("./fixture", "evilink")
}

func TestGenerateRandomness(t *testing.T) {
	store := newTestVStore()
	randomness, err := store.GenerateRandomness(keyHash, PreSeedData{
		PreSeed:   common.HexToHash("0xb3fb0f766b15159704d515f5e17f813a85d784bcc39ce982af38f0e997aef007"),
		BlockHash: common.HexToHash("0xda2f81c1e0a64897c37fe16a8d0dce7ea5c2a0de03c9a629277cdd925b3ac228"),
		BlockNum:  777,
	})

	expectedRandomness := common.HexToHash("0x3c050221596be1d77aecba25186a0b1bcbf131d6fd5846c07f5c2ffb107b2f9b")
	assert.Nil(t, err, "failed to generate randomness")
	assert.Equal(t, randomness, expectedRandomness, "invalid randomness generated")
}
