#!/usr/bin/env bash
# title: Delete the demo cluster
#
# STANDBY=1 deletes the standby cluster instead (see scripts/standby.sh).
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth
[[ -n "${STANDBY-}" ]] && CLUSTER_NAME="${CLUSTER_NAME}-standby"

banner "Cleanup — delete '$CLUSTER_NAME'"

CID="$(civo_cluster_id "$CLUSTER_NAME" "$CIVO_REGION")"
if [[ -z "$CID" ]]; then
  ok "no cluster named exactly '$CLUSTER_NAME' in $CIVO_REGION — nothing to delete"
  exit 0
fi

warn "This permanently deletes '$CLUSTER_NAME' ($CID), its load balancer and volumes."
if [[ -z "${DEMO_AUTO-}" && -t 0 ]]; then
  printf '%s%sType the cluster name to confirm: %s' "$BOLD" "$YELLOW" "$RESET"
  read -r CONFIRM < /dev/tty || true
  [[ "$CONFIRM" == "$CLUSTER_NAME" ]] || { ok "not deleting anything"; exit 0; }
fi

bash "$REPO_ROOT/scripts/argocd-ui.sh" stop >/dev/null 2>&1 || true

# Deleting the Service first releases the Civo load balancer cleanly.
if [[ -z "${STANDBY-}" ]] && have_kubeconfig; then
  kubectl -n "$APP_NS" delete deploy loadgen --ignore-not-found >/dev/null 2>&1 || true
  kubectl -n argocd patch application "$APP" -p '{"metadata":{"finalizers":null}}' --type=merge >/dev/null 2>&1 || true
  kubectl -n "$APP_NS" delete svc "$APP" --ignore-not-found --timeout=60s >/dev/null 2>&1 || true
fi

VOLS=$(civo_cluster_volumes "$CID" "$CIVO_REGION")
run "civo kubernetes remove '$CID' --region '$CIVO_REGION' --yes"
for v in $VOLS; do run "civo volume remove '$v' --region '$CIVO_REGION' --yes || true"; done

# Load balancers can outlive a deleted cluster. Remove any left over.
sleep 5
civo loadbalancer ls --region "$CIVO_REGION" -o json 2>/dev/null \
  | jq -r --arg cid "$CID" '.[]? | select(.cluster_id==$cid) | .id' \
  | while read -r lb; do [[ -n "$lb" ]] && run "civo loadbalancer remove '$lb' --region '$CIVO_REGION' --yes || true"; done

[[ -z "${STANDBY-}" ]] && rm -f "$KUBECONFIG" "$STATE/argocd-password"
printf '\n'
ok "Deleted."
note "check:  civo kubernetes ls --region $CIVO_REGION ; civo loadbalancer ls --region $CIVO_REGION"
