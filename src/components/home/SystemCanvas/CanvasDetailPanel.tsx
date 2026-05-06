import type { CanvasLocale, CanvasNode } from './canvasData';

type CanvasDetailPanelProps = {
  node: CanvasNode;
  locale: CanvasLocale;
};

const labels = {
  ko: {
    title: 'Selected proof path',
    proves: '무엇을 증명하나',
    artifact: '공개 산출물',
  },
  en: {
    title: 'Selected proof path',
    proves: 'What this proves',
    artifact: 'Public artifact',
  },
};

export default function CanvasDetailPanel({ node, locale }: CanvasDetailPanelProps) {
  const copy = node.copy[locale];
  const label = labels[locale];

  return (
    <aside className="canvas-card rounded-3xl border p-4 shadow-sm backdrop-blur-md">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--canvas-muted)]">
        {label.title}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--canvas-text)]">
        {copy.title}
      </h3>
      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--canvas-muted)]">
            {label.proves}
          </dt>
          <dd className="mt-1 leading-relaxed text-[var(--canvas-text)]">{copy.proof}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--canvas-muted)]">
            {label.artifact}
          </dt>
          <dd className="mt-1 leading-relaxed text-[var(--canvas-muted)]">{copy.artifact}</dd>
        </div>
      </dl>
    </aside>
  );
}
