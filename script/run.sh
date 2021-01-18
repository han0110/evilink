#!/bin/bash

set -eo pipefail

DIR_ROOT="$(dirname "${BASH_SOURCE[0]}")/.."

# shellcheck disable=SC1090
source "$DIR_ROOT/script/util.sh"

ENV="$DIR_ROOT/script/docker-compose.env"
ENV_SAMPLE="$DIR_ROOT/script/docker-compose.sample.env"

PROJECT_NAME="evilink"
COMMANDS=(
    build
    config
    up
    down
    exec
    clean
)
BUILD_TARGETS=(
    evilthereum
    playground
)

env_docker_compose() {
    [ ! -f "$ENV" ] && cp "$ENV_SAMPLE" "$ENV"
    # shellcheck disable=SC2046
    env $(grep -v '^#' "$ENV") \
        docker-compose -p "$PROJECT_NAME" -f "$DIR_ROOT"/script/docker-compose.yml "$@"
}

build() {
    PACKAGE="$1"; shift
    help_if_command_not_found "${BUILD_TARGETS[@]}" "$PACKAGE"
    yarn workspace "@evilink/$PACKAGE" build
    yarn docker build "@evilink/$PACKAGE" -t "evilink/$PACKAGE" "$@"
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
    TARGET_CONTAINER_NAME=$1; shift
    if [ -z "$TARGET_CONTAINER_NAME" ]; then echo "container name is required" && exit 1; fi

    ALL_CONTAINERS=()
    while IFS='' read -r CONTAINER; do ALL_CONTAINERS+=("$CONTAINER"); done < \
        <(docker ps --filter "label=com.docker.compose.project=$PROJECT_NAME" --format "{{.Label \"com.docker.compose.service\"}}:{{ .ID }}")

    if [ ${#ALL_CONTAINERS[@]} -eq  0 ]; then
        echo "nothing found in project $PROJECT_NAME, have you ever run 'bash script/run.sh up'?"
        exit 1
    fi

    TARGET_CONTAINER_ID=$(value "${ALL_CONTAINERS[@]}" "$TARGET_CONTAINER_NAME")
    if [ -z "$TARGET_CONTAINER_ID" ]; then
        printf 'please specify container in\n'
        printf '  * %s\n' "${ALL_CONTAINERS[@]//:*/}"
        exit 1
    fi

    ENTRYPOINT=${1:-/bin/bash}
    docker exec -it "$TARGET_CONTAINER_ID" "$ENTRYPOINT"
}

clean() {
    rm -rf "${DIR_ROOT}/.chainlink/root"
    rm -rf "${DIR_ROOT}/.evilthereum/chaindb"
    rm -rf "${DIR_ROOT}/.ipfs/data"
    rm -rf "${DIR_ROOT}/.postgres/data"
}

main() {
    help_if_command_not_found "${COMMANDS[@]}" "$1"
    "$@"
}

main "${@:-up}"
