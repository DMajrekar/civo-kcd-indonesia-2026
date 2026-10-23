import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, Bullets, ArgoLogo, fadeUp } from '../ui.jsx'

export default function WhyGitOpsSlide() {
  return (
    <Slide>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Eyebrow>Why GitOps</Eyebrow>
          <Title small>The four GitOps principles</Title>
        </div>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 70, color: 'var(--dim)', fontSize: 24 }}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.6}
        >
          <ArgoLogo height={56} />
          <span>Argo CD is how we do it today</span>
        </motion.div>
      </div>
      <div style={{ marginTop: 50, maxWidth: 1640 }}>
        <Bullets
          size={40}
          gap={0.3}
          start={0.5}
          style={{ gap: 36 }}
          items={[
            { text: 'Declarative', sub: 'The desired state of the system must be expressed in a declarative format (describing what you want, not how to build it).' },
            { text: 'Versioned and Immutable', sub: 'The desired state is stored in a way that enforces version control and keeps a complete history of changes.' },
            { text: 'Pulled Automatically', sub: 'Software agents automatically pull the approved state from the repository.' },
            { text: 'Continuously Reconciled', sub: 'Software agents constantly observe the actual system state and automatically fix any "drift" from the desired Git state.' },
          ]}
        />
      </div>
      <motion.div className="muted" style={{ position: 'absolute', right: 120, bottom: 100, fontSize: 22 }} variants={fadeUp} initial="hidden" animate="show" custom={2.2}>
        OpenGitOps, opengitops.dev
      </motion.div>
    </Slide>
  )
}
