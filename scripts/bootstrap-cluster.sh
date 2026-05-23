#!/usr/bin/env bash
# Creates a local kind cluster with port mappings for ingress-nginx (80/443).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLUSTER_NAME="${KIND_CLUSTER_NAME:-mindlet}"

if ! command -v kind &>/dev/null; then
  echo "kind is not installed. Install: https://kind.sigs.k8s.io/docs/user/quick-start/"
  exit 1
fi

if kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
  echo "Cluster '${CLUSTER_NAME}' already exists. Delete with: kind delete cluster --name ${CLUSTER_NAME}"
  exit 0
fi

cat <<'YAML' >/tmp/mindlet-kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
YAML

kind create cluster --name "${CLUSTER_NAME}" --config /tmp/mindlet-kind-config.yaml

echo "Installing ingress-nginx (kind provider manifest)..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s

echo "Done. Next: ${ROOT_DIR}/scripts/deploy-platform.sh"
