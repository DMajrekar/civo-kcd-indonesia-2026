variable "cluster_name" {
  type    = string
  default = "kcd-jakarta"
}

variable "region" {
  type    = string
  default = "JKT1"
}

variable "node_size" {
  type    = string
  default = "g4s.kube.medium" # 2 vCPU / 4 GB
}

variable "node_count" {
  description = "Initial worker count. The cluster autoscaler changes this later; see ignore_changes."
  type        = number
  default     = 2
}

variable "kubernetes_version" {
  description = "k3s version, e.g. 1.35.0-k3s1. Empty = the region's current default."
  type        = string
  default     = ""
}

variable "applications" {
  description = "Civo marketplace apps. A leading '-' removes a default app."
  type        = string
  default     = "-traefik2-nodeport,metrics-server"
}

variable "kubeconfig_path" {
  type = string
}

variable "argocd_chart_version" {
  description = "argo-cd Helm chart version (10.10.5 ships Argo CD v3.5.5)."
  type        = string
  default     = "10.10.5"
}
