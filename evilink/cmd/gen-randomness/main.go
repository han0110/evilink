package main

import (
	"context"
	"fmt"
	"os"

	"github.com/ethereum/go-ethereum/common"
	"github.com/go-playground/validator/v10"
	"github.com/han0110/configo"
	"github.com/pkg/errors"
	"go.uber.org/fx"

	"evilink/pkg/vrf"
)

// Args defines arguments to generate randomness
type Args struct {
	Passphrase  string `validate:"required"`
	KeyDir      string `validate:"required"`
	KeyHash     string `validate:"required,hexadecimal,len=64|len=66"`
	PreSeed     string `validate:"required,hexadecimal,len=64|len=66"`
	BlockHash   string `validate:"required,hexadecimal,len=64|len=66"`
	BlockNumber uint64 `validate:"required,gt=0"`
}

func newArgs() (*Args, error) {
	var args Args
	if err := configo.Default().Load(&args, os.Args[1:]); err != nil {
		return nil, errors.Wrap(err, "failed to load arguments")
	}

	return &args, errors.Wrap(validator.New().Struct(args), "invalid argument")
}

func newVRFStore(args *Args) *vrf.Store {
	store := vrf.NewStore(args.KeyDir, args.Passphrase)
	return &store
}

func generateRandomness(args *Args, store *vrf.Store) error {
	randomness, err := store.GenerateRandomness(common.HexToHash(args.KeyHash), vrf.PreSeedData{
		PreSeed:   common.HexToHash(args.PreSeed),
		BlockHash: common.HexToHash(args.BlockHash),
		BlockNum:  args.BlockNumber,
	})
	if err != nil {
		return errors.Wrap(err, "failed to generate randomness")
	}

	_, err = fmt.Fprintf(os.Stdout, "%s", randomness.Hex())
	return err
}

func main() {
	app := fx.New(
		fx.NopLogger,
		fx.Provide(newArgs, newVRFStore),
		fx.Invoke(generateRandomness),
	)
	if err := app.Start(context.TODO()); err != nil {
		fmt.Fprintf(os.Stderr, "%v", err)
	}
}
