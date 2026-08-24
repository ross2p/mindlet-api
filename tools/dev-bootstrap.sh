#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Remove only runtime Nest packages from libs so apps supply a single copy.
# Do NOT delete the whole @nestjs scope (that removes @nestjs/cli and breaks `nest build`).
prune_lib_nest() {
  local pkgs=(common core platform-express microservices swagger config testing)
  for lib in libs/common libs/types; do
    for pkg in "${pkgs[@]}"; do
      rm -rf "$ROOT/$lib/node_modules/@nestjs/$pkg" 2>/dev/null || true
    done
    echo "Pruned duplicate @nestjs/* runtime packages in $lib (kept cli/schematics)"
  done
}

for lib in libs/common libs/types; do
  if [[ ! -d "$lib" ]]; then
    echo "Skip missing: $lib"
    continue
  fi
  echo "[lib] $lib"
  (cd "$lib" && npm install && npm run build)
done

prune_lib_nest

for app in apps/*/; do
  if [[ ! -f "${app}package.json" ]]; then
    continue
  fi
  echo "[app] $app"
  (cd "$app" && rm -rf node_modules package-lock.json && npm install)
done

echo "Done. In another terminal: cd mindlet-api && npm run dev:watch-libs"
