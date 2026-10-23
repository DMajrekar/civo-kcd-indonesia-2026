output "cluster_id" { value = civo_kubernetes_cluster.demo.id }
output "api_endpoint" { value = civo_kubernetes_cluster.demo.api_endpoint }
output "kubeconfig_path" { value = local_sensitive_file.kubeconfig.filename }
output "status" { value = civo_kubernetes_cluster.demo.status }
output "network_id" { value = civo_network.cluster.id }
output "argocd_version" { value = helm_release.argocd.metadata.app_version }
