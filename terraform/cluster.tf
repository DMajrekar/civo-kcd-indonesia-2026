# The same firewall the Civo CLI creates for a cluster: API, HTTP/S in,
# everything out. The load balancer the app asks for later sits inside the
# network and reuses this.
resource "civo_firewall" "cluster" {
  name                 = "${var.cluster_name}-firewall"
  create_default_rules = false

  ingress_rule {
    label      = "kubernetes api"
    protocol   = "tcp"
    port_range = "6443"
    cidr       = ["0.0.0.0/0"]
    action     = "allow"
  }
  ingress_rule {
    label      = "http"
    protocol   = "tcp"
    port_range = "80"
    cidr       = ["0.0.0.0/0"]
    action     = "allow"
  }
  ingress_rule {
    label      = "https"
    protocol   = "tcp"
    port_range = "443"
    cidr       = ["0.0.0.0/0"]
    action     = "allow"
  }
  egress_rule {
    label      = "all tcp out"
    protocol   = "tcp"
    port_range = "1-65535"
    cidr       = ["0.0.0.0/0"]
    action     = "allow"
  }
  egress_rule {
    label      = "all udp out"
    protocol   = "udp"
    port_range = "1-65535"
    cidr       = ["0.0.0.0/0"]
    action     = "allow"
  }
  egress_rule {
    label    = "icmp out"
    protocol = "icmp"
    cidr     = ["0.0.0.0/0"]
    action   = "allow"
  }
}

resource "civo_kubernetes_cluster" "demo" {
  name               = var.cluster_name
  region             = var.region
  firewall_id        = civo_firewall.cluster.id
  cluster_type       = "k3s"
  kubernetes_version = var.kubernetes_version != "" ? var.kubernetes_version : null
  applications       = var.applications
  write_kubeconfig   = true

  pools {
    label      = "workers"
    size       = var.node_size
    node_count = var.node_count
  }

  # The cluster autoscaler owns the node count once the cluster exists.
  # Without this, the next `terraform apply` would scale it straight back.
  lifecycle {
    ignore_changes = [pools[0].node_count]
  }

  timeouts { create = "15m" }
}

resource "local_sensitive_file" "kubeconfig" {
  content         = civo_kubernetes_cluster.demo.kubeconfig
  filename        = var.kubeconfig_path
  file_permission = "0600"
}
