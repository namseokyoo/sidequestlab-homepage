import { Link } from '@/i18n/routing';
import type { CanvasLocale } from './SystemCanvas/canvasData';

type EditorialHeroPanelProps = {
  locale: CanvasLocale;
};

const copy = {
  ko: {
    eyebrow: 'AI Operations Portfolio',
    title: '운영을\n디자인하는\nAI 제품\n실험실',
    body: 'SidequestLab은 아이디어, 코드, QA, 배포, 회고를 하나의 운영 시스템으로 묶어 공개 가능한 증거와 함께 축적합니다.',
    primary: '프로젝트 증거 보기',
    secondary: '운영 방식 보기',
    principles: [
      ['01', 'Systems Thinking', '제품보다 먼저 반복 가능한 운영 구조를 세웁니다.'],
      ['02', 'Experimental Mindset', '가설, 변경, 검증, 회고가 한 경로에 남습니다.'],
      ['03', 'Operational Design', 'QA와 배포, 복구를 포트폴리오의 일부로 공개합니다.'],
    ],
    logLabel: 'Latest proof log',
    logTitle: 'Portfolio spine updated',
    logBody: 'Homepage · README · public proof sections aligned for review.',
  },
  en: {
    eyebrow: 'AI Operations Portfolio',
    title: 'An AI\nproduct lab\nthat designs\noperations',
    body: 'SidequestLab connects ideas, code, QA, deployment, and retrospectives into an operating system with public proof.',
    primary: 'View project evidence',
    secondary: 'See operating system',
    principles: [
      ['01', 'Systems Thinking', 'Reusable operating structure comes before product expansion.'],
      ['02', 'Experimental Mindset', 'Hypotheses, changes, checks, and retrospectives stay on one path.'],
      ['03', 'Operational Design', 'QA, deployment, and recovery become part of the portfolio proof.'],
    ],
    logLabel: 'Latest proof log',
    logTitle: 'Portfolio spine updated',
    logBody: 'Homepage · README · public proof sections aligned for review.',
  },
};

export default function EditorialHeroPanel({ locale }: EditorialHeroPanelProps) {
  const text = copy[locale];

  return (
    <aside className="portfolio-editorial-panel relative overflow-hidden rounded-[2rem] border p-6 shadow-xl shadow-black/5 sm:p-8 lg:min-h-[680px]">
      <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full border-[34px] border-[var(--sql-red)] opacity-95" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 h-72 w-72 editorial-dot-grid opacity-45" aria-hidden="true" />
      <div className="relative z-10 flex min-h-full flex-col">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--sql-red-muted)]">
          {text.eyebrow}
        </p>
        <h1 className="mt-8 whitespace-pre-line text-5xl font-black leading-[0.92] tracking-[-0.07em] text-[var(--sql-ink)] sm:text-6xl lg:text-7xl">
          {text.title}
        </h1>
        <p className="mt-7 max-w-md text-base leading-relaxed text-[rgba(17,16,14,0.7)]">
          {text.body}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Link
            href="/projects"
            className="portfolio-cta-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
          >
            {text.primary}
          </Link>
          <Link
            href="/workflow"
            className="portfolio-cta-secondary inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold"
          >
            {text.secondary}
          </Link>
        </div>

        <div className="mt-10 divide-y divide-[rgba(17,16,14,0.14)] border-y border-[rgba(17,16,14,0.14)]">
          {text.principles.map(([number, title, description]) => (
            <details key={number} className="group py-4" open={number === '01'}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                <span className="font-mono text-xs tracking-[0.22em] text-[var(--sql-red-muted)]">{number}</span>
                <span className="flex-1">{title}</span>
                <span className="text-lg leading-none transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pl-12 text-sm leading-relaxed text-[rgba(17,16,14,0.62)]">
                {description}
              </p>
            </details>
          ))}
        </div>

        <div className="relative z-10 mt-auto pt-10">
          <div className="rounded-3xl border border-[rgba(17,16,14,0.14)] bg-white/50 p-4 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--sql-red-muted)]">
              {text.logLabel}
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">{text.logTitle}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[rgba(17,16,14,0.62)]">{text.logBody}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
