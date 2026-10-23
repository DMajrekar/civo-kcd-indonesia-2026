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

## Voting runs on the standby

The QR code on slide 3 (and small on every slide after it) points at
`http://49.128.189.194/`, the standby's copy of the app behind the Civo
reserved IP `kcd-votes` (`gitops/app-standby` pins it with the
`kubernetes.civo.com/ipv4-address` annotation). Rebuilding the standby keeps
that address. The board for the projector is `http://49.128.189.194/board`.
The app built live in step 4 is the same image from the same git path; say so.

## Fallbacks

- **Step 1 stalls** (region busy): keep talking, re-run `make step2` once; after 5 min switch to the standby: `CLUSTER_NAME=kcd-jakarta-standby make step4`. Standby app is already up, so continue from step 5 there.
- **Terraform misbehaves**: `CLUSTER_TOOL=cli make step1` uses the civo CLI; everything after is identical.
- **Slides**: served from the standby at the `kcd-slides` load balancer IP (`kubectl -n slides get svc`, standby kubeconfig). Have a local `cd slides && npm run dev` as backup.
- **No venue wifi for phones**: the board still works; the load generator does the scaling.
- **Image pull fails**: `make doctor` the night before checks the package is public.
- **Argo slow to notice the push**: step 5 already forces a refresh with an annotation.
- **Autoscaler never adds a node**: check `kubectl -n kube-system logs deploy/cluster-autoscaler`; quota (`civo quota show`) is the usual cause.

## Measured timings

Full `make rehearse` from a deleted cluster, 23 Oct 2026, JKT1, Terraform path
(network, firewall, cluster, Argo CD Helm release).

| step | machine time | slot | notes |
|------|--------------|------|-------|
| 1 | 0m07s | 3m | returns once `terraform apply` is running in the background |
| 2 | 3m08s | 4m | this is the wait for the apply: cluster 1m28s, then Argo CD 1m25s; nodes Ready and metrics-server answering at the end |
| 3 | 0m14s | 4m | root Application applied, Applications stream in, UI opens |
| 4 | 0m20s | 4m | Valkey volume, pods, Civo load balancer IP (cold run was 0m54s) |
| 5 | 0m18s | 4m | drift reverted, commit pushed, rollout done |
| 6 | 2m44s | 8m | load on → HPA 16 pods → Unschedulable → Civo node Ready |
| 7 | 0m04s | 2m | |
| **total** | **6m55s** | 29m | |

The machine needs about seven minutes of the thirty. Step 2 is the one real
wait; start step 1 within the first two minutes and talk over slides 6 and 7
(Terraform) while it runs.
