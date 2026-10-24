#!/usr/bin/env bash
# The whole demo with no pauses, timed per step against docs/RUNSHEET.md.
# If this passes end to end from a deleted cluster, the live run will not
# surprise you. Run it the day before.
#   scripts/rehearse.sh            all steps
#   scripts/rehearse.sh 5 6        just these
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
export DEMO_AUTO=1 NO_CLEAR=1
STEPS=("$@"); [[ ${#STEPS[@]} -eq 0 ]] && STEPS=(1 2 3 4 5 6 7)
budget() { case "$1" in 1) echo 3;; 2) echo 4;; 3) echo 4;; 4) echo 4;; 5) echo 2;; 6) echo 3;; 7) echo 8;; *) echo 0;; esac; }
LOGDIR="$STATE/rehearsal"; mkdir -p "$LOGDIR"
TOTAL=0; FAILED=0; RESULTS=()
banner "Rehearsal — timed, no pauses"
for s in "${STEPS[@]}"; do
  log="$LOGDIR/step$s.log"; start=$SECONDS; rc=0
  bash "$REPO_ROOT"/demo/step-0$s-*/run.sh > "$log" 2>&1 || rc=$?
  e=$((SECONDS - start)); TOTAL=$((TOTAL + e)); b=$(budget "$s")
  if (( rc )); then FAILED=$((FAILED+1)); fail "step$s FAILED after $((e/60))m$((e%60))s — $log"; tail -8 "$log" | sed 's/^/    /'; RESULTS+=("$s|$e|$b|$rc"); break
  elif (( e > b*60 )); then warn "step$s $((e/60))m$((e%60))s (budget ${b}m) — over"
  else ok "step$s $((e/60))m$((e%60))s (budget ${b}m)"; fi
  RESULTS+=("$s|$e|$b|$rc")
done
printf '\n  %-6s %8s %8s\n' step actual budget
for r in "${RESULTS[@]}"; do IFS='|' read -r s e b rc <<< "$r"; printf '  step%-2s %5dm%02ds %6dm   %s\n' "$s" $((e/60)) $((e%60)) "$b" "$([[ $rc == 0 ]] && echo ok || echo FAIL)"; done
printf '  %-6s %5dm%02ds\n\n' total $((TOTAL/60)) $((TOTAL%60))
note "remember: make reset   (step 6 moved gitops/ to v2.1)"
(( FAILED )) && exit 1
ok "all steps passed — logs in $LOGDIR"
