import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, ease } from '../ui.jsx'

// Condensed from terraform/cluster.tf (88 lines): network, firewall, cluster.
// Argo CD's helm_release (terraform/argocd.tf) has its own slide after step 3.
const left = [
  'resource "civo_network" "cluster" {',
  '  label  = "${var.cluster_name}-network"',
  '  region = var.region',
  '}',
  '',
  'resource "civo_firewall" "cluster" {',
  '  name                 = "${var.cluster_name}-firewall"',
  '  network_id           = civo_network.cluster.id',
  '  create_default_rules = false',
  '',
  '  ingress_rule {',
  '    label      = "kubernetes api"',
  '    protocol   = "tcp"',
  '    port_range = "6443"',
  '    cidr       = ["0.0.0.0/0"]',
  '    action     = "allow"',
  '  }',
  '  # ... http and https in, everything out',
  '}',
]
const leftHighlight = new Set()

const right = [
  'resource "civo_kubernetes_cluster" "demo" {',
  '  name             = var.cluster_name',
  '  region           = var.region',
  '  network_id       = civo_network.cluster.id',
  '  firewall_id      = civo_firewall.cluster.id',
  '  cluster_type     = "k3s"',
  '  applications     = var.applications # metrics-server',
  '  write_kubeconfig = true',
  '',
  '  pools {',
  '    size       = var.node_size   # g4s.kube.medium',
  '    node_count = var.node_count  # 2',
  '  }',
  '',
  '  # The autoscaler owns the node count once it exists',
  '  lifecycle {',
  '    ignore_changes = [pools[0].node_count]',
  '  }',
  '}',
]
const rightHighlight = new Set([14, 15, 16, 17])

const KW = /\b(resource|lifecycle|pools|ingress_rule)\b/

function tint(line) {
  const parts = line.split(/(#.*$|"[^"]*"|\b(?:resource|lifecycle|pools|ingress_rule)\b)/)
  return parts.map((p, i) => {
    if (!p) return null
    if (p.startsWith('#')) return <span key={i} className="cm">{p}</span>
    if (p.startsWith('"')) return <span key={i} className="str">{p}</span>
    if (KW.test(p) && p.match(KW)[0] === p) return <span key={i} className="kw">{p}</span>
    return <span key={i}>{p}</span>
  })
}

export function CodeColumn({ lines, highlight = new Set(), start = 0.4 }) {
  return (
    <pre className="hcl">
      {lines.map((l, i) => (
        <motion.span
          key={i}
          className={`ln ${highlight.has(i) ? 'hl' : ''}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease, delay: start + i * 0.05 }}
        >
          {l === '' ? ' ' : tint(l)}
        </motion.span>
      ))}
    </pre>
  )
}

export default function TerraformSlide() {
  return (
    <Slide>
      <Eyebrow>
        terraform/cluster.tf <span className="muted">(condensed here: the firewall has five more rules)</span>
      </Eyebrow>
      <Title small>The whole cluster is 88 lines of HCL</Title>
      <motion.div
        className="panel"
        style={{ marginTop: 24, padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, flex: 1, minHeight: 0 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
      >
        <CodeColumn lines={left} highlight={leftHighlight} start={0.5} />
        <CodeColumn lines={right} highlight={rightHighlight} start={0.9} />
      </motion.div>
    </Slide>
  )
}
