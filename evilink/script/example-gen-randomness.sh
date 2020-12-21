#!/bin/sh

go run ./cmd/gen-randomness \
    --passphrase evilink \
    --key-dir ./pkg/vrf/fixture \
    --key-hash 0x9fe62971ada37edbdab3582f8aec660edf7c59b4659d1b9cf321396b73918b56 \
    --pre-seed 0xb3fb0f766b15159704d515f5e17f813a85d784bcc39ce982af38f0e997aef007 \
    --block-hash 0xda2f81c1e0a64897c37fe16a8d0dce7ea5c2a0de03c9a629277cdd925b3ac228 \
    --block-number 777
