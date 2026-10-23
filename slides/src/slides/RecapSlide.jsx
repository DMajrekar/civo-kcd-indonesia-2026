import { Slide, Eyebrow, Title, Bullets } from '../ui.jsx'

export default function RecapSlide() {
  return (
    <Slide>
      <Eyebrow>Take this home</Eyebrow>
      <Title>What to take away</Title>
      <div style={{ marginTop: 60, maxWidth: 1600 }}>
        <Bullets
          size={42}
          gap={0.22}
          items={[
            { text: 'Cluster and Argo CD are one terraform apply; everything after is a git commit', sub: 'in any Civo region, now including Jakarta' },
            { text: 'One kubectl apply, ever: the root Application', sub: 'everything else arrives from git through Argo CD' },
            { text: 'A release is a commit; drift is reverted', sub: 'selfHeal and prune make the repo the truth' },
            { text: 'Two autoscalers: pods first, then nodes', sub: 'HPA on CPU, cluster autoscaler with the Civo cloud provider' },
            { text: 'No secrets in git, none typed by hand', sub: 'the autoscaler reuses the API Secret Civo installs; the whole demo is a public repo you can run' },
          ]}
        />
      </div>
    </Slide>
  )
}
