'use client';

import { Link } from '@/i18n/routing';
import CanvasEdgeLayer from './CanvasEdgeLayer';
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
    desktopInstruction: '증거 경로의 단계를 선택하세요',
    mobileInstruction: '증거 경로를 탭해서 확인하세요',
    detailEyebrow: '선택된 단계',
    proofLabel: '증명하는 것',
    artifactLabel: '연결된 산출물',
    pathLabel: 'Brief -> Harness -> Build -> QA -> Deploy -> Monitor -> Public Proof',
  },
  en: {
    eyebrow: 'OPERATING PROOF TRAIL',
    desktopInstruction: 'Select a stage to trace the evidence path',
    mobileInstruction: 'Tap through the proof trail',
    detailEyebrow: 'Selected stage',
    proofLabel: 'What this proves',
    artifactLabel: 'Linked artifact',
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
      className="system-canvas-shell reference-system-canvas relative min-h-[640px] flex-1 overflow-hidden border-b border-[rgba(243,238,229,0.12)]"
      aria-label="Operating Proof Trail"
    >
      <div className="absolute inset-0 system-canvas-grid" aria-hidden="true" />
      <div className="absolute inset-0 system-canvas-grain" aria-hidden="true" />

      <header className="relative z-20 flex flex-col gap-2 px-5 pt-7 sm:px-7 lg:flex-row lg:items-center lg:gap-5">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--canvas-text)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--canvas-accent)]" />
          {text.eyebrow}
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.17em] text-[rgba(243,238,229,0.74)] lg:inline">
          {text.desktopInstruction}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.17em] text-[rgba(243,238,229,0.74)] lg:hidden">
          {text.mobileInstruction}
        </span>
      </header>

      <div className="relative z-10 px-5 pb-6 pt-5 sm:px-7 lg:min-h-[590px] lg:pt-2">
        <p className="sr-only">{text.pathLabel}</p>

        <div className="hidden lg:block">
          <CanvasEdgeLayer activeStageId={activeStageId} />
          {proofStages.map((stage) => (
            <div
              key={stage.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${stage.x}%`, top: `${stage.y}%` }}
            >
              <CanvasNode
                stage={stage}
                locale={locale}
                active={stage.id === activeStageId}
                complete={stage.order <= activeStage.order}
                onSelect={onStageSelect}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:hidden">
          {proofStages.map((stage) => (
            <div key={stage.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-3 h-2.5 w-2.5 rounded-full ${
                    stage.order <= activeStage.order ? 'bg-[var(--canvas-accent)]' : 'bg-[rgba(243,238,229,0.24)]'
                  }`}
                />
                {stage.order < proofStages.length && (
                  <span
                    className={`mt-1 h-full min-h-12 w-px ${
                      stage.order < activeStage.order ? 'bg-[rgba(209,44,36,0.7)]' : 'bg-[rgba(243,238,229,0.16)]'
                    }`}
                  />
                )}
              </div>
              <CanvasNode
                stage={stage}
                locale={locale}
                active={stage.id === activeStageId}
                complete={stage.order <= activeStage.order}
                onSelect={onStageSelect}
              />
            </div>
          ))}
        </div>

        <aside className="canvas-card pointer-events-none mt-5 rounded-md border p-5 shadow-2xl shadow-black/20 backdrop-blur-md lg:absolute lg:bottom-8 lg:left-7 lg:mt-0 lg:w-[min(31rem,48%)]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(243,238,229,0.66)]">
            {text.detailEyebrow} / {String(activeStage.order).padStart(2, '0')}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--canvas-text)]">
            {activeCopy.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[rgba(243,238,229,0.78)]">
            {activeCopy.description}
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(243,238,229,0.58)]">
                {text.proofLabel}
              </dt>
              <dd className="mt-1 leading-relaxed text-[var(--canvas-text)]">{activeCopy.proof}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(243,238,229,0.58)]">
                {text.artifactLabel}
              </dt>
              <dd className="mt-1 leading-relaxed text-[rgba(243,238,229,0.78)]">{activeCopy.artifact}</dd>
            </div>
          </dl>
          <Link
            href={activeCopy.href}
            className="pointer-events-auto mt-5 inline-flex items-center border-b border-[rgba(209,44,36,0.7)] pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--canvas-text)] hover:text-[var(--canvas-accent)]"
          >
            {activeCopy.ctaLabel} →
          </Link>
        </aside>
      </div>
    </section>
  );
}
