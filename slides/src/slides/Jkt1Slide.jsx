import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, Bullets, fadeUp, ease } from '../ui.jsx'
import globe from '../assets/globe.gif'

// Slide 2: the launch. A looping radar-globe GIF on the right (bundled, same
// origin, no runtime fetch), the three facts on the left.
export default function Jkt1Slide() {
  return (
    <Slide>
      <Eyebrow>Yesterday, 23 October 2026</Eyebrow>
      <Title small>
        Civo's Indonesia region, <span className="accent">JKT1</span>, is live
      </Title>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 920px', gap: 60, alignItems: 'center', marginTop: 40 }}>
        <div>
          <Bullets
            start={0.6}
            size={38}
            items={[
              'Jakarta, launched with PT Arupa Cloud Nusantara, who operate the region',
              'Same platform and tooling as every other Civo region',
              'Data stays in Indonesia',
            ]}
          />
          <motion.div
            className="muted"
            style={{ marginTop: 44, fontSize: 24 }}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1.8}
          >
            Civo is Platinum Sponsor of KCD Indonesia 2026
          </motion.div>
        </div>

        <motion.div
          style={{ position: 'relative', width: 920, height: 518, borderRadius: 20, overflow: 'hidden', background: '#000' }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
        >
          <img
            src={globe}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              left: 36,
              bottom: 28,
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              textShadow: '0 0 24px rgba(0,0,0,0.9)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 1.2 }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: 44, fontWeight: 700, color: 'var(--aurora)' }}>jkt1</span>
            <span style={{ fontSize: 26, color: 'var(--cloud)' }}>Jakarta · fra1 · lon1 · mum1 · nyc1</span>
          </motion.div>
        </motion.div>
      </div>
    </Slide>
  )
}
