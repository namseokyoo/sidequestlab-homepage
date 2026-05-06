import type { CanvasLocale, ProofStage, ProofStageId } from './canvasData';

type CanvasNodeProps = {
  stage: ProofStage;
  locale: CanvasLocale;
  active: boolean;
  complete: boolean;
  onSelect: (id: ProofStageId) => void;
};

export default function CanvasNode({ stage, locale, active, complete, onSelect }: CanvasNodeProps) {
  const copy = stage.copy[locale];
  const selectedLabel = locale === 'ko' ? '선택됨' : 'Selected';

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${stage.order}. ${copy.title}`}
      onClick={() => onSelect(stage.id)}
      className={`group relative flex h-full min-h-[6.4rem] w-full flex-col rounded-md border px-3 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--canvas-accent)] sm:min-h-[7rem] ${
        active
          ? 'border-[rgba(209,44,36,0.92)] bg-[linear-gradient(180deg,rgba(209,44,36,0.22),rgba(28,27,25,0.96))] shadow-[0_0_0_1px_rgba(209,44,36,0.28),0_20px_70px_rgba(209,44,36,0.13)]'
          : 'border-[rgba(243,238,229,0.13)] bg-[rgba(243,238,229,0.045)] hover:-translate-y-0.5 hover:border-[rgba(209,44,36,0.45)] hover:bg-[rgba(243,238,229,0.07)]'
      }`}
    >
      <span className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold ${
            active
              ? 'border-[var(--canvas-accent)] bg-[var(--canvas-accent)] text-white'
              : complete
                ? 'border-[rgba(209,44,36,0.65)] text-[var(--canvas-accent)]'
                : 'border-[rgba(243,238,229,0.22)] text-[rgba(243,238,229,0.7)]'
          }`}
        >
          {String(stage.order).padStart(2, '0')}
        </span>
        <span className="rounded-full border border-[rgba(243,238,229,0.14)] bg-[rgba(243,238,229,0.07)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[rgba(243,238,229,0.82)]">
          {copy.statusLabel}
        </span>
      </span>

      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.11em] text-[rgba(243,238,229,0.72)]">
        {copy.eyebrow}
      </span>
      <span className="mt-1 flex items-start justify-between gap-2 text-sm font-semibold leading-snug text-[var(--canvas-text)]">
        <span>
          <span className="hidden xl:inline">{copy.shortTitle}</span>
          <span className="xl:hidden">{copy.mobileTitle}</span>
        </span>
        <span className="text-[rgba(243,238,229,0.48)] transition group-hover:translate-x-0.5 group-hover:text-[var(--canvas-accent)]" aria-hidden="true">
          →
        </span>
      </span>
      {active && (
        <span className="mt-auto inline-flex w-fit rounded-full border border-[rgba(209,44,36,0.55)] bg-[rgba(209,44,36,0.18)] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--canvas-text)]">
          {selectedLabel}
        </span>
      )}
    </button>
  );
}
