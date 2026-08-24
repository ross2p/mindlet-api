#!/usr/bin/env bash
# Applies kustomize overlay for each app under apps/*/deploy/overlays/<env> if present.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OVERLAY="${1:-dev}"

shopt -s nullglob
for service_dir in "${ROOT_DIR}/apps"/*/; do
  service="$(basename "${service_dir}")"
  manifest="${service_dir}deploy/overlays/${OVERLAY}"
  if [[ -d "${manifest}" ]]; then
    echo "==> kubectl apply -k ${manifest}"
    kubectl apply -k "${manifest}"
  else
    echo "WARN: skip ${service} (no deploy/overlays/${OVERLAY})"
  fi
done
