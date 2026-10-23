# Run sheet — 30 minutes, main stage

Saturday 24 October 2026, Selah Hall, Bandung. Solo, no follow-along. Two
windows on the projector: the terminal (`make demo`) and a browser with the
board (`http://<ip>/board`) and the Argo CD UI (`https://localhost:8080`).

| Time | Target | On screen | Talk track |
|------|--------|-----------|------------|
| 00:00 | — | Title | Who I am, Civo, yesterday's JKT1 launch with Arupa. |
| 00:02 | `step1` | `terraform plan`, apply, wait for ACTIVE | **Fire this early.** Regions, sizes, the `ignore_changes` on node count. The apply blocks 2-3 min; talk over slides 6-7. |
| 00:04 | — | slides / talk | What we are about to build (diagram on step 3 slide). Why GitOps. ~3 min of air cover while Civo provisions. |
| 00:07 | `step2` | nodes Ready, `kubectl top` | Blocks until ACTIVE. Normally already there. |
| 00:09 | `step3` | Argo CD install, root app | "One kubectl apply, ever." The autoscaler reuses the `civo-api-access` Secret Civo installs for its CCM. Open Argo UI. |
| 00:13 | `step4` | app, PVC, LB IP, **board + QR** | Everyone scans. Let it run 60s: votes climb, pod names rotate in the footer. |
| 00:17 | `step5` | TITLE before, hand edit, Application OutOfSync then Synced, TITLE after | "Someone fixed prod." Argo CD puts it back within seconds. |
| 00:19 | `step6` | whoami v1.0.0, diff, push, rollout, whoami v1.1.0 | Board turns red, title changes, votes survive. |
| 00:22 | `step7` | HPA, Pending, new node | Longest wait is Civo adding a node (~2-3 min). Talk through the autoscaler logs. |
| 00:27 | — | Recap + Thanks slides | Repo link, winner of the vote. Terima kasih. |
| 00:29 | — | Q&A | `make clean` after, not on stage. |

## Voting runs on the standby

The QR code on slide 3 (and small on every slide after it) points at
`https://vote.49-128-189-194.sslip.io/`: the standby's copy of the app behind
ingress-nginx on the Civo reserved IP `kcd-votes` (49.128.189.194, pinned with
the `kubernetes.civo.com/ipv4-address` annotation). sslip.io resolves the
hostname to the IP; cert-manager issued the Let's Encrypt certificates on
23 Oct (valid 90 days). Do not rebuild the standby on the day: a rebuild means
re-issuing against sslip.io's shared Let's Encrypt rate limit.
Board for the projector: `https://vote.49-128-189-194.sslip.io/board`.
Slides: `https://slides.49-128-189-194.sslip.io/`.
The app built live in step 4 is the same image from the same git path; say so.

## Fallbacks

- **Step 1 stalls** (region busy): keep talking, re-run `make step2` once; after 5 min switch to the standby: `CLUSTER_NAME=kcd-jakarta-standby make step4`. Standby app is already up, so continue from step 5 there.
- **Terraform misbehaves**: `CLUSTER_TOOL=cli make step1` uses the civo CLI; everything after is identical.
- **Slides**: served from the standby at the `kcd-slides` load balancer IP (`kubectl -n slides get svc`, standby kubeconfig). Have a local `cd slides && npm run dev` as backup.
- **No venue wifi for phones**: the board still works; the load generator does the scaling.
- **Image pull fails**: `make doctor` the night before checks the package is public.
- **Argo slow to notice the push**: step 6 already forces a refresh with an annotation.
- **Autoscaler never adds a node**: check `kubectl -n kube-system logs deploy/cluster-autoscaler`; quota (`civo quota show`) is the usual cause.

## Measured timings

Full `make rehearse` from a deleted cluster, 23 Oct 2026, JKT1, Terraform path
(network, firewall, cluster, Argo CD Helm release).

| step | machine time | slot | notes |
|------|--------------|------|-------|
| 1 | ~3m | 3m | blocks until `terraform apply` finishes: cluster ACTIVE, kubeconfig, Argo CD |
| 2 | ~0m20s | 2m | cluster show, nodes Ready, metrics-server answering (the apply wait moved into step 1: cluster ~1m30s, then Argo CD ~1m25s) |
| 3 | 0m14s | 4m | root Application applied, Applications stream in, UI opens |
| 4 | 0m20s | 4m | Valkey volume, pods, Civo load balancer IP (cold run was 0m54s) |
| 5 | ~0m10s | 2m | hand edit reverted by selfHeal |
| 6 | ~0m15s | 3m | commit pushed, refresh, rollout done |
| 7 | 2m44s | 8m | load on → HPA 16 pods → Unschedulable → Civo node Ready |
| **total** | **6m55s** | 29m | |

The machine needs about seven minutes of the thirty. Step 1 is the one real
wait; start it within the first two minutes and talk over slides 6 and 7
(Terraform) while it runs.
