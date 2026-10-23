#!/usr/bin/env bash
# title: What we built, and what it costs
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth; need_cluster
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }

banner "Step 08 — wrap"

say "In under thirty minutes, in a region that is one day old:"
say "  - a Kubernetes cluster, one command"
say "  - Argo CD, with git as the single source of truth"
say "  - an application with a public Civo load balancer"
say "  - a release shipped as a commit, and a hand-edit reverted"
say "  - pods and nodes that scale with traffic"
printf '\n'
run "kubectl -n argocd get applications"
run "kubectl get nodes"
run "civo kubernetes show '$CLUSTER_NAME' --region '$CIVO_REGION' | sed -n '1,/^$/p'"

say ""
say "Everything is billed per hour at the published JKT1 prices, and this whole"
say "thing is a few dollars a day. Delete it after and you pay nothing. Everything"
say "you saw is in the repo."
note "$GITOPS_REPO_URL"
printf '\n'
ok "Terima kasih, Bandung!"
note "cleanup when done:  make clean"
