import TitleSlide from './TitleSlide.jsx'
import Jkt1Slide from './Jkt1Slide.jsx'
import ArchitectureSlide from './ArchitectureSlide.jsx'
import WhyGitOpsSlide from './WhyGitOpsSlide.jsx'
import AutoscalersSlide from './AutoscalersSlide.jsx'
import RecapSlide from './RecapSlide.jsx'
import ThanksSlide from './ThanksSlide.jsx'
import StepSlide from './StepSlide.jsx'
import { CreateCluster, Connect, ArgoCd, TheApp, GitOpsInPractice, Autoscaling, WhatWeBuilt } from './illustrations.jsx'

// Key points come from the Makefile stepN targets and the run.sh "say" lines.
const Step1 = () => (
  <StepSlide
    n={1}
    title="Create a cluster in Jakarta"
    points={[
      'Terraform: a firewall and a k3s cluster, two nodes, metrics-server from the marketplace',
      'terraform plan on stage, apply runs in the background while we talk',
      <>
        <code>{'lifecycle { ignore_changes = [pools[0].node_count] }'}</code>: the autoscaler owns the node count
      </>,
    ]}
    illustration={<CreateCluster />}
  />
)

const Step2 = () => (
  <StepSlide
    n={2}
    title="Connect"
    points={[
      'The kubeconfig is one command; from here on it is only kubectl',
      'metrics-server came from the Civo marketplace (the HPA needs it)',
      'Two nodes Ready, kubectl top works',
    ]}
    illustration={<Connect />}
  />
)

const Step3 = () => (
  <StepSlide
    n={3}
    title="Argo CD: git as the source of truth"
    points={[
      'Nothing is kubectl-applied by hand except one root Application',
      'App-of-apps: gitops/root holds the other Applications',
      'No secrets in git, none typed by hand: the autoscaler reuses the API Secret Civo installs for its own cloud controller',
    ]}
    illustration={<ArgoCd />}
  />
)

const Step4 = () => (
  <StepSlide
    n={4}
    title="The application"
    points={[
      'Scan the QR code: vote on what I should do on my free day in Jakarta',
      'Valkey StatefulSet on a Civo volume (a real PVC)',
      'Service type LoadBalancer gives a public IP on Civo, no extras',
    ]}
    illustration={<TheApp />}
  />
)

const Step5 = () => (
  <StepSlide
    n={5}
    title="GitOps in practice"
    points={[
      'kubectl edit in prod? Argo CD self-heals it back to git',
      'A release is a diff: bump the image, commit, push, rolled out',
      'v1.0.0 to v1.1.0 with zero downtime; the votes survive',
    ]}
    illustration={<GitOpsInPractice />}
  />
)

const Step6 = () => (
  <StepSlide
    n={6}
    title="Autoscaling"
    points={[
      'HPA: CPU above 50% means more pods, up to 20',
      'Pods go Pending when two nodes are full',
      'Cluster autoscaler, with the Civo cloud provider, adds nodes, up to 5',
    ]}
    illustration={<Autoscaling />}
  />
)

const Step7 = () => (
  <StepSlide
    n={7}
    title="What we built, and what it costs"
    points={[
      'Under thirty minutes, in a region that is one day old',
      'Billed per hour; delete it after and pay nothing',
      'Everything you saw is in the repo',
    ]}
    illustration={<WhatWeBuilt />}
  />
)

export const slides = [
  TitleSlide,
  Jkt1Slide,
  ArchitectureSlide,
  WhyGitOpsSlide,
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  AutoscalersSlide,
  Step6,
  Step7,
  RecapSlide,
  ThanksSlide,
]
