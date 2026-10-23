#!/usr/bin/env bash
# title: Drift: a hand edit in prod, reverted by Argo CD
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }
title_env() { kubectl -n "$APP_NS" get deploy "$APP" -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="TITLE")].value}'; }

banner "Step 05 — GitOps in practice: drift"

# ------------------------------------------------------------------ drift
say "First, the thing GitOps protects you from. This is the title git says the"
say "app should have:"
run "kubectl -n $APP_NS get deploy $APP -o jsonpath='{.spec.template.spec.containers[0].env[0]}{\"\\n\"}'"
say ""
say "Now someone 'fixes' production with kubectl:"
run "kubectl -n $APP_NS set env deploy/$APP TITLE='edited by hand in prod (oops)'"
run_now "kubectl -n $APP_NS get deploy $APP -o jsonpath='{.spec.template.spec.containers[0].env[0]}{\"\\n\"}'"
say ""
say "Argo CD notices the live state no longer matches git, and puts it back."
say "Watch the Application go OutOfSync, then Synced again:"
watch_until 300 "kubectl -n argocd get application $APP -w" \
  "[[ \"\$(title_env)\" != 'edited by hand in prod (oops)' ]]"
say "And the Deployment is back to what git says:"
run "kubectl -n $APP_NS get deploy $APP -o jsonpath='{.spec.template.spec.containers[0].env[0]}{\"\\n\"}'"

printf '\n'
ok "Reverted. Git is the source of truth; the cluster follows it."
note "next:  make step6"
