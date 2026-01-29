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
}

export const projects: Project[] = [
  {
    id: 'nbbang',
    name: {
      ko: '엔빵 계산기',
      en: 'N-Bang Calculator'
    },
    description: {
      ko: '모임이나 회식 후 복잡한 정산을 쉽고 빠르게 해결하는 계산기입니다.',
      en: 'A calculator that makes splitting bills easy and fast after gatherings.'
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
    category: 'product'
  },
  {
    id: 'pomodoro',
    name: {
      ko: '뽀모도로 타이머',
      en: 'Pomodoro Timer'
    },
    description: {
      ko: '집중력을 높이는 뽀모도로 기법 타이머입니다.',
      en: 'A Pomodoro technique timer to boost your focus.'
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
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    featured: true,
    status: 'completed',
    category: 'product'
  },
  {
    id: 'todo',
    name: {
      ko: 'Todo App',
      en: 'Todo App'
    },
    description: {
      ko: '간단하고 직관적인 할일 관리 앱입니다.',
      en: 'A simple and intuitive todo management app.'
    },
    url: '#',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    featured: false,
    status: 'completed',
    category: 'product'
  },
  {
    id: 'mailbox-dashboard',
    name: {
      ko: 'Mailbox Dashboard',
      en: 'Mailbox Dashboard'
    },
    description: {
      ko: 'Work Order Gate System - 팀 협업 대시보드입니다.',
      en: 'Work Order Gate System - Team collaboration dashboard.'
    },
    url: 'https://mailbox-dashboard-v2.vercel.app',
    github: 'https://github.com/namseokyoo/mailbox-dashboard-v2',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GitHub Actions'],
    featured: false,
    status: 'completed',
    category: 'internal'
  },
  {
    id: 'spectrum-visualizer',
    name: {
      ko: 'Spectrum Visualizer',
      en: 'Spectrum Visualizer'
    },
    description: {
      ko: 'OLED/디스플레이 연구자를 위한 스펙트럼-색좌표 시각화 도구입니다.',
      en: 'A spectrum-to-color coordinate visualization tool for OLED/display researchers.'
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
    category: 'product'
  },
  {
    id: 'sidequestlab-homepage',
    name: {
      ko: 'SidequestLab 홈페이지',
      en: 'SidequestLab Homepage'
    },
    description: {
      ko: '회사 공식 홈페이지 - 브랜드, 포트폴리오, 블로그.',
      en: 'Official company website - Brand, Portfolio, Blog.'
    },
    url: 'https://sidequestlab-homepage.vercel.app',
    github: 'https://github.com/namseokyoo/sidequestlab-homepage',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'next-intl', 'MDX'],
    featured: false,
    status: 'completed',
    category: 'homepage'
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
