#!/usr/bin/env bash
# title: Create a Kubernetes cluster in Jakarta
#
# Terraform by default; CLUSTER_TOOL=cli uses the civo CLI instead. The
# Terraform apply logs to a file and this step waits for it to finish, so the
# step ends with an ACTIVE cluster (Civo takes 2-3 minutes). Step 02 keeps a
# wait on the same log as a safety net for a re-run.
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth
TOOL="${CLUSTER_TOOL:-terraform}"

banner "Step 01 — a cluster in Jakarta"

say "Civo's Indonesia region, JKT1, launched yesterday, run by Arupa Cloud"
say "Nusantara. Same platform and tooling as every other Civo region, with the"
say "data staying in Indonesia. Let's build on it."
printf '\n'

run "civo region ls"

say ""
say "Node sizes are plain: g4s.kube.medium is 2 vCPU / 4 GB. We start with two"
say "of them and let the autoscaler add more later."
run "civo kubernetes size | grep -E 'Name|g4s.kube'"

if civo_cluster_exists "$CLUSTER_NAME" "$CIVO_REGION"; then
  ok "cluster '$CLUSTER_NAME' already exists in $CIVO_REGION — reusing it"
  [[ "$TOOL" == terraform ]] && tf_init && [[ ! -s "$KUBECONFIG" ]] && tf output -raw kubeconfig_path >/dev/null 2>&1 || true
elif [[ "$TOOL" == terraform ]]; then
  say ""
  say "The cluster is Terraform (the HCL is on the slides): its own network, a"
  say "firewall and a two-node k3s cluster, with Terraform told to ignore the"
  say "node count because the autoscaler owns it."
  tf_init
  say ""
  say "Plan, then apply. Apply blocks until the cluster is up -- two to three"
  say "minutes. The log scrolls here; the slides carry the talk meanwhile."
  run "tf plan -input=false -no-color $(tf_vars) | grep -E '^(Plan|  #|Terraform will)'"
  : > "$TF_LOG_FILE"
  printf '\n%s%s$ terraform apply -auto-approve  (in the background, log: %s)%s\n' "$BOLD" "$GREEN" "${TF_LOG_FILE#$REPO_ROOT/}" "$RESET"
  ( tf apply -auto-approve -input=false -no-color $(tf_vars) >> "$TF_LOG_FILE" 2>&1; echo "exit $?" >> "$TF_LOG_FILE" ) &
  disown
  sleep 3
  wait_for "Terraform to start creating" 120 "grep -qE 'Creating\.\.\.|exit ' '$TF_LOG_FILE'"
  grep -E 'Creating\.\.\.' "$TF_LOG_FILE" | sed 's/^/  /' || true
  wait_for "terraform apply to finish (cluster, kubeconfig, Argo CD)" 900 "grep -q '^exit ' '$TF_LOG_FILE'"
  if ! grep -q '^exit 0' "$TF_LOG_FILE"; then tail -20 "$TF_LOG_FILE"; fail "terraform apply failed — see ${TF_LOG_FILE#$REPO_ROOT/}"; exit 1; fi
  grep -E 'Creation complete|Apply complete' "$TF_LOG_FILE" | sed 's/^/  /'
else
  VERSION_FLAG=""; [[ -n "$CIVO_K8S_VERSION" ]] && VERSION_FLAG="--version '$CIVO_K8S_VERSION'"
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
if [[ "$TOOL" == terraform ]]; then
  ok "Cluster '$CLUSTER_NAME' is ACTIVE in $CIVO_REGION, with Argo CD installed."
else
  ok "Cluster creation is under way — ACTIVE in two to four minutes."
  note "watch it:  civo kubernetes show $CLUSTER_NAME --region $CIVO_REGION"
fi
note "next:  make step2"
