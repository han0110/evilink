#!/bin/bash

value() {
    ARGS=() && IFS=" " read -r -a ARGS <<< "$@"
    TARGET=${ARGS[${#ARGS[@]}-1]}
    for PAIR in "${ARGS[@]:0:${#ARGS[@]}-1}"; do
        if [ "${PAIR%%:*}" = "$TARGET" ]; then
            echo "${PAIR#*:}"
        fi
    done
}

help_if_command_not_found() {
    CMDS=() && IFS=" " read -r -a CMDS <<< "$@"
    TARGET=${CMDS[${#CMDS[@]}-1]}
    for CMD in "${CMDS[@]:0:${#CMDS[@]}-1}"; do
        if [ "$TARGET" = "$CMD" ]; then
            return 0
        fi
    done

    printf 'please specify commands below:\n'
    printf '  * %s\n' "${CMDS[@]:0:${#CMDS[@]}-1}"
    exit 1
}
