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
