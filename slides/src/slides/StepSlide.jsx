import { Slide, Eyebrow, Title, Bullets } from '../ui.jsx'

// Shared layout for the seven demo steps: shown between terminal segments,
// so each one has to be readable in a glance.
export default function StepSlide({ n, title, points, illustration, wideRight = false, size = 40 }) {
  return (
    <Slide>
      <Eyebrow>Step {n} of 7</Eyebrow>
      <Title small>{title}</Title>
      <div className={`two-col ${wideRight ? 'wide-right' : ''}`} style={{ marginTop: 40 }}>
        <div className="col">
          <Bullets items={points} size={size} />
        </div>
        <div className="col" style={{ position: 'relative', height: 600 }}>
          {illustration}
        </div>
      </div>
    </Slide>
  )
}
