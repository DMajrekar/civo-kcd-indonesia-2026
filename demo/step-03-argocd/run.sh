#!/usr/bin/env bash
# title: Install Argo CD and point it at git
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth; need_cluster
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }

banner "Step 03 — Argo CD"

say "We are not going to kubectl apply the application. Git is going to be the"
say "source of truth, and Argo CD will make the cluster match it."
printf '\n'

if kubectl -n argocd get deploy argocd-server >/dev/null 2>&1; then
  ok "Argo CD already installed"
else
  run "kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -"
  run "kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/$ARGOCD_VERSION/manifests/install.yaml"
fi
wait_for "Argo CD server to be ready" 600 \
  "kubectl -n argocd rollout status deploy/argocd-server --timeout=5s"
wait_for "Argo CD repo-server to be ready" 300 \
  "kubectl -n argocd rollout status deploy/argocd-repo-server --timeout=5s"

# --------------------------------------------------- autoscaler credentials
say ""
say "One thing never goes in git: credentials. The cluster autoscaler needs a"
say "Civo API key to add nodes, so that Secret is created here, by hand."
printf '\n%s%s$ kubectl -n kube-system create secret generic civo-api-access --from-literal=api-key=**** ...%s\n' \
  "$BOLD" "$GREEN" "$RESET"
kubectl -n kube-system create secret generic civo-api-access \
  --from-literal=api-url=https://api.civo.com \
  --from-literal=api-key="$CIVO_API_KEY" \
  --from-literal=cluster-id="$CID" \
  --from-literal=region="$CIVO_REGION" \
  --dry-run=client -o yaml | kubectl apply -f - >/dev/null
ok "secret civo-api-access in kube-system"

# ------------------------------------------------------------- root app
say ""
say "Now the only manifest we apply by hand: a root Application that points at"
say "the repo. Everything under gitops/root is an Application too, so one"
say "apply bootstraps the whole cluster."
sed -e "s#__REPO_URL__#$GITOPS_REPO_URL#" -e "s#__BRANCH__#$GITOPS_BRANCH#" "$HERE/root-app.yaml" > "$STATE/root-app.yaml"
run "show_file '$STATE/root-app.yaml'"
sed -e "s#__REPO_URL__#$GITOPS_REPO_URL#" -e "s#__BRANCH__#$GITOPS_BRANCH#" "$HERE/root-app.yaml" \
  | kubectl apply -f - >/dev/null
ok "root Application applied"

wait_for "Argo CD to discover the child Applications" 180 \
  "kubectl -n argocd get application $APP cluster-autoscaler"
run "kubectl -n argocd get applications"

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
