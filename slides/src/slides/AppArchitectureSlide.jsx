import { motion } from 'framer-motion'
import { Slide, Title, Box, Arrow, ArrowDefs, Logo, ArgoLogo, ease } from '../ui.jsx'

const t = { cluster: 0.3, lb: 0.9, app: 1.6, valkey: 2.2, volume: 2.7, argo: 3.3 }

function Pods({ n, delay }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
      {Array.from({ length: n }).map((_, i) => (
        <motion.div key={i} className="pod" style={{ width: 40, height: 40 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.35, ease, delay: delay + i * 0.1 }} />
      ))}
    </div>
  )
}

export default function AppArchitectureSlide() {
  return (
    <Slide>
      <Title small>Architecture</Title>

      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <ArrowDefs />
          <Arrow from={[120, 585]} to={[300, 585]} label="public IP" delay={t.lb + 0.3} color="var(--cloud)" dashed labelOffset={[0, -18]} labelSize={22} />
          <Arrow from={[640, 585]} to={[760, 585]} delay={t.app - 0.2} />
          <Arrow from={[1180, 585]} to={[1260, 585]} label="votes" delay={t.valkey - 0.2} labelOffset={[0, -18]} labelSize={22} />
          <Arrow from={[1440, 600]} to={[1440, 660]} delay={t.volume - 0.2} />
        </svg>

        <Box x={240} y={300} w={1440} h={660} accent ghost delay={t.cluster} style={{ justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Logo height={34} />
            <div className="box-title" style={{ color: 'var(--aurora)', fontSize: 32 }}>
              Civo Kubernetes, JKT1 (Jakarta)
            </div>
          </div>
          <div className="box-sub">k3s, two g4s.kube.large nodes</div>
        </Box>

        <Box x={300} y={520} w={340} h={130} title="Load balancer" sub="Service type LoadBalancer, public IP" accent delay={t.lb} />
        <Box x={760} y={470} w={420} h={230} title="jakarta-votes" sub="Deployment, 2 pods to start, 500m CPU each" delay={t.app}>
          <Pods n={2} delay={t.app + 0.3} />
        </Box>
        <Box x={1260} y={470} w={360} h={130} title="Valkey" sub="StatefulSet, 1 replica" delay={t.valkey} />
        <Box x={1260} y={660} w={360} h={110} title="Civo volume" sub="PersistentVolumeClaim, block storage" delay={t.volume} />

        <motion.div
          style={{
            position: 'absolute',
            left: 300,
            top: 820,
            width: 900,
            height: 96,
            borderRadius: 48,
            border: '2px solid var(--line)',
            background: 'var(--panel)',
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '0 32px',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: t.argo }}
        >
          <ArgoLogo height={56} />
          <div style={{ fontSize: 26, color: 'var(--cloud)', lineHeight: 1.25 }}>
            <span style={{ color: 'var(--white)', fontWeight: 600 }}>Deployed by Argo CD</span> from gitops/app in the repo.
          </div>
        </motion.div>
      </div>
    </Slide>
  )
}
