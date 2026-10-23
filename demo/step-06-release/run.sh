#!/usr/bin/env bash
# title: Ship a release the GitOps way
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }
DEPLOY="$REPO_ROOT/gitops/app/deployment.yaml"
IP="$(app_ip)"

banner "Step 06 — ship a release"

say "A release is a commit: new image built by CI, new colour, new title."
say "Review it, push it, and Argo rolls it out."
printf '\n'

say "What is running right now:"
[[ -n "$IP" ]] && run "curl -s http://$IP/api/whoami | jq -r .version"

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

say "Watch the Application: OutOfSync on the new commit, then Synced as the"
say "new image lands in the Deployment."
watch_until 300 "kubectl -n argocd get application $APP -w" \
  "kubectl -n $APP_NS get deploy $APP -o jsonpath='{.spec.template.spec.containers[0].image}' | grep -q v1.1.0"
run "kubectl -n $APP_NS rollout status deploy/$APP --timeout=180s"
run "kubectl -n $APP_NS get pods -l app=$APP"
[[ -n "$IP" ]] && run "curl -s http://$IP/api/whoami | jq -r .version"

printf '\n'
ok "Rolled out with zero downtime — the board changed colour, the votes survived."
note "next:  make step7"
