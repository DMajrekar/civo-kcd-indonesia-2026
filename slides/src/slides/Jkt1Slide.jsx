import { motion } from 'framer-motion'
import { fadeUp, ease } from '../ui.jsx'
import globe from '../assets/globe.gif'

// Slide 2: the launch. The radar-globe GIF fills the stage (it is 480x270, so
// it is soft on purpose; it carries its own captions, so nothing is drawn over
// the globe itself). Title at the top, one tagline at the bottom, both on dark
// gradients so they stay readable.
export default function Jkt1Slide() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      <motion.img
        src={globe}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease }}
      />

      {/* Top: eyebrow + title on a gradient */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 380,
          padding: '96px 120px 0',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 100%)',
        }}
      >
        <motion.div className="eyebrow" variants={fadeUp} initial="hidden" animate="show" custom={0.3}>
          Yesterday, 23 October 2026
        </motion.div>
        <motion.h1 className="title small" variants={fadeUp} initial="hidden" animate="show" custom={0.45}>
          Civo's Indonesia region, <span className="accent">JKT1</span>, is live
        </motion.h1>
      </div>

      {/* Bottom: the tagline on a gradient, clear of the GIF's own caption */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 260,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 66,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)',
        }}
      >
        <motion.div
          style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--white)', textAlign: 'center', lineHeight: 1 }}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1.2}
        >
          Build open. Build portable. Build <span className="accent">sovereign</span>.
        </motion.div>
      </div>
    </div>
  )
}
