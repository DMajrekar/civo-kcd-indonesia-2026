#!/usr/bin/env bash
# title: Connect to the cluster
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth; need_cluster

banner "Step 02 — connect"

wait_for "cluster '$CLUSTER_NAME' to be ACTIVE" 900 \
  "[[ \"\$(civo_cluster_field '$CID' '$CIVO_REGION' Status)\" == 'ACTIVE' ]]"

run "civo kubernetes show '$CLUSTER_NAME' --region '$CIVO_REGION'"

say ""
say "The kubeconfig is one more command. From here on it is just kubectl."
run "civo kubernetes config '$CLUSTER_NAME' --region '$CIVO_REGION' --save --local-path '$KUBECONFIG' --overwrite --yes"
chmod 600 "$KUBECONFIG"

wait_for "both nodes to be Ready" 600 \
  "[[ \$(kubectl get nodes --no-headers 2>/dev/null | grep -c ' Ready ') -ge $CIVO_NODE_COUNT ]]"
run "kubectl get nodes -o wide"

wait_for "metrics-server to answer" 300 "kubectl top nodes"
run "kubectl top nodes"

printf '\n'
ok "Connected. Cluster ID $CID"
note "next:  make step3"
