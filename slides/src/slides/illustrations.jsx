import { motion } from 'framer-motion'
import { Box, Arrow, ArrowDefs, Chip, Code, Logo, ArgoLogo, ease } from '../ui.jsx'

// All illustrations live in an 820x600 canvas on the right-hand column.

export function CreateCluster() {
  return (
    <>
      <svg width={820} height={600} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ArrowDefs />
        <Arrow from={[250, 150]} to={[480, 150]} label="terraform apply" delay={1.2} labelSize={21} />
      </svg>
      <Box x={0} y={90} w={250} h={120} title="laptop" sub="Terraform, civo provider" delay={0.7} />
      <Box x={480} y={60} w={340} h={180} title="JKT1" sub="firewall + k3s cluster, 2 x g4s.kube.medium, metrics-server" accent delay={1.5} />
      <Code delay={2.0} style={{ position: 'absolute', left: 0, top: 300, width: 820, fontSize: 23 }}>
        {'resource "civo_kubernetes_cluster" "demo" {\n  pools { size = "g4s.kube.medium"  node_count = 2 }\n  '}
        <span className="hl">{'lifecycle { ignore_changes = [pools[0].node_count] }'}</span>
        {'\n}'}
      </Code>
      <motion.div className="muted" style={{ position: 'absolute', left: 0, top: 500, fontSize: 26 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
        Step 2 picks up the result; Terraform writes the kubeconfig too.
      </motion.div>
    </>
  )
}

export function Connect() {
  const nodes = ['kcd-jakarta-node-1', 'kcd-jakarta-node-2']
  return (
    <>
      <Chip delay={0.6} style={{ position: 'absolute', left: 0, top: 40, fontSize: 25 }}>
        civo kubernetes config kcd-jakarta --save
      </Chip>
      <Chip delay={0.9} style={{ position: 'absolute', left: 0, top: 130, fontSize: 25 }}>
        kubectl get nodes
      </Chip>
      <div style={{ position: 'absolute', left: 0, top: 250, width: 820 }}>
        {nodes.map((n, i) => (
          <motion.div
            key={n}
            style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 28px', borderRadius: 16, border: '2px solid var(--line)', marginBottom: 18, fontFamily: 'var(--mono)', fontSize: 28 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease, delay: 1.4 + i * 0.3 }}
          >
            <motion.span
              style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--aurora)' }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
            />
            <span style={{ flex: 1 }}>{n}</span>
            <span className="accent">Ready</span>
          </motion.div>
        ))}
      </div>
      <Chip delay={2.3} style={{ position: 'absolute', left: 0, top: 490, fontSize: 25 }}>
        kubectl top nodes
      </Chip>
    </>
  )
}

export function ArgoCd() {
  return (
    <>
      <svg width={820} height={600} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ArrowDefs />
        <Arrow from={[210, 150]} to={[305, 150]} label="pull" delay={1.4} labelOffset={[0, -16]} />
        <Arrow from={[515, 150]} to={[610, 150]} label="apply" delay={1.8} labelOffset={[0, -16]} />
      </svg>
      <Box x={0} y={90} w={210} h={120} title="GitHub" sub="gitops/" delay={0.6} />
      <Box x={305} y={60} w={210} h={180} accent delay={1.0} style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <ArgoLogo height={64} />
        <div className="box-title" style={{ color: 'var(--aurora)' }}>Argo CD</div>
        <div className="box-sub">installed by Terraform</div>
      </Box>
      <Box x={610} y={60} w={210} h={180} delay={1.4} style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <Logo height={44} />
        <div className="box-title">cluster</div>
        <div className="box-sub">app, Valkey, autoscaler</div>
      </Box>
      <Chip block delay={2.2} style={{ position: 'absolute', left: 0, top: 300, width: 820, fontSize: 25 }}>
        kubectl apply -f root-app.yaml
      </Chip>
      <motion.div className="muted" style={{ position: 'absolute', left: 0, top: 400, fontSize: 26 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
        The one manifest applied by hand. gitops/root holds more Applications, so one apply bootstraps everything.
      </motion.div>
    </>
  )
}

export function TheApp() {
  return (
    <>
      <svg width={820} height={600} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ArrowDefs />
        <Arrow from={[150, 120]} to={[150, 220]} delay={1.1} />
        <Arrow from={[300, 290]} to={[470, 290]} delay={1.6} />
        <Arrow from={[620, 360]} to={[620, 440]} delay={2.0} />
      </svg>
      <Box x={0} y={0} w={300} h={120} title="Load balancer" sub="Civo, public IP, no annotations" accent delay={0.6} />
      <Box x={0} y={220} w={300} h={140} title="jakarta-votes" sub="Deployment, 2 pods" delay={1.2}>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <span className="pod" style={{ width: 30, height: 30 }} />
          <span className="pod" style={{ width: 30, height: 30 }} />
        </div>
      </Box>
      <Box x={470} y={220} w={300} h={140} title="Valkey" sub="StatefulSet, 1 replica" delay={1.6} />
      <Box x={470} y={440} w={300} h={100} title="Civo volume" sub="PersistentVolumeClaim" delay={2.1} />
      <Box x={0} y={440} w={300} h={100} title="HPA" sub="CPU 50%, 2 to 20 pods" dashed ghost delay={2.4} />
    </>
  )
}

export function Drift() {
  return (
    <>
      <motion.div
        className="panel"
        style={{ position: 'absolute', left: 0, top: 10, width: 820, padding: '28px 36px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.6 }}
      >
        <div className="muted" style={{ fontSize: 24, marginBottom: 10 }}>Drift</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 25, color: 'var(--cloud)' }}>
          <span className="accent">$</span> kubectl set env deploy/jakarta-votes TITLE='edited by hand (oops)'
        </div>
        <motion.div
          style={{ marginTop: 16, fontSize: 28, color: 'var(--aurora)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          selfHeal: reverted to what git says
        </motion.div>
      </motion.div>

    </>
  )
}

export function Release() {
  return (
    <>
      <motion.div
        className="panel"
        style={{ position: 'absolute', left: 0, top: 10, width: 820, padding: '28px 36px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.6 }}
      >
        <div className="muted" style={{ fontSize: 24, marginBottom: 14 }}>Release</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontFamily: 'var(--mono)', fontSize: 40 }}>
          <motion.span style={{ color: 'var(--dim)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
            v1.0.0
          </motion.span>
          <motion.span className="accent" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 }}>
            &rarr;
          </motion.span>
          <motion.span style={{ color: 'var(--white)', fontWeight: 700 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6 }}>
            v1.1.0
          </motion.span>
        </div>
        <motion.div style={{ marginTop: 18, fontSize: 26, color: 'var(--cloud)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>
          git commit, git push, Argo CD rolls it out. Zero downtime, votes survive.
        </motion.div>
      </motion.div>
    </>
  )
}

export function FlowStrip({ steps = ['load', 'pods x2', 'x4', 'x8', 'Pending', '+ node'], start = 0.6, fontSize = 23, style }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 10, alignItems: 'center', ...style }}>
      {steps.map((s, i) => (
        <motion.div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: start + i * 0.25 }}>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize,
              padding: '8px 14px',
              borderRadius: 10,
              border: `2px solid ${s === 'Pending' ? 'var(--private)' : s === '+ node' ? 'var(--aurora)' : 'var(--line)'}`,
              color: s === 'Pending' ? 'var(--private)' : s === '+ node' ? 'var(--aurora)' : 'var(--cloud)',
            }}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span className="muted" style={{ fontSize: fontSize - 1 }}>&rarr;</span>}
        </motion.div>
      ))}
    </div>
  )
}

