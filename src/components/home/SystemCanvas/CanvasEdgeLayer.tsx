import { proofStages, type ProofStageId } from './canvasData';

type CanvasEdgeLayerProps = {
  activeStageId: ProofStageId;
};

function pathBetween(from: (typeof proofStages)[number], to: (typeof proofStages)[number]) {
  const midX = (from.x + to.x) / 2;
  const bend = from.y > to.y ? -7 : 7;

  return `M ${from.x} ${from.y} C ${midX} ${from.y + bend}, ${midX} ${to.y - bend}, ${to.x} ${to.y}`;
}

export default function CanvasEdgeLayer({ activeStageId }: CanvasEdgeLayerProps) {
  const activeStage = proofStages.find((stage) => stage.id === activeStageId) ?? proofStages[0];
  const segments = proofStages.slice(0, -1).map((stage, index) => ({
    id: `${stage.id}-${proofStages[index + 1].id}`,
    from: stage,
    to: proofStages[index + 1],
  }));

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <filter id="proof-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {segments.map((segment) => {
        const complete = segment.to.order <= activeStage.order;
        return (
          <path
            key={segment.id}
            d={pathBetween(segment.from, segment.to)}
            fill="none"
            stroke={complete ? 'var(--canvas-line-active)' : 'var(--canvas-line)'}
            strokeDasharray={complete ? undefined : '2 5'}
            strokeLinecap="round"
            strokeWidth={complete ? 0.42 : 0.2}
            vectorEffect="non-scaling-stroke"
            filter={complete ? 'url(#proof-path-glow)' : undefined}
            className="transition-[stroke,stroke-width,opacity] duration-300"
            opacity={complete ? 0.95 : 0.38}
          />
        );
      })}

      {proofStages.map((stage) => {
        const complete = stage.order <= activeStage.order;
        return (
          <g key={stage.id}>
            <circle
              cx={stage.x}
              cy={stage.y}
              r={stage.id === activeStageId ? 1.35 : 0.9}
              fill={stage.id === activeStageId ? 'var(--canvas-line-active)' : 'var(--sql-charcoal)'}
              stroke={complete ? 'var(--canvas-line-active)' : 'rgba(243,238,229,0.42)'}
              strokeWidth="0.18"
            />
            <circle
              cx={stage.x}
              cy={stage.y}
              r={stage.id === activeStageId ? 2.2 : 1.45}
              fill="none"
              stroke={complete ? 'rgba(207,48,39,0.44)' : 'rgba(243,238,229,0.18)'}
              strokeWidth="0.13"
            />
          </g>
        );
      })}
    </svg>
  );
}
