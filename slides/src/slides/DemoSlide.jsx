import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Slide, Eyebrow, ease } from '../ui.jsx'

// A recorded terminal session for one demo step. The GIF is built to play
// once (agg --no-loop) and hold its last frame. Each visit to the slide
// fetches the file (from the browser cache after the first time) and hands
// the <img> a fresh object URL, so the animation restarts from frame one.
const cache = new Map()
async function load(url) {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => r.blob()))
  return cache.get(url)
}
export function prefetchDemos(urls) {
  urls.forEach((u) => load(u).catch(() => {}))
}

export default function DemoSlide({ n, title, gif }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let obj
    load(gif).then((blob) => { obj = URL.createObjectURL(blob); setSrc(obj) }).catch(() => setSrc(gif))
    return () => { if (obj) URL.revokeObjectURL(obj) }
  }, [gif])
  return (
    <Slide style={{ padding: '72px 120px 110px' }}>
      <Eyebrow>
        Step {n} <span className="muted">· {title}</span>
      </Eyebrow>
      <motion.div
        style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.1 }}
      >
        {src && (
          <img
            src={src}
            alt={`Terminal recording of step ${n}`}
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 18, border: '2px solid var(--line)', display: 'block' }}
          />
        )}
      </motion.div>
    </Slide>
  )
}
