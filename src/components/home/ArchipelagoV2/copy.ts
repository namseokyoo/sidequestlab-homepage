import type { ArchipelagoLocale } from '../Archipelago/types';

const COPY = {
  ko: {
    eyebrow: 'SIDEQUESTLAB · LIVING ARCHIPELAGO V2',
    title: '살아 움직이는 제품 군도',
    intro: '세 개의 프로젝트 섬이 지금 이 순간에도 개발되고 있습니다. 월드를 탐험하거나, 항해 일지에서 최근 활동을 확인하세요.',
    harborLogTitle: '항해 일지',
    harborLogSubtitle: '프로젝트 횡단 최근 활동',
    dayLabel: '낮',
    nightLabel: '밤',
    zoomIn: '확대',
    zoomOut: '축소',
    resetView: '전체 보기로 돌아가기',
    choose: '탐험할 프로젝트 섬 선택',
    selected: '선택한 섬',
    overview: '전체 군도',
    lifecycle: '개발 단계',
    progress: '진행률',
    version: '버전',
    updated: '공개 정보 업데이트',
    outcome: '공개 결과',
    details: '프로젝트 자세히',
    visit: '서비스 방문',
    evidence: 'GitHub 근거 보기',
    unavailableLive: '공개 서비스 링크 없음',
    unavailableEvidence: '공개 근거 링크 없음',
    voyageHint: '스크롤하여 섬 사이를 항해하세요',
    projectStates: {
      IDEA: '아이디어', PLANNING: '계획', DESIGNING: '설계', BUILDING: '개발',
      REVIEWING: '검토', TESTING: '검증', WAITING_FOR_RELEASE: '출시 승인 대기',
      DEPLOYING: '배포', OPERATING: '운영', MAINTENANCE: '유지보수',
      BLOCKED: '진행 차단', PAUSED: '일시 중단', ARCHIVED: '보관',
    } as Record<string, string>,
    logActions: {
      BUILDING: '개발 진행 중',
      MAINTENANCE: '유지보수 활동 중',
      OPERATING: '서비스 운영 중',
      TESTING: '품질 검증 중',
      PLANNING: '다음 항로 계획 중',
      DEPLOYING: '배포 준비 중',
      REVIEWING: '코드 검토 중',
    } as Record<string, string>,
    sceneDescription: '세 개의 프로젝트 섬으로 이루어진 2.5D 미니チュ어 군도. 각 섬에는 랜드마크와 두 명의 AI Wayfarer가 있습니다.',
  },
  en: {
    eyebrow: 'SIDEQUESTLAB · LIVING ARCHIPELAGO V2',
    title: 'A Living Archipelago of Products',
    intro: 'Three project islands are being developed right now. Explore the world, or check the harbor log for recent activity.',
    harborLogTitle: 'Harbor Log',
    harborLogSubtitle: 'Recent activity across projects',
    dayLabel: 'Day',
    nightLabel: 'Night',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset to overview',
    choose: 'Choose a project island to explore',
    selected: 'Selected island',
    overview: 'Full archipelago',
    lifecycle: 'Lifecycle stage',
    progress: 'Progress',
    version: 'Version',
    updated: 'Public info updated',
    outcome: 'Public outcome',
    details: 'Project details',
    visit: 'Visit service',
    evidence: 'View GitHub evidence',
    unavailableLive: 'No public service link',
    unavailableEvidence: 'No public evidence link',
    voyageHint: 'Scroll to voyage between islands',
    projectStates: {
      IDEA: 'Idea', PLANNING: 'Planning', DESIGNING: 'Designing', BUILDING: 'Building',
      REVIEWING: 'Reviewing', TESTING: 'Testing', WAITING_FOR_RELEASE: 'Awaiting release',
      DEPLOYING: 'Deploying', OPERATING: 'Operating', MAINTENANCE: 'Maintenance',
      BLOCKED: 'Blocked', PAUSED: 'Paused', ARCHIVED: 'Archived',
    } as Record<string, string>,
    logActions: {
      BUILDING: 'Building in progress',
      MAINTENANCE: 'Maintenance activity',
      OPERATING: 'Service operating',
      TESTING: 'Quality verification',
      PLANNING: 'Planning next route',
      DEPLOYING: 'Preparing deployment',
      REVIEWING: 'Code review in progress',
    } as Record<string, string>,
    sceneDescription: 'A 2.5D miniature archipelago of three project islands, each with landmarks and two AI Wayfarers.',
  },
} as const;

export type ArchipelagoV2Copy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly harborLogTitle: string;
  readonly harborLogSubtitle: string;
  readonly dayLabel: string;
  readonly nightLabel: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly resetView: string;
  readonly choose: string;
  readonly selected: string;
  readonly overview: string;
  readonly lifecycle: string;
  readonly progress: string;
  readonly version: string;
  readonly updated: string;
  readonly outcome: string;
  readonly details: string;
  readonly visit: string;
  readonly evidence: string;
  readonly unavailableLive: string;
  readonly unavailableEvidence: string;
  readonly voyageHint: string;
  readonly projectStates: Record<string, string>;
  readonly logActions: Record<string, string>;
  readonly sceneDescription: string;
};

export function getArchipelagoV2Copy(locale: ArchipelagoLocale): ArchipelagoV2Copy {
  return COPY[locale];
}
