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
  const bend = from.y > to.y ? -7 : 7;

  return `M ${from.x} ${from.y} C ${midX} ${from.y + bend}, ${midX} ${to.y - bend}, ${to.x} ${to.y}`;
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
        <marker id="canvas-dot" markerHeight="4" markerWidth="4" refX="2" refY="2">
          <circle cx="2" cy="2" r="1.4" fill="var(--canvas-line-active)" />
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
            markerEnd={selected ? 'url(#canvas-dot)' : undefined}
            stroke={emphasized ? 'var(--canvas-line-active)' : 'var(--canvas-line)'}
            strokeDasharray={emphasized ? undefined : '3 5'}
            strokeLinecap="round"
            strokeWidth={emphasized ? 0.38 : 0.22}
            vectorEffect="non-scaling-stroke"
            className="transition-[stroke,stroke-width,opacity] duration-300"
            opacity={selected ? 0.95 : emphasized ? 0.58 : 0.42}
          />
        );
      })}
    </svg>
  );
}
