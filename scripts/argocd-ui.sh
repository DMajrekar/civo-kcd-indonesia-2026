#!/usr/bin/env bash
# Keep the Argo CD UI port-forward alive outside any single step.
#   argocd-ui.sh start | stop | status
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
PIDFILE="$STATE/argocd-ui.pid"
case "${1:-start}" in
  start)
    if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then ok "Argo CD UI already on http://localhost:8080"; exit 0; fi
    nohup kubectl -n argocd port-forward svc/argocd-server 8080:80 >/dev/null 2>&1 &
    echo $! > "$PIDFILE"
    for _ in 1 2 3 4 5 6 7 8 9 10; do (echo > /dev/tcp/127.0.0.1/8080) >/dev/null 2>&1 && break; sleep 1; done
    ok "Argo CD UI: http://localhost:8080  (admin / $(cat "$STATE/argocd-password" 2>/dev/null || echo '?'))"
    ;;
  stop)   [[ -f "$PIDFILE" ]] && { kill "$(cat "$PIDFILE")" 2>/dev/null || true; rm -f "$PIDFILE"; }; ok "stopped" ;;
  status) [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null && ok "running" || fail "not running" ;;
esac
