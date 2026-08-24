#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Run once from mindlet-api/: npm install (installs concurrently in this repo root).

npx concurrently \
  --names "common,types" \
  --prefix-colors "cyan,magenta" \
  "cd \"$ROOT/libs/common\" && npm run build:watch" \
  "cd \"$ROOT/libs/types\" && npm run build:watch"
