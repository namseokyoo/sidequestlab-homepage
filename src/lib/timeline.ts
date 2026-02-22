export interface TimelineEvent {
  date: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  type: 'milestone' | 'project' | 'governance';
}

export const timelineEvents: TimelineEvent[] = [
  {
    date: '2026-01-26',
    title: { ko: 'SidequestLab 설립', en: 'SidequestLab Founded' },
    description: {
      ko: 'AI 가상 기업 설립, CEO Agent + 전문 스킬 기반 조직 구축',
      en: 'AI virtual company established with CEO Agent + specialized skill-based organization',
    },
    type: 'milestone',
  },
  {
    date: '2026-01-26',
    title: { ko: '첫 프로젝트 런칭', en: 'First Projects Launched' },
    description: {
      ko: 'Todo App, Pomodoro Timer 개발 및 배포. 팀 시스템 첫 가동',
      en: 'Todo App, Pomodoro Timer developed and deployed. First team system operation',
    },
    type: 'project',
  },
  {
    date: '2026-01-27',
    title: {
      ko: '엔빵 계산기 & 홈페이지 런칭',
      en: 'N-Bang Calculator & Homepage Launch',
    },
    description: {
      ko: 'PRD 프로세스 첫 적용, 수익화 프로젝트 시작. 회사 홈페이지 MVP 완성',
      en: 'First PRD process applied, monetization project started. Company homepage MVP completed',
    },
    type: 'project',
  },
  {
    date: '2026-01-31',
    title: {
      ko: 'Thisor & Spectrum Visualizer 완성',
      en: 'Thisor & Spectrum Visualizer Completed',
    },
    description: {
      ko: '투표 앱 Thisor 1일 MVP, OLED 연구용 스펙트럼 시각화 도구 완성',
      en: 'Voting app Thisor 1-day MVP, OLED research spectrum visualization tool completed',
    },
    type: 'project',
  },
  {
    date: '2026-02-04',
    title: {
      ko: 'LiveNote & 프로덕션 배포 규칙 수립',
      en: 'LiveNote & Production Deploy Rules',
    },
    description: {
      ko: '실시간 협업 노트 앱. QA 없이 배포 → 장애 → CLAUDE.md 배포 규칙 신설',
      en: 'Real-time collaborative note app. Deploy without QA → incident → new deployment rules',
    },
    type: 'governance',
  },
  {
    date: '2026-02-06',
    title: {
      ko: 'BookSalon Supabase 마이그레이션',
      en: 'BookSalon Supabase Migration',
    },
    description: {
      ko: 'Firebase → Supabase 전면 마이그레이션. 거버넌스 체계 대폭 강화',
      en: 'Full Firebase → Supabase migration. Major governance system reinforcement',
    },
    type: 'milestone',
  },
  {
    date: '2026-02-20',
    title: { ko: 'Display Lab 런칭', en: 'Display Lab Launch' },
    description: {
      ko: '디스플레이 엔지니어용 전문 분석 플랫폼. 8개 모듈, 다국어 지원',
      en: 'Professional analysis platform for display engineers. 8 modules, multilingual support',
    },
    type: 'project',
  },
  {
    date: '2026-02-22',
    title: { ko: '거버넌스 체계 완성', en: 'Governance System Completed' },
    description: {
      ko: '80개 이상 의사결정 기록, 성장 자가점검 루프, 신기술 검토 프로토콜 구축',
      en: '80+ decision records, growth self-check loop, tech review protocol established',
    },
    type: 'governance',
  },
];
