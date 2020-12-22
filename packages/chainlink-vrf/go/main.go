package main

import (
	"C"

	"crypto/ecdsa"
	"fmt"

	"github.com/ethereum/go-ethereum/common"

	"evilink/pkg/vrf"
)

//export GenVRFRandomness
func GenVRFRandomness(privateKey, preSeed, blockHash []byte, blockNumber uint64) (*C.char, *C.char) {
	randomness, err := vrf.GenerateRandomness(&ecdsa.PrivateKey{D: common.BytesToHash(privateKey).Big()}, vrf.PreSeedData{
		PreSeed:     common.BytesToHash(preSeed),
		BlockHash:   common.BytesToHash(blockHash),
		BlockNumber: blockNumber,
	})

	if err != nil {
		return nil, C.CString(fmt.Sprintf("%v", err))
	}

	return C.CString(randomness.Hex()), nil
}

func main() {}
