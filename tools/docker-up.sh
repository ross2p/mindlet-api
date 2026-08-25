#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PARALLEL="${DOCKER_BUILD_PARALLEL:-1}"

docker compose -f compose.stack.yaml build --parallel "$PARALLEL"
docker compose -f compose.stack.yaml up -d "$@"
