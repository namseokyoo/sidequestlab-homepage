'use client';

// =============================================================================
// WorkflowLegend.tsx - 역할별 색상 범례 컴포넌트
// ROLE_COLORS 기반 동적 범례 표시
// =============================================================================

import { type FC } from 'react';
import { useTranslations } from 'next-intl';
import { ROLE_COLORS, type AgentRole } from './constants/nodeStyles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface WorkflowLegendProps {
  roles?: AgentRole[];
}

// ---------------------------------------------------------------------------
// Default roles displayed in the legend
// ---------------------------------------------------------------------------
const DEFAULT_ROLES: AgentRole[] = [
  'chairman',
  'ceo',
  'dev',
  'qa',
  'devops',
  'advisor',
  'historian',
];

// ---------------------------------------------------------------------------
// i18n key mapping for role names
// ---------------------------------------------------------------------------
const ROLE_I18N_KEYS: Record<AgentRole, string> = {
  chairman: 'chairman',
  ceo: 'ceo',
  dev: 'dev',
  qa: 'qa',
  devops: 'devops',
  advisor: 'advisor',
  historian: 'historian',
  content: 'content',
  growth: 'growth',
};

// ---------------------------------------------------------------------------
// Role color class mapping (inline Tailwind classes from ROLE_COLORS)
// We use the bg/border/darkBg/darkBorder values from nodeStyles
// ---------------------------------------------------------------------------
function getRoleBadgeClasses(role: AgentRole): string {
  const color = ROLE_COLORS[role];
  return [color.bg, color.border, color.darkBg, color.darkBorder].join(' ');
}

// ---------------------------------------------------------------------------
// WorkflowLegend component
// ---------------------------------------------------------------------------
const WorkflowLegend: FC<WorkflowLegendProps> = ({
  roles = DEFAULT_ROLES,
}) => {
  const t = useTranslations('workflow_page.legend');

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
      {roles.map((role) => {
        const color = ROLE_COLORS[role];
        return (
          <div
            key={role}
            className="flex items-center gap-1.5 text-xs md:text-sm"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${getRoleBadgeClasses(role)}`}
              aria-hidden="true"
            >
              {color.emoji}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {t(ROLE_I18N_KEYS[role])}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowLegend;
export { WorkflowLegend };
export type { WorkflowLegendProps };
