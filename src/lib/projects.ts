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
  url: string;
  techStack: string[];
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: 'nbbang',
    name: {
      ko: '엔빵 계산기',
      en: 'N-Bang Calculator'
    },
    description: {
      ko: '모임이나 회식 후 복잡한 정산을 쉽고 빠르게 해결하는 계산기입니다. 누가 얼마를 내야 하는지 한눈에 확인하세요.',
      en: 'A calculator that makes splitting bills easy and fast after gatherings or dinners. See at a glance who owes what.'
    },
    url: 'https://nbbang.click',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    featured: true
  },
  {
    id: 'pomodoro',
    name: {
      ko: 'Pomodoro Timer',
      en: 'Pomodoro Timer'
    },
    description: {
      ko: '집중력을 높이는 뽀모도로 기법 타이머입니다. 25분 집중, 5분 휴식의 사이클로 생산성을 극대화하세요.',
      en: 'A Pomodoro technique timer to boost your focus. Maximize productivity with cycles of 25-minute focus and 5-minute breaks.'
    },
    url: 'https://app-ecru-eight-10.vercel.app',
    techStack: ['React', 'TypeScript', 'CSS Modules'],
    featured: true
  },
  {
    id: 'todo',
    name: {
      ko: 'Todo App',
      en: 'Todo App'
    },
    description: {
      ko: '간단하고 직관적인 할일 관리 앱입니다. 복잡한 기능 없이 할일을 추가하고, 완료하고, 삭제할 수 있습니다.',
      en: 'A simple and intuitive todo management app. Add, complete, and delete tasks without complex features.'
    },
    url: '#',
    techStack: ['React', 'JavaScript', 'LocalStorage'],
    featured: true
  }
];

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured);
}
