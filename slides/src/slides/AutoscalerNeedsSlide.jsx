import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, ease } from '../ui.jsx'
import { FlowStrip } from './illustrations.jsx'

function Column({ title, unit, rows, delay, x }) {
  return (
    <motion.div
      className="panel"
      style={{ position: 'absolute', left: x, top: 300, width: 800, padding: '32px 40px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div style={{ fontSize: 36, fontWeight: 600 }}>{title}</div>
        <div className="accent" style={{ fontFamily: 'var(--mono)', fontSize: 24 }}>{unit}</div>
      </div>
      {rows.map(([k, v], i) => (
        <motion.div
          key={k}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 24, padding: '16px 0', borderTop: '1px solid var(--line)', fontSize: 28 }}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease, delay: delay + 0.3 + i * 0.18 }}
        >
          <span className="muted">{k}</span>
          <span style={{ color: 'var(--white)', textAlign: 'right' }}>{v}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function AutoscalerNeedsSlide() {
  return (
    <Slide>
      <Eyebrow>Autoscaling</Eyebrow>
      <Title small>What the autoscalers need</Title>

      <div style={{ position: 'absolute', inset: 0 }}>
        <Column
          x={120}
          title="HorizontalPodAutoscaler"
          unit="more pods"
          delay={0.4}
          rows={[
            ['Metrics', 'metrics-server'],
            ['CPU request per pod', '500m'],
            ['Target', '50% average CPU'],
            ['Replicas', 'min 2, max 20'],
          ]}
        />
        <Column
          x={1000}
          title="Cluster autoscaler"
          unit="more nodes"
          delay={0.8}
          rows={[
            ['Cloud provider', 'Civo'],
            ['Credentials', 'Secret civo-api-access, pre-installed by Civo'],
            ['Nodes', 'min 2, max 5'],
            ['Trigger', 'Unschedulable (Pending) pods'],
          ]}
        />

        <motion.div
          className="muted"
          style={{ position: 'absolute', left: 120, top: 790, fontSize: 24 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
        >
          How step 6 will play out
        </motion.div>
        <FlowStrip steps={['load', 'pods x2', 'x4', 'x8', 'Pending', '+ node']} start={2.6} fontSize={28} style={{ position: 'absolute', left: 120, top: 840 }} />
      </div>
    </Slide>
  )
}
