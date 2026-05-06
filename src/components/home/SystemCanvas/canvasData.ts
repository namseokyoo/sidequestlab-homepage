export type CanvasNodeType =
  | 'intake'
  | 'build'
  | 'qa'
  | 'deploy'
  | 'monitoring'
  | 'decision'
  | 'proof';

export type CanvasNodeStatus =
  | 'documented'
  | 'in-progress'
  | 'verified'
  | 'released'
  | 'observed'
  | 'recorded'
  | 'public-proof';

export type CanvasLocale = 'ko' | 'en';

export type CanvasNodeCopy = {
  eyebrow: string;
  title: string;
  description: string;
  proof: string;
  artifact: string;
};

export type CanvasNode = {
  id: string;
  type: CanvasNodeType;
  status: CanvasNodeStatus;
  x: number;
  y: number;
  size?: 'sm' | 'md' | 'lg';
  copy: Record<CanvasLocale, CanvasNodeCopy>;
};

export type CanvasEdge = {
  id: string;
  from: string;
  to: string;
  active?: boolean;
};

export const canvasNodes: CanvasNode[] = [
  {
    id: 'intake',
    type: 'intake',
    status: 'documented',
    x: 23,
    y: 42,
    size: 'lg',
    copy: {
      ko: {
        eyebrow: 'Project',
        title: 'INTELLIGENT ONBOARDING',
        description: 'AI-driven onboarding flow',
        proof: '76% pathway readiness without invented public metrics.',
        artifact: 'Project brief · onboarding flow',
      },
      en: {
        eyebrow: 'Project',
        title: 'INTELLIGENT ONBOARDING',
        description: 'AI-driven onboarding flow',
        proof: '76% pathway readiness without invented public metrics.',
        artifact: 'Project brief · onboarding flow',
      },
    },
  },
  {
    id: 'build',
    type: 'build',
    status: 'in-progress',
    x: 47,
    y: 27,
    size: 'md',
    copy: {
      ko: {
        eyebrow: 'Experiment',
        title: 'RANKING MODEL v3',
        description: 'Offline evaluation and model selection loop',
        proof: 'Changed only after the evaluation note is recorded.',
        artifact: 'eval note · experiment log',
      },
      en: {
        eyebrow: 'Experiment',
        title: 'RANKING MODEL v3',
        description: 'Offline evaluation and model selection loop',
        proof: 'Changed only after the evaluation note is recorded.',
        artifact: 'eval note · experiment log',
      },
    },
  },
  {
    id: 'qa',
    type: 'qa',
    status: 'verified',
    x: 55,
    y: 50,
    size: 'md',
    copy: {
      ko: {
        eyebrow: 'QA Gate',
        title: 'E2E TEST',
        description: 'Passed · May 20',
        proof: 'Build, lint, visual QA, and claim-safety are required before public polish.',
        artifact: 'npm run lint · npm run build · screenshot',
      },
      en: {
        eyebrow: 'QA Gate',
        title: 'E2E TEST',
        description: 'Passed · May 20',
        proof: 'Build, lint, visual QA, and claim-safety are required before public polish.',
        artifact: 'npm run lint · npm run build · screenshot',
      },
    },
  },
  {
    id: 'deploy',
    type: 'deploy',
    status: 'released',
    x: 49,
    y: 72,
    size: 'md',
    copy: {
      ko: {
        eyebrow: 'Deployment',
        title: 'DEPLOYMENT v2.3.1',
        description: 'Live · 3m ago',
        proof: 'Release state is presented as an operating surface, not a fake outcome claim.',
        artifact: '/projects · /workflow · /harness · /about',
      },
      en: {
        eyebrow: 'Deployment',
        title: 'DEPLOYMENT v2.3.1',
        description: 'Live · 3m ago',
        proof: 'Release state is presented as an operating surface, not a fake outcome claim.',
        artifact: '/projects · /workflow · /harness · /about',
      },
    },
  },
  {
    id: 'monitoring',
    type: 'monitoring',
    status: 'observed',
    x: 82,
    y: 71,
    size: 'md',
    copy: {
      ko: {
        eyebrow: 'Monitoring',
        title: 'SYSTEM HEALTH',
        description: 'All systems operational',
        proof: 'Monitoring is part of the portfolio operating system and not hidden below the fold.',
        artifact: 'guard notes · incident reports · recovery log',
      },
      en: {
        eyebrow: 'Monitoring',
        title: 'SYSTEM HEALTH',
        description: 'All systems operational',
        proof: 'Monitoring is part of the portfolio operating system and not hidden below the fold.',
        artifact: 'guard notes · incident reports · recovery log',
      },
    },
  },
  {
    id: 'decision',
    type: 'decision',
    status: 'recorded',
    x: 29,
    y: 66,
    size: 'sm',
    copy: {
      ko: {
        eyebrow: 'Data Source',
        title: 'SOURCE ROUTE',
        description: 'Operational inputs',
        proof: 'Raw source context remains attached to the path.',
        artifact: 'data source · task brief',
      },
      en: {
        eyebrow: 'Data Source',
        title: 'SOURCE ROUTE',
        description: 'Operational inputs',
        proof: 'Raw source context remains attached to the path.',
        artifact: 'data source · task brief',
      },
    },
  },
  {
    id: 'proof',
    type: 'proof',
    status: 'public-proof',
    x: 75,
    y: 44,
    size: 'sm',
    copy: {
      ko: {
        eyebrow: 'Path Point',
        title: 'PUBLIC PROOF',
        description: 'Evidence handoff',
        proof: 'The final path connects back to public proof and portfolio narrative.',
        artifact: 'homepage · README · portfolio cards',
      },
      en: {
        eyebrow: 'Path Point',
        title: 'PUBLIC PROOF',
        description: 'Evidence handoff',
        proof: 'The final path connects back to public proof and portfolio narrative.',
        artifact: 'homepage · README · portfolio cards',
      },
    },
  },
];

export const canvasEdges: CanvasEdge[] = [
  { id: 'intake-build', from: 'intake', to: 'build', active: true },
  { id: 'build-proof', from: 'build', to: 'proof', active: true },
  { id: 'proof-monitoring', from: 'proof', to: 'monitoring', active: true },
  { id: 'intake-qa', from: 'intake', to: 'qa', active: true },
  { id: 'qa-monitoring', from: 'qa', to: 'monitoring', active: true },
  { id: 'decision-deploy', from: 'decision', to: 'deploy', active: true },
  { id: 'deploy-monitoring', from: 'deploy', to: 'monitoring', active: true },
  { id: 'build-qa', from: 'build', to: 'qa' },
  { id: 'intake-decision', from: 'intake', to: 'decision' },
  { id: 'deploy-intake', from: 'deploy', to: 'intake' },
];

export function getCanvasNode(id: string) {
  return canvasNodes.find((node) => node.id === id) ?? canvasNodes[0];
}
