#!/usr/bin/env bash
# A warm standby: the same cluster, built the night before in the fallback
# region (or the same one), with Argo CD and the app already up. If the live
# create in step 1 stalls, `make step2 CLUSTER_NAME=kcd-jakarta-standby`
# (or STANDBY_REGION) carries on from there and the audience never knows.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
export CLUSTER_NAME="${CLUSTER_NAME}-standby"
export CIVO_REGION="${STANDBY_REGION:-$CIVO_REGION}"
export GITOPS_ROOT_PATH="${GITOPS_ROOT_PATH:-gitops/root-standby}"
banner "Standby cluster '$CLUSTER_NAME' in $CIVO_REGION"
export DEMO_AUTO=1 NO_CLEAR=1
for s in 01 02 03 04; do bash "$REPO_ROOT"/demo/step-$s-*/run.sh; done
ok "standby ready. To use it live:  CLUSTER_NAME=$CLUSTER_NAME CIVO_REGION=$CIVO_REGION make step2"
note "kubeconfig: $KUBECONFIG"
