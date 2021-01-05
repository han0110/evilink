#!/bin/bash

DIR_ROOT="$(dirname "${BASH_SOURCE[0]}")/.."

# shellcheck disable=SC1090
source "$DIR_ROOT/script/util.sh"

PROJECT_NAME="evilink"
COMMANDS=(
    build
    config
    up
    down
    exec
    clean
)

env_docker_compose() {
    # shellcheck disable=SC2046
    env $(grep -v '^#' "$DIR_ROOT"/script/docker-compose.env) \
        docker-compose -p "$PROJECT_NAME" -f "$DIR_ROOT"/script/docker-compose.yml "$@"
}

build() {
    local WORKSPACE_NAME="@evilink/evilthereum"
    yarn workspace "${WORKSPACE_NAME}" build
    yarn docker build "${WORKSPACE_NAME}" "$@" -t evilthereum
}

config() {
    env_docker_compose config
}

up() {
    env_docker_compose up -d "$@"
}

down() {
    env_docker_compose down
}

exec() {
    TARGET_CONTAINER_NAME=$1
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

    docker exec -it "$TARGET_CONTAINER_ID" /bin/bash
}

clean() {
    rm -rf "${DIR_ROOT}/.chainlink/root"
    rm -rf "${DIR_ROOT}/.chainlink/postgres"
    rm -rf "${DIR_ROOT}/.evilthereum/chaindb"
}

main() {
    help_if_command_not_found "${COMMANDS[@]}" "$1"
    "$@"
}

main "${@:-up}"
