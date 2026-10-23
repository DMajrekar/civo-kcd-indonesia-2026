terraform {
  required_version = ">= 1.5"
  required_providers {
    civo  = { source = "civo/civo", version = "~> 1.3" }
    local = { source = "hashicorp/local", version = "~> 2.5" }
    helm  = { source = "hashicorp/helm", version = "~> 3.0" }
  }
}

# Credentials come from CIVO_TOKEN in the environment. Nothing secret in here.
provider "civo" {
  region = var.region
}
