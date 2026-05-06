import type { CanvasLocale, CanvasNode as CanvasNodeType } from './canvasData';

const iconByType: Record<CanvasNodeType['type'], string> = {
  intake: '⌘',
  build: '♙',
  qa: '♢',
  deploy: '⌁',
  monitoring: '⌁',
  decision: '▭',
  proof: '•',
};

const widthBySize: Record<NonNullable<CanvasNodeType['size']>, string> = {
  sm: 'w-full lg:w-32',
  md: 'w-full lg:w-44',
  lg: 'w-full lg:w-56',
};

type CanvasNodeProps = {
  node: CanvasNodeType;
  locale: CanvasLocale;
  active: boolean;
  onSelect: (id: string) => void;
};

export default function CanvasNode({ node, locale, active, onSelect }: CanvasNodeProps) {
  const copy = node.copy[locale];
  const width = widthBySize[node.size ?? 'md'];

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${copy.eyebrow}: ${copy.title}`}
      onClick={() => onSelect(node.id)}
      className={`canvas-node group relative ${width} rounded-md border px-4 py-3 text-left shadow-2xl shadow-black/20 backdrop-blur-md transition duration-200 focus-visible:outline-none focus-visible:ring-2 ${
        active ? 'canvas-node-active scale-[1.025]' : 'hover:-translate-y-0.5'
      }`}
    >
      <span className="absolute -left-1.5 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full border border-[var(--canvas-accent)] bg-[var(--sql-charcoal)] shadow-[0_0_0_3px_rgba(198,58,49,0.18)] lg:block" />
      <span className="absolute -right-1.5 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full border border-[var(--canvas-accent)] bg-[var(--sql-charcoal)] shadow-[0_0_0_3px_rgba(198,58,49,0.14)] lg:block" />

      <span className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--canvas-text)]">
        <span className="text-[var(--canvas-muted)]">{iconByType[node.type]}</span>
        {copy.eyebrow}
      </span>

      <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--canvas-text)]">
        {copy.title}
      </span>
      <span className="mt-2 block text-[13px] leading-relaxed text-[rgba(243,238,229,0.88)]">
        {copy.description}
      </span>

      {node.id === 'intake' && (
        <span className="mt-4 block">
          <span className="mb-2 flex items-center justify-between font-mono text-[10px] text-[rgba(243,238,229,0.82)]">
            <span />
            <span className="text-[var(--canvas-text)]">76%</span>
          </span>
          <span className="block h-1 overflow-hidden rounded-full bg-[rgba(243,238,229,0.14)]">
            <span className="block h-full w-[76%] bg-[var(--canvas-accent)]" />
          </span>
        </span>
      )}
    </button>
  );
}
