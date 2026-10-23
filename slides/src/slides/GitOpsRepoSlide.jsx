import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, ease } from '../ui.jsx'
import { CodeColumn } from './TerraformSlide.jsx'

// What the root Application (the one kubectl apply in step 3) points at.
// Left: the gitops/ tree as it is in the repo. Right: gitops/root/app.yaml.
const tree = [
  ['gitops/', ''],
  ['├── root/', 'the root Application points here'],
  ['│   ├── kustomization.yaml', ''],
  ['│   ├── app.yaml', 'Application → gitops/app, namespace jakarta'],
  ['│   └── cluster-autoscaler.yaml', 'Application → gitops/cluster-autoscaler, kube-system'],
  ['├── app/', ''],
  ['│   ├── kustomization.yaml', ''],
  ['│   ├── valkey.yaml', 'StatefulSet + PVC on a Civo volume'],
  ['│   ├── deployment.yaml', 'jakarta-votes: image tag, title, colour'],
  ['│   ├── service.yaml', 'type LoadBalancer → Civo load balancer'],
  ['│   └── hpa.yaml', '2 to 20 pods on CPU'],
  ['└── cluster-autoscaler/', ''],
  ['    └── deployment.yaml', 'RBAC + Deployment, reads civo-api-access'],
]
const treeHighlight = new Set([1, 3, 4])

const appYaml = [
  '# gitops/root/app.yaml',
  'apiVersion: argoproj.io/v1alpha1',
  'kind: Application',
  'metadata:',
  '  name: jakarta-votes',
  '  namespace: argocd',
  'spec:',
  '  source:',
  '    repoURL: https://github.com/dmajrekar/...',
  '    targetRevision: main',
  '    path: gitops/app',
  '  destination:',
  '    server: https://kubernetes.default.svc',
  '    namespace: jakarta',
  '  syncPolicy:',
  '    automated:',
  '      prune: true     # delete from git, gone from the cluster',
  '      selfHeal: true  # kubectl edit in prod? put back',
  '    syncOptions: [CreateNamespace=true]',
]
const appHighlight = new Set([10, 16, 17])

function Tree({ start = 0.4 }) {
  return (
    <pre className="hcl" style={{ fontSize: 24 }}>
      {tree.map(([path, note], i) => (
        <motion.span
          key={i}
          className={`ln ${treeHighlight.has(i) ? 'hl' : ''}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease, delay: start + i * 0.08 }}
        >
          <span className="str">{path.padEnd(30)}</span>
          {note && <span className="cm" style={{ color: 'var(--dim)', fontStyle: 'normal' }}>{note}</span>}
        </motion.span>
      ))}
    </pre>
  )
}

export default function GitOpsRepoSlide() {
  return (
    <Slide>
      <Eyebrow>
        gitops/ in the repo <span className="muted">(what the root Application points at)</span>
      </Eyebrow>
      <Title small>What we just installed, as it is in git</Title>
      <motion.div
        className="panel"
        style={{ marginTop: 24, padding: '24px 40px', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 48, flex: 1, minHeight: 0 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
      >
        <Tree start={0.5} />
        <CodeColumn lines={appYaml} highlight={appHighlight} start={1.2} />
      </motion.div>
    </Slide>
  )
}
