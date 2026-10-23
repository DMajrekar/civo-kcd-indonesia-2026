#!/usr/bin/env bash
# The night before. Everything that can be done ahead of time, is.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
banner "Prep"
bash "$REPO_ROOT/scripts/doctor.sh"
printf '\n'
say "Resetting gitops/ to v1 and pushing, so step 5 has something to ship."
bash "$REPO_ROOT/scripts/reset-gitops.sh"
printf '\n'
say "Pre-pulling nothing: the cluster is created live. But the images must"
say "exist and be public, or step 4 hangs on ImagePullBackOff."
for img in $(grep -rhoE 'image: *[^ ]+' "$REPO_ROOT/gitops" "$REPO_ROOT/demo" | awk '{print $2}' | sort -u); do
  printf '  %-60s ' "$img"
  case "$img" in
    ghcr.io/*) repo="${img#ghcr.io/}"; repo="${repo%%:*}"; tag="${img##*:}"
      tok="$(curl -fsSL "https://ghcr.io/token?scope=repository:$repo:pull" | jq -r .token)"
      if curl -fsSL -o /dev/null -H "Authorization: Bearer $tok" -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json' "https://ghcr.io/v2/$repo/manifests/$tag"; then ok "public"; else fail "NOT pullable — build it / make the package public"; fi ;;
    *) ok "(not checked)";;
  esac
done
printf '\n'
if [[ "${1-}" == "--standby" || -n "${WITH_STANDBY-}" ]]; then bash "$REPO_ROOT/scripts/standby.sh"; else
  note "to also warm a standby cluster:  make standby   (or make prep WITH_STANDBY=1)"; fi
ok "prep done. Tomorrow:  make demo"
