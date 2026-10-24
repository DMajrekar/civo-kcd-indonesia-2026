import { Slide, Eyebrow, Title, Bullets } from '../ui.jsx'

export default function RecapSlide() {
  return (
    <Slide>
      <Eyebrow>Take this home</Eyebrow>
      <Title>What to take away</Title>
      <div style={{ marginTop: 90, maxWidth: 1600 }}>
        <Bullets
          size={46}
          gap={0.3}
          style={{ gap: 44 }}
          items={[
            { text: 'Cluster and Argo CD are one terraform apply; everything after is a git commit', sub: 'in any Civo region, now including Jakarta' },
            { text: 'A release is a commit; drift is reverted', sub: 'selfHeal and prune make the repo the truth' },
            { text: 'Two autoscalers: pods first, then nodes', sub: 'HPA on CPU, cluster autoscaler with the Civo cloud provider' },
          ]}
        />
      </div>
    </Slide>
  )
}
