package main

import (
	"C"

	"fmt"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"

	"evilink/pkg/vrf"
)

// GenerateProof exports GenerateProof
//export GenerateProof
func GenerateProof(privateKey, preSeed, blockHash []byte, blockNumber uint64) (*C.char, *C.char, *C.char, *C.char) {
	proof, err := (&vrf.Key{D: common.BytesToHash(privateKey).Big()}).
		GenerateProof(vrf.PreSeedData{
			PreSeed:     common.BytesToHash(preSeed),
			BlockHash:   common.BytesToHash(blockHash),
			BlockNumber: blockNumber,
		})

	if err != nil {
		return nil, nil, nil, C.CString(fmt.Sprintf("%v", err))
	}

	return C.CString(proof.Randomness.Hex()), C.CString(hexutil.Encode(proof.Packed[:])),
		C.CString(hexutil.Encode(proof.PackedForContractInput[:])), nil
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
