#!/usr/bin/env bash
# title: The application arrives from git, with a Civo load balancer
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }

banner "Step 04 — the application"

say "Nobody ran kubectl apply for this. Argo saw gitops/app in the repo and"
say "made it real: a Valkey StatefulSet on a Civo volume, the app Deployment,"
say "a Service of type LoadBalancer, and an HPA."
printf '\n'
run "ls '$REPO_ROOT/gitops/app'"
run "show_file '$REPO_ROOT/gitops/app/deployment.yaml'"

wait_for "Argo to sync the $APP Application" 300 \
  "[[ \"\$(kubectl -n argocd get application $APP -o jsonpath='{.status.sync.status}')\" == Synced ]]"
wait_for "Valkey to be ready on its Civo volume" 300 \
  "[[ \"\$(kubectl -n $APP_NS get sts valkey -o jsonpath='{.status.readyReplicas}')\" == 1 ]]"
wait_for "$APP pods to be Ready" 300 \
  "[[ \$(kubectl -n $APP_NS get pods -l app=$APP --no-headers 2>/dev/null | grep -c ' 1/1 ') -ge 2 ]]"
run "kubectl -n $APP_NS get deploy,sts,pods,hpa,pvc"

say ""
say "The PVC is a real Civo block volume. The Service asked for a LoadBalancer"
say "and Civo provisioned one with a public IP: no annotations, no controller."
wait_for "Civo load balancer to get a public IP" 300 "[[ -n \"\$(app_ip)\" ]]"
run "kubectl -n $APP_NS get svc $APP"
run "civo volume ls --region '$CIVO_REGION'"
run "civo loadbalancer ls --region '$CIVO_REGION'"

IP="$(app_ip)"
wait_for "the app to answer on http://$IP" 180 "curl -fsS -m 5 http://$IP/healthz"

printf '\n'
ok "Live at http://$IP   — put http://$IP/board on the projector"
say ""
say "The QR code on the slides points at this same app on the standby cluster,"
say "where the votes have been collecting since slide 3. Same image, same git."
open_url "http://$IP/board"
note "next:  make step5"
