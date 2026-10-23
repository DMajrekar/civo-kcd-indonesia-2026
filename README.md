# Kubernetes on Civo, from zero to autoscaling — KCD Indonesia 2026

A 30-minute live demo for the main stage in Bandung, 24 October 2026, the day
after Civo's Indonesia region (JKT1, run with Arupa Cloud Nusantara) launched.

```
make demo
```

| Step | What happens | Civo / Kubernetes thing shown |
|------|--------------|-------------------------------|
| 1 | Terraform plan, apply in the background, cluster in JKT1 | regions, sizes, marketplace apps, `ignore_changes` on node count |
| 2 | kubeconfig, nodes, `kubectl top` | metrics-server |
| 3 | Argo CD is already there (Terraform Helm release); one root Application by hand; autoscaler reuses Civo's pre-installed API Secret | app-of-apps, secrets stay out of git |
| 4 | App + Valkey + HPA arrive from git; public IP; QR on the projector | Civo load balancer, Civo volume (PVC) |
| 5 | Hand-edit reverted; release shipped as a commit | selfHeal, rolling update |
| 6 | Load generator → HPA to 20 pods → Pending → Civo adds nodes | HPA, cluster autoscaler (Civo provider) |
| 7 | Recap and cost | |

The app is **jakarta-votes** (`app/`): the audience scans a QR code and votes
on what Dinesh should do on his free day in Jakarta. Votes live in Valkey on a
Civo block volume. Every response says which pod and node served it, so the
autoscaling step is visible on the board.

## Layout

| Path | What |
|------|------|
| `Makefile` | The deck. `make demo`, `make stepN`, `make help`. |
| `demo/step-NN-*/run.sh` | The commands for each step: shown, paused, run, waited on. Idempotent. |
| `scripts/lib.sh` | Presentation runner: `run`, `pause`, `wait_for`, `banner`. |
| `gitops/root/` | Argo CD Applications (app-of-apps). |
| `gitops/app/` | The application: Valkey StatefulSet + PVC, Deployment, Service, HPA (kustomize base). |
| `gitops/app-standby/` | Overlay for the standby: ClusterIP Service behind ingress-nginx. |
| `gitops/standby-ingress/` | ClusterIssuer (Let's Encrypt) and the Ingresses for `vote.` and `slides.` on `49-128-189-194.sslip.io`. |
| `gitops/root-standby/` | Standby root: the live root plus slides, ingress-nginx (on the reserved IP), cert-manager and the Ingresses. |
| `gitops/cluster-autoscaler/` | Kubernetes cluster-autoscaler with the Civo cloud provider. |
| `app/` | Go source, Dockerfile. Built by `.github/workflows/build.yml` to `ghcr.io/<owner>/jakarta-votes`. |
| `terraform/` | Dedicated network + firewall + k3s cluster + Argo CD (Helm release). One workspace per cluster name. `CLUSTER_TOOL=cli` in `.env` uses the civo CLI instead. |
| `slides/` | The React slide deck, served from the standby cluster (`gitops/slides`, `gitops/root-standby`). |
| `docs/RUNSHEET.md` | Minute-by-minute plan and rehearsal timings. |

## Before the day

```bash
cp .env.example .env         # optional: the civo CLI's saved key is used otherwise
make doctor                  # tools, key, region, git remote, image is public
make prep                    # doctor + reset gitops to v1 + check images
make rehearse                # full run, no pauses, timed      (then: make reset, make clean)
make standby                 # optional: a warm cluster in case the live create stalls
```

Images: push tags `v1.0.0` and `v1.1.0` so both exist in GHCR, and make the
package public once (GitHub → Packages → jakarta-votes → settings).

## On the day

```bash
make demo
```

Each step clears the screen, prints its key points, then shows every command
and waits for Enter before running it. If a step fails, fix the cause and run
`make stepN` again; every step is safe to re-run. `DEMO_AUTO=1` skips pauses.

If step 1 stalls and a standby exists: `CLUSTER_NAME=kcd-jakarta-standby make step4`.
The standby also serves the slide deck (`make standby` points its Argo root at
`gitops/root-standby`). Never change a running cluster's root path: Argo prunes
the old child Applications first, which deletes the app, its load balancer and
its volume before recreating them.

Afterwards: `make clean` (or `make clean-all` with the standby).
