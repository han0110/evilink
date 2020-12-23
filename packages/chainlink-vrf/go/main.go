package main

import (
	"C"

	"fmt"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"

	"evilink/pkg/vrf"
)

// GenVRFRandomness exports GenerateRandomness
//export GenVRFRandomness
func GenVRFRandomness(privateKey, preSeed, blockHash []byte, blockNumber uint64) (*C.char, *C.char) {
	randomness, err := (&vrf.Key{D: common.BytesToHash(privateKey).Big()}).
		GenerateRandomness(vrf.PreSeedData{
			PreSeed:     common.BytesToHash(preSeed),
			BlockHash:   common.BytesToHash(blockHash),
			BlockNumber: blockNumber,
		})

	if err != nil {
		return nil, C.CString(fmt.Sprintf("%v", err))
	}

	return C.CString(randomness.Hex()), nil
}

// PublicKey exports PublicKey
//export PublicKey
func PublicKey(privateKey []byte) (*C.char, *C.char, *C.char) {
	publicKey := (&vrf.Key{D: common.BytesToHash(privateKey).Big()}).PublicKey()
	return C.CString(hexutil.Encode(publicKey.X.Bytes())),
		C.CString(hexutil.Encode(publicKey.Y.Bytes())),
		C.CString(publicKey.Hash.Hex())
}

func main() {}
