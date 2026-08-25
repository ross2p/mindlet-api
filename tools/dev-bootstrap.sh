#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for app in apps/*/; do
  if [[ ! -f "${app}package.json" ]]; then
    continue
  fi
  echo "[app] $app"
  (cd "$app" && rm -rf node_modules package-lock.json && npm install --prefer-online)
done

echo "Done. Run a service: cd apps/auth && npm run start:dev"
