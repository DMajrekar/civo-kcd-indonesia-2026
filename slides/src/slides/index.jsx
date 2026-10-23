import TitleSlide from './TitleSlide.jsx'
import Jkt1Slide from './Jkt1Slide.jsx'
import FreeDaySlide from './FreeDaySlide.jsx'
import AppArchitectureSlide from './AppArchitectureSlide.jsx'
import AutoscalerNeedsSlide from './AutoscalerNeedsSlide.jsx'
import WhyAutoscaleSlide from './WhyAutoscaleSlide.jsx'
import TerraformSlide from './TerraformSlide.jsx'
import ArgoTerraformSlide from './ArgoTerraformSlide.jsx'
import GitOpsRepoSlide from './GitOpsRepoSlide.jsx'
import WhyGitOpsSlide from './WhyGitOpsSlide.jsx'
import AutoscalersSlide from './AutoscalersSlide.jsx'
import RecapSlide from './RecapSlide.jsx'
import ThanksSlide from './ThanksSlide.jsx'
import StepSlide from './StepSlide.jsx'
import { CreateCluster, Connect, ArgoCd, TheApp, Drift, Release } from './illustrations.jsx'

// Key points come from the Makefile stepN targets and the run.sh "say" lines.
const Step1 = () => (
  <StepSlide
    n={1}
    title="Create a cluster in Jakarta"
    size={36}
    points={[
      'Terraform: infrastructure as code. You declare the resources in HCL; the civo provider turns that into API calls',
      'A network, a firewall, a k3s cluster with metrics-server, and Argo CD as a Helm release',
      'plan shows the diff, on stage; apply makes it real, running in the background while we talk',
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
    size={36}
    points={[
      'Argo CD is already running: Terraform installed it as a Helm release, right after the cluster',
      'The one kubectl apply of the day: a root Application pointing at the repo. App-of-apps: gitops/root holds the rest',
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
    title="GitOps in practice: drift"
    points={[
      'Someone fixes production with kubectl',
      'Argo CD sees live state that does not match git',
      'selfHeal puts it back; nobody had to notice',
    ]}
    illustration={<Drift />}
  />
)

const Step6 = () => (
  <StepSlide
    n={6}
    title="Ship a release"
    points={[
      'A release is a diff: bump the image, commit, push',
      'Argo CD picks up the commit and rolls it out',
      'v1.0.0 to v1.1.0 with zero downtime; the votes survive',
    ]}
    illustration={<Release />}
  />
)

export const slides = [
  TitleSlide,
  Jkt1Slide,
  FreeDaySlide,
  AppArchitectureSlide,
  WhyGitOpsSlide,
  Step1,
  TerraformSlide,
  Step2,
  Step3,
  GitOpsRepoSlide,
  ArgoTerraformSlide,
  Step4,
  Step5,
  Step6,
  WhyAutoscaleSlide,
  AutoscalerNeedsSlide,
  AutoscalersSlide,
  RecapSlide,
  ThanksSlide,
]
