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
      className={`canvas-node group relative w-full rounded-md border px-4 py-3 text-left shadow-2xl shadow-black/20 backdrop-blur-md transition duration-200 focus-visible:outline-none focus-visible:ring-2 lg:w-40 xl:w-44 ${
        active ? 'canvas-node-active scale-[1.025]' : 'hover:-translate-y-0.5'
      }`}
    >
      <span className="mb-3 flex items-center justify-between gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold ${
            active
              ? 'border-[var(--canvas-accent)] bg-[var(--canvas-accent)] text-white'
              : complete
                ? 'border-[rgba(209,44,36,0.65)] text-[var(--canvas-accent)]'
                : 'border-[rgba(243,238,229,0.22)] text-[rgba(243,238,229,0.7)]'
          }`}
        >
          {stage.order}
        </span>
        <span className="rounded-full border border-[rgba(243,238,229,0.14)] bg-[rgba(243,238,229,0.07)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(243,238,229,0.82)]">
          {copy.statusLabel}
        </span>
      </span>

      <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(243,238,229,0.78)]">
        {copy.eyebrow}
      </span>
      <span className="mt-1 flex items-center justify-between gap-3 text-sm font-semibold leading-snug text-[var(--canvas-text)]">
        <span>
          <span className="hidden lg:inline">{copy.shortTitle}</span>
          <span className="lg:hidden">{copy.mobileTitle}</span>
        </span>
        <span className="text-[rgba(243,238,229,0.55)] transition group-hover:translate-x-0.5 group-hover:text-[var(--canvas-accent)]" aria-hidden="true">→</span>
      </span>
      {active && (
        <span className="mt-2 inline-flex rounded-full border border-[rgba(209,44,36,0.5)] bg-[rgba(209,44,36,0.16)] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--canvas-text)]">
          {selectedLabel}
        </span>
      )}
      <span className="mt-2 block text-[12px] leading-relaxed text-[rgba(243,238,229,0.78)]">
        {copy.description}
      </span>
    </button>
  );
}
