import { Link } from '@/i18n/routing';
import type { CanvasLocale } from './SystemCanvas/canvasData';

type ProofCaseStripProps = {
  locale: CanvasLocale;
};

const copy = {
  ko: {
    tabs: ['CASE STUDIES', 'SYSTEMS', 'EXPERIMENTS', 'DEPLOYMENTS'],
    viewAll: 'VIEW ALL',
    cards: [
      { label: 'SaaS · AI/ML', title: 'Intelligent Onboarding', href: '/projects' },
      { label: 'Fintech · ML Ops', title: 'Pricing Optimization', href: '/workflow' },
      { label: 'Media · LLM Ops', title: 'Content Generation Pipeline', href: '/harness' },
      { label: 'SaaS · NLP', title: 'Support Automation', href: '/about' },
    ],
  },
  en: {
    tabs: ['CASE STUDIES', 'SYSTEMS', 'EXPERIMENTS', 'DEPLOYMENTS'],
    viewAll: 'VIEW ALL',
    cards: [
      { label: 'SaaS · AI/ML', title: 'Intelligent Onboarding', href: '/projects' },
      { label: 'Fintech · ML Ops', title: 'Pricing Optimization', href: '/workflow' },
      { label: 'Media · LLM Ops', title: 'Content Generation Pipeline', href: '/harness' },
      { label: 'SaaS · NLP', title: 'Support Automation', href: '/about' },
    ],
  },
};

export default function ProofCaseStrip({ locale }: ProofCaseStripProps) {
  const text = copy[locale];

  return (
    <section className="reference-case-strip border-t border-[rgba(243,238,229,0.12)] bg-[var(--sql-charcoal)] px-7 pb-8 pt-5 text-[var(--canvas-text)]">
      <div className="flex items-center justify-between gap-5 font-mono text-[10px] uppercase tracking-[0.14em]">
        <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-x-5 gap-y-2 text-[rgba(243,238,229,0.82)] sm:flex-nowrap sm:justify-between sm:overflow-x-auto">
          {text.tabs.map((tab, index) => (
            <span key={tab} className={`whitespace-nowrap ${index === 0 ? 'font-semibold text-[var(--canvas-text)]' : ''}`}>
              {index === 0 && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--canvas-accent)] align-middle" />}
              {tab}
            </span>
          ))}
        </nav>
        <Link href="/projects" className="hidden shrink-0 whitespace-nowrap font-semibold text-[var(--canvas-text)] hover:text-[var(--canvas-accent)] sm:inline-flex">
          {text.viewAll} →
        </Link>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {text.cards.map((card, index) => (
          <Link
            key={card.title}
            href={card.href}
            className="group overflow-hidden rounded border border-[rgba(243,238,229,0.11)] bg-[rgba(243,238,229,0.045)] shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-[rgba(201,58,49,0.65)]"
          >
            <div className={`case-study-visual case-study-visual-${index}`} aria-hidden="true" />
            <div className="flex items-start justify-between gap-3 border-t border-[rgba(243,238,229,0.09)] p-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-[var(--canvas-text)]">{card.title}</h3>
                <p className="mt-2 text-xs font-medium text-[rgba(243,238,229,0.74)]">{card.label}</p>
              </div>
              <span className="text-lg text-[rgba(243,238,229,0.72)] transition group-hover:translate-x-1 group-hover:text-[var(--canvas-accent)]">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
