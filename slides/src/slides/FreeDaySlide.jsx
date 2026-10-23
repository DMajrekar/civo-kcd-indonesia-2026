import { motion } from 'framer-motion'
import { Slide, Eyebrow, Title, Bullets, fadeUp, ease } from '../ui.jsx'
import phone from '../assets/votes-phone.png'

// Slide 3: the problem we are solving today. Phone screenshot of the voting
// app on the right (bundled image), the ask on the left.
export default function FreeDaySlide() {
  return (
    <Slide>
      <Eyebrow>Tomorrow</Eyebrow>
      <Title small>
        I have a free day in Jakarta. <span className="accent">What should I do?</span>
      </Title>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 80, alignItems: 'start', marginTop: 10 }}>
        <div>
          <Bullets
            start={0.6}
            size={38}
            items={[
              'You decide. Scan the QR code when it comes up, vote, add your own ideas',
              'The app we build in the next 30 minutes is the one that counts the votes',
              'It runs on the cluster we create live, in Jakarta',
            ]}
          />
          <motion.div className="muted" style={{ marginTop: 44, fontSize: 24 }} variants={fadeUp} initial="hidden" animate="show" custom={1.6}>
            Votes live in Valkey on a Civo volume, served through a Civo load balancer.
          </motion.div>
        </div>

        <motion.div
          style={{
            width: 390,
            height: 640,
            borderRadius: 44,
            overflow: 'hidden',
            border: '10px solid #1a1a1a',
            boxShadow: '0 0 80px rgba(0,255,111,0.18)',
            background: '#000',
            justifySelf: 'center',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.5 }}
        >
          <img src={phone} alt="The voting app on a phone" style={{ width: '100%', display: 'block' }} />
        </motion.div>
      </div>
    </Slide>
  )
}
