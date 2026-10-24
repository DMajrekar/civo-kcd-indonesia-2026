#!/usr/bin/env bash
# Shared presentation helpers for the KCD Indonesia demo.
# Lifted from dmajrekar/kagent-civo-workshop and trimmed.
#
# The model is: narrate, show the command, wait for the presenter to hit
# enter, run it, show the result.
#
#   DEMO_AUTO=1   skip every pause (make rehearse uses this; if it passes with
#                 DEMO_AUTO=1 it will not surprise you on stage)
#   DEMO_NARROW=1 wrap narration at 72 cols instead of terminal width
set -euo pipefail

# Colour names are short and generic, which means they can silently clobber a
# variable the caller set on the command line. RESET in particular reads like a
# perfectly good flag name. Warn rather than swallow it.
for _c in BOLD DIM RESET RED GREEN YELLOW BLUE CYAN; do
  if [[ -n "${!_c-}" ]]; then
    printf 'lib.sh: ignoring inherited $%s — it is a colour variable here.\n' "$_c" >&2
    printf '        If you meant a control flag, it needs a different name.\n' >&2
  fi
done
unset _c

if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
  RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'
  BLUE=$'\033[34m'; CYAN=$'\033[36m'
else
  BOLD=; DIM=; RESET=; RED=; GREEN=; YELLOW=; BLUE=; CYAN=
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export REPO_ROOT

# Scratch space for kubeconfigs, generated manifests and tokens. Gitignored.
# Created here rather than per-step: several steps write into it and used to
# depend on an earlier one having made it first.
mkdir -p "$REPO_ROOT/.state"

# ---------------------------------------------------------------- env loading

# Load .env if present. Values already in the environment win, so you can
# override a single var for one run without editing the file.
load_env() {
  local envfile="${1:-$REPO_ROOT/.env}"
  [[ -f "$envfile" ]] || return 0
  local line key val
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    line="${line#export }"
    key="${line%%=*}"; val="${line#*=}"
    key="$(printf '%s' "$key" | tr -d '[:space:]')"
    [[ -z "$key" ]] && continue
    # strip surrounding quotes
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    [[ -n "${!key-}" ]] || export "$key=$val"
  done < "$envfile"
}

