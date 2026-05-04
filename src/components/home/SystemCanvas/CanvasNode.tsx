import type { CanvasLocale, CanvasNode as CanvasNodeType } from './canvasData';

const statusLabels: Record<CanvasNodeType['status'], Record<CanvasLocale, string>> = {
  documented: { ko: '문서화됨', en: 'Documented' },
  'in-progress': { ko: '진행중', en: 'In progress' },
  verified: { ko: '검증됨', en: 'Verified' },
  released: { ko: '반영됨', en: 'Released' },
  observed: { ko: '관찰됨', en: 'Observed' },
  recorded: { ko: '기록됨', en: 'Recorded' },
  'public-proof': { ko: '공개 증거', en: 'Public proof' },
};

type CanvasNodeProps = {
  node: CanvasNodeType;
  locale: CanvasLocale;
  active: boolean;
  onSelect: (id: string) => void;
};

export default function CanvasNode({ node, locale, active, onSelect }: CanvasNodeProps) {
  const copy = node.copy[locale];

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${copy.title}: ${copy.description}`}
      onClick={() => onSelect(node.id)}
      className={`canvas-node group w-36 rounded-2xl border p-3 text-left shadow-sm backdrop-blur-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 sm:w-40 ${
        active ? 'canvas-node-active scale-[1.02]' : 'hover:-translate-y-0.5'
      }`}
    >
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--canvas-muted)]">
        {copy.eyebrow}
      </span>
      <span className="block text-sm font-semibold leading-tight text-[var(--canvas-text)]">
        {copy.title}
      </span>
      <span className="mt-2 line-clamp-2 block text-[11px] leading-relaxed text-[var(--canvas-muted)]">
        {copy.description}
      </span>
      <span className="mt-3 inline-flex rounded-full border border-[var(--canvas-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--canvas-text)]">
        {statusLabels[node.status][locale]}
      </span>
    </button>
  );
}
