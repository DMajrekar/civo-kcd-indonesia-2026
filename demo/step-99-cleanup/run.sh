#!/usr/bin/env bash
# title: Delete the demo cluster
#
# STANDBY=1 deletes the standby cluster instead (see scripts/standby.sh).
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth
[[ -n "${STANDBY-}" ]] && { CLUSTER_NAME="${CLUSTER_NAME}-standby"; export KUBECONFIG="$STATE/kubeconfig-$CLUSTER_NAME"; }

banner "Cleanup — delete '$CLUSTER_NAME'"

CID="$(civo_cluster_id "$CLUSTER_NAME" "$CIVO_REGION")"
tf_has_state() { [[ -d "$TF_DIR/terraform.tfstate.d/$CLUSTER_NAME" ]] && tf_init && [[ -n "$(tf state list 2>/dev/null)" ]]; }
if [[ -z "$CID" ]] && ! tf_has_state; then
  ok "no cluster named exactly '$CLUSTER_NAME' in $CIVO_REGION and no Terraform state — nothing to delete"
  exit 0
fi
[[ -z "$CID" ]] && warn "no cluster, but Terraform still tracks resources (network/firewall) — destroying those"

warn "This permanently deletes '$CLUSTER_NAME' ($CID), its load balancer and volumes."
if [[ -z "${DEMO_AUTO-}" && -t 0 ]]; then
  printf '%s%sType the cluster name to confirm: %s' "$BOLD" "$YELLOW" "$RESET"
  read -r CONFIRM < /dev/tty || true
  [[ "$CONFIRM" == "$CLUSTER_NAME" ]] || { ok "not deleting anything"; exit 0; }
fi

bash "$REPO_ROOT/scripts/argocd-ui.sh" stop >/dev/null 2>&1 || true

# Release the Civo load balancers before the cluster goes: stop Argo CD so it
# cannot recreate the Services, delete every LoadBalancer Service, and wait
# for the cloud controller to remove the load balancers behind them.
if have_kubeconfig; then
  kubectl -n argocd scale sts/argocd-application-controller --replicas=0 >/dev/null 2>&1 || true
  kubectl -n "$APP_NS" delete deploy loadgen --ignore-not-found >/dev/null 2>&1 || true
  kubectl get svc -A -o json 2>/dev/null \
    | jq -r '.items[] | select(.spec.type=="LoadBalancer") | "\(.metadata.namespace) \(.metadata.name)"' \
    | while read -r ns name; do run "kubectl -n '$ns' delete svc '$name' --timeout=120s || true"; done
fi
VOLS=""; [[ -n "$CID" ]] && VOLS=$(civo_cluster_volumes "$CID" "$CIVO_REGION")
if tf_has_state; then
  # Two phases: the cluster first (Argo CD and the kubeconfig go with it), then
  # the volumes the cluster's PVCs created, then the network and firewall.
  # Destroying everything at once fails: Civo will not delete a network that
  # still holds volumes, and the provider times out waiting.
  if tf state list 2>/dev/null | grep -q civo_kubernetes_cluster; then
    run "tf destroy -auto-approve -input=false -no-color -target=civo_kubernetes_cluster.demo $(tf_vars)"
  fi
  sleep 5
  for v in $VOLS; do run "civo volume remove '$v' --region '$CIVO_REGION' --yes || true"; done
  # Anything else still in this cluster's network blocks the network delete.
  NET_ID="$(tf output -raw network_id 2>/dev/null || true)"
  if [[ -n "$NET_ID" ]]; then
    civo volume ls --region "$CIVO_REGION" -o json 2>/dev/null \
      | jq -r --arg n "$NET_ID" '.[]? | select(.network_id==$n) | .id' \
      | while read -r v; do [[ -n "$v" ]] && run "civo volume remove '$v' --region '$CIVO_REGION' --yes || true"; done
  fi
  run "tf destroy -auto-approve -input=false -no-color $(tf_vars)"
  tf workspace select default >/dev/null 2>&1 && tf workspace delete "$CLUSTER_NAME" >/dev/null 2>&1 || true
else
  run "civo kubernetes remove '$CID' --region '$CIVO_REGION' --yes"
  for v in $VOLS; do run "civo volume remove '$v' --region '$CIVO_REGION' --yes || true"; done
fi
rm -f "$TF_LOG_FILE"
for v in $VOLS; do run "civo volume remove '$v' --region '$CIVO_REGION' --yes || true"; done

# Load balancers can outlive a deleted cluster. Remove any left over.
sleep 5
civo loadbalancer ls --region "$CIVO_REGION" -o json 2>/dev/null \
  | jq -r --arg cid "$CID" '.[]? | select(.cluster_id==$cid) | .id' \
  | while read -r lb; do [[ -n "$lb" ]] && run "civo loadbalancer remove '$lb' --region '$CIVO_REGION' --yes || true"; done

# `civo kubernetes remove` leaves the firewall it created behind. Sweep any
# firewall for this cluster that no longer protects anything.
civo firewall ls --region "$CIVO_REGION" -o json 2>/dev/null \
  | jq -r --arg n "$CLUSTER_NAME" '.[] | select(.name | startswith("k3s-cluster-" + $n)) | select((.cluster_count // 0) == 0 and (.loadbalancer_count // 0) == 0 and (.instance_count // 0) == 0) | .id' \
  | while read -r fw; do [[ -n "$fw" ]] && run "civo firewall remove '$fw' --region '$CIVO_REGION' --yes || true"; done

[[ -z "${STANDBY-}" ]] && rm -f "$KUBECONFIG" "$STATE/argocd-password"
printf '\n'
ok "Deleted."
note "check:  civo kubernetes ls --region $CIVO_REGION ; civo loadbalancer ls --region $CIVO_REGION"
