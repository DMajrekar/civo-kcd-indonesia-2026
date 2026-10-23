# KCD Indonesia 2026 -- Civo Kubernetes, GitOps with Argo CD, autoscaling.
# Run `make demo` for the 30-minute walkthrough. `make help` lists targets.

.PHONY: help demo prep rehearse reset doctor set-repo standby argocd-ui clean clean-all \
        step1 step2 step3 step4 step5 step6 step7

-include .env
export
export PATH := $(HOME)/.local/bin:$(PATH)
SHELL := /usr/bin/env bash

# Real escape characters (bash's echo does not interpret \033), and kept out of
# the environment so scripts/lib.sh keeps its own colour handling.
CYAN   := $(shell printf '\033[36m')
GREEN  := $(shell printf '\033[32m')
YELLOW := $(shell printf '\033[33m')
DIM    := $(shell printf '\033[2m')
BOLD   := $(shell printf '\033[1m')
RESET  := $(shell printf '\033[0m')
unexport CYAN GREEN YELLOW DIM BOLD RESET

TITLE := KCD INDONESIA 2026  ·  Kubernetes on Civo, from zero to autoscaling

# Every step clears the screen and prints the same header, then runs its
# script. The scripts (demo/step-NN-*/run.sh) do the actual work: they show
# each command, wait for Enter, run it, and wait for the cluster to catch up.
define slide
	@clear
	@echo "$(BOLD)=================================================================="
	@echo "  $(TITLE)"
	@echo "==================================================================$(RESET)"
	@echo ""
	@echo "$(CYAN)$(1)$(RESET)"
	@echo "------------------------------------------------------------------"
	@echo ""
endef

help: ## Show this help
	@echo 'KCD Indonesia 2026 -- Civo demo'
	@echo ''
	@echo 'Usage: make [target]'
	@echo ''
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {printf "  $(GREEN)%-12s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Runs the steps in order with an [enter] between them (DEMO_AUTO=1 skips it),
# so the presenter decides when the next screen clears.
demo: ## Run the full 30-minute demo
	@steps=(step1 step2 step3 step4 step5 step6 step7); \
	for i in $${!steps[@]}; do \
	  $(MAKE) --no-print-directory $${steps[$$i]} || exit $$?; \
	  n=$${steps[$$((i+1))]-}; [ -z "$$n" ] && break; \
	  [ -n "$${DEMO_AUTO-}" ] && continue; \
	  printf '\n$(DIM)$(CYAN)  [enter] next: make %s$(RESET)' "$$n"; read -r _ < /dev/tty || exit 1; \
	done

# ------------------------------------------------------------------ steps

step1: ## Step 1: Create a Kubernetes cluster in Jakarta (JKT1)
	$(call slide,Step 1: A cluster in Jakarta)
	@NO_CLEAR=1 bash demo/step-01-cluster/run.sh

step2: ## Step 2: Connect with kubectl, check nodes and metrics
	$(call slide,Step 2: Connect)
	@NO_CLEAR=1 bash demo/step-02-connect/run.sh

step3: ## Step 3: Install Argo CD and point it at git
	$(call slide,Step 3: Argo CD -- git becomes the source of truth)
	@NO_CLEAR=1 bash demo/step-03-argocd/run.sh

step4: ## Step 4: The application arrives from git, with a Civo load balancer
	$(call slide,Step 4: The application)
	@NO_CLEAR=1 bash demo/step-04-app/run.sh

step5: ## Step 5: Ship a release as a commit; watch drift get reverted
	$(call slide,Step 5: GitOps in practice)
	@NO_CLEAR=1 bash demo/step-05-gitops/run.sh

step6: ## Step 6: Traffic spike -- HPA adds pods, Civo autoscaler adds nodes
	$(call slide,Step 6: Autoscaling)
	@NO_CLEAR=1 bash demo/step-06-autoscale/run.sh

step7: ## Step 7: Summary and cost
	$(call slide,Step 7: What we built)
	@NO_CLEAR=1 bash demo/step-07-wrap/run.sh

# -------------------------------------------------------------- operations

doctor: ## Check tools, credentials and the repo remote
	@scripts/doctor.sh

prep: ## Night before: doctor, push gitops, warm a standby cluster
	@scripts/prep.sh

standby: ## Create (or reuse) the standby cluster in the fallback region
	@scripts/standby.sh

rehearse: ## Run every step with no pauses, timed per step
	@scripts/rehearse.sh

reset: ## Reset gitops/ to v1 and push, so step5 has a change to ship
	@scripts/reset-gitops.sh

set-repo: ## Rewrite every repoURL under gitops/ to GITOPS_REPO_URL
	@scripts/set-repo.sh

argocd-ui: ## Port-forward the Argo CD UI to http://localhost:8080
	@scripts/argocd-ui.sh start

clean: ## Delete the demo cluster, its load balancer and volumes
	@bash demo/step-99-cleanup/run.sh

clean-all: ## Delete the demo cluster AND the standby cluster
	@bash demo/step-99-cleanup/run.sh
	@STANDBY=1 bash demo/step-99-cleanup/run.sh
