#!/usr/bin/env bash
# title: Traffic spike: HPA adds pods, Civo autoscaler adds nodes
source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/lib.sh"
civo_auth; need_cluster
have_kubeconfig || { fail "no working kubeconfig — run 'make step2' first"; exit 1; }
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pods_by_node() { kubectl -n "$APP_NS" get pods -l app="$APP" -o wide --no-headers | awk '{print $7}' | sort | uniq -c; }

banner "Step 07 — autoscaling"

say "Two autoscalers, both installed from git. The HPA scales pods on CPU. The"
say "cluster autoscaler, in kube-system with a Civo API key, adds nodes when"
say "pods cannot be scheduled. Right now: two nodes, two pods, mostly idle."
say "The CPU numbers come from metrics-server, installed from the Civo marketplace."
wait_for "metrics-server to answer" 300 "kubectl top nodes"
run "kubectl top nodes"
run "kubectl -n $APP_NS get hpa"
run "kubectl -n kube-system logs deploy/cluster-autoscaler --tail=3 | cut -c1-150"

say ""
say "The room is voting, but phones are not a traffic spike. This is: three"
say "load generators, as many requests as they can push."
run "kubectl apply -f '$HERE/loadgen.yaml'"

say ""
say "Watch the HPA. Metrics land every 15-60 seconds; pods double, then double"
say "again, until 20 x 500m CPU no longer fits on two nodes. The watch ends"
say "when the first pod is stuck Pending with nowhere to go."
# The watch stops on "Unschedulable", not on Pending: every pod spends a
# moment Pending on its way to a node, and the condition must say so.
watch_until 480 "kubectl -n $APP_NS get hpa $APP -w" \
  "kubectl -n $APP_NS get pods -l app=$APP -o json | jq -e '[.items[] | select(.status.conditions[]? | select(.type==\"PodScheduled\" and .reason==\"Unschedulable\"))] | length > 0' >/dev/null" \
  20   # linger through one more HPA update so the jump in REPLICAS is on screen
run "kubectl -n $APP_NS get pods -l app=$APP --no-headers | awk '{print \$3}' | sort | uniq -c"
run "kubectl -n $APP_NS get pods -l app=$APP --field-selector=status.phase=Pending"
run "kubectl -n kube-system logs deploy/cluster-autoscaler --since=5m | grep -iE 'scale.?up|unschedulable|expanding' | tail -4 | cut -c1-150 || true"

say ""
say "The cluster autoscaler has asked Civo for more nodes. Same API you used"
say "in step 1, driven by the cluster itself."
say "Watch the node list: the new node appears NotReady, joins, and goes Ready"
say "(Civo takes two to three minutes to build it)."
BEFORE=$(kubectl get nodes --no-headers | grep -c ' Ready ')
watch_until 600 "kubectl get nodes -w" \
  "[[ \$(kubectl get nodes --no-headers | grep -c ' Ready ') -gt $BEFORE ]]" 5

say ""
say "And the Pending pods land on it:"
watch_until 300 "kubectl -n $APP_NS get pods -l app=$APP -o wide -w --field-selector=status.phase!=Succeeded" \
  "! kubectl -n $APP_NS get pods -l app=$APP --no-headers | grep -q Pending" 5
run "pods_by_node"

say ""
say "Stop the traffic. The HPA scales pods back within a minute or two; the"
say "cluster autoscaler removes the extra node a couple of minutes after."
run "kubectl delete -f '$HERE/loadgen.yaml' --ignore-not-found"

printf '\n'
ok "Pods and nodes scaled up on demand, and nothing was applied by hand."
note "next:  make step8"
