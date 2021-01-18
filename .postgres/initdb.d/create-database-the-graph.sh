#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${THE_GRAPH_USER} WITH PASSWORD '${THE_GRAPH_PASSWORD}';
    ALTER ROLE ${THE_GRAPH_USER} SUPERUSER;
    CREATE DATABASE ${THE_GRAPH_DB};
    GRANT ALL PRIVILEGES ON DATABASE ${THE_GRAPH_DB} TO ${THE_GRAPH_USER};
EOSQL
