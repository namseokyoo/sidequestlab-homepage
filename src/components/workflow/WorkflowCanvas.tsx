'use client';

// =============================================================================
// WorkflowCanvas.tsx - React Flow 래퍼 컴포넌트
// ReactFlow + Background + Controls + MiniMap + 다크모드 연동
// =============================================================================

import { useCallback, useMemo, useState, type FC } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowNode, type WorkflowNodeData } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { WorkflowTooltip, type WorkflowTooltipData } from './WorkflowTooltip';
import { WorkflowDetailPanel, type WorkflowDetailData } from './WorkflowDetailPanel';
import { ROLE_COLORS } from './constants/nodeStyles';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface WorkflowCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  className?: string;
  onNodeClick?: (data: WorkflowNodeData) => void;
}

// ---------------------------------------------------------------------------
// Custom node & edge type registrations
// ---------------------------------------------------------------------------
const nodeTypes: NodeTypes = {
  workflow: WorkflowNode as unknown as NodeTypes[string],
};

const edgeTypes: EdgeTypes = {
  workflow: WorkflowEdge as unknown as EdgeTypes[string],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const WorkflowCanvas: FC<WorkflowCanvasProps> = ({
  initialNodes,
  initialEdges,
  className = '',
  onNodeClick: externalOnNodeClick,
}) => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: WorkflowTooltipData | null;
  }>({ visible: false, x: 0, y: 0, data: null });

  // Detail panel state
  const [detailPanel, setDetailPanel] = useState<{
    open: boolean;
    data: WorkflowDetailData | null;
  }>({ open: false, data: null });

  // -------------------------------------------------------------------------
  // Tooltip handlers (injected into node data)
  // -------------------------------------------------------------------------
  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, data: WorkflowNodeData) => {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        data: {
          role: data.role,
          label: data.label,
          description: data.description,
          rules: data.rules,
        },
      });
    },
    [],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // -------------------------------------------------------------------------
  // Detail panel handler
  // -------------------------------------------------------------------------
  const handleNodeClick = useCallback(
    (data: WorkflowNodeData) => {
      setDetailPanel({
        open: true,
        data: {
          title: data.label,
          description: data.description,
          role: data.role,
          rules: data.rules,
          examples: data.examples,
        },
      });
      externalOnNodeClick?.(data);
    },
    [externalOnNodeClick],
  );

  const handleClosePanel = useCallback(() => {
    setDetailPanel({ open: false, data: null });
  }, []);

  // -------------------------------------------------------------------------
  // Augment nodes with tooltip/click handlers
  // -------------------------------------------------------------------------
  const augmentedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onMouseEnter: handleNodeMouseEnter,
        onMouseLeave: handleNodeMouseLeave,
        onClick: handleNodeClick,
      },
    }));
  }, [nodes, handleNodeMouseEnter, handleNodeMouseLeave, handleNodeClick]);

  // -------------------------------------------------------------------------
  // MiniMap node color
  // -------------------------------------------------------------------------
  const miniMapNodeColor = useCallback((node: Node) => {
    const data = node.data as unknown as WorkflowNodeData | undefined;
    if (data?.role) {
      const colors = ROLE_COLORS[data.role];
      // Return a simple hex for minimap
      const colorMap: Record<string, string> = {
        ceo: '#3b82f6',
        dev: '#10b981',
        qa: '#f59e0b',
        devops: '#ef4444',
        advisor: '#8b5cf6',
        historian: '#6366f1',
        content: '#ec4899',
        growth: '#14b8a6',
        chairman: '#eab308',
      };
      return colorMap[data.role] ?? '#9ca3af';
    }
    return '#9ca3af';
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className={`relative w-full h-full ${className}`}>
      <ReactFlow
        nodes={augmentedNodes}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange<Node>}
        onEdgesChange={onEdgesChange as OnEdgesChange<Edge>}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-white dark:bg-gray-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
          className="dark:!bg-gray-950 [&>*]:dark:!stroke-gray-800"
        />
        <Controls
          className="
            !bg-white dark:!bg-gray-800
            !border-gray-200 dark:!border-gray-700
            !shadow-md
            [&>button]:!bg-white [&>button]:dark:!bg-gray-800
            [&>button]:!border-gray-200 [&>button]:dark:!border-gray-700
            [&>button]:!text-gray-600 [&>button]:dark:!text-gray-300
            [&>button:hover]:!bg-gray-50 [&>button:hover]:dark:!bg-gray-700
          "
          showInteractive={false}
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="
            !bg-white dark:!bg-gray-800
            !border-gray-200 dark:!border-gray-700
            !shadow-md !rounded-lg
          "
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Tooltip overlay */}
      <WorkflowTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        data={tooltip.data}
      />

      {/* Detail panel */}
      <WorkflowDetailPanel
        open={detailPanel.open}
        onClose={handleClosePanel}
        data={detailPanel.data}
      />
    </div>
  );
};

export default WorkflowCanvas;
