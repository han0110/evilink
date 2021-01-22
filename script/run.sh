#!/bin/bash

set -eo pipefail

DIR_ROOT="$(dirname "${BASH_SOURCE[0]}")/.."

# shellcheck disable=SC1090
source "$DIR_ROOT/script/util.sh"

ENV="$DIR_ROOT/script/docker-compose.env"
ENV_SAMPLE="$DIR_ROOT/script/docker-compose.sample.env"

PROJECT="evilink"
COMMANDS=(
    build
    config
    up
    down
    exec
    clean
    deploy_subgraph
)
BUILD_TARGETS=(
    evilthereum
    playground
)
SUBGRAPHS=(
    flipcoin
)

env_docker_compose() {
    [ ! -f "$ENV" ] && cp "$ENV_SAMPLE" "$ENV"
    # shellcheck disable=SC2046
    env $(grep -v '^#' "$ENV") \
        docker-compose -p "$PROJECT" -f "$DIR_ROOT/script/docker-compose.yml" "$@"
}

read_container_id_or_exit() {
    TARGET_CONTAINER_NAME=$1

    ALL_CONTAINERS=()
    while IFS='' read -r CONTAINER; do ALL_CONTAINERS+=("$CONTAINER"); done < \
        <(docker ps --filter "label=com.docker.compose.project=$PROJECT" --format "{{ .Label \"com.docker.compose.service\" }}:{{ .ID }}")

    if [ ${#ALL_CONTAINERS[@]} -eq  0 ]; then
        echo "nothing found in project $PROJECT, have you ever run 'bash script/run.sh up'?" >&2
        exit 1
    fi

    TARGET_CONTAINER_ID=$(value "${ALL_CONTAINERS[@]}" "$TARGET_CONTAINER_NAME")
    if [ -z "$TARGET_CONTAINER_ID" ]; then
        printf 'please specify container in\n' >&2
        printf '  * %s\n' "${ALL_CONTAINERS[@]//:*/}" >&2
        exit 1
    fi

    echo "$TARGET_CONTAINER_ID"
}

build() {
    PACKAGE="$1"
    if [ -n "$PACKAGE" ]; then
        help_if_command_not_found "${BUILD_TARGETS[@]}" "$PACKAGE"
        BUILD_TARGETS=("$PACKAGE")
        shift
    fi

    for TARGET in "${BUILD_TARGETS[@]}"; do
        yarn workspace "@evilink/$TARGET" build
        yarn docker build "@evilink/$TARGET" -t "${DOCKER_HUB_USER:-evilink}/$TARGET" "$@"
    done
}

config() {
    env_docker_compose config
}

up() {
    # make initdb.d script executable for postgresql initialization
    [ ! -d "$DIR_ROOT/.postgres/data" ] && chmod +x "$DIR_ROOT/.postgres/initdb.d/"*.sh
    env_docker_compose up -d "$@"
}

down() {
    env_docker_compose down
}

exec() {
    TARGET_CONTAINER_NAME=$1
    if [ -z "$TARGET_CONTAINER_NAME" ]; then echo "container name is required" && exit 1; else shift; fi

    TARGET_CONTAINER_ID=$(read_container_id_or_exit "$TARGET_CONTAINER_NAME")

    ENTRYPOINT=${1:-/bin/bash}
    docker exec -it "$TARGET_CONTAINER_ID" "$ENTRYPOINT"
}

clean() {
    rm -rf "${DIR_ROOT}/.chainlink/root"
    rm -rf "${DIR_ROOT}/.evilthereum/chaindb"
    rm -rf "${DIR_ROOT}/.ipfs/data"
    rm -rf "${DIR_ROOT}/.postgres/data"
}

deploy_subgraph() {
    NETWORK_ID=$(docker network ls \
        --filter "label=com.docker.compose.project=${PROJECT}" \
        --filter "name=internal" \
        --format "{{ .ID }}")
    THE_GRAPH_ID=$(read_container_id_or_exit graph-node)
    IPFS_ID=$(read_container_id_or_exit ipfs)

    SUBGRAPH=$1
    if [ -z "$SUBGRAPH" ]; then echo "subgraph name is required" && exit 1; else shift; fi
    help_if_command_not_found "${SUBGRAPHS[@]}" "$SUBGRAPH"

    docker run \
        -v "$(pwd)/${DIR_ROOT}/contracts/${SUBGRAPH}:/subgraph" \
        -w /subgraph \
        --network "$NETWORK_ID" \
        -e "THE_GRAPH_ADMIN_URI=http://${THE_GRAPH_ID}:8020" \
        -e "IPFS_URI=http://${IPFS_ID}:5001" \
        han0110/subgraph "$SUBGRAPH" "$@"
}

main() {
    help_if_command_not_found "${COMMANDS[@]}" "$1"
    "$@"
}

main "${@:-up}"
