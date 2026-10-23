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
          <Arrow from={[400, 390]} to={[640, 390]} label="civo kubernetes create" delay={t.cluster} labelOffset={[0, -18]} />
          <Arrow from={[400, 700]} to={[700, 700]} label="pull" delay={t.git + 0.4} />
          <Arrow from={[850, 640]} to={[1070, 480]} label="apply" delay={t.app} labelOffset={[-50, -10]} />
          <Arrow from={[1080, 560]} to={[400, 545]} label="public IP" delay={t.lb + 0.4} color="var(--cloud)" dashed labelOffset={[0, -14]} />
        </svg>

        {/* Left column: the outside world */}
        <Box x={120} y={330} w={280} h={120} title="Your laptop" sub="civo CLI, kubectl, git" delay={t.laptop} />
        <Box x={120} y={485} w={280} h={120} title="The room" sub="phones, one QR code" delay={t.lb + 0.6} />
        <Box x={120} y={640} w={280} h={120} title="GitHub repo" sub="gitops/ is the source of truth" delay={t.git} />

        {/* The cluster */}
        <Box x={640} y={300} w={1160} h={660} accent ghost delay={t.cluster} style={{ justifyContent: 'flex-start', borderWidth: 2 }}>
          <div className="box-title" style={{ color: 'var(--aurora)', fontSize: 32 }}>
            Civo Kubernetes, JKT1 (Jakarta)
          </div>
          <div className="box-sub">k3s, two g4s.kube.medium nodes to start</div>
        </Box>

        <Box x={700} y={640} w={300} h={120} title="Argo CD" sub="one root Application, app-of-apps" delay={t.git + 0.7} />

        <Box x={1080} y={430} w={320} h={150} title="jakarta-votes" sub="Deployment" delay={t.app + 0.3}>
          <Pods n={2} delay={t.app + 0.5} />
        </Box>
        <Box x={1450} y={430} w={310} h={150} title="Valkey" sub="StatefulSet" delay={t.app + 0.5} />
        <Box x={1450} y={600} w={310} h={90} title="Civo volume" sub="PersistentVolumeClaim" delay={t.app + 0.7} />

        <Box x={1080} y={600} w={320} h={90} title="Civo load balancer" sub="Service type LoadBalancer" delay={t.lb} />

        <Box x={1080} y={345} w={680} h={70} dashed delay={t.scale} style={{ flexDirection: 'row', alignItems: 'center', gap: 20, padding: '0 24px' }}>
          <span className="box-title" style={{ fontSize: 26 }}>HPA</span>
          <span className="box-sub" style={{ fontSize: 24 }}>CPU above 50%: more pods, up to 20</span>
        </Box>

        {/* Nodes */}
        <motion.div
          style={{ position: 'absolute', left: 700, top: 790, fontSize: 24, color: 'var(--dim)' }}
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
            y={830}
            w={190}
            h={100}
            dashed={i >= 2}
            ghost={i >= 2}
            delay={i < 2 ? t.cluster + 0.4 + i * 0.15 : t.scale + 0.3 + (i - 2) * 0.15}
            title={`node ${i + 1}`}
            sub={i < 2 ? 'g4s.kube.medium' : 'added by autoscaler'}
            titleStyle={{ fontSize: 26 }}
          />
        ))}
        <motion.div
          style={{ position: 'absolute', left: 1130, top: 790, fontSize: 24, color: 'var(--cloud)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: t.scale + 0.5 }}
        >
          Cluster autoscaler (Civo cloud provider): Pending pods, then a new node, up to 5
        </motion.div>
      </div>
    </Slide>
  )
}
