import { canvasEdges, canvasNodes } from './canvasData';

type CanvasEdgeLayerProps = {
  activeNodeId: string;
};

function getNodePoint(id: string) {
  const node = canvasNodes.find((item) => item.id === id) ?? canvasNodes[0];
  return { x: node.x, y: node.y };
}

function pathBetween(fromId: string, toId: string) {
  const from = getNodePoint(fromId);
  const to = getNodePoint(toId);
  const midX = (from.x + to.x) / 2;
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const bend = Math.min(12, Math.max(5, distance / 6));
  const sweep = from.y > to.y ? -bend : bend;

  return `M ${from.x} ${from.y} C ${midX} ${from.y + sweep}, ${midX} ${to.y - sweep}, ${to.x} ${to.y}`;
}

export default function CanvasEdgeLayer({ activeNodeId }: CanvasEdgeLayerProps) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <filter id="red-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.45" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="canvas-dot" markerHeight="5" markerWidth="5" refX="2.5" refY="2.5">
          <circle cx="2.5" cy="2.5" r="1.4" fill="var(--canvas-line-active)" />
        </marker>
      </defs>

      {canvasEdges.map((edge) => {
        const selected = edge.from === activeNodeId || edge.to === activeNodeId;
        const emphasized = selected || edge.active;
        return (
          <path
            key={edge.id}
            d={pathBetween(edge.from, edge.to)}
            fill="none"
            markerEnd={emphasized ? 'url(#canvas-dot)' : undefined}
            stroke={emphasized ? 'var(--canvas-line-active)' : 'var(--canvas-line)'}
            strokeDasharray={emphasized ? undefined : '2 5'}
            strokeLinecap="round"
            strokeWidth={emphasized ? 0.34 : 0.18}
            vectorEffect="non-scaling-stroke"
            filter={emphasized ? 'url(#red-path-glow)' : undefined}
            className="transition-[stroke,stroke-width,opacity] duration-300"
            opacity={selected ? 0.96 : emphasized ? 0.78 : 0.35}
          />
        );
      })}

      {canvasNodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r="0.75" fill="var(--sql-charcoal)" stroke="var(--canvas-line-active)" strokeWidth="0.2" />
          <circle cx={node.x} cy={node.y} r="1.25" fill="none" stroke="rgba(243,238,229,0.32)" strokeWidth="0.13" />
        </g>
      ))}
    </svg>
  );
}
