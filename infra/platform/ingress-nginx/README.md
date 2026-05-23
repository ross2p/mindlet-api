# NGINX Ingress Controller (kind)

Install the official manifest **after** creating the kind cluster (see [`scripts/bootstrap-cluster.sh`](../../../scripts/bootstrap-cluster.sh)).

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

Wait until the ingress controller is ready:

```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

## Local hostnames

- Application gateway host: `mindlet.localtest.me` (resolves to `127.0.0.1`).
- Kafka UI (platform): `kafka-ui.localtest.me` (Ingress in `infra/platform/kafka/kafka-ui.yaml`).

Ensure your kind config maps host ports **80** and **443** to the cluster (see bootstrap script).

## Notes

- Do not vendor the full YAML into this repo; pin by commit URL if you need reproducibility.
- For non-kind clusters, use the matching manifest from the same upstream directory (`cloud` / `baremetal`, etc.).