export function Autoscaling() {
  return (
    <>
      <FlowStrip style={{ position: 'absolute', left: 0, top: 30, width: 820 }} />

      <Stat x={0} y={160} big="50%" label="CPU per pod, HPA target" delay={2.2} />
      <Stat x={300} y={160} big="20" label="pods, HPA max" delay={2.5} />
      <Stat x={580} y={160} big="5" label="nodes, autoscaler max" delay={2.8} />

      <motion.div className="muted" style={{ position: 'absolute', left: 0, top: 410, fontSize: 26, lineHeight: 1.4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>
        Three load generators push as many requests as they can. Metrics land every 15 to 60 seconds; 20 x 250m CPU does not fit on two nodes, so pods go Pending and Civo adds a node (2 to 3 minutes).
      </motion.div>
    </>
  )
}

function Stat({ x, y, big, label, delay }) {
  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: y, width: 240 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
    >
      <div style={{ fontSize: 110, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--aurora)', lineHeight: 1 }}>{big}</div>
      <div className="muted" style={{ fontSize: 24, marginTop: 8 }}>{label}</div>
    </motion.div>
  )
}

export function WhatWeBuilt() {
  const built = [
    'A Kubernetes cluster in JKT1 from Terraform',
    'Argo CD, git as the single source of truth',
    'App with a public Civo load balancer',
    'Release by commit, drift reverted',
    'Pods and nodes scaling with traffic',
  ]
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 820 }}>
        {built.map((b, i) => (
          <motion.div
            key={b}
            style={{ display: 'flex', gap: 22, alignItems: 'center', fontSize: 32, padding: '14px 0', borderBottom: '1px solid var(--line)' }}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease, delay: 0.6 + i * 0.25 }}
          >
            <motion.svg width={34} height={34} viewBox="0 0 34 34" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.25, type: 'spring', stiffness: 300, damping: 18 }}>
              <circle cx={17} cy={17} r={16} fill="var(--aurora)" />
              <path d="M9 17.5l5.5 5.5L25 12.5" stroke="#000" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            {b}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="panel"
        style={{ position: 'absolute', left: 0, top: 400, width: 820, padding: '26px 36px', borderColor: 'var(--aurora)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 2.2 }}
      >
        <div style={{ fontSize: 30, fontWeight: 600 }}>Billed per hour at the published JKT1 prices</div>
        <div className="muted" style={{ fontSize: 25, marginTop: 8 }}>Two nodes, a load balancer, a volume: a few dollars a day.</div>
      </motion.div>
    </>
  )
}
