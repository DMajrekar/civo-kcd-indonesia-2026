#!/usr/bin/env bash
# title: Create a Kubernetes cluster in Jakarta
#
# Async on purpose: Civo takes ~90s-3m, and a room watching a spinner is a
# room not listening. Step 02 blocks on readiness.
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth

banner "Step 01 — a cluster in Jakarta"

say "Civo's Indonesia region, JKT1, launched yesterday, run by Arupa Cloud"
say "Nusantara. Same platform, same tooling, same prices as every other Civo"
say "region. Let's build on it."
printf '\n'

run "civo region ls"

say ""
say "Node sizes are plain: g4s.kube.medium is 2 vCPU / 4 GB. We start with two"
say "of them and let the autoscaler add more later."
run "civo kubernetes size | grep -E 'Name|g4s.kube'"

VERSION_FLAG=""
[[ -n "$CIVO_K8S_VERSION" ]] && VERSION_FLAG="--version '$CIVO_K8S_VERSION'"

if civo_cluster_exists "$CLUSTER_NAME" "$CIVO_REGION"; then
  ok "cluster '$CLUSTER_NAME' already exists in $CIVO_REGION — reusing it"
else
  say ""
  say "One command. k3s, two nodes, metrics-server from the Civo marketplace"
  say "(the HPA needs it later). We drop the default Traefik: the app brings"
  say "its own load balancer."
  run "civo kubernetes create '$CLUSTER_NAME' \
    --region '$CIVO_REGION' --size '$CIVO_NODE_SIZE' --nodes '$CIVO_NODE_COUNT' \
    --applications metrics-server --remove-applications traefik2-nodeport \
    $VERSION_FLAG --yes"
fi

printf '\n'
ok "Cluster creation is under way — it will be ACTIVE in about two minutes."
note "watch it:  civo kubernetes show $CLUSTER_NAME --region $CIVO_REGION"
note "next:      make step2"
