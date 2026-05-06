import type { CanvasLocale } from './SystemCanvas/canvasData';

type EditorialHeroPanelProps = {
  locale: CanvasLocale;
};

const copy = {
  ko: {
    eyebrow: 'AI PRODUCT STUDIO',
    title: '운영을\n디자인하는\nAI 제품 실험실',
    body: '사이드퀘스트랩은 AI 제품의 실험과 운영을 하나의 시스템으로 설계합니다.',
    principles: [
      ['01', 'Systems Thinking'],
      ['02', 'Experimental Mindset'],
      ['03', 'Operational Design'],
    ],
    logLabel: 'LATEST LOG',
    logTime: 'MAY 20, 2025   14:32',
    logStatus: 'DEPLOYMENT COMPLETED',
    logBody: 'Customer Onboarding v2.3.1',
  },
  en: {
    eyebrow: 'AI PRODUCT STUDIO',
    title: 'An AI\nproduct lab\nthat designs\noperations',
    body: 'SidequestLab designs AI product experiments and operations as a single system.',
    principles: [
      ['01', 'Systems Thinking'],
      ['02', 'Experimental Mindset'],
      ['03', 'Operational Design'],
    ],
    logLabel: 'LATEST LOG',
    logTime: 'MAY 20, 2025   14:32',
    logStatus: 'DEPLOYMENT COMPLETED',
    logBody: 'Customer Onboarding v2.3.1',
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

        <div className="relative z-10 mt-11 max-w-[15rem] divide-y divide-[rgba(17,16,14,0.18)] border-y border-[rgba(17,16,14,0.18)] bg-[rgba(243,238,229,0.72)] backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none">
          {text.principles.map(([number, title]) => (
            <div key={number} className="flex items-center gap-5 py-4 text-[13px] text-[var(--sql-ink)]">
              <span className="font-mono text-[10px] tracking-[0.18em] text-[rgba(17,16,14,0.62)]">{number}</span>
              <span className="flex-1 font-medium">{title}</span>
              <span className="text-xl leading-none">+</span>
            </div>
          ))}
        </div>

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