# Fail loudly and early if a step needs a variable the presenter has not set.
require_env() {
  local missing=()
  for v in "$@"; do [[ -n "${!v-}" ]] || missing+=("$v"); done
  if (( ${#missing[@]} )); then
    printf '\n%s%sMissing required variable(s):%s %s\n' "$BOLD" "$RED" "$RESET" "${missing[*]}"
    printf '  Set them in %s/.env (copy .env.example to start).\n\n' "$REPO_ROOT"
    exit 1
  fi
}

# ------------------------------------------------------------------ narration

_width() {
  if [[ -n "${DEMO_NARROW-}" ]]; then echo 72
  else local c; c=$(tput cols 2>/dev/null || echo 80); (( c > 100 )) && c=100; echo "$c"; fi
}

banner() {
  local w; w=$(_width)
  # Start each step on a clean screen. `make all` otherwise scrolls one wall of
  # text past the room and the step you are on is lost in the middle of it.
  #
  # \033[H\033[2J homes the cursor and clears the visible screen but leaves the
  # scrollback intact, so anyone who wants the previous step can still scroll
  # up. Only on a terminal -- in a log file these are just noise. NO_CLEAR=1
  # turns it off.
  if [[ -t 1 && -z "${NO_CLEAR-}" ]]; then
    printf '\033[H\033[2J'
  fi
  printf '\n%s%s%s%s\n' "$BOLD" "$BLUE" "$(printf '%*s' "$w" '' | tr ' ' '=')" "$RESET"
  printf '%s%s  %s%s\n' "$BOLD" "$BLUE" "$*" "$RESET"
  printf '%s%s%s%s\n\n' "$BOLD" "$BLUE" "$(printf '%*s' "$w" '' | tr ' ' '=')" "$RESET"
}

# A narration paragraph -- what you say while the slide is up.
# say "" is the section separator in the step scripts. When recording
# (DEMO_CLEAR_SECTIONS=1) it pauses so the previous output can be read, then
# clears the screen, so each section of a step is its own frame.
say() {
  if [[ -z "$*" && -n "${DEMO_CLEAR_SECTIONS-}" ]]; then
    sleep "${DEMO_PACE:-0}"; sleep "${DEMO_PACE:-0}"; clear; return 0
  fi
  printf '%s\n' "$*" | fold -s -w "$(_width)"
}
note() { printf '%s%s  %s%s\n' "$DIM" "$CYAN" "$*" "$RESET"; }
warn() { printf '%s%s!! %s%s\n' "$BOLD" "$YELLOW" "$*" "$RESET"; }
ok()   { printf '%s%s✓ %s%s\n' "$BOLD" "$GREEN" "$*" "$RESET"; }
fail() { printf '%s%s✗ %s%s\n' "$BOLD" "$RED" "$*" "$RESET"; }

# ---------------------------------------------------------------- interaction

# Wait for Enter on the terminal. Without a terminal and without DEMO_AUTO=1
# this ABORTS rather than racing through every pause (a piped or scripted
# `make step1` once created a cluster this way).
wait_enter() {
  # DEMO_PACE (seconds) gives a recording time to read the command first.
  if [[ -n "${DEMO_AUTO-}" ]]; then sleep "${DEMO_PACE:-0}"; printf '\n'; return 0; fi
  if { : < /dev/tty; } 2>/dev/null; then
    read -r _ < /dev/tty || true
    printf '\n'
    return 0
  fi
  printf '\n%s%sNo terminal to pause on and DEMO_AUTO is not set -- refusing to run unattended.%s\n' "$BOLD" "$RED" "$RESET" >&2
  exit 2
}

pause() {
  [[ -n "${DEMO_AUTO-}" ]] && return 0
  printf '\n%s%s  [enter] %s%s' "$DIM" "$CYAN" "${1:-continue}" "$RESET"
  wait_enter
}

# run "<command>" -- show it, wait for enter, execute it, report.
#
# NOTE: run and run_quiet ALREADY pause. Never put a bare `pause` immediately
# before one, or the presenter has to press enter twice for a single action.
# Use `pause` only where nothing is about to be run -- to hold on a point, or
# to confirm something done outside the script.
# The command is displayed exactly as the attendee would type it, which is the
# whole point: they are reading along and copying from their own repo.
run() {
  local cmd="$*"
  printf '\n%s%s$ %s%s' "$BOLD" "$GREEN" "$cmd" "$RESET"
  wait_enter
  printf '\n'
  local rc=0
  eval "$cmd" || rc=$?
  if (( rc != 0 )); then
    printf '\n'; fail "command exited $rc"
    [[ -n "${DEMO_CONTINUE_ON_ERROR-}" ]] || exit $rc
  fi
  return 0
}

# Like run, but without the pause: show the command and execute it at once.
# For a follow-up that must happen before the cluster moves on (e.g. reading
# back a value Argo CD is about to revert).
run_now() {
  local cmd="$*"
  printf '\n%s%s$ %s%s\n\n' "$BOLD" "$GREEN" "$cmd" "$RESET"
  local rc=0
  eval "$cmd" || rc=$?
  if (( rc != 0 )); then
    printf '\n'; fail "command exited $rc"
    [[ -n "${DEMO_CONTINUE_ON_ERROR-}" ]] || exit $rc
  fi
  return 0
}

# Like run, but the output is noisy/uninteresting -- swallow it unless it fails.
run_quiet() {
  local cmd="$*"
  printf '\n%s%s$ %s%s' "$BOLD" "$GREEN" "$cmd" "$RESET"
  wait_enter
  local out rc=0
  out="$(eval "$cmd" 2>&1)" || rc=$?
  if (( rc != 0 )); then printf '\n%s\n' "$out"; fail "command exited $rc"; exit $rc; fi
  ok "done"
}

# ------------------------------------------------------------ port-forwards
#
# `kubectl port-forward` exits if the pod is not accepting connections yet,
# which on a cold cluster it often is not even once the resource reports Ready.
# Backgrounding it with output discarded means you never see that -- you just
# watch a 60-second timeout and learn nothing. Start it, check the port really
# answers, and restart it if the process died.
#
#   port_forward <ns> <target> <local:remote> [attempts]
# Sets PF_PIDS so cleanup_port_forwards can tear them all down.
PF_PIDS=""

port_forward() {
  local ns="$1" target="$2" ports="$3" attempts="${4:-5}"
  local lport="${ports%%:*}"
  local i pid
  for (( i = 1; i <= attempts; i++ )); do
    kubectl -n "$ns" port-forward "$target" "$ports" >/dev/null 2>&1 &
    pid=$!
    local waited=0
    while (( waited < 15 )); do
      if ! kill -0 "$pid" 2>/dev/null; then break; fi
      if (echo > "/dev/tcp/127.0.0.1/$lport") >/dev/null 2>&1; then
        PF_PIDS="$PF_PIDS $pid"
        return 0
      fi
      sleep 1; waited=$(( waited + 1 ))
    done
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
    (( i < attempts )) && sleep 3
  done
  fail "could not port-forward to $target in namespace $ns after $attempts attempts"
  note "kubectl -n $ns get pod,endpoints -l ... to see whether it is actually serving"
  return 1
}

cleanup_port_forwards() {
  local p
  for p in $PF_PIDS; do kill "$p" 2>/dev/null || true; done
  PF_PIDS=""
}

# ------------------------------------------------------------------- waiting

# Poll until a command succeeds. Used so a step can be re-run safely while the
# thing it depends on (a cluster, a rollout) is still coming up.
# Return to the start of the line AND erase it. A bare \r only moves the
# cursor, so a short line written over a long one leaves the long one's tail
# visible.
_clearline() { printf '\r\033[2K'; }

wait_for() {
  local desc="$1" timeout="$2"; shift 2
  local deadline=$(( SECONDS + timeout )) spin='|/-\' i=0
  local tty=0; [[ -t 1 ]] && tty=1
  # Draw the spinner only on a terminal. Redirected to a file nothing
  # interprets \r, so the progress line and the result both survive and read
  # as duplicated text -- which is exactly how it looked in the run logs.
  if (( tty )); then
    printf '%s  waiting for %s (up to %ss)%s ' "$DIM" "$desc" "$timeout" "$RESET"
  fi
  while (( SECONDS < deadline )); do
    if eval "$@" >/dev/null 2>&1; then
      (( tty )) && _clearline
      ok "$desc"
      return 0
    fi
    (( tty )) && printf '\b%s' "${spin:i++%4:1}"
    sleep 5
  done
  (( tty )) && _clearline
  fail "timed out waiting for $desc"
  return 1
}

# ------------------------------------------------------------------ prereqs

need() {
  local bin="$1" hint="${2-}"
  if command -v "$bin" >/dev/null 2>&1; then return 0; fi
  fail "$bin not found"; [[ -n "$hint" ]] && note "$hint"
  return 1
}

load_env

# ------------------------------------------------------------ civo helpers
#
# `civo kubernetes show <name>` matches on PREFIX, not exact name: asking for
# "kagent-workshop" happily returns "kagent-workshop-hub". In a workshop where
# everyone picks their own cluster name and a shared hub exists in the same
# account, that is how somebody ends up deploying into the instructor's
# cluster. Always resolve to an ID by exact name.

# civo_cluster_id <name> <region> -> prints the ID, or nothing if no exact match
civo_cluster_id() {
  local name="$1" region="$2"
  civo kubernetes ls --region "$region" -o json 2>/dev/null \
    | NAME="$name" python3 -c '
import json, os, sys
want = os.environ["NAME"]
try:
    rows = json.load(sys.stdin) or []
except Exception:
    sys.exit(0)
for c in rows:
    if c.get("name") == want:
        print(c.get("id", "")); break
'
}

civo_cluster_exists() { [[ -n "$(civo_cluster_id "$1" "$2")" ]]; }

# civo_cluster_field <id> <region> <field>  e.g. Status
civo_cluster_field() {
  civo kubernetes show "$1" --region "$2" -o custom -f "$3" 2>/dev/null | tail -1
}

# civo_cluster_volumes <cluster-id> <region> -> volume IDs belonging to it
#
# Deleting a Civo cluster does NOT delete the volumes its PVCs created. They
# are left "available" and keep billing, and the only warning is a line in the
# delete output that scrolls past. Collect them before deleting the cluster --
# afterwards the association is gone and you cannot tell whose they were.
civo_cluster_volumes() {
  local cid="$1" region="$2"
  civo volume ls --region "$region" -o json 2>/dev/null \
    | CID="$cid" python3 -c '
import json, os, sys
want = os.environ["CID"]
try:
    rows = json.load(sys.stdin) or []
except Exception:
    sys.exit(0)
for v in rows:
    if v.get("cluster_id") == want or v.get("cluster") == want:
        print(v.get("id", ""))
'
}

# Report volumes with no cluster and no instance -- leftovers that still bill.
civo_orphan_volumes() {
  civo volume ls --region "${1:-lon1}" -o json 2>/dev/null \
    | python3 -c '
import json, sys
try:
    rows = json.load(sys.stdin) or []
except Exception:
    sys.exit(0)
for v in rows:
    if not (v.get("cluster_id") or v.get("cluster") or v.get("instance_id") or v.get("instance")):
        vid = v.get("id", "")
        name = v.get("name", "")
        size = v.get("size_gb", v.get("size", "?"))
        print("%s\t%s\t%sGB" % (vid, name, size))
'
}

# ------------------------------------------------------------ demo helpers

# Make sure CIVO_API_KEY is set. .env wins; otherwise use the key the civo
# CLI already has saved (`civo apikey ls`). The autoscaler Secret in step-03
# needs the raw key, which is why the CLI config alone is not enough.
civo_auth() {
  if [[ -z "${CIVO_API_KEY-}" && -f "$HOME/.civo.json" ]]; then
    CIVO_API_KEY="$(jq -r '.apikeys[.meta.current_apikey] // empty' "$HOME/.civo.json" 2>/dev/null || true)"
    export CIVO_API_KEY
  fi
  require_env CIVO_API_KEY
  if [[ "$(jq -r '.apikeys[.meta.current_apikey] // empty' "$HOME/.civo.json" 2>/dev/null)" != "$CIVO_API_KEY" ]]; then
    civo apikey add kcd "$CIVO_API_KEY" >/dev/null 2>&1 || true
    civo apikey current kcd >/dev/null 2>&1 || true
  fi
}

# Cluster settings every step shares. .env wins; these are the defaults.
CLUSTER_NAME="${CLUSTER_NAME:-kcd-jakarta}"
CIVO_REGION="$(echo "${CIVO_REGION:-JKT1}" | tr '[:lower:]' '[:upper:]')"
CIVO_NODE_SIZE="${CIVO_NODE_SIZE:-g4s.kube.large}"
CIVO_NODE_COUNT="${CIVO_NODE_COUNT:-2}"
CIVO_K8S_VERSION="${CIVO_K8S_VERSION:-}"
GITOPS_REPO_URL="${GITOPS_REPO_URL:-https://github.com/dmajrekar/civo-kcd-indonesia-2026}"
GITOPS_BRANCH="${GITOPS_BRANCH:-main}"
# The standby points at gitops/root-standby, which adds the slides deck.
GITOPS_ROOT_PATH="${GITOPS_ROOT_PATH:-gitops/root}"
ARGOCD_VERSION="${ARGOCD_VERSION:-v3.5.6}"
STATE="$REPO_ROOT/.state"
# One kubeconfig per cluster, so the standby and the live cluster never mix.
export KUBECONFIG="$STATE/kubeconfig-$CLUSTER_NAME"

# Resolve the cluster ID once per step, or fail with the step to run.
need_cluster() {
  CID="$(civo_cluster_id "$CLUSTER_NAME" "$CIVO_REGION")"
  [[ -n "$CID" ]] || { fail "no cluster named exactly '$CLUSTER_NAME' in $CIVO_REGION — run 'make step-01' first"; exit 1; }
}

# True once kubectl can talk to the cluster.
have_kubeconfig() { [[ -s "$KUBECONFIG" ]] && kubectl get --raw /readyz >/dev/null 2>&1; }

# The public URL of the demo app, once the Civo load balancer has an IP.
APP_NS=jakarta
APP=jakarta-votes
app_ip() {
  kubectl -n "$APP_NS" get svc "$APP" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true
}

# Open a URL in the presenter's browser, if there is one. Never fails.
open_url() {
  local url="$1"
  note "open: $url"
  [[ -n "${DEMO_AUTO-}" ]] && return 0
  if command -v xdg-open >/dev/null 2>&1; then (xdg-open "$url" >/dev/null 2>&1 &) ;
  elif command -v open >/dev/null 2>&1; then (open "$url" >/dev/null 2>&1 &) ; fi
  return 0
}

# Print a file with syntax highlighting if bat is installed, else cat.
show_file() {
  local f="$1" lang="${2:-yaml}"
  if command -v bat >/dev/null 2>&1; then
    bat --language="$lang" --style=plain --color=always --paging=never "$f"
  else
    cat "$f"
  fi
}

# ------------------------------------------------------------- terraform
#
# One Terraform workspace per cluster name, so the standby and the live
# cluster have separate state. CIVO_TOKEN is what the civo provider reads.
TF_DIR="$REPO_ROOT/terraform"
tf() {
  export CIVO_TOKEN="${CIVO_API_KEY}"
  terraform -chdir="$TF_DIR" "$@"
}
tf_init() {
  [[ -d "$TF_DIR/.terraform/providers" ]] || terraform -chdir="$TF_DIR" init -input=false >/dev/null
  terraform -chdir="$TF_DIR" workspace select -or-create "$CLUSTER_NAME" >/dev/null 2>&1
}
tf_vars() {
  printf -- "-var cluster_name=%s -var region=%s -var node_size=%s -var node_count=%s -var kubernetes_version=%s -var kubeconfig_path=%s" \
    "$CLUSTER_NAME" "$CIVO_REGION" "$CIVO_NODE_SIZE" "$CIVO_NODE_COUNT" "$CIVO_K8S_VERSION" "$KUBECONFIG"
}
TF_LOG_FILE="$STATE/terraform-apply-$CLUSTER_NAME.log"

# watch_until <seconds> "<watch command>" "<done condition>"
#
# Stream a `kubectl ... -w` style command to the screen and stop it as soon as
# the condition holds (or the time is up). Rows appear as the cluster changes,
# which is the point: the room sees objects being created, not a final table.
watch_until() {
  # Separate statements: bash expands every word of a `local` line before
  # assigning any of them, so `secs` would still be unset in the arithmetic.
  local secs="$1" cmd="$2" cond="$3" linger="${4:-2}"   # linger: keep watching N s after the condition
  local pid deadline
  deadline=$(( SECONDS + secs ))
  printf '\n%s%s$ %s%s\n\n' "$BOLD" "$GREEN" "$cmd" "$RESET"
  eval "$cmd" &
  pid=$!
  while (( SECONDS < deadline )); do
    if eval "$cond" >/dev/null 2>&1; then sleep "$linger"; break; fi
    kill -0 "$pid" 2>/dev/null || break
    sleep 1
  done
  # $pid is the subshell wrapping the command: kill its children too, or a
  # `kubectl ... -w` outlives the step.
  kill_tree "$pid"
  wait "$pid" 2>/dev/null || true
  printf '\n'
}

# kill_tree <pid> -- TERM a process and every descendant, children first.
kill_tree() {
  local child
  for child in $(pgrep -P "$1" 2>/dev/null); do kill_tree "$child"; done
  kill -TERM "$1" 2>/dev/null || true
}
