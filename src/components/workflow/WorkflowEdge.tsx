'use client';

// =============================================================================
// WorkflowEdge.tsx - 커스텀 애니메이션 엣지
// SVG path 위에 점이 흐르는 애니메이션 + 조건부 라벨 + 타입별 색상
// =============================================================================

import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { EDGE_COLORS, type EdgeType } from './constants/nodeStyles';

// ---------------------------------------------------------------------------
// Data Type
// ---------------------------------------------------------------------------
export interface WorkflowEdgeData {
  edgeType?: EdgeType;
  label?: string;
  animated?: boolean;
}

// ---------------------------------------------------------------------------
// Animated dot CSS (injected once via style tag approach, or inline)
// ---------------------------------------------------------------------------
const ANIMATION_KEYFRAMES = `
@keyframes flowDot {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function WorkflowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const edgeData = (data ?? {}) as WorkflowEdgeData;
  const edgeType: EdgeType = edgeData.edgeType ?? 'default';
  const label = edgeData.label;
  const showAnimation = edgeData.animated !== false;

  const colors = EDGE_COLORS[edgeType];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Use the light stroke; dark mode handled via CSS variables or direct check
  const strokeColor = colors.stroke;
  const dotColor = edgeType === 'success' ? '#22c55e' : edgeType === 'fail' ? '#ef4444' : '#6b7280';

  return (
    <>
      {/* Inject keyframes */}
      <style>{ANIMATION_KEYFRAMES}</style>

      {/* Base edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: 2,
          strokeDasharray: edgeType === 'conditional' ? '6 3' : undefined,
        }}
      />

      {/* Animated flowing dot */}
      {showAnimation && (
        <circle
          r={3}
          fill={dotColor}
          style={{
            offsetPath: `path('${edgePath}')`,
            animation: 'flowDot 2s linear infinite',
          }}
        />
      )}

      {/* Second dot with delay for continuous flow effect */}
      {showAnimation && (
        <circle
          r={3}
          fill={dotColor}
          style={{
            offsetPath: `path('${edgePath}')`,
            animation: 'flowDot 2s linear infinite',
            animationDelay: '-1s',
          }}
        />
      )}

      {/* Label */}
      {label && (
        <foreignObject
          width={80}
          height={24}
          x={labelX - 40}
          y={labelY - 12}
          className="pointer-events-none"
        >
          <div
            className={`
              flex items-center justify-center
              rounded-full px-2 py-0.5
              text-[10px] font-medium
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              shadow-sm
              ${edgeType === 'success' ? 'text-green-600 dark:text-green-400' : ''}
              ${edgeType === 'fail' ? 'text-red-600 dark:text-red-400' : ''}
              ${edgeType === 'conditional' ? 'text-amber-600 dark:text-amber-400' : ''}
              ${edgeType === 'default' ? 'text-gray-600 dark:text-gray-400' : ''}
            `}
          >
            {label}
          </div>
        </foreignObject>
      )}
    </>
  );
}

export const WorkflowEdge = memo(WorkflowEdgeComponent);
export default WorkflowEdge;
