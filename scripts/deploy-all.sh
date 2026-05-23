#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"${ROOT_DIR}/scripts/deploy-platform.sh"
"${ROOT_DIR}/scripts/deploy-services.sh" "${1:-dev}"
