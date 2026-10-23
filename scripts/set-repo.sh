#!/usr/bin/env bash
# Rewrite every repoURL under gitops/ (and the image owner) to match .env.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
owner="$(echo "$GITOPS_REPO_URL" | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#')"
grep -rl 'repoURL:' "$REPO_ROOT/gitops" | while read -r f; do
  sed -i -E "s#(repoURL:).*#\1 $GITOPS_REPO_URL#; s#(targetRevision:).*#\1 $GITOPS_BRANCH#" "$f"
done
sed -i -E "s#ghcr.io/[^/]+/jakarta-votes#ghcr.io/$owner/jakarta-votes#" "$REPO_ROOT/gitops/app/deployment.yaml" "$REPO_ROOT/app/Dockerfile"
sed -i -E "s#(image.source=\"https://github.com/)[^\"]+#\1$owner/$(basename "$GITOPS_REPO_URL" .git)#" "$REPO_ROOT/app/Dockerfile"
ok "gitops/ now points at $GITOPS_REPO_URL ($GITOPS_BRANCH); image ghcr.io/$owner/jakarta-votes"
git -C "$REPO_ROOT" --no-pager status --short gitops app/Dockerfile
