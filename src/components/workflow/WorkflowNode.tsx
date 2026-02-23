'use client';

// =============================================================================
// WorkflowNode.tsx - 커스텀 React Flow 노드 컴포넌트
// 역할별 색상 + 아이콘 배지 + 호버 스케일 + 다양한 노드 타입
// =============================================================================

import { memo, useCallback, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  ROLE_COLORS,
  NODE_TYPE_STYLES,
  type AgentRole,
  type WorkflowNodeType,
} from './constants/nodeStyles';

// ---------------------------------------------------------------------------
// Data Type
// ---------------------------------------------------------------------------
export interface WorkflowNodeData {
  label: string;
  description?: string;
  role: AgentRole;
  nodeType: WorkflowNodeType;
  rules?: string[];
  examples?: string[];
  onClick?: (data: WorkflowNodeData) => void;
  onMouseEnter?: (event: React.MouseEvent, data: WorkflowNodeData) => void;
  onMouseLeave?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function WorkflowNodeComponent({ data, selected }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as unknown as WorkflowNodeData;
  const { label, description, role, nodeType, onClick, onMouseEnter, onMouseLeave } = nodeData;

  const roleColor = ROLE_COLORS[role];
  const typeStyle = NODE_TYPE_STYLES[nodeType];

  const handleClick = useCallback(() => {
    onClick?.(nodeData);
  }, [onClick, nodeData]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      setIsHovered(true);
      onMouseEnter?.(e, nodeData);
    },
    [onMouseEnter, nodeData],
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onMouseLeave?.();
  }, [onMouseLeave]);

  // -------------------------------------------------------------------------
  // Decision node (diamond shape)
  // -------------------------------------------------------------------------
  if (nodeType === 'decision') {
    return (
      <div className="relative" style={{ width: typeStyle.minWidth, height: typeStyle.minHeight }}>
        {/* Handles */}
        <Handle type="target" position={Position.Top} className="!bg-gray-400 dark:!bg-gray-500" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-gray-400 dark:!bg-gray-500" />
        <Handle type="source" position={Position.Left} id="left" className="!bg-gray-400 dark:!bg-gray-500" />
        <Handle type="source" position={Position.Right} id="right" className="!bg-gray-400 dark:!bg-gray-500" />

        <motion.div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Diamond rotated 45deg */}
          <div
            className={`
              absolute inset-[15%] border-2 rotate-45
              ${roleColor.bg} ${roleColor.border}
              ${roleColor.darkBg} ${roleColor.darkBorder}
              ${selected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}
              ${isHovered ? roleColor.bgHover.replace('hover:', '') + ' ' + roleColor.darkBgHover.replace('dark:hover:', 'dark:') : ''}
              transition-shadow duration-200
              shadow-sm hover:shadow-md
            `}
          />
          {/* Content (not rotated) */}
          <div className="relative z-10 flex flex-col items-center gap-1 text-center px-2">
            <span className="text-lg">{roleColor.emoji}</span>
            <span className={`text-xs font-semibold leading-tight ${roleColor.text} ${roleColor.darkText}`}>
              {label}
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Start / End node (circle)
  // -------------------------------------------------------------------------
  if (nodeType === 'start' || nodeType === 'end') {
    return (
      <>
        {nodeType === 'start' && (
          <Handle type="source" position={Position.Bottom} className="!bg-gray-400 dark:!bg-gray-500" />
        )}
        {nodeType === 'end' && (
          <Handle type="target" position={Position.Top} className="!bg-gray-400 dark:!bg-gray-500" />
        )}

        <motion.div
          className={`
            flex items-center justify-center cursor-pointer
            border-2 rounded-full
            ${roleColor.bg} ${roleColor.border}
            ${roleColor.darkBg} ${roleColor.darkBorder}
            ${selected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}
            shadow-sm hover:shadow-md transition-shadow duration-200
          `}
          style={{ width: typeStyle.minWidth, height: typeStyle.minHeight }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-base">{roleColor.emoji}</span>
            <span className={`text-[10px] font-semibold ${roleColor.text} ${roleColor.darkText}`}>
              {label}
            </span>
          </div>
        </motion.div>
      </>
    );
  }

  // -------------------------------------------------------------------------
  // Gate node (shield shape - rounded with badge)
  // -------------------------------------------------------------------------
  if (nodeType === 'gate') {
    return (
      <>
        <Handle type="target" position={Position.Top} className="!bg-gray-400 dark:!bg-gray-500" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-gray-400 dark:!bg-gray-500" />
        <Handle type="source" position={Position.Right} id="right" className="!bg-gray-400 dark:!bg-gray-500" />
        <Handle type="source" position={Position.Left} id="left" className="!bg-gray-400 dark:!bg-gray-500" />

        <motion.div
          className={`
            relative flex items-center gap-2 cursor-pointer
            border-2 ${typeStyle.borderRadius} ${typeStyle.padding}
            ${roleColor.bg} ${roleColor.border}
            ${roleColor.darkBg} ${roleColor.darkBorder}
            ${selected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}
            shadow-sm hover:shadow-md transition-shadow duration-200
          `}
          style={{ minWidth: typeStyle.minWidth, minHeight: typeStyle.minHeight }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Shield icon */}
          <div className="flex-shrink-0 text-lg">🛡️</div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-bold leading-tight ${roleColor.text} ${roleColor.darkText}`}>
              {label}
            </span>
            {description && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                {description}
              </span>
            )}
          </div>
          {/* Role badge */}
          <span
            className={`
              absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
              rounded-full text-xs border
              ${roleColor.bg} ${roleColor.border}
              ${roleColor.darkBg} ${roleColor.darkBorder}
            `}
          >
            {roleColor.emoji}
          </span>
        </motion.div>
      </>
    );
  }

  // -------------------------------------------------------------------------
  // Document node
  // -------------------------------------------------------------------------
  if (nodeType === 'document') {
    return (
      <>
        <Handle type="target" position={Position.Top} className="!bg-gray-400 dark:!bg-gray-500" />
        <Handle type="source" position={Position.Bottom} className="!bg-gray-400 dark:!bg-gray-500" />

        <motion.div
          className={`
            relative cursor-pointer
            border-2 rounded-lg ${typeStyle.padding}
            ${roleColor.bg} ${roleColor.border}
            ${roleColor.darkBg} ${roleColor.darkBorder}
            ${selected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}
            shadow-sm hover:shadow-md transition-shadow duration-200
          `}
          style={{ minWidth: typeStyle.minWidth, minHeight: typeStyle.minHeight }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Document fold effect */}
          <div className="absolute top-0 right-0 w-4 h-4 border-l border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-bl" />
          <div className="flex items-center gap-2">
            <span className="text-base">📄</span>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-semibold leading-tight ${roleColor.text} ${roleColor.darkText}`}>
                {label}
              </span>
              {description && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {description}
                </span>
              )}
            </div>
          </div>
          {/* Role badge */}
          <span
            className={`
              absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center
              rounded-full text-[10px] border
              ${roleColor.bg} ${roleColor.border}
              ${roleColor.darkBg} ${roleColor.darkBorder}
            `}
          >
            {roleColor.emoji}
          </span>
        </motion.div>
      </>
    );
  }

  // -------------------------------------------------------------------------
  // Default: Process node (rectangle)
  // -------------------------------------------------------------------------
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 dark:!bg-gray-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 dark:!bg-gray-500" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-gray-400 dark:!bg-gray-500" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-gray-400 dark:!bg-gray-500" />

      <motion.div
        className={`
          relative flex items-center gap-2.5 cursor-pointer
          border-2 ${typeStyle.borderRadius} ${typeStyle.padding}
          ${roleColor.bg} ${roleColor.border}
          ${roleColor.darkBg} ${roleColor.darkBorder}
          ${selected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}
          shadow-sm hover:shadow-md transition-shadow duration-200
        `}
        style={{ minWidth: typeStyle.minWidth, minHeight: typeStyle.minHeight }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Role emoji badge */}
        <span
          className={`
            absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center
            rounded-full text-xs border bg-white dark:bg-gray-800
            ${roleColor.border} ${roleColor.darkBorder}
          `}
        >
          {roleColor.emoji}
        </span>

        <div className="flex flex-col min-w-0">
          <span className={`text-xs font-semibold leading-tight ${roleColor.text} ${roleColor.darkText}`}>
            {label}
          </span>
          {description && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
              {description}
            </span>
          )}
        </div>
      </motion.div>
    </>
  );
}

export const WorkflowNode = memo(WorkflowNodeComponent);
export default WorkflowNode;
