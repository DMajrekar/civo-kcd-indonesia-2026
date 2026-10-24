import TitleSlide from './TitleSlide.jsx'
import Jkt1Slide from './Jkt1Slide.jsx'
import FreeDaySlide from './FreeDaySlide.jsx'
import AppArchitectureSlide from './AppArchitectureSlide.jsx'
import AutoscalerNeedsSlide from './AutoscalerNeedsSlide.jsx'
import WhyAutoscaleSlide from './WhyAutoscaleSlide.jsx'
import TerraformSlide from './TerraformSlide.jsx'
import ArgoTerraformSlide from './ArgoTerraformSlide.jsx'
import GitOpsRepoSlide from './GitOpsRepoSlide.jsx'
import DemoSlide, { prefetchDemos } from './DemoSlide.jsx'
import demo1 from '../assets/demo-step1.gif'
import demo2 from '../assets/demo-step2.gif'
import demo3 from '../assets/demo-step3.gif'
import demo4 from '../assets/demo-step4.gif'
import demo5 from '../assets/demo-step5.gif'
import demo6 from '../assets/demo-step6.gif'
import demo7 from '../assets/demo-step7.gif'
prefetchDemos([demo1, demo2, demo3, demo4, demo5, demo6, demo7])
const Demo1 = () => <DemoSlide n={1} title="A cluster in Jakarta" gif={demo1} />
const Demo2 = () => <DemoSlide n={2} title="Connect" gif={demo2} />
const Demo3 = () => <DemoSlide n={3} title="Argo CD and the root Application" gif={demo3} />
const Demo4 = () => <DemoSlide n={4} title="The application" gif={demo4} />
const Demo5 = () => <DemoSlide n={5} title="Drift, reverted" gif={demo5} />
const Demo6 = () => <DemoSlide n={6} title="Ship a release" gif={demo6} />
const Demo7 = () => <DemoSlide n={7} title="Autoscaling" gif={demo7} />
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
      'v2.0 to v2.1 with zero downtime; the votes survive',
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
  Demo1,
  Step2,
  Demo2,
  Step3,
  Demo3,
  GitOpsRepoSlide,
  ArgoTerraformSlide,
  Step4,
  Demo4,
  Step5,
  Demo5,
  Step6,
  Demo6,
  WhyAutoscaleSlide,
  AutoscalerNeedsSlide,
  AutoscalersSlide,
  Demo7,
  RecapSlide,
  ThanksSlide,
]
