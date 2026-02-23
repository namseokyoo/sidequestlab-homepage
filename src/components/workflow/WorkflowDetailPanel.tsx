'use client';

// =============================================================================
// WorkflowDetailPanel.tsx - 노드 클릭 시 상세 사이드 패널
// 오른쪽 슬라이드 인 + AnimatePresence + 상세 정보 표시
// =============================================================================

import { type FC, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROLE_COLORS, type AgentRole } from './constants/nodeStyles';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface WorkflowDetailData {
  title: string;
  description?: string;
  role: AgentRole;
  rules?: string[];
  examples?: string[];
}

export interface WorkflowDetailPanelProps {
  open: boolean;
  onClose: () => void;
  data: WorkflowDetailData | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const WorkflowDetailPanel: FC<WorkflowDetailPanelProps> = ({ open, onClose, data }) => {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const roleColor = data ? ROLE_COLORS[data.role] : null;

  return (
    <AnimatePresence>
      {open && data && roleColor && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              fixed right-0 top-0 bottom-0 z-50
              w-full max-w-md
              bg-white dark:bg-gray-900
              border-l border-gray-200 dark:border-gray-800
              shadow-2xl
              overflow-y-auto
            "
          >
            {/* Header */}
            <div
              className={`
                sticky top-0 z-10
                flex items-center justify-between
                px-5 py-4
                border-b border-gray-100 dark:border-gray-800
                bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
              `}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`
                    w-8 h-8 flex items-center justify-center
                    rounded-full text-sm border
                    ${roleColor.bg} ${roleColor.border}
                    ${roleColor.darkBg} ${roleColor.darkBorder}
                  `}
                >
                  {roleColor.emoji}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    {data.title}
                  </h2>
                  <p className={`text-xs ${roleColor.text} ${roleColor.darkText}`}>
                    {roleColor.label}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="
                  w-8 h-8 flex items-center justify-center
                  rounded-lg text-gray-400 hover:text-gray-600
                  dark:text-gray-500 dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors
                "
                aria-label="패널 닫기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-5">
              {/* Description */}
              {data.description && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    설명
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {data.description}
                  </p>
                </section>
              )}

              {/* Related rules */}
              {data.rules && data.rules.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    관련 규칙
                  </h3>
                  <ul className="space-y-2">
                    {data.rules.map((rule, i) => (
                      <li
                        key={i}
                        className="
                          flex items-start gap-2 text-sm
                          text-gray-600 dark:text-gray-400
                        "
                      >
                        <span
                          className={`
                            flex-shrink-0 w-5 h-5 flex items-center justify-center
                            rounded text-[10px] font-bold mt-0.5
                            ${roleColor.bg} ${roleColor.text}
                            ${roleColor.darkBg} ${roleColor.darkText}
                          `}
                        >
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Examples */}
              {data.examples && data.examples.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    실제 사례
                  </h3>
                  <div className="space-y-2">
                    {data.examples.map((example, i) => (
                      <div
                        key={i}
                        className="
                          px-3 py-2.5 rounded-lg text-xs leading-relaxed
                          bg-gray-50 dark:bg-gray-800/60
                          text-gray-600 dark:text-gray-400
                          border border-gray-100 dark:border-gray-700/50
                        "
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default WorkflowDetailPanel;
