import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, Bullets, ease } from '../ui.jsx'

// Why autoscale: traffic is spiky, fixed capacity is either idle or on fire.
// Left: the argument. Right: an animated chart, drawn in this order:
// traffic curve -> fixed capacity line -> stepped autoscaled capacity.
const W = 820
const H = 430
const PAD = { l: 70, r: 30, t: 30, b: 60 }
const x = (t) => PAD.l + (t / 100) * (W - PAD.l - PAD.r)
const y = (v) => H - PAD.b - (v / 100) * (H - PAD.t - PAD.b)

// Traffic over the session: quiet, QR code goes up, a spike, then it fades.
const traffic = [
  [0, 8], [12, 10], [22, 14], [30, 30], [36, 62], [42, 88], [48, 80], [54, 90],
  [60, 70], [68, 44], [76, 26], [86, 14], [100, 9],
]
const trafficPath = traffic.map(([t, v], i) => `${i ? 'L' : 'M'} ${x(t)} ${y(v)}`).join(' ')
const trafficArea = `${trafficPath} L ${x(100)} ${y(0)} L ${x(0)} ${y(0)} Z`

// Capacity that follows demand in steps: pods first, then a node.
const steps = [[0, 24], [30, 24], [30, 48], [38, 48], [38, 72], [44, 72], [44, 100], [62, 100], [62, 72], [72, 72], [72, 48], [82, 48], [82, 24], [100, 24]]
const stepPath = steps.map(([t, v], i) => `${i ? 'L' : 'M'} ${x(t)} ${y(v)}`).join(' ')

const FIXED = 40

export default function WhyAutoscaleSlide() {
  return (
    <Slide>
      <Eyebrow>Autoscaling</Eyebrow>
      <Title small>Why autoscale at all?</Title>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 860px', gap: 60, alignItems: 'center', marginTop: 20 }}>
        <Bullets
          start={0.5}
          size={36}
          items={[
            { text: 'Traffic is not flat', sub: 'A room scanning a QR code is a spike: nothing, then everyone at once, then nothing.' },
            { text: 'Fixed capacity is always wrong', sub: 'Size for the peak and pay for idle nodes all day. Size for the average and fall over at the peak.' },
            { text: 'Two levers', sub: 'Pods scale inside the capacity you have. Nodes scale the capacity itself.' },
            { text: 'Pay by the hour for what is running', sub: 'Up when it is needed, back down when it is quiet.' },
          ]}
        />

        <motion.div className="panel" style={{ padding: 20 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.3 }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {/* axes */}
            <line x1={x(0)} y1={y(0)} x2={x(100)} y2={y(0)} stroke="var(--line)" strokeWidth={2} />
            <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(100)} stroke="var(--line)" strokeWidth={2} />
            <text x={x(50)} y={H - 18} textAnchor="middle" fill="var(--dim)" fontSize={22}>the 30 minutes</text>
            <text x={22} y={y(50)} textAnchor="middle" fill="var(--dim)" fontSize={22} transform={`rotate(-90 22 ${y(50)})`}>load</text>

            {/* traffic */}
            <motion.path d={trafficArea} fill="var(--aurora)" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 0.8, delay: 1.4 }} />
            <motion.path d={trafficPath} fill="none" stroke="var(--aurora)" strokeWidth={5} strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease, delay: 0.6 }} />

            {/* fixed capacity */}
            <motion.line x1={x(0)} y1={y(FIXED)} x2={x(100)} y2={y(FIXED)} stroke="#FF7633" strokeWidth={4} strokeDasharray="14 10"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.0, ease, delay: 2.4 }} />

            {/* autoscaled capacity */}
            <motion.path d={stepPath} fill="none" stroke="var(--white)" strokeWidth={4} strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease, delay: 4.0 }} />
          </svg>
          <div style={{ display: 'flex', gap: 36, justifyContent: 'center', marginTop: 6, fontSize: 22, color: 'var(--cloud)' }}>
            {[
              ['traffic', 'var(--aurora)', 'solid', 2.0],
              ['fixed capacity: idle, then on fire', '#FF7633', 'dashed', 3.2],
              ['autoscaled: pods, then a node, then back down', 'var(--white)', 'solid', 5.4],
            ].map(([label, color, style, delay]) => (
              <motion.div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
                <span style={{ width: 34, borderTop: `4px ${style} ${color}` }} />
                <span>{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Slide>
  )
}
