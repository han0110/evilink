.PHONY: download-modules build

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	GO_ENV += CGO_ENABLED=0
endif
GO := $(GO_ENV) go

download-modules:
	@echo download go.mod dependencies
	@$(GO) mod download

build: download-modules
	@echo build gen-randomness
	@$(GO) build -o build/gen-randomness ./cmd/gen-randomness
