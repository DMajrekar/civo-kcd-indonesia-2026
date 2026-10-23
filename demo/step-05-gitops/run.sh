#!/usr/bin/env bash
# title: Ship a change the GitOps way (and watch drift get fixed)
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }
DEPLOY="$REPO_ROOT/gitops/app/deployment.yaml"
IP="$(app_ip)"
title_env() { kubectl -n "$APP_NS" get deploy "$APP" -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="TITLE")].value}'; }

banner "Step 05 — GitOps in practice"

# ------------------------------------------------------------------ drift
say "First, the thing GitOps protects you from. Someone 'fixes' production"
say "with kubectl:"
run "kubectl -n $APP_NS set env deploy/$APP TITLE='edited by hand in prod (oops)'"
say ""
say "Argo CD notices the live state no longer matches git, and puts it back."
wait_for "Argo CD to revert the hand edit" 300 "[[ \"\$(title_env)\" != 'edited by hand in prod (oops)' ]]"
run "kubectl -n argocd get application $APP -o jsonpath='{.status.sync.status} {.status.health.status}{\"\\n\"}'"
run "kubectl -n $APP_NS get deploy $APP -o jsonpath='{.spec.template.spec.containers[0].env[0].value}{\"\\n\"}'"

# ----------------------------------------------------------------- release
say ""
say "Now the right way. A release is a commit: new image built by CI, new"
say "colour, new title. Review it, push it, and Argo rolls it out."
printf '\n'

if grep -q 'jakarta-votes:v1.1.0' "$DEPLOY"; then
  ok "gitops/app already at v1.1.0 — run 'make reset' before the next rehearsal"
else
  sed -i \
    -e 's#jakarta-votes:v1.0.0#jakarta-votes:v1.1.0#' \
    -e 's#value: "\#00FF6F"#value: "\#FF4D4D"#' \
    -e 's#value: "Dinesh has a free day in Jakarta. What should he do?"#value: "Halo Bandung! Shipped from git to JKT1 — keep voting"#' \
    "$DEPLOY"
  run "git -C '$REPO_ROOT' --no-pager diff --color=always -- gitops/app/deployment.yaml"
  run "git -C '$REPO_ROOT' commit -qam 'jakarta-votes: release v1.1.0 for KCD Indonesia' && git -C '$REPO_ROOT' push -q origin '$GITOPS_BRANCH'"
fi

say ""
say "Argo polls git every three minutes (or takes a webhook). We will not wait"
say "on stage -- this asks it to look now."
run "kubectl -n argocd annotate application $APP argocd.argoproj.io/refresh=normal --overwrite"

wait_for "Argo CD to sync the new revision" 300 \
  "kubectl -n $APP_NS get deploy $APP -o jsonpath='{.spec.template.spec.containers[0].image}' | grep -q v1.1.0"
run "kubectl -n $APP_NS rollout status deploy/$APP --timeout=180s"
run "kubectl -n $APP_NS get pods -l app=$APP"
[[ -n "$IP" ]] && run "curl -s http://$IP/api/whoami | jq -r .version"

printf '\n'
ok "Rolled out with zero downtime — the board changed colour, the votes survived."
note "next:  make step6"
