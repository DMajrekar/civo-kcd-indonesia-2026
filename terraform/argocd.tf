# Argo CD is the only workload Terraform installs. Everything after this
# arrives through git: Terraform bootstraps the cluster and its GitOps agent,
# then hands over.

locals {
  kubeconfig = yamldecode(civo_kubernetes_cluster.demo.kubeconfig)
}

# Talk to the cluster we just created, using the credentials Civo returned.
provider "helm" {
  kubernetes = {
    host                   = local.kubeconfig.clusters[0].cluster.server
    cluster_ca_certificate = base64decode(local.kubeconfig.clusters[0].cluster["certificate-authority-data"])
    client_certificate     = base64decode(local.kubeconfig.users[0].user["client-certificate-data"])
    client_key             = base64decode(local.kubeconfig.users[0].user["client-key-data"])
  }
}

resource "helm_release" "argocd" {
  name             = "argocd"
  namespace        = "argocd"
  create_namespace = true
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_chart_version

  # Plain HTTP on the service: we reach the UI over a kubectl port-forward.
  set = [
    { name = "configs.params.server\\.insecure", value = "true" },
  ]

  wait    = true
  timeout = 600

  depends_on = [local_sensitive_file.kubeconfig]
}
