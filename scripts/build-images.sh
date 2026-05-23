#!/usr/bin/env bash
# Build images from monorepo root and load into kind. Parallelism via xargs.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TAG="${1:-dev}"
CLUSTER_NAME="${KIND_CLUSTER_NAME:-mindlet}"

if ! command -v docker &>/dev/null; then
  echo "docker not found"
  exit 1
fi

build_one() {
  local service="$1"
  local tag="$2"
  local root="$3"
  cd "${root}"
  if [[ "${service}" == "payment" ]]; then
    docker build -f tools/docker/payment-monorepo.Dockerfile -t "mindlet-${service}:${tag}" .
  else
    docker build -f tools/docker/nest-monorepo.Dockerfile --build-arg "APP_DIR=apps/${service}" -t "mindlet-${service}:${tag}" .
  fi
  if command -v kind &>/dev/null; then
    kind load docker-image "mindlet-${service}:${tag}" --name "${CLUSTER_NAME}"
  fi
}
export -f build_one

cd "${ROOT_DIR}"
# Only services that exist as directories and use nest build from root (payment special-cased)
SERVICES=()
for d in apps/*/; do
  SERVICES+=("$(basename "$d")")
done

printf '%s\n' "${SERVICES[@]}" | xargs -I{} -P 4 bash -c 'build_one "$1" "$2" "$3"' _ {} "${TAG}" "${ROOT_DIR}"

echo "Built and loaded: mindlet-<service>:${TAG}"
