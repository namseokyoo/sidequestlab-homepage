'use client';

// =============================================================================
// WorkflowTooltip.tsx - 노드 호버 시 나타나는 툴팁
// 역할, 설명, 관련 규칙 표시 + Framer Motion fade-in/out
// =============================================================================

import { type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROLE_COLORS, type AgentRole } from './constants/nodeStyles';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface WorkflowTooltipData {
  role: AgentRole;
  label: string;
  description?: string;
  rules?: string[];
}

export interface WorkflowTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  data: WorkflowTooltipData | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const WorkflowTooltip: FC<WorkflowTooltipProps> = ({ visible, x, y, data }) => {
  if (!data) return null;

  const roleColor = ROLE_COLORS[data.role];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="
            fixed z-[100] pointer-events-none
            max-w-[280px] min-w-[180px]
            rounded-lg border shadow-lg
            bg-white dark:bg-gray-900
            border-gray-200 dark:border-gray-700
          "
          style={{
            left: x + 12,
            top: y - 8,
          }}
        >
          <div className="p-3 space-y-2">
            {/* Header: role badge + label */}
            <div className="flex items-center gap-2">
              <span
                className={`
                  w-6 h-6 flex items-center justify-center
                  rounded-full text-xs border
                  ${roleColor.bg} ${roleColor.border}
                  ${roleColor.darkBg} ${roleColor.darkBorder}
                `}
              >
                {roleColor.emoji}
              </span>
              <div>
                <p className={`text-xs font-bold ${roleColor.text} ${roleColor.darkText}`}>
                  {data.label}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {roleColor.label}
                </p>
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                {data.description}
              </p>
            )}

            {/* Related rules */}
            {data.rules && data.rules.length > 0 && (
              <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  관련 규칙
                </p>
                <ul className="space-y-0.5">
                  {data.rules.slice(0, 3).map((rule, i) => (
                    <li
                      key={i}
                      className="text-[10px] text-gray-500 dark:text-gray-400 flex items-start gap-1"
                    >
                      <span className="text-gray-300 dark:text-gray-600 mt-px">&#8226;</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                  {data.rules.length > 3 && (
                    <li className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                      +{data.rules.length - 3}개 더...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkflowTooltip;
