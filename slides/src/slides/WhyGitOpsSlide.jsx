import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, Bullets, ease } from '../ui.jsx'

export default function WhyGitOpsSlide() {
  return (
    <Slide>
      <Eyebrow>Before the terminal</Eyebrow>
      <Title>Why GitOps</Title>
      <div className="two-col" style={{ marginTop: 40 }}>
        <div className="col">
          <Bullets
            items={[
              { text: 'Git is the source of truth', sub: 'the repo describes the whole cluster' },
              { text: 'The cluster converges', sub: 'Argo CD pulls and applies, you never push' },
              { text: 'Drift is corrected', sub: 'a hand edit in prod is reverted' },
              { text: 'A release is a diff', sub: 'review it, merge it, it rolls out' },
              { text: 'An audit trail for free', sub: 'git log is the change log' },
            ]}
            size={38}
            gap={0.22}
          />
        </div>
        <div className="col" style={{ position: 'relative', height: 560 }}>
          <Loop />
        </div>
      </div>
    </Slide>
  )
}

// Desired state and actual state, with Argo CD closing the loop.
function Loop() {
  const cx = 400
  const cy = 280
  const r = 190
  return (
    <>
      <svg width={800} height={560} style={{ position: 'absolute', inset: 0 }}>
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.4 }}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--aurora)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="90 1104"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      </svg>
      <Node x={cx - 150} y={cy - r - 70} title="git" sub="desired state" delay={0.8} />
      <Node x={cx - 150} y={cy + r - 70} title="cluster" sub="actual state" delay={1.1} />
      <motion.div
        style={{
          position: 'absolute',
          left: cx - 110,
          top: cy - 48,
          width: 220,
          height: 96,
          borderRadius: 48,
          background: 'var(--aurora)',
          color: 'var(--black)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 700,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease, delay: 1.5 }}
      >
        Argo CD
      </motion.div>
      <motion.div
        className="muted"
        style={{ position: 'absolute', left: cx + r + 30, top: cy - 30, fontSize: 26, lineHeight: 1.3 }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        observe
        <br />
        diff
        <br />
        apply
      </motion.div>
    </>
  )
}

function Node({ x, y, title, sub, delay }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 300,
        height: 140,
        borderRadius: 18,
        border: '2px solid var(--line)',
        background: 'var(--black)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease, delay }}
    >
      <div style={{ fontSize: 40, fontWeight: 600, fontFamily: 'var(--mono)' }}>{title}</div>
      <div className="muted" style={{ fontSize: 24 }}>{sub}</div>
    </motion.div>
  )
}
