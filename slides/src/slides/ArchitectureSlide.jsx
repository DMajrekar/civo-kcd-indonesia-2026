import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, Box, Arrow, ArrowDefs, ease } from '../ui.jsx'

// Canvas coordinates are stage pixels (1920x1080). The diagram builds itself
// up in the order the demo does: cluster, git, app, load balancer, scaling.
const t = {
  laptop: 0.3,
  cluster: 0.9,
  git: 2.0,
  app: 3.1,
  lb: 4.2,
  scale: 5.3,
}

function Pods({ n, delay, pending = false }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
      {Array.from({ length: n }).map((_, i) => (
        <motion.div
          key={i}
          className={`pod ${pending ? 'pending' : ''}`}
          style={{ width: 30, height: 30, borderRadius: 7 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, ease, delay: delay + i * 0.08 }}
        />
      ))}
    </div>
  )
}

export default function ArchitectureSlide() {
  return (
    <Slide>
      <Eyebrow>The next 30 minutes</Eyebrow>
      <Title small>What we are going to build</Title>

      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <ArrowDefs />
          <Arrow from={[360, 390]} to={[640, 390]} label="civo kubernetes create" delay={t.cluster} labelOffset={[0, -14]} labelSize={20} />
          <Arrow from={[360, 545]} to={[700, 545]} label="pull" delay={t.git + 0.4} />
          <Arrow from={[1000, 545]} to={[1080, 560]} label="apply" delay={t.app} labelOffset={[8, -22]} labelSize={22} />
          <Arrow from={[1080, 722]} to={[360, 700]} label="public IP" delay={t.lb + 0.4} color="var(--cloud)" dashed labelOffset={[0, -16]} />
        </svg>

        {/* Left column: the outside world */}
        <Box x={120} y={330} w={240} h={120} title="Laptop" sub="civo CLI, kubectl, git" subStyle={{ fontSize: 20 }} delay={t.laptop} />
        <Box x={120} y={485} w={240} h={120} title="GitHub" sub="the repo, gitops/" subStyle={{ fontSize: 20 }} delay={t.git} />
        <Box x={120} y={640} w={240} h={120} title="The room" sub="phones, one QR code" subStyle={{ fontSize: 20 }} delay={t.lb + 0.6} />

        {/* The cluster */}
        <Box x={640} y={300} w={1160} h={660} accent ghost delay={t.cluster} style={{ justifyContent: 'flex-start', borderWidth: 2 }}>
          <div className="box-title" style={{ color: 'var(--aurora)', fontSize: 32 }}>
            Civo Kubernetes, JKT1 (Jakarta)
          </div>
          <div className="box-sub">k3s, two g4s.kube.medium nodes to start</div>
        </Box>

        <Box x={700} y={485} w={300} h={120} title="Argo CD" sub="one root Application, app-of-apps" delay={t.git + 0.7} />

        <Box x={1080} y={420} w={680} h={64} dashed delay={t.scale} style={{ flexDirection: 'row', alignItems: 'center', gap: 20, padding: '0 24px' }}>
          <span className="box-title" style={{ fontSize: 26 }}>HPA</span>
          <span className="box-sub" style={{ fontSize: 24 }}>CPU above 50%: more pods, up to 20</span>
        </Box>

        <Box x={1080} y={505} w={340} h={150} title="jakarta-votes" sub="Deployment" delay={t.app + 0.3}>
          <Pods n={2} delay={t.app + 0.5} />
        </Box>
        <Box x={1440} y={505} w={320} h={150} title="Valkey" sub="StatefulSet" delay={t.app + 0.5} />
        <Box x={1080} y={675} w={340} h={95} title="Load balancer" sub="Service type LoadBalancer" subStyle={{ fontSize: 21, whiteSpace: 'nowrap' }} delay={t.lb} />
        <Box x={1440} y={675} w={320} h={95} title="Civo volume" sub="PersistentVolumeClaim" delay={t.app + 0.7} />

        {/* Nodes */}
        <motion.div
          style={{ position: 'absolute', left: 700, top: 800, fontSize: 24, color: 'var(--dim)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: t.cluster + 0.3 }}
        >
          Nodes
        </motion.div>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            x={700 + i * 212}
            y={840}
            w={200}
            h={100}
            dashed={i >= 2}
            ghost={i >= 2}
            delay={i < 2 ? t.cluster + 0.4 + i * 0.15 : t.scale + 0.3 + (i - 2) * 0.15}
            title={`node ${i + 1}`}
            sub={i < 2 ? 'g4s.kube.medium' : 'autoscaler'}
            titleStyle={{ fontSize: 26 }}
            subStyle={{ fontSize: 20, whiteSpace: 'nowrap' }}
            style={{ padding: '14px 14px' }}
          />
        ))}
        <motion.div
          style={{ position: 'absolute', left: 1124, top: 780, fontSize: 22, lineHeight: 1.2, color: 'var(--cloud)', whiteSpace: 'nowrap' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: t.scale + 0.5 }}
        >
          Cluster autoscaler (Civo cloud provider)
          <br />
          <span className="muted">Pending pods, then a new node, up to 5</span>
        </motion.div>
      </div>
    </Slide>
  )
}
