#!/usr/bin/env bash
# title: Connect to the cluster
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth

banner "Step 02 — connect"

if [[ -f "$TF_LOG_FILE" ]] && ! grep -q '^exit ' "$TF_LOG_FILE"; then
  say "Terraform is still applying. This is the wait we skipped in step 1."
  wait_for "terraform apply to finish" 900 "grep -q '^exit ' '$TF_LOG_FILE'"
  if ! grep -q '^exit 0' "$TF_LOG_FILE"; then tail -20 "$TF_LOG_FILE"; fail "terraform apply failed — see $TF_LOG_FILE"; exit 1; fi
  grep -E 'Apply complete|Creation complete' "$TF_LOG_FILE" | sed 's/^/  /'
fi
need_cluster

wait_for "cluster '$CLUSTER_NAME' to be ACTIVE" 900 \
  "[[ \"\$(civo_cluster_field '$CID' '$CIVO_REGION' Status)\" == 'ACTIVE' ]]"

run "civo kubernetes show '$CLUSTER_NAME' --region '$CIVO_REGION'"

if [[ -s "$KUBECONFIG" ]] && kubectl get --raw /readyz >/dev/null 2>&1; then
  ok "kubeconfig written by Terraform: ${KUBECONFIG#$REPO_ROOT/}"
else
  say ""
  say "The kubeconfig is one more command. From here on it is just kubectl."
  run "civo kubernetes config '$CLUSTER_NAME' --region '$CIVO_REGION' --save --local-path '$KUBECONFIG' --overwrite --yes"
fi
chmod 600 "$KUBECONFIG"

wait_for "both nodes to be Ready" 600 \
  "[[ \$(kubectl get nodes --no-headers 2>/dev/null | grep -c ' Ready ') -ge $CIVO_NODE_COUNT ]]"
run "kubectl get nodes -o wide"

wait_for "metrics-server to answer" 300 "kubectl top nodes"
run "kubectl top nodes"

printf '\n'
ok "Connected. Cluster ID $CID"
note "next:  make step3"
