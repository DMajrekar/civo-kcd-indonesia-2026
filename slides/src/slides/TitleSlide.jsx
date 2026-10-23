import { motion } from 'framer-motion'
import { Slide, Logo, fadeUp, ease } from '../ui.jsx'
import dinesh from '../assets/dinesh.png'

export default function TitleSlide() {
  return (
    <Slide style={{ justifyContent: 'space-between' }}>
      {/* Soft aurora glow, pure CSS, no assets. */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          right: -300,
          top: -200,
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,255,111,0.22), rgba(0,255,111,0.06) 55%, transparent 72%)',
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease }}
      />
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <Logo height={64} />
      </motion.div>

      <div style={{ maxWidth: 1500 }}>
        <motion.h1
          className="title"
          style={{ fontSize: 112, marginBottom: 40 }}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.2}
        >
          Kubernetes on Civo:
          <br />
          <span className="accent">from zero to autoscaling</span>
          <br />
          in 30 minutes
        </motion.h1>
        <motion.p className="subtitle" variants={fadeUp} initial="hidden" animate="show" custom={0.55}>
          A live build: a cluster in Jakarta, GitOps with Argo CD, and two autoscalers.
        </motion.p>
      </div>

      <motion.div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 34, color: 'var(--cloud)' }}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.8}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img
            src={dinesh}
            alt="Dinesh Majrekar"
            width={80}
            height={80}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--aurora)', display: 'block' }}
          />
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>Dinesh Majrekar</div>
            <div className="muted">Civo</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--white)' }}>KCD Indonesia 2026</div>
          <div className="muted">Bandung, 24 October 2026</div>
        </div>
      </motion.div>
    </Slide>
  )
}
