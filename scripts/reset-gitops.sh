#!/usr/bin/env bash
# Put gitops/app back to "v1" so step 6 has a change to make, and push.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
D="$REPO_ROOT/gitops/app/deployment.yaml"
sed -i \
  -e 's#jakarta-votes:v2\.[0-9]*#jakarta-votes:v2.0#' \
  -e 's#value: "\#[0-9a-fA-F]\{6\}"#value: "\#00FF6F"#' \
  -e 's#name: TITLE, *value: "[^"]*"#name: TITLE,       value: "Dinesh has a free day in Jakarta. What should he do?"#' \
  "$D"
if git -C "$REPO_ROOT" diff --quiet -- gitops; then
  ok "gitops/ already at v1"
else
  git -C "$REPO_ROOT" --no-pager diff --stat -- gitops
  git -C "$REPO_ROOT" commit -qm "reset demo to v1" -- gitops
  git -C "$REPO_ROOT" push -q origin "$GITOPS_BRANCH"
  ok "reset and pushed"
fi
# If a cluster is up, ask Argo to pick it up straight away.
if have_kubeconfig; then
  kubectl -n argocd annotate application "$APP" argocd.argoproj.io/refresh=normal --overwrite >/dev/null 2>&1 || true
fi
