export type CanvasLocale = 'ko' | 'en';

export type ProofStageId = 'brief' | 'harness' | 'build' | 'qa' | 'deploy' | 'monitor' | 'proof';

export type ProofStageStatus =
  | 'source'
  | 'locked'
  | 'in-review'
  | 'passed'
  | 'released'
  | 'observed'
  | 'published';

export type ProofStageCopy = {
  eyebrow: string;
  title: string;
  shortTitle: string;
  mobileTitle: string;
  description: string;
  statusLabel: string;
  proof: string;
  artifact: string;
  ctaLabel: string;
  href: string;
};

export type ProofStage = {
  id: ProofStageId;
  order: number;
  status: ProofStageStatus;
  x: number;
  y: number;
  copy: Record<CanvasLocale, ProofStageCopy>;
};

export const proofStages: ProofStage[] = [
  {
    id: 'brief',
    order: 1,
    status: 'source',
    x: 10,
    y: 56,
    copy: {
      ko: {
        eyebrow: '입력',
        title: '요청을 작업 브리프로 고정',
        shortTitle: '브리프',
        mobileTitle: '요청 브리프',
        description: '목표, 제약, 공개 가능한 증거 기준을 먼저 정리합니다.',
        statusLabel: '출처 확인',
        proof: '작업이 시작되기 전에 범위와 검증 기준이 문서로 남습니다.',
        artifact: '워크플로 문서',
        ctaLabel: '워크플로 보기',
        href: '/workflow',
      },
      en: {
        eyebrow: 'Input',
        title: 'Lock the request into a work brief',
        shortTitle: 'Brief',
        mobileTitle: 'Request brief',
        description: 'Goals, constraints, and public proof criteria are written down first.',
        statusLabel: 'Source checked',
        proof: 'Scope and verification criteria are documented before implementation begins.',
        artifact: 'Workflow document',
        ctaLabel: 'View workflow',
        href: '/workflow',
      },
    },
  },
  {
    id: 'harness',
    order: 2,
    status: 'locked',
    x: 25,
    y: 43,
    copy: {
      ko: {
        eyebrow: '하네스',
        title: '검증 하네스를 먼저 세팅',
        shortTitle: '하네스',
        mobileTitle: '검증 하네스',
        description: '품질 기준과 금지된 주장, 확인할 화면을 실행 전에 잠급니다.',
        statusLabel: '기준 잠금',
        proof: '품질 게이트가 구현 결과를 사후 감상으로 판단하지 않게 합니다.',
        artifact: '하네스 정책',
        ctaLabel: '하네스 보기',
        href: '/harness',
      },
      en: {
        eyebrow: 'Harness',
        title: 'Set the verification harness first',
        shortTitle: 'Harness',
        mobileTitle: 'Verification harness',
        description: 'Quality rules, banned claims, and target screens are fixed before execution.',
        statusLabel: 'Rules locked',
        proof: 'The quality gate keeps review from becoming subjective after the work is built.',
        artifact: 'Harness policy',
        ctaLabel: 'View harness',
        href: '/harness',
      },
    },
  },
  {
    id: 'build',
    order: 3,
    status: 'in-review',
    x: 39,
    y: 55,
    copy: {
      ko: {
        eyebrow: '빌드',
        title: '작은 단위로 구현',
        shortTitle: '빌드',
        mobileTitle: '구현',
        description: '기존 구조를 살리고 변경 범위를 작게 유지합니다.',
        statusLabel: '검토 중',
        proof: '코드 변경은 공개 화면의 주장과 연결되는 부분에 집중됩니다.',
        artifact: '홈페이지 구현',
        ctaLabel: '프로젝트 보기',
        href: '/projects',
      },
      en: {
        eyebrow: 'Build',
        title: 'Implement in small units',
        shortTitle: 'Build',
        mobileTitle: 'Implementation',
        description: 'Existing structure stays intact and the change surface remains small.',
        statusLabel: 'In review',
        proof: 'Code changes stay focused on the parts that support the public claim.',
        artifact: 'Homepage implementation',
        ctaLabel: 'View projects',
        href: '/projects',
      },
    },
  },
  {
    id: 'qa',
    order: 4,
    status: 'passed',
    x: 54,
    y: 40,
    copy: {
      ko: {
        eyebrow: 'QA 게이트',
        title: '린트와 시각 검증으로 통과 확인',
        shortTitle: 'QA',
        mobileTitle: 'QA 게이트',
        description: '실행 가능한 검사와 화면 확인으로 완료 주장을 뒷받침합니다.',
        statusLabel: '통과',
        proof: '완료 보고는 실행한 검사와 남은 위험을 함께 남깁니다.',
        artifact: '검증 리포트',
        ctaLabel: '증거 루프 읽기',
        href: '/blog/portfolio-content-proof-loop',
      },
      en: {
        eyebrow: 'QA Gate',
        title: 'Confirm with lint and visual checks',
        shortTitle: 'QA',
        mobileTitle: 'QA gate',
        description: 'Runnable checks and screen review support the completion claim.',
        statusLabel: 'Passed',
        proof: 'Completion reports include the checks that ran and any remaining risk.',
        artifact: 'Verification report',
        ctaLabel: 'Read the proof loop',
        href: '/blog/portfolio-content-proof-loop',
      },
    },
  },
  {
    id: 'deploy',
    order: 5,
    status: 'released',
    x: 68,
    y: 53,
    copy: {
      ko: {
        eyebrow: '배포',
        title: '공개 표면에 반영',
        shortTitle: '배포',
        mobileTitle: '배포',
        description: '검증된 변경만 사이트와 프로젝트 표면으로 이동합니다.',
        statusLabel: '릴리스됨',
        proof: '배포는 숫자 과장이 아니라 확인 가능한 산출물로 설명됩니다.',
        artifact: '공개 프로젝트',
        ctaLabel: '프로젝트 보기',
        href: '/projects',
      },
      en: {
        eyebrow: 'Deploy',
        title: 'Move verified work onto the public surface',
        shortTitle: 'Deploy',
        mobileTitle: 'Deploy',
        description: 'Only verified changes move into the site and project surfaces.',
        statusLabel: 'Released',
        proof: 'Release is explained through inspectable artifacts, not inflated numbers.',
        artifact: 'Public projects',
        ctaLabel: 'View projects',
        href: '/projects',
      },
    },
  },
  {
    id: 'monitor',
    order: 6,
    status: 'observed',
    x: 82,
    y: 42,
    copy: {
      ko: {
        eyebrow: '관찰',
        title: '운영 중 배운 점을 기록',
        shortTitle: '관찰',
        mobileTitle: '모니터링',
        description: '운영 노트와 회고가 다음 작업의 입력으로 돌아갑니다.',
        statusLabel: '관찰됨',
        proof: '실서비스 운영 경험은 다음 하네스와 배포 규칙을 보강합니다.',
        artifact: '운영 노트',
        ctaLabel: '운영 노트 보기',
        href: '/workflow',
      },
      en: {
        eyebrow: 'Monitor',
        title: 'Record what operations teach',
        shortTitle: 'Monitor',
        mobileTitle: 'Monitoring',
        description: 'Operating notes and retrospectives feed the next request.',
        statusLabel: 'Observed',
        proof: 'Live-service experience strengthens the next harness and deploy rule.',
        artifact: 'Operating notes',
        ctaLabel: 'View operating notes',
        href: '/workflow',
      },
    },
  },
  {
    id: 'proof',
    order: 7,
    status: 'published',
    x: 92,
    y: 57,
    copy: {
      ko: {
        eyebrow: '공개 증거',
        title: '공개 증거로 닫기',
        shortTitle: '증거',
        mobileTitle: '공개 증거',
        description: '결과, 하네스, 운영 맥락을 방문자가 확인할 수 있게 연결합니다.',
        statusLabel: '공개됨',
        proof: '포트폴리오는 주장보다 확인 가능한 산출물을 먼저 보여줍니다.',
        artifact: '공개 포트폴리오',
        ctaLabel: '프로젝트 둘러보기',
        href: '/projects',
      },
      en: {
        eyebrow: 'Public Proof',
        title: 'Close with public proof',
        shortTitle: 'Proof',
        mobileTitle: 'Public proof',
        description: 'Results, harnesses, and operating context are linked for visitors to inspect.',
        statusLabel: 'Published',
        proof: 'The portfolio leads with inspectable artifacts before making claims.',
        artifact: 'Public portfolio',
        ctaLabel: 'Browse projects',
        href: '/projects',
      },
    },
  },
];

export function getProofStage(id: ProofStageId) {
  return proofStages.find((stage) => stage.id === id) ?? proofStages[0];
}
