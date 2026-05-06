import { Link } from '@/i18n/routing';
import type { CanvasLocale, ProofStageId } from './SystemCanvas/canvasData';
import { getProofStage } from './SystemCanvas/canvasData';

type ProofCaseStripProps = {
  locale: CanvasLocale;
  activeStageId: ProofStageId;
};

type ProofCard = {
  href: string;
  stageIds: ProofStageId[];
  copy: Record<CanvasLocale, {
    label: string;
    title: string;
    description: string;
  }>;
};

const copy = {
  ko: {
    eyebrow: 'RELATED PROOF',
    title: '선택한 단계와 연결된 공개 산출물',
    viewAll: '전체 보기',
  },
  en: {
    eyebrow: 'RELATED PROOF',
    title: 'Public artifacts tied to the selected stage',
    viewAll: 'View all',
  },
};

const cards: ProofCard[] = [
  {
    href: '/workflow',
    stageIds: ['brief', 'monitor'],
    copy: {
      ko: {
        label: '운영 워크플로',
        title: '요청에서 운영 노트까지',
        description: '브리프와 운영 회고가 다음 작업의 입력으로 돌아가는 방식을 설명합니다.',
      },
      en: {
        label: 'Operating Workflow',
        title: 'From request to operating notes',
        description: 'Shows how briefs and retrospectives feed the next cycle of work.',
      },
    },
  },
  {
    href: '/harness',
    stageIds: ['harness', 'qa'],
    copy: {
      ko: {
        label: '품질 하네스',
        title: '검증 기준과 QA 게이트',
        description: '완료 주장을 뒷받침하는 검사, 금지 주장, 화면 확인 기준을 모읍니다.',
      },
      en: {
        label: 'Quality Harness',
        title: 'Verification rules and QA gate',
        description: 'Collects checks, banned claims, and screen-review rules behind completion claims.',
      },
    },
  },
  {
    href: '/blog/portfolio-content-proof-loop',
    stageIds: ['build', 'qa', 'proof'],
    copy: {
      ko: {
        label: '콘텐츠 증거 루프',
        title: '포트폴리오 콘텐츠 검증 기록',
        description: '공개 문구와 증거 경로를 맞추기 위해 사용한 검증 루프를 기록합니다.',
      },
      en: {
        label: 'Content Proof Loop',
        title: 'Portfolio content verification record',
        description: 'Documents the loop used to align public copy with the proof path.',
      },
    },
  },
  {
    href: '/projects',
    stageIds: ['build', 'deploy', 'proof'],
    copy: {
      ko: {
        label: '공개 프로젝트',
        title: '디스플레이 랩과 서비스 증거',
        description: '검증된 변경이 방문자가 확인할 수 있는 프로젝트 표면으로 이어집니다.',
      },
      en: {
        label: 'Public Projects',
        title: 'Display Lab and service proof',
        description: 'Connects verified work to project surfaces visitors can inspect.',
      },
    },
  },
];

export default function ProofCaseStrip({ locale, activeStageId }: ProofCaseStripProps) {
  const text = copy[locale];
  const activeStage = getProofStage(activeStageId);
  const sortedCards = [...cards].sort((a, b) => Number(b.stageIds.includes(activeStageId)) - Number(a.stageIds.includes(activeStageId)));
  const activeLabel = locale === 'ko'
    ? `단계 ${String(activeStage.order).padStart(2, '0')} 연결 증거`
    : `Stage ${String(activeStage.order).padStart(2, '0')} linked proof`;

  return (
    <section className="reference-case-strip border-t border-[rgba(243,238,229,0.12)] bg-[var(--sql-charcoal)] px-5 pb-8 pt-5 text-[var(--canvas-text)] sm:px-7">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--canvas-accent)]">
            {text.eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--canvas-text)]">
            {text.title}
          </h2>
        </div>
        <Link href="/projects" className="hidden shrink-0 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--canvas-text)] hover:text-[var(--canvas-accent)] sm:inline-flex">
          {text.viewAll} →
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sortedCards.map((card, index) => {
          const cardCopy = card.copy[locale];
          const active = card.stageIds.includes(activeStageId);

          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group overflow-hidden rounded-md border bg-[rgba(243,238,229,0.045)] shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-[rgba(201,58,49,0.65)] ${
                active ? 'border-[rgba(209,44,36,0.78)] shadow-[0_0_0_1px_rgba(209,44,36,0.22)]' : 'border-[rgba(243,238,229,0.11)]'
              }`}
            >
              <div className={`case-study-visual case-study-visual-${index}`} aria-hidden="true" />
              <div className="border-t border-[rgba(243,238,229,0.09)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(243,238,229,0.68)]">
                    {cardCopy.label}
                  </p>
                  <span className="text-lg text-[rgba(243,238,229,0.72)] transition group-hover:translate-x-1 group-hover:text-[var(--canvas-accent)]">↗</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold tracking-tight text-[var(--canvas-text)]">{cardCopy.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[rgba(243,238,229,0.74)]">{cardCopy.description}</p>
                {active && (
                  <span className="mt-4 inline-flex rounded-full border border-[rgba(209,44,36,0.46)] bg-[rgba(209,44,36,0.14)] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--canvas-text)]">
                    {activeLabel}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
