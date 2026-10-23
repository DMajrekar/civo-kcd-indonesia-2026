#!/usr/bin/env bash
# Tools, credentials, region and repo: everything that can fail before step 1.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
banner "Doctor"
FAILED=0
t() { printf '  %-10s ' "$1"; if command -v "$1" >/dev/null; then ok "$($1 ${2:---version} 2>&1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)"; else fail "missing"; FAILED=1; fi; }
t civo version; t kubectl "version --client"; t helm "version --short"; t terraform version; t jq; t git; t bat; t curl
printf '\n'
civo_auth
printf '  %-10s ' "civo key"; ok "${CIVO_API_KEY:0:6}…"
printf '  %-10s ' "region"
if civo region ls -o json 2>/dev/null | jq -e --arg r "$(echo "$CIVO_REGION" | tr A-Z a-z)" '.[] | select(.code==$r)' >/dev/null; then ok "$CIVO_REGION available"; else fail "$CIVO_REGION not in civo region ls"; FAILED=1; fi
printf '  %-10s ' "quota"
Q="$(civo quota show -o json 2>/dev/null || true)"
if [[ -n "$Q" ]]; then ok "instances $(echo "$Q" | jq -r '.instance_count_usage')/$(echo "$Q" | jq -r '.instance_count_limit')  cpu $(echo "$Q" | jq -r '.cpu_core_usage')/$(echo "$Q" | jq -r '.cpu_core_limit')"; else warn "could not read quota"; fi
printf '\n'
printf '  %-10s ' "git remote"
R="$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || true)"
if [[ -z "$R" ]]; then fail "no origin — git remote add origin <url>"; FAILED=1; else ok "$R"; fi
printf '  %-10s ' "repoURL"
if grep -rq "repoURL: $GITOPS_REPO_URL" "$REPO_ROOT/gitops/root"; then ok "$GITOPS_REPO_URL"; else fail "gitops/ points elsewhere — run 'make set-repo'"; FAILED=1; fi
printf '  %-10s ' "push"
if git -C "$REPO_ROOT" ls-remote --exit-code origin "$GITOPS_BRANCH" >/dev/null 2>&1; then ok "origin/$GITOPS_BRANCH reachable"; else fail "cannot read origin/$GITOPS_BRANCH"; FAILED=1; fi
printf '  %-10s ' "clean tree"
if git -C "$REPO_ROOT" diff --quiet && git -C "$REPO_ROOT" diff --cached --quiet; then ok "nothing uncommitted"; else warn "uncommitted changes — step 6 commits with -a"; fi
printf '  %-10s ' "image"
IMG="$(grep -oE 'ghcr.io/[^ ]+' "$REPO_ROOT/gitops/app/deployment.yaml")"; repo="${IMG#ghcr.io/}"; repo="${repo%%:*}"; tag="${IMG##*:}"
tok="$(curl -fsSL "https://ghcr.io/token?scope=repository:$repo:pull" 2>/dev/null | jq -r .token)"
if curl -fsSL -o /dev/null -H "Authorization: Bearer $tok" -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json' "https://ghcr.io/v2/$repo/manifests/$tag" 2>/dev/null; then ok "$IMG pullable (public)"; else warn "$IMG not pullable anonymously — not built yet, or package is private"; fi
printf '\n'
(( FAILED )) && { fail "fix the above before the demo"; exit 1; }
ok "ready"
