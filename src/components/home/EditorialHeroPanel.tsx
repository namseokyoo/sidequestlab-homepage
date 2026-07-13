import { Link } from '@/i18n/routing';
import type { CanvasLocale } from './SystemCanvas/canvasData';

type EditorialHeroPanelProps = {
  locale: CanvasLocale;
};

type ProofPillar = {
  number: string;
  title: string;
  description: string;
  href: '/projects' | '/harness' | '/workflow';
};

const copy: Record<CanvasLocale, {
  eyebrow: string;
  title: string;
  body: string;
  principles: ProofPillar[];
  logLabel: string;
  logTime: string;
  logStatus: string;
  logBody: string;
}> = {
  ko: {
    eyebrow: 'AI PRODUCT STUDIO',
    title: '운영을\n디자인하는\nAI 제품 실험실',
    body: '사이드퀘스트랩은 검증된 제품 증거와 운영 하네스를 함께 공개하는 AI 제품 포트폴리오입니다. 현재 홈페이지 증거 패키지는 Display Lab입니다.',
    principles: [
      {
        number: '01',
        title: 'Display Lab 증거',
        description: '검증된 로컬 QA와 화면 증거가 있는 현재 증거 패키지',
        href: '/projects',
      },
      {
        number: '02',
        title: '검증 하네스',
        description: '완료 주장을 막는 QA·증거 기준',
        href: '/harness',
      },
      {
        number: '03',
        title: '운영 기억',
        description: '요청, 회고, 다음 개선으로 이어지는 방식',
        href: '/workflow',
      },
    ],
    logLabel: 'LATEST PROOF',
    logTime: 'JUL 13, 2026   07:39',
    logStatus: 'PRODUCTION RELEASE VERIFIED',
    logBody: 'Display Lab release and responsive QA evidence',
  },
  en: {
    eyebrow: 'AI PRODUCT STUDIO',
    title: 'An AI\nproduct lab\nthat designs\noperations',
    body: 'SidequestLab is an AI product portfolio that publishes verified product evidence together with the operating harness behind it. Display Lab is the current verified proof package.',
    principles: [
      {
        number: '01',
        title: 'Display Lab proof',
        description: 'Current proof package with local QA and screen evidence',
        href: '/projects',
      },
      {
        number: '02',
        title: 'Verification harness',
        description: 'QA and evidence gates behind completion claims',
        href: '/harness',
      },
      {
        number: '03',
        title: 'Operating memory',
        description: 'How requests and retrospectives feed the next cycle',
        href: '/workflow',
      },
    ],
    logLabel: 'LATEST PROOF',
    logTime: 'JUL 13, 2026   07:39',
    logStatus: 'PRODUCTION RELEASE VERIFIED',
    logBody: 'Display Lab release and responsive QA evidence',
  },
};

export default function EditorialHeroPanel({ locale }: EditorialHeroPanelProps) {
  const text = copy[locale];

  return (
    <aside className="portfolio-editorial-panel relative isolate min-h-[760px] overflow-hidden border-r border-[rgba(17,16,14,0.16)] px-8 py-10 sm:px-11 lg:min-h-[calc(100vh-5rem)]">
      <div className="relative z-10 flex min-h-full flex-col">
        <p className="mt-8 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sql-red)]">
          {text.eyebrow}
        </p>

        <h1 className="relative z-10 mt-9 whitespace-pre-line break-keep text-[clamp(3.25rem,7.4vw,6.75rem)] font-black leading-[1.04] tracking-[-0.095em] text-[var(--sql-ink)] [word-break:keep-all]">
          {text.title}
        </h1>

        <p className="relative z-10 mt-8 max-w-[25rem] break-keep text-base leading-[1.85] text-[rgba(17,16,14,0.72)]">
          {text.body}
        </p>

        <nav
          aria-label={locale === 'ko' ? '포트폴리오 증거 축' : 'Portfolio proof pillars'}
          className="relative z-10 mt-11 max-w-[19rem] divide-y divide-[rgba(17,16,14,0.18)] border-y border-[rgba(17,16,14,0.18)] bg-[rgba(243,238,229,0.78)] backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
        >
          {text.principles.map((item) => (
            <Link
              key={item.number}
              href={item.href}
              className="group flex items-center gap-4 py-4 text-[13px] text-[var(--sql-ink)] transition-colors hover:text-[var(--sql-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sql-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sql-ivory)]"
            >
              <span className="font-mono text-[10px] tracking-[0.18em] text-[rgba(17,16,14,0.62)] group-hover:text-[var(--sql-red)]">
                {item.number}
              </span>
              <span className="flex-1">
                <span className="block font-semibold leading-snug">{item.title}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-[rgba(17,16,14,0.62)] group-hover:text-[rgba(201,32,25,0.76)]">
                  {item.description}
                </span>
              </span>
              <span className="font-mono text-lg leading-none text-[rgba(17,16,14,0.42)] transition group-hover:translate-x-0.5 group-hover:text-[var(--sql-red)]" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>

        <div className="pointer-events-none absolute bottom-[2.4rem] right-[-14.8rem] z-0 h-[22rem] w-[22rem] rounded-full bg-[var(--sql-red)] sm:bottom-[7.2rem] sm:right-[-10.8rem] sm:h-[25rem] sm:w-[25rem]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[9.8rem] right-[5.3rem] h-px w-[17.5rem] bg-[rgba(201,32,25,0.58)]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[4.1rem] right-[1.1rem] h-[23rem] w-px bg-[rgba(17,16,14,0.18)]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[4.1rem] right-[5.3rem] h-[23rem] w-px bg-[rgba(17,16,14,0.18)]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[9.42rem] right-[5.05rem] h-3 w-3 rounded-full border border-[var(--sql-ink)] bg-[var(--sql-ink)] shadow-[0_0_0_1.4rem_rgba(201,32,25,0.14),0_0_0_2.9rem_rgba(201,32,25,0.1)]" aria-hidden="true" />

        <div className="relative z-10 mt-auto max-w-xs pt-16 text-[11px] uppercase tracking-[0.08em] text-[rgba(17,16,14,0.68)]">
          <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[rgba(17,16,14,0.56)]">{text.logLabel}</p>
          <p className="mt-4 font-mono font-bold text-[var(--sql-ink)]">
            {text.logTime} <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--sql-red)] align-middle" />
          </p>
          <p className="mt-3 font-mono text-[10px] font-semibold tracking-[0.14em] text-[rgba(17,16,14,0.62)]">{text.logStatus}</p>
          <p className="mt-2 normal-case tracking-normal text-[13px] font-medium text-[rgba(17,16,14,0.82)]">{text.logBody}</p>
        </div>
      </div>
    </aside>
  );
}
