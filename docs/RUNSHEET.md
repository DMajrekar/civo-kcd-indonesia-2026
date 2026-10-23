# Run sheet — 30 minutes, main stage

Saturday 24 October 2026, Selah Hall, Bandung. Solo, no follow-along. Two
windows on the projector: the terminal (`make demo`) and a browser with the
board (`http://<ip>/board`) and the Argo CD UI (`https://localhost:8080`).

| Time | Target | On screen | Talk track |
|------|--------|-----------|------------|
| 00:00 | — | Title | Who I am, Civo, yesterday's JKT1 launch with Arupa. |
| 00:02 | `step1` | `terraform plan`, apply in background | **Fire this early.** Regions, sizes, the `ignore_changes` on node count. Civo takes 3-4 min to ACTIVE. |
| 00:04 | — | slides / talk | What we are about to build (diagram on step 3 slide). Why GitOps. ~3 min of air cover while Civo provisions. |
| 00:07 | `step2` | nodes Ready, `kubectl top` | Blocks until ACTIVE. Normally already there. |
| 00:09 | `step3` | Argo CD install, root app | "One kubectl apply, ever." The autoscaler reuses the `civo-api-access` Secret Civo installs for its CCM. Open Argo UI. |
| 00:13 | `step4` | app, PVC, LB IP, **board + QR** | Everyone scans. Let it run 60s: votes climb, pod names rotate in the footer. |
| 00:17 | `step5` | hand edit reverted; diff, push, rollout | Board turns red, title changes, votes survive. |
| 00:21 | `step6` | HPA, Pending, new node | Longest wait is Civo adding a node (~2-3 min). Talk through the autoscaler logs. |
| 00:27 | `step7` | recap, `civo kubernetes show` | Cost, repo link, winner of the vote. Terima kasih. |
| 00:29 | — | Q&A | `make clean` after, not on stage. |

## Fallbacks

- **Step 1 stalls** (region busy): keep talking, re-run `make step2` once; after 5 min switch to the standby: `CLUSTER_NAME=kcd-jakarta-standby make step4`. Standby app is already up, so continue from step 5 there.
- **Terraform misbehaves**: `CLUSTER_TOOL=cli make step1` uses the civo CLI; everything after is identical.
- **Slides**: served from the standby at the `kcd-slides` load balancer IP (`kubectl -n slides get svc`, standby kubeconfig). Have a local `cd slides && npm run dev` as backup.
- **No venue wifi for phones**: the board still works; the load generator does the scaling.
- **Image pull fails**: `make doctor` the night before checks the package is public.
- **Argo slow to notice the push**: step 5 already forces a refresh with an annotation.
- **Autoscaler never adds a node**: check `kubectl -n kube-system logs deploy/cluster-autoscaler`; quota (`civo quota show`) is the usual cause.

## Measured timings

Fill in from `make rehearse` (`.state/rehearsal/*.log`).

| step | machine time | slot |
|------|--------------|------|
| 1 | | 3m |
| 2 | | 4m |
| 3 | | 4m |
| 4 | | 4m |
| 5 | | 4m |
| 6 | 3m13s (load on → node Ready) | 8m |
| 7 | | 2m |
