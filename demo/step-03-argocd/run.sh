#!/usr/bin/env bash
# title: Install Argo CD and point it at git
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth; need_cluster
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }

banner "Step 03 — Argo CD"

say "We are not going to kubectl apply the application. Git is going to be the"
say "source of truth, and Argo CD will make the cluster match it. Argo CD itself"
say "was the last thing Terraform did: a Helm release, right after the cluster"
say "(the HCL is on the slides)."
printf '\n'

wait_for "Argo CD server to be ready" 600 \
  "kubectl -n argocd rollout status deploy/argocd-server --timeout=5s"
wait_for "Argo CD repo-server to be ready" 300 \
  "kubectl -n argocd rollout status deploy/argocd-repo-server --timeout=5s"
run "kubectl -n argocd get pods"

# One thing never goes in git: credentials. The cluster autoscaler reuses the
# civo-api-access Secret Civo pre-installs in kube-system for its CCM and CSI
# driver; nothing to show here, the point is on the slides.

# ------------------------------------------------------------- root app
say ""
say "Now the only manifest we apply by hand: a root Application that points at"
say "the repo. Everything under gitops/root is an Application too, so one"
say "apply bootstraps the whole cluster."
sed -e "s#__REPO_URL__#$GITOPS_REPO_URL#" -e "s#__BRANCH__#$GITOPS_BRANCH#" -e "s#__ROOT_PATH__#$GITOPS_ROOT_PATH#" "$HERE/root-app.yaml" > "$STATE/root-app.yaml"
run "show_file '$STATE/root-app.yaml'"
run "kubectl apply -f '$STATE/root-app.yaml'"

say ""
say "Watch the Application objects appear: root first, then the ones it finds"
say "in gitops/root, and their sync status turning to Synced."
watch_until 180 "kubectl -n argocd get applications -w" \
  "[[ \$(kubectl -n argocd get applications --no-headers 2>/dev/null | awk '\$2==\"Synced\"' | wc -l) -ge 3 ]]"

# ---------------------------------------------------------------- the UI
say ""
say "Argo's UI shows the same thing as a picture. Password is generated at"
say "install; this fetches it."
ARGO_PW="$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' 2>/dev/null | base64 -d || true)"
bash "$REPO_ROOT/scripts/argocd-ui.sh" start >/dev/null 2>&1 || true
printf '\n'
note "Argo CD UI:  http://localhost:8080   user: admin   password: ${ARGO_PW:-<see argocd-initial-admin-secret>}"
printf '%s' "${ARGO_PW}" > "$STATE/argocd-password"
open_url "http://localhost:8080/applications"

printf '\n'
ok "Argo CD is syncing the repo."
note "next:  make step4"
