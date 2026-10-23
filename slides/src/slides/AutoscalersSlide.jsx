import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Slide, Eyebrow, Title, ease } from '../ui.jsx'

// A looping animation: load arrives, HPA doubles pods, the nodes fill up,
// pods go Pending, the cluster autoscaler adds a node and they schedule.
const stages = [
  { key: 'load', label: 'load', pods: 2, nodes: 2 },
  { key: 'x2', label: 'pods x2', pods: 2, nodes: 2 },
  { key: 'x4', label: 'x4', pods: 4, nodes: 2 },
  { key: 'x8', label: 'x8', pods: 8, nodes: 2 },
  { key: 'pending', label: 'Pending', pods: 12, nodes: 2 },
  { key: 'node', label: '+ node', pods: 12, nodes: 3 },
]
const durations = [1500, 1500, 1500, 1700, 2200, 3200]

const NODE_W = 300
const NODE_H = 300
const NODE_GAP = 40
const POD = 56
const POD_GAP = 16
const PER_NODE = 8
const nodeX = (i) => i * (NODE_W + NODE_GAP)
const nodeY = 120


// Place pods 4 per node row-wise: indices 0-3 node 1, 4-7 node 2, 8-11 pending/node 3.
function place(i, stage) {
  if (i >= stage.pods) return null
  const n = Math.floor(i / 4)
  const slot = i % 4
  const col = slot % 2
  const row = Math.floor(slot / 2)
  if (n < stage.nodes) {
    return {
      x: nodeX(n) + 40 + col * (POD + POD_GAP) + (POD + POD_GAP) / 2,
      y: nodeY + 90 + row * (POD + POD_GAP),
      pending: false,
    }
  }
  // Pending: parked above the empty third node slot.
  return {
    x: nodeX(2) + 40 + col * (POD + POD_GAP) + (POD + POD_GAP) / 2,
    y: nodeY + 90 + row * (POD + POD_GAP),
    pending: true,
  }
}

export default function AutoscalersSlide() {
  const [s, setS] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setS((s + 1) % stages.length), durations[s])
    return () => clearTimeout(t)
  }, [s])
  const stage = stages[s]

  return (
    <Slide>
      <Eyebrow>Before step 6</Eyebrow>
      <Title>Two autoscalers</Title>
      <div className="two-col" style={{ marginTop: 20, gridTemplateColumns: '0.8fr 1.2fr' }}>
        <div className="col" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <Explain
            title="HorizontalPodAutoscaler"
            body="Watches CPU from metrics-server. Above 50% per pod, it adds replicas, up to 20."
            unit="more pods"
            active={s >= 1 && s <= 4}
            delay={0.4}
          />
          <Explain
            title="Cluster autoscaler"
            body="Watches for Pending pods. With the Civo cloud provider it asks Civo for a node, up to 5."
            unit="more nodes"
            active={s === 5}
            delay={0.7}
          />
        </div>

        <div className="col" style={{ position: 'relative', height: 600 }}>
          {/* Flow strip */}
          <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', gap: 14, alignItems: 'center' }}>
            {stages.map((st, i) => (
              <div key={st.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <motion.span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 26,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '2px solid',
                  }}
                  animate={{
                    borderColor: i === s ? (st.key === 'pending' ? 'var(--private)' : 'var(--aurora)') : 'rgba(209,204,190,0.22)',
                    color: i === s ? (st.key === 'pending' ? 'var(--private)' : 'var(--aurora)') : 'rgba(209,204,190,0.6)',
                    scale: i === s ? 1.06 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {st.label}
                </motion.span>
                {i < stages.length - 1 && <span className="muted" style={{ fontSize: 24 }}>&rarr;</span>}
              </div>
            ))}
          </div>

          {/* Load arrow */}
          <motion.div
            style={{ position: 'absolute', left: 0, top: 70, fontSize: 24, color: 'var(--cloud)', display: 'flex', gap: 10 }}
            animate={{ opacity: s >= 1 ? 1 : 0.35 }}
          >
            <motion.span animate={{ x: s >= 1 ? [0, 14, 0] : 0 }} transition={{ repeat: Infinity, duration: 0.8 }}>
              &rarr;
            </motion.span>
            traffic
          </motion.div>

          {/* Nodes */}
          {[0, 1, 2].map((i) => {
            const present = i < stage.nodes
            const pendingHere = i === 2 && stage.key === 'pending'
            return (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  left: nodeX(i),
                  top: nodeY,
                  width: NODE_W,
                  height: NODE_H,
                  borderRadius: 20,
                  border: '2px ' + (present ? 'solid' : 'dashed'),
                  padding: '18px 24px',
                }}
                initial={false}
                animate={{
                  opacity: present ? 1 : pendingHere ? 0.5 : 0.2,
                  borderColor: present ? (i === 2 ? 'var(--aurora)' : 'rgba(209,204,190,0.35)') : pendingHere ? 'var(--private)' : 'rgba(209,204,190,0.22)',
                  backgroundColor: present ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0)',
                }}
                transition={{ duration: 0.5 }}
              >
                <div style={{ fontSize: 26, fontWeight: 600, color: present ? 'var(--white)' : 'var(--dim)' }}>node {i + 1}</div>
                <div className="muted" style={{ fontSize: 20 }}>
                  {present ? 'g4s.kube.medium' : pendingHere ? 'no room: Pending' : 'added by autoscaler'}
                </div>
              </motion.div>
            )
          })}

          {/* Pods */}
          <AnimatePresence>
            {Array.from({ length: 12 }).map((_, i) => {
              const p = place(i, stage)
              if (!p) return null
              return (
                <motion.div
                  key={i}
                  className={`pod ${p.pending ? 'pending' : ''}`}
                  style={{ position: 'absolute', width: POD, height: POD, borderRadius: 12 }}
                  initial={{ opacity: 0, scale: 0, left: p.x, top: p.y }}
                  animate={{ opacity: p.pending ? [0.4, 1, 0.4] : 1, scale: 1, left: p.x, top: p.y }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.4, ease, opacity: p.pending ? { repeat: Infinity, duration: 1.2 } : { duration: 0.3 } }}
                />
              )
            })}
          </AnimatePresence>

          <motion.div
            className="muted"
            style={{ position: 'absolute', left: 0, top: 460, fontSize: 26, lineHeight: 1.4, width: 1000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Both are installed from git. Neither is told about the other: pods first, nodes follow. When the traffic stops, it all comes back down.
          </motion.div>
        </div>
      </div>
    </Slide>
  )
}

function Explain({ title, body, unit, active, delay }) {
  return (
    <motion.div
      className="panel"
      style={{ padding: '30px 36px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, borderColor: active ? 'var(--aurora)' : 'rgba(209,204,190,0.22)' }}
      transition={{ duration: 0.5, ease, delay }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <div style={{ fontSize: 34, fontWeight: 600 }}>{title}</div>
        <motion.div className="accent" style={{ fontSize: 24, fontFamily: 'var(--mono)' }} animate={{ opacity: active ? 1 : 0.35 }}>
          {unit}
        </motion.div>
      </div>
      <div className="muted" style={{ fontSize: 27, marginTop: 10, lineHeight: 1.35 }}>{body}</div>
    </motion.div>
  )
}
