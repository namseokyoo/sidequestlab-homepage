export interface Project {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  longDescription?: {
    ko: string;
    en: string;
  };
  features?: {
    ko: string[];
    en: string[];
  };
  url: string;
  github?: string;
  techStack: string[];
  featured: boolean;
  status: 'completed' | 'in-progress' | 'planned';
  category: 'product' | 'internal' | 'homepage';
  tags?: string[];
  startDate?: string;
  gradient?: string;
}

export const projects: Project[] = [
  {
    id: 'nbbang',
    name: {
      ko: '엔빵 계산기',
      en: 'N-Bang Calculator'
    },
    description: {
      ko: '모임 비용을 쉽고 공정하게 나누는 스마트 정산 앱',
      en: 'Smart bill splitting app for fair and easy group expense sharing'
    },
    longDescription: {
      ko: '엔빵 계산기는 회식이나 모임 후 복잡한 정산을 간편하게 해결해주는 서비스입니다. 1차, 2차, 3차 각각 다른 인원이 참여했을 때도 정확하게 계산하고, 최소한의 송금 횟수로 정산을 완료할 수 있습니다.',
      en: 'N-Bang Calculator is a service that simplifies complex expense splitting after gatherings. It accurately calculates even when different people participate in each round, and minimizes the number of transfers needed.'
    },
    features: {
      ko: [
        '차수별 정산 - 1차, 2차, 3차 각각 다른 금액과 인원 관리',
        '선택적 참여 - 특정 항목에 일부만 참여한 경우 처리',
        '최적화된 송금 - 최소 거래 횟수로 정산 완료',
        '공유 링크 - 압축된 URL로 결과 공유',
        '카카오톡 공유 - 간편하게 결과 전송'
      ],
      en: [
        'Round-based splitting - Manage different amounts and participants for each round',
        'Selective participation - Handle items where only some participated',
        'Optimized transfers - Complete settlement with minimum transactions',
        'Shareable links - Share results via compressed URLs',
        'KakaoTalk sharing - Easily send results'
      ]
    },
    url: 'https://nbbang.click',
    github: 'https://github.com/namseokyoo/nbbang',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Vercel'],
    featured: true,
    status: 'in-progress',
    category: 'product',
    startDate: '2026-01-27',
    gradient: 'from-blue-500 to-cyan-400',
    tags: ['monetization', 'utility']
  },
  {
    id: 'booksalon',
    name: {
      ko: '북살롱',
      en: 'BookSalon'
    },
    description: {
      ko: '책 중심 지식 공유 및 토론 커뮤니티 플랫폼',
      en: 'Book-centered knowledge sharing and discussion community platform'
    },
    longDescription: {
      ko: '북살롱은 책을 중심으로 지식을 공유하고 토론하는 커뮤니티 플랫폼입니다. 독서 기록을 관리하고, 책에 대한 의견을 나누며, 같은 관심사를 가진 독서가들과 연결될 수 있습니다. Firebase에서 Supabase로 전면 마이그레이션하며 거버넌스 체계를 대폭 강화했습니다.',
      en: 'BookSalon is a community platform for sharing knowledge and discussing ideas centered around books. You can manage reading logs, share opinions on books, and connect with readers who share your interests. A full migration from Firebase to Supabase significantly strengthened our governance system.',
    },
    features: {
      ko: [
        '독서 기록 - 읽은 책을 기록하고 별점과 메모 관리',
        '토론 게시판 - 책별 의견 공유 및 토론',
        '독서 배지 - 활동에 따른 성취 배지 시스템',
        'Supabase RLS - Row Level Security로 안전한 데이터 관리',
      ],
      en: [
        'Reading logs - Record books with ratings and notes',
        'Discussion boards - Share opinions and discuss by book',
        'Reading badges - Achievement badge system based on activity',
        'Supabase RLS - Secure data management with Row Level Security',
      ],
    },
    url: 'https://booksalon-nine.vercel.app',
    github: 'https://github.com/namseokyoo/booksalon',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vite'],
    featured: true,
    status: 'in-progress',
    category: 'product',
    startDate: '2026-02-05',
    gradient: 'from-amber-500 to-orange-400',
    tags: ['community', 'social']
  },
  {
    id: 'displaylab',
    name: {
      ko: '디스플레이랩',
      en: 'Display Lab'
    },
    description: {
      ko: '디스플레이 엔지니어를 위한 전문 분석 플랫폼',
      en: 'Professional analysis platform for display engineers'
    },
    longDescription: {
      ko: 'Display Lab은 디스플레이 엔지니어를 위한 전문 분석 플랫폼입니다. 색역 분석, 시야각 측정, HDR 성능 평가 등 8개 모듈을 제공하며, 다국어를 지원합니다. 연구 데이터를 시각적으로 분석하고 보고서를 생성할 수 있습니다.',
      en: 'Display Lab is a professional analysis platform for display engineers. It provides 8 modules including color gamut analysis, viewing angle measurement, and HDR performance evaluation with multilingual support. You can visually analyze research data and generate reports.',
    },
    features: {
      ko: [
        '색역 분석 - sRGB, DCI-P3, BT.2020 색역 커버리지 측정',
        '시야각 분석 - 각도별 색 변화 및 휘도 감소 분석',
        'HDR 성능 - 명암비, 피크 휘도, 톤 매핑 평가',
        '다국어 지원 - 한국어, 영어, 일본어 인터페이스',
      ],
      en: [
        'Color gamut analysis - sRGB, DCI-P3, BT.2020 coverage measurement',
        'Viewing angle analysis - Color shift and luminance decrease by angle',
        'HDR performance - Contrast ratio, peak brightness, tone mapping evaluation',
        'Multilingual support - Korean, English, Japanese interface',
      ],
    },
    url: 'https://displaylab.vercel.app',
    github: 'https://github.com/namseokyoo/displaylab',
    techStack: ['React', 'Vite', 'TypeScript', 'D3.js', 'Tailwind CSS'],
    featured: true,
    status: 'in-progress',
    category: 'product',
    startDate: '2026-02-20',
    gradient: 'from-violet-500 to-purple-400',
    tags: ['professional-tool', 'display']
  },
  {
    id: 'spectrum-visualizer',
    name: {
      ko: '스펙트럼 시각화기',
      en: 'Spectrum Visualizer'
    },
    description: {
      ko: 'OLED/디스플레이 연구자용 스펙트럼-색좌표 시각화 도구',
      en: 'Spectrum-to-color coordinate visualization tool for OLED/display researchers'
    },
    longDescription: {
      ko: 'Interactive Spectrum-to-Color Visualizer (ISCV)는 디스플레이 연구자들이 스펙트럼 데이터를 CIE 색좌표로 변환하고 시각화하는 도구입니다. Spectrum-on-Locus 기능으로 스펙트럼을 색공간 외곽선 위에 산맥 형태로 표시하고, 드래그로 파장 이동 효과를 직관적으로 확인할 수 있습니다.',
      en: 'Interactive Spectrum-to-Color Visualizer (ISCV) is a tool for display researchers to convert and visualize spectrum data as CIE color coordinates. The Spectrum-on-Locus feature displays spectra as mountain ridges on the color space boundary, allowing intuitive wavelength shift visualization through dragging.'
    },
    features: {
      ko: [
        'CIE 1931 xy / CIE 1976 u\'v\' 색좌표 다이어그램',
        'Spectrum-on-Locus - 스펙트럼을 외곽선 위 산맥 형태로 시각화',
        '파장 이동 - 슬라이더, 수치입력, 드래그로 조절',
        '색역 토글 - sRGB, DCI-P3, BT.2020, Adobe RGB',
        '스냅샷 - 여러 스펙트럼 비교 저장'
      ],
      en: [
        'CIE 1931 xy / CIE 1976 u\'v\' chromaticity diagrams',
        'Spectrum-on-Locus - Visualize spectra as ridges on the color boundary',
        'Wavelength shift - Adjust via slider, input, or drag',
        'Gamut toggle - sRGB, DCI-P3, BT.2020, Adobe RGB',
        'Snapshots - Save and compare multiple spectra'
      ]
    },
    url: 'https://spectrum-visualizer-seven.vercel.app',
    github: 'https://github.com/namseokyoo/spectrum-visualizer',
    techStack: ['React', 'Vite', 'TypeScript', 'D3.js', 'Tailwind CSS'],
    featured: true,
    status: 'completed',
    category: 'product',
    startDate: '2026-01-28',
    gradient: 'from-emerald-500 to-teal-400',
    tags: ['professional-tool', 'visualization']
  },
  {
    id: 'pomodoro-timer',
    name: {
      ko: '뽀모도로 타이머',
      en: 'Pomodoro Timer'
    },
    description: {
      ko: '집중력 향상을 위한 뽀모도로 기법 타이머',
      en: 'Pomodoro technique timer for better focus'
    },
    longDescription: {
      ko: '뽀모도로 타이머는 프란체스코 시릴로가 개발한 시간 관리 기법을 적용한 타이머입니다. 25분 집중, 5분 휴식의 사이클을 반복하여 지속적인 집중력을 유지하고 생산성을 극대화할 수 있습니다.',
      en: 'Pomodoro Timer applies the time management technique developed by Francesco Cirillo. By repeating cycles of 25-minute focus and 5-minute breaks, you can maintain sustained concentration and maximize productivity.'
    },
    features: {
      ko: [
        '25분 집중 타이머 - 뽀모도로 기법 기본 시간',
        '5분 휴식 타이머 - 짧은 휴식으로 재충전',
        '15분 긴 휴식 - 4회 집중 후 긴 휴식',
        '세션 카운트 - 완료한 뽀모도로 횟수 추적',
        '알림 소리 - 타이머 완료 시 알림'
      ],
      en: [
        '25-minute focus timer - Standard Pomodoro duration',
        '5-minute break timer - Recharge with short breaks',
        '15-minute long break - Extended rest after 4 sessions',
        'Session count - Track completed Pomodoros',
        'Notification sound - Alert when timer ends'
      ]
    },
    url: 'https://app-ecru-eight-10.vercel.app',
    github: 'https://github.com/namseokyoo/pomodoro-timer',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    featured: false,
    status: 'completed',
    category: 'product',
    startDate: '2026-01-26',
    gradient: 'from-rose-500 to-pink-400',
    tags: ['productivity']
  },
  {
    id: 'thisor',
    name: {
      ko: '디스올',
      en: 'Thisor'
    },
    description: {
      ko: '가벼운 이것저것 투표 앱',
      en: 'Fun this-or-that voting app'
    },
    longDescription: {
      ko: 'Thisor(디스올)은 가벼운 이것저것 투표 앱입니다. 두 가지 선택지 중 하나를 고르는 간단한 투표를 만들고 공유할 수 있습니다. 1일 MVP로 개발되어 빠른 실행의 좋은 사례가 되었습니다.',
      en: 'Thisor is a fun this-or-that voting app. Create and share simple polls where people choose between two options. Built as a 1-day MVP, it became a great example of fast execution.',
    },
    features: {
      ko: [
        '투표 생성 - 두 가지 선택지로 간단한 투표 만들기',
        '실시간 결과 - 투표 현황 실시간 확인',
        '공유 링크 - URL로 간편하게 투표 공유',
      ],
      en: [
        'Create polls - Make simple polls with two options',
        'Real-time results - See voting results in real-time',
        'Share links - Easily share polls via URL',
      ],
    },
    url: 'https://thisor-theta.vercel.app',
    github: 'https://github.com/namseokyoo/thisor',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    featured: false,
    status: 'completed',
    category: 'product',
    startDate: '2026-01-31',
    gradient: 'from-sky-500 to-indigo-400',
    tags: ['social', 'entertainment']
  },
  {
    id: 'livenote',
    name: {
      ko: '라이브노트',
      en: 'LiveNote'
    },
    description: {
      ko: '실시간 협업 노트 앱',
      en: 'Real-time collaborative note-taking app'
    },
    longDescription: {
      ko: 'LiveNote는 실시간으로 여러 사용자가 동시에 편집할 수 있는 협업 노트 앱입니다. TipTap 에디터 기반의 리치 텍스트 편집을 지원하며, Supabase 실시간 기능으로 변경사항이 즉시 동기화됩니다. QA 없이 배포하여 장애가 발생한 경험을 통해 프로덕션 배포 규칙이 수립된 프로젝트입니다.',
      en: 'LiveNote is a collaborative note app where multiple users can edit simultaneously in real-time. It supports rich text editing based on the TipTap editor, with changes synced instantly through Supabase real-time features. Deploying without QA led to an incident that established our production deployment rules.',
    },
    features: {
      ko: [
        '실시간 동시 편집 - 여러 사용자가 동시에 문서 편집',
        '리치 텍스트 - TipTap 기반 다양한 서식 지원',
        '자동 저장 - 변경사항 자동 저장 및 동기화',
        '노트 관리 - 폴더별 노트 정리 및 검색',
      ],
      en: [
        'Real-time co-editing - Multiple users edit documents simultaneously',
        'Rich text - Various formatting with TipTap editor',
        'Auto-save - Automatic saving and syncing of changes',
        'Note management - Organize and search notes by folder',
      ],
    },
    url: 'https://livenote-nine.vercel.app',
    github: 'https://github.com/namseokyoo/livenote',
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'TipTap'],
    featured: false,
    status: 'completed',
    category: 'product',
    startDate: '2026-02-04',
    gradient: 'from-lime-500 to-green-400',
    tags: ['productivity', 'collaboration']
  },
  {
    id: 'todo-app',
    name: {
      ko: '투두앱',
      en: 'Todo App'
    },
    description: {
      ko: '심플한 할 일 관리 앱',
      en: 'Simple task management app'
    },
    url: 'https://todo-app-ten-beryl-34.vercel.app',
    github: 'https://github.com/namseokyoo/todo-app',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    featured: false,
    status: 'completed',
    category: 'product',
    startDate: '2026-01-26',
    gradient: 'from-gray-500 to-slate-400',
    tags: ['productivity']
  },
  {
    id: 'mailbox-dashboard',
    name: {
      ko: '메일박스 대시보드',
      en: 'Mailbox Dashboard'
    },
    description: {
      ko: '팀 협업 Work Order 대시보드',
      en: 'Team collaboration Work Order dashboard'
    },
    url: 'https://mailbox-dashboard-v2.vercel.app',
    github: 'https://github.com/namseokyoo/mailbox-dashboard-v2',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GitHub Actions'],
    featured: false,
    status: 'completed',
    category: 'internal',
    startDate: '2026-01-28',
    gradient: 'from-blue-600 to-blue-400',
    tags: ['internal-tool', 'dashboard']
  },
  {
    id: 'sidequestlab-homepage',
    name: {
      ko: 'SidequestLab 홈페이지',
      en: 'SidequestLab Homepage'
    },
    description: {
      ko: '회사 공식 홈페이지',
      en: 'Official company website'
    },
    url: 'https://sidequestlab-homepage.vercel.app',
    github: 'https://github.com/namseokyoo/sidequestlab-homepage',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'next-intl', 'MDX'],
    featured: false,
    status: 'completed',
    category: 'homepage',
    startDate: '2026-01-27',
    gradient: 'from-neutral-600 to-neutral-400',
    tags: ['website']
  },
  {
    id: 'n8n-automation',
    name: {
      ko: 'n8n 자동화',
      en: 'n8n Automation'
    },
    description: {
      ko: 'Telegram ↔ Claude Code 양방향 자동화 시스템',
      en: 'Telegram ↔ Claude Code bidirectional automation system'
    },
    longDescription: {
      ko: 'n8n 자동화 시스템은 Telegram과 Claude Code를 양방향으로 연결하는 워크플로우 자동화 플랫폼입니다. 음성 메시지를 Groq Whisper로 텍스트 변환하고, 자동으로 작업을 처리하여 결과를 보고합니다.',
      en: 'The n8n automation system is a workflow automation platform that bidirectionally connects Telegram and Claude Code. It converts voice messages to text using Groq Whisper and automatically processes tasks to report results.',
    },
    features: {
      ko: [
        'Telegram 연동 - 메시지로 작업 지시 및 결과 수신',
        '음성 인식 - Groq Whisper로 음성 메시지 텍스트 변환',
        '자동 워크플로우 - n8n 기반 자동화 파이프라인',
      ],
      en: [
        'Telegram integration - Send instructions and receive results via messages',
        'Voice recognition - Convert voice messages to text with Groq Whisper',
        'Auto workflows - n8n-based automation pipelines',
      ],
    },
    url: '#',
    github: 'https://github.com/namseokyoo/n8n-automation',
    techStack: ['n8n', 'Node.js', 'Telegram Bot API', 'Groq Whisper'],
    featured: false,
    status: 'in-progress',
    category: 'internal',
    startDate: '2026-02-06',
    gradient: 'from-orange-600 to-red-400',
    tags: ['automation', 'internal-tool']
  },
  {
    id: 'monitoring-system',
    name: {
      ko: '모니터링 시스템',
      en: 'Monitoring System'
    },
    description: {
      ko: '프로덕션 서비스 모니터링 시스템',
      en: 'Production service monitoring system'
    },
    longDescription: {
      ko: '프로덕션 서비스의 가용성과 성능을 모니터링하는 시스템입니다. UptimeRobot으로 서비스 상태를 실시간 감시하고, Sentry로 에러를 추적하여 장애를 빠르게 감지하고 대응합니다.',
      en: 'A system for monitoring the availability and performance of production services. It monitors service status in real-time with UptimeRobot and tracks errors with Sentry for fast incident detection and response.',
    },
    features: {
      ko: [
        '업타임 모니터링 - 서비스 가용성 실시간 감시',
        '에러 추적 - Sentry 기반 에러 수집 및 분석',
        '장애 알림 - 서비스 다운 시 즉시 알림',
      ],
      en: [
        'Uptime monitoring - Real-time service availability tracking',
        'Error tracking - Sentry-based error collection and analysis',
        'Incident alerts - Instant notifications on service downtime',
      ],
    },
    url: '#',
    techStack: ['UptimeRobot', 'Sentry'],
    featured: false,
    status: 'planned',
    category: 'internal',
    gradient: 'from-red-500 to-rose-400',
    tags: ['monitoring', 'internal-tool']
  }
];

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured);
}

export function getProductProjects(): Project[] {
  return projects.filter(p => p.category === 'product');
}

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectsByStatus(status: Project['status']): Project[] {
  return projects.filter(p => p.status === status);
}
