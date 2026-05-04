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
    x: 12,
    y: 26,
    copy: {
      ko: {
        eyebrow: '01 / Intake',
        title: '문제 수집',
        description: '아이디어와 사용자 맥락을 바로 코드로 보내지 않고 운영 질문으로 정리합니다.',
        proof: '요구사항, 제약, 공개 가능 범위를 먼저 기록합니다.',
        artifact: 'PRD · project notes · public summary',
      },
      en: {
        eyebrow: '01 / Intake',
        title: 'Problem intake',
        description: 'Ideas and user context are shaped into operating questions before code starts.',
        proof: 'Requirements, constraints, and public-safe scope are recorded first.',
        artifact: 'PRD · project notes · public summary',
      },
    },
  },
  {
    id: 'build',
    type: 'build',
    status: 'in-progress',
    x: 39,
    y: 18,
    copy: {
      ko: {
        eyebrow: '02 / Build Loop',
        title: '빌드 루프',
        description: '제품 코드를 늘리는 것보다 검증 가능한 공개 포트폴리오 spine을 먼저 세웁니다.',
        proof: '작업 브랜치, diff, README/홈페이지 변경으로 남깁니다.',
        artifact: 'branch · component diff · commit log',
      },
      en: {
        eyebrow: '02 / Build Loop',
        title: 'Build loop',
        description: 'The portfolio spine is made visible before expanding product code.',
        proof: 'Work is traceable through branches, diffs, README, and homepage changes.',
        artifact: 'branch · component diff · commit log',
      },
    },
  },
  {
    id: 'qa',
    type: 'qa',
    status: 'verified',
    x: 58,
    y: 38,
    copy: {
      ko: {
        eyebrow: '03 / QA Gate',
        title: '검증 게이트',
        description: '좋아 보이는 랜딩보다 외부 방문자가 이해하는지, 빌드가 통과하는지 확인합니다.',
        proof: 'lint/build와 claim audit를 완료 기준에 포함합니다.',
        artifact: 'npm run lint · npm run build · review notes',
      },
      en: {
        eyebrow: '03 / QA Gate',
        title: 'QA gate',
        description: 'The landing is checked for comprehension and build health, not just visual polish.',
        proof: 'Lint/build and claim audit are part of the definition of done.',
        artifact: 'npm run lint · npm run build · review notes',
      },
    },
  },
  {
    id: 'deploy',
    type: 'deploy',
    status: 'released',
    x: 82,
    y: 25,
    copy: {
      ko: {
        eyebrow: '04 / Release',
        title: '공개 표면 반영',
        description: '홈페이지, README, 공개 포트폴리오 섹션이 같은 방향을 말하도록 연결합니다.',
        proof: '새 URL을 만들지 않고 기존 공개 경로와 CTA만 사용합니다.',
        artifact: '/projects · /workflow · /harness · /about',
      },
      en: {
        eyebrow: '04 / Release',
        title: 'Public surface',
        description: 'Homepage, README, and portfolio sections point to the same operating story.',
        proof: 'Existing public routes and CTAs are used instead of invented URLs.',
        artifact: '/projects · /workflow · /harness · /about',
      },
    },
  },
  {
    id: 'monitoring',
    type: 'monitoring',
    status: 'observed',
    x: 69,
    y: 70,
    copy: {
      ko: {
        eyebrow: '05 / Recovery',
        title: '관찰과 복구',
        description: '운영 실패와 복구 경험을 숨기지 않고 다음 시스템 개선의 증거로 남깁니다.',
        proof: '가드, 알림, 배포 확인 같은 운영 기록을 proof block으로 보존합니다.',
        artifact: 'guard notes · incident reports · recovery log',
      },
      en: {
        eyebrow: '05 / Recovery',
        title: 'Observe & recover',
        description: 'Failures and recovery work become proof for improving the operating system.',
        proof: 'Guards, alerts, and deployment checks remain as proof blocks.',
        artifact: 'guard notes · incident reports · recovery log',
      },
    },
  },
  {
    id: 'decision',
    type: 'decision',
    status: 'recorded',
    x: 31,
    y: 66,
    copy: {
      ko: {
        eyebrow: '06 / Decision Log',
        title: '결정 기록',
        description: '무엇을 만들었는지보다 왜 그렇게 운영했는지를 방문자가 따라갈 수 있게 합니다.',
        proof: '의사결정과 회고를 제품 증거와 함께 묶습니다.',
        artifact: 'DECISIONS · retrospectives · sprint reports',
      },
      en: {
        eyebrow: '06 / Decision Log',
        title: 'Decision log',
        description: 'Visitors can follow why the system was operated this way, not only what was built.',
        proof: 'Decisions and retrospectives are paired with product evidence.',
        artifact: 'DECISIONS · retrospectives · sprint reports',
      },
    },
  },
  {
    id: 'proof',
    type: 'proof',
    status: 'public-proof',
    x: 51,
    y: 84,
    copy: {
      ko: {
        eyebrow: '07 / Proof Archive',
        title: '증거 아카이브',
        description: '외부 방문자가 3분 안에 무엇을 해온 사람인지 확인할 수 있게 정리합니다.',
        proof: 'README, 홈페이지, 프로젝트 카드, 공개 요약이 같은 spine으로 정렬됩니다.',
        artifact: 'homepage · README · portfolio cards',
      },
      en: {
        eyebrow: '07 / Proof Archive',
        title: 'Proof archive',
        description: 'A visitor can understand the operator behind the work within three minutes.',
        proof: 'Homepage, README, project cards, and public summary align around one spine.',
        artifact: 'homepage · README · portfolio cards',
      },
    },
  },
];

export const canvasEdges: CanvasEdge[] = [
  { id: 'intake-build', from: 'intake', to: 'build', active: true },
  { id: 'build-qa', from: 'build', to: 'qa', active: true },
  { id: 'qa-deploy', from: 'qa', to: 'deploy', active: true },
  { id: 'deploy-monitoring', from: 'deploy', to: 'monitoring' },
  { id: 'monitoring-decision', from: 'monitoring', to: 'decision' },
  { id: 'decision-proof', from: 'decision', to: 'proof', active: true },
  { id: 'proof-intake', from: 'proof', to: 'intake' },
  { id: 'build-decision', from: 'build', to: 'decision' },
  { id: 'qa-proof', from: 'qa', to: 'proof', active: true },
];

export function getCanvasNode(id: string) {
  return canvasNodes.find((node) => node.id === id) ?? canvasNodes[0];
}
