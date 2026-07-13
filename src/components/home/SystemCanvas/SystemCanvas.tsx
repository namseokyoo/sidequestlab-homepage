'use client';

import { Link } from '@/i18n/routing';
import CanvasNode from './CanvasNode';
import { getProofStage, proofStages, type CanvasLocale, type ProofStageId } from './canvasData';

type SystemCanvasProps = {
  locale: CanvasLocale;
  activeStageId: ProofStageId;
  onStageSelect: (id: ProofStageId) => void;
};

const copy = {
  ko: {
    eyebrow: 'OPERATING PROOF TRAIL',
    desktopInstruction: '단계를 선택하면 아래 상세와 연결된 증거가 바뀝니다',
    mobileInstruction: '단계를 탭하면 상세와 연결 증거가 바뀝니다',
    detailEyebrow: '선택된 단계',
    proofLabel: '증명하는 것',
    artifactLabel: '연결된 산출물',
    relationTitle: '연결성이 보이는 구조',
    relationBody: '상단 rail은 전체 흐름, 큰 카드는 현재 선택, 아래 proof cards는 선택 단계의 증거입니다.',
    relationFoot: '선택한 단계와 직접 연결된 카드만 붉은 테두리로 강조합니다.',
    pathLabel: 'Brief -> Harness -> Build -> QA -> Deploy -> Monitor -> Public Proof',
  },
  en: {
    eyebrow: 'OPERATING PROOF TRAIL',
    desktopInstruction: 'Select a stage to update the detail and linked proof',
    mobileInstruction: 'Tap a stage to update detail and linked proof',
    detailEyebrow: 'Selected stage',
    proofLabel: 'What this proves',
    artifactLabel: 'Linked artifact',
    relationTitle: 'Connection made visible',
    relationBody: 'The top rail shows the whole flow, the large card shows the selected stage, and the proof cards below show linked evidence.',
    relationFoot: 'Only cards directly tied to the selected stage receive the red emphasis.',
    pathLabel: 'Brief -> Harness -> Build -> QA -> Deploy -> Monitor -> Public Proof',
  },
};

export default function SystemCanvas({ locale, activeStageId, onStageSelect }: SystemCanvasProps) {
  const activeStage = getProofStage(activeStageId);
  const activeCopy = activeStage.copy[locale];
  const text = copy[locale];

  return (
    <section
      data-canvas-theme="graphite"
      className="system-canvas-shell reference-system-canvas relative flex-1 overflow-hidden border-b border-[rgba(243,238,229,0.12)]"
      aria-label="Operating Proof Trail"
    >
      <div className="absolute inset-0 system-canvas-grid" aria-hidden="true" />
      <div className="absolute inset-0 system-canvas-grain" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[640px] flex-col px-5 pb-6 pt-7 sm:px-7 lg:min-h-[720px] xl:min-h-[760px]">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--canvas-text)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--canvas-accent)] shadow-[0_0_18px_rgba(209,44,36,0.55)]" />
            {text.eyebrow}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.17em] text-[rgba(243,238,229,0.74)] lg:inline">
            {text.desktopInstruction}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.17em] text-[rgba(243,238,229,0.74)] lg:hidden">
            {text.mobileInstruction}
          </span>
        </header>

        <p className="sr-only">{text.pathLabel}</p>

        <div className="mt-6 rounded-md border border-[rgba(243,238,229,0.12)] bg-[rgba(243,238,229,0.035)] p-3 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-4 lg:p-5">
          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            <div
              className="pointer-events-none absolute left-[7%] right-[7%] top-10 hidden h-0.5 bg-[linear-gradient(90deg,rgba(209,44,36,0.15),rgba(209,44,36,0.92),rgba(209,44,36,0.15))] lg:block"
              aria-hidden="true"
            />
            {proofStages.map((stage) => (
              <CanvasNode
                key={stage.id}
                stage={stage}
                locale={locale}
                active={stage.id === activeStageId}
                complete={stage.order <= activeStage.order}
                onSelect={onStageSelect}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.45fr)] xl:items-stretch">
          <aside className="canvas-card rounded-md border p-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-6 lg:p-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(243,238,229,0.66)]">
              {text.detailEyebrow} / {String(activeStage.order).padStart(2, '0')}
            </p>
            <h3 className="mt-3 max-w-2xl break-keep text-2xl font-semibold tracking-tight text-[var(--canvas-text)] sm:text-3xl lg:text-4xl">
              {activeCopy.title}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[rgba(243,238,229,0.82)] sm:text-base lg:text-lg">
              {activeCopy.description}
            </p>
            <dl className="mt-7 grid gap-5 text-sm sm:grid-cols-2 lg:text-base">
              <div className="border-t border-[rgba(243,238,229,0.16)] pt-4">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(243,238,229,0.62)]">
                  {text.proofLabel}
                </dt>
                <dd className="mt-2 leading-relaxed text-[var(--canvas-text)]">{activeCopy.proof}</dd>
              </div>
              <div className="border-t border-[rgba(243,238,229,0.16)] pt-4">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(243,238,229,0.62)]">
                  {text.artifactLabel}
                </dt>
                <dd className="mt-2 leading-relaxed text-[rgba(243,238,229,0.82)]">{activeCopy.artifact}</dd>
              </div>
            </dl>
            <Link
              href={activeCopy.href}
              className="mt-7 inline-flex items-center border-b border-[rgba(209,44,36,0.7)] pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--canvas-text)] hover:text-[var(--canvas-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--canvas-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas-bg)]"
            >
              {activeCopy.ctaLabel} →
            </Link>
          </aside>

          <aside className="rounded-md border border-[rgba(243,238,229,0.14)] bg-[rgba(243,238,229,0.045)] p-5 text-[var(--canvas-text)] shadow-xl shadow-black/10 backdrop-blur-md sm:p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--canvas-accent)]">
              Stage {String(activeStage.order).padStart(2, '0')}
            </p>
            <h4 className="mt-3 text-xl font-semibold tracking-tight">{text.relationTitle}</h4>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(243,238,229,0.78)]">{text.relationBody}</p>
            <div className="my-5 h-14 w-px bg-[linear-gradient(180deg,rgba(209,44,36,0.9),rgba(209,44,36,0.08))]" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-[rgba(243,238,229,0.82)]">
              <strong className="text-[var(--canvas-text)]">{activeCopy.shortTitle}</strong> — {text.relationFoot}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
