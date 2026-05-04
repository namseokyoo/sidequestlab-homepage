import { Link } from '@/i18n/routing';
import type { CanvasLocale } from './SystemCanvas/canvasData';

type ProofCaseStripProps = {
  locale: CanvasLocale;
  projectCount: number;
  serviceCount: number;
};

const copy = {
  ko: {
    heading: '증거로 이어지는 공개 표면',
    body: '성과를 과장하지 않고, 외부 방문자가 바로 확인할 수 있는 프로젝트·운영 방식·검증 기록으로 연결합니다.',
    cards: [
      { label: 'Public Projects', title: '프로젝트 증거', desc: '공개 프로젝트와 운영 중인 서비스를 한 곳에서 확인합니다.', href: '/projects', cta: '프로젝트 보기' },
      { label: 'Operating Workflow', title: '운영 방식', desc: '아이디어가 QA와 배포까지 이동하는 작업 프로토콜을 공개합니다.', href: '/workflow', cta: '워크플로우 보기' },
      { label: 'QA Harness', title: '검증 체계', desc: '테스트, 품질 게이트, 공개 전 확인 과정을 포트폴리오의 일부로 둡니다.', href: '/harness', cta: '하네스 보기' },
      { label: 'Company Record', title: '맥락과 회고', desc: '조직 구조와 기록을 통해 어떤 방식으로 계속 개선하는지 보여줍니다.', href: '/about', cta: '소개 보기' },
    ],
    projectCount: '기록된 프로젝트',
    serviceCount: '운영 표면',
  },
  en: {
    heading: 'Public surfaces connected by proof',
    body: 'No inflated claims: visitors move through projects, operating methods, and verification records they can inspect.',
    cards: [
      { label: 'Public Projects', title: 'Project evidence', desc: 'Explore public projects and services currently represented in the portfolio.', href: '/projects', cta: 'View projects' },
      { label: 'Operating Workflow', title: 'Operating method', desc: 'See how ideas move through QA, deployment, and review protocols.', href: '/workflow', cta: 'View workflow' },
      { label: 'QA Harness', title: 'Verification system', desc: 'Tests, quality gates, and pre-publication checks remain part of the portfolio.', href: '/harness', cta: 'View harness' },
      { label: 'Company Record', title: 'Context & retrospectives', desc: 'Organization and records show how the system keeps improving.', href: '/about', cta: 'View about' },
    ],
    projectCount: 'Recorded projects',
    serviceCount: 'Operating surfaces',
  },
};

export default function ProofCaseStrip({ locale, projectCount, serviceCount }: ProofCaseStripProps) {
  const text = copy[locale];

  return (
    <section className="border-t border-[rgba(17,16,14,0.1)] bg-[var(--sql-paper)] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--sql-red-muted)]">Proof Wall</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--sql-ink)] sm:text-4xl">
              {text.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgba(17,16,14,0.66)]">
              {text.body}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-md lg:ml-auto">
            <div className="rounded-3xl border border-[rgba(17,16,14,0.12)] bg-white/60 p-4">
              <div className="text-3xl font-black tracking-tight text-[var(--sql-ink)]">{projectCount}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[rgba(17,16,14,0.54)]">{text.projectCount}</div>
            </div>
            <div className="rounded-3xl border border-[rgba(17,16,14,0.12)] bg-white/60 p-4">
              <div className="text-3xl font-black tracking-tight text-[var(--sql-ink)]">{serviceCount}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[rgba(17,16,14,0.54)]">{text.serviceCount}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {text.cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-3xl border border-[rgba(17,16,14,0.12)] bg-white/70 p-5 shadow-sm shadow-black/0 transition hover:-translate-y-1 hover:border-[var(--sql-red-muted)] hover:shadow-xl hover:shadow-black/5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--sql-red-muted)]">{card.label}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--sql-ink)]">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[rgba(17,16,14,0.62)]">{card.desc}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-[var(--sql-ink)] group-hover:text-[var(--sql-red-muted)]">
                {card.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
