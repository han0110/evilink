#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${CHAINLINK_USER} WITH PASSWORD '${CHAINLINK_PASSWORD}';
    CREATE DATABASE ${CHAINLINK_DB};
    GRANT ALL PRIVILEGES ON DATABASE ${CHAINLINK_DB} TO ${CHAINLINK_USER};
EOSQL
