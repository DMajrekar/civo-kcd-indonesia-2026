import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, ArgoLogo, ease } from '../ui.jsx'
import { CodeColumn } from './TerraformSlide.jsx'

// terraform/argocd.tf, condensed: the helm provider is pointed at the cluster
// Terraform just created, then Argo CD is one helm_release.
const left = [
  'locals {',
  '  kubeconfig = yamldecode(',
  '    civo_kubernetes_cluster.demo.kubeconfig)',
  '}',
  '',
  '# Talk to the cluster we just created,',
  '# with the credentials Civo returned.',
  'provider "helm" {',
  '  kubernetes = {',
  '    host = local.kubeconfig',
  '      .clusters[0].cluster.server',
  '    cluster_ca_certificate = base64decode(...)',
  '    client_certificate     = base64decode(...)',
  '    client_key             = base64decode(...)',
  '  }',
  '}',
]
const right = [
  'resource "helm_release" "argocd" {',
  '  name             = "argocd"',
  '  namespace        = "argocd"',
  '  create_namespace = true',
  '  repository = "https://argoproj.github.io/argo-helm"',
  '  chart      = "argo-cd"',
  '  version    = var.argocd_chart_version',
  '',
  '  # Plain HTTP on the service; the UI is',
  '  # reached over a kubectl port-forward.',
  '  set = [{',
  '    name  = "configs.params.server\\\\.insecure",',
  '    value = "true",',
  '  }]',
  '',
  '  wait    = true',
  '  timeout = 600',
  '',
  '  depends_on = [local_sensitive_file.kubeconfig]',
  '}',
]
const rightHighlight = new Set([0])

export default function ArgoTerraformSlide() {
  return (
    <Slide>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Eyebrow>
            terraform/argocd.tf <span className="muted">(condensed)</span>
          </Eyebrow>
          <Title small>Argo CD is 36 lines of HCL</Title>
        </div>
        <motion.div style={{ marginTop: 70 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <ArgoLogo height={72} />
        </motion.div>
      </div>
      <motion.div
        className="panel"
        style={{ marginTop: 24, padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, flex: 1, minHeight: 0 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
      >
        <CodeColumn lines={left} start={0.5} />
        <CodeColumn lines={right} highlight={rightHighlight} start={0.9} />
      </motion.div>
    </Slide>
  )
}
