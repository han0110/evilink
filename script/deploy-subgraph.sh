#!/bin/bash

set -eo pipefail

IPFS_URI="${IPFS_URI:-http://localhost:5001}"
THE_GRAPH_ADMIN_URI="${THE_GRAPH_ADMIN_URI:-http://localhost:8020}"

main() {
    SUBGRAPH=$1
    if [ -z "$SUBGRAPH" ]; then echo "subgraph name is required" && exit 1; else shift; fi

    graph create --node "$THE_GRAPH_ADMIN_URI" "$SUBGRAPH"
    graph deploy --node "$THE_GRAPH_ADMIN_URI" --ipfs "$IPFS_URI" "$SUBGRAPH"
}

main "$@"
