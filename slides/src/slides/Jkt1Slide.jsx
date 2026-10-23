import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, Bullets, fadeUp, ease } from '../ui.jsx'

// Civo regions placed by longitude on a single strip. Honest and simple.
const regions = [
  { id: 'nyc1', city: 'New York', lon: -74.0 },
  { id: 'lon1', city: 'London', lon: -0.1, above: true },
  { id: 'fra1', city: 'Frankfurt', lon: 8.7 },
  { id: 'mum1', city: 'Mumbai', lon: 72.9 },
  { id: 'jkt1', city: 'Jakarta', lon: 106.8, isNew: true },
]

const minLon = -100
const maxLon = 130
const stripW = 1600
const xFor = (lon) => ((lon - minLon) / (maxLon - minLon)) * stripW

export default function Jkt1Slide() {
  return (
    <Slide>
      <Eyebrow>Yesterday, 23 October 2026</Eyebrow>
      <Title small>
        Civo's Indonesia region, <span className="accent">JKT1</span>, is live
      </Title>

      <div style={{ position: 'relative', height: 300, margin: '70px 40px 40px' }}>
        <motion.div
          style={{ position: 'absolute', left: 0, right: 0, top: 150, height: 2, background: 'var(--line)', transformOrigin: 'left' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.4 }}
        />
        {regions.map((r, i) => {
          const x = xFor(r.lon)
          const delay = 0.7 + i * 0.25
          return (
            <div key={r.id} style={{ position: 'absolute', left: x, top: 0, width: 0 }}>
              <motion.div
                style={{
                  position: 'absolute',
                  left: -14,
                  top: 136,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: r.isNew ? 'var(--aurora)' : 'var(--cloud)',
                  boxShadow: r.isNew ? '0 0 40px rgba(0,255,111,0.7)' : 'none',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease, delay }}
              />
              {r.isNew && (
                <motion.div
                  style={{ position: 'absolute', left: -14, top: 136, width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--aurora)' }}
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: [1, 3.2], opacity: [0.9, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: delay + 0.3 }}
                />
              )}
              <motion.div
                style={{
                  position: 'absolute',
                  left: -120,
                  width: 240,
                  textAlign: 'center',
                  top: r.isNew || r.above ? 40 : 190,
                  color: r.isNew ? 'var(--aurora)' : 'var(--cloud)',
                }}
                initial={{ opacity: 0, y: r.isNew || r.above ? -10 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: delay + 0.15 }}
              >
                <div style={{ fontFamily: 'var(--mono)', fontSize: r.isNew ? 40 : 30, fontWeight: r.isNew ? 700 : 400 }}>{r.id}</div>
                <div style={{ fontSize: 24, color: 'var(--dim)' }}>{r.city}</div>
              </motion.div>
            </div>
          )
        })}
      </div>

      <Bullets
        start={2.1}
        size={38}
        items={[
          'Launched with PT Arupa Cloud Nusantara; operated by Arupa, data stays in Indonesia',
          'Same platform, same tooling, same prices as every other Civo region',
        ]}
      />

      <motion.div
        className="muted"
        style={{ marginTop: 44, fontSize: 24 }}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={2.8}
      >
        Civo is Platinum Sponsor of KCD Indonesia 2026
      </motion.div>
    </Slide>
  )
}
