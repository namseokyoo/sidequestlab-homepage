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
  {
    date: '2026-02-25',
    title: { ko: '북살롱 디자인 시스템 완성', en: 'BookSalon Design System Completed' },
    description: {
      ko: 'OKLCH 디자인 토큰, "다정한 도서관" 브랜딩, UI/UX 전면 개선',
      en: 'OKLCH design tokens, "Warm Library" branding, full UI/UX overhaul',
    },
    type: 'milestone',
  },
  {
    date: '2026-02-28',
    title: { ko: '북살롱 UX 전면 개선', en: 'BookSalon Full UX Overhaul' },
    description: {
      ko: 'Stitch 디자인 레퍼런스 기반 카드 그리드, 검색 UX, 모바일 최적화 완료',
      en: 'Card grid, search UX, and mobile optimization based on Stitch design reference',
    },
    type: 'project',
  },
  {
    date: '2026-03-04',
    title: { ko: '북살롱 v1.0.0 정식 출시', en: 'BookSalon v1.0.0 Official Launch' },
    description: {
      ko: '대댓글 시스템, React Router v7, OKLCH "다정한 도서관" 브랜딩 적용. 정식 v1.0.0 출시',
      en: 'Nested comments, React Router v7, OKLCH "Warm Library" branding applied. Official v1.0.0 release',
    },
    type: 'project',
  },
  {
    date: '2026-03-07',
    title: { ko: '하네스 v4.0 Custom Subagent Architecture 완성', en: 'Harness v4.0 Custom Subagent Architecture Completed' },
    description: {
      ko: 'agent.md 기반 도구 권한 매트릭스, SKILL.md 역할 인지율 100% 달성',
      en: 'agent.md-based tool permission matrix, SKILL.md role awareness 100% achieved',
    },
    type: 'milestone',
  },
  {
    date: '2026-03-10',
    title: { ko: 'ISCV 아카이브 → Display Lab 자산 흡수', en: 'ISCV Archived → Assets Absorbed into Display Lab' },
    description: {
      ko: 'ISCV 영문 SEO 3주 0명 → 아카이브 결정. Spectrum Analyzer 모듈로 Display Lab에 통합',
      en: 'ISCV English SEO 3 weeks 0 visitors → archived. Spectrum Analyzer module integrated into Display Lab',
    },
    type: 'governance',
  },
  {
    date: '2026-03-11',
    title: { ko: '하네스 v5.0 Sprint D 완료 (추적 기반 강화)', en: 'Harness v5.0 Sprint D Completed (Traceability Enhanced)' },
    description: {
      ko: 'run_id 추적 시스템, 로그 수집 파이프라인, KPI 측정 체계 구축 완료',
      en: 'run_id tracking system, log collection pipeline, and KPI measurement framework completed',
    },
    type: 'milestone',
  },
];
