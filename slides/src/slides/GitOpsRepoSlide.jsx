import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, ease } from '../ui.jsx'
import { CodeColumn } from './TerraformSlide.jsx'

// What the root Application (applied by hand in step 3) points at, as two
// slides: first the gitops/ tree as it is in the repo, then gitops/root/app.yaml.
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

function Tree({ start = 0.4, fontSize = 24 }) {
  return (
    <pre className="hcl" style={{ fontSize }}>
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

export function GitOpsRepoTreeSlide() {
  return (
    <Slide>
      <Eyebrow>
        gitops/ in the repo <span className="muted">(what the root Application points at)</span>
      </Eyebrow>
      <Title small>What we just installed, as it is in git</Title>
      <motion.div
        className="panel"
        style={{ marginTop: 24, padding: '32px 48px', flex: 1, minHeight: 0 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
      >
        <Tree start={0.5} fontSize={30} />
      </motion.div>
    </Slide>
  )
}

export function GitOpsRepoAppSlide() {
  return (
    <Slide>
      <Eyebrow>
        gitops/root/app.yaml <span className="muted">(condensed)</span>
      </Eyebrow>
      <Title small>The Application that installs the app</Title>
      <motion.div
        className="panel"
        style={{ marginTop: 24, padding: '32px 48px', flex: 1, minHeight: 0 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
      >
        <CodeColumn lines={appYaml} highlight={appHighlight} start={0.5} />
      </motion.div>
    </Slide>
  )
}
