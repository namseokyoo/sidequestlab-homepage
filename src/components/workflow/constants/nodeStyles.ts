// =============================================================================
// nodeStyles.ts - 워크플로우 노드 스타일 정의
// 역할별 색상 시스템 + 노드 타입별 스타일
// =============================================================================

// ---------------------------------------------------------------------------
// Agent Role Types
// ---------------------------------------------------------------------------
export type AgentRole =
  | 'ceo'
  | 'dev'
  | 'qa'
  | 'devops'
  | 'advisor'
  | 'historian'
  | 'content'
  | 'growth'
  | 'chairman';

// ---------------------------------------------------------------------------
// Node Types
// ---------------------------------------------------------------------------
export type WorkflowNodeType =
  | 'process'
  | 'decision'
  | 'gate'
  | 'document'
  | 'start'
  | 'end';

// ---------------------------------------------------------------------------
// Role Color Definition
// ---------------------------------------------------------------------------
export interface RoleColor {
  bg: string;
  bgHover: string;
  border: string;
  text: string;
  icon: string;
  emoji: string;
  label: string;
  // Dark mode variants
  darkBg: string;
  darkBgHover: string;
  darkBorder: string;
  darkText: string;
}

// ---------------------------------------------------------------------------
// Node Type Style Definition
// ---------------------------------------------------------------------------
export interface NodeTypeStyle {
  shape: 'rectangle' | 'diamond' | 'shield' | 'document' | 'circle';
  borderRadius: string;
  minWidth: number;
  minHeight: number;
  padding: string;
}

// ---------------------------------------------------------------------------
// Role Colors Map
// ---------------------------------------------------------------------------
export const ROLE_COLORS: Record<AgentRole, RoleColor> = {
  ceo: {
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-700',
    icon: 'text-blue-500',
    emoji: '🎯',
    label: 'CEO Agent',
    darkBg: 'dark:bg-blue-950/50',
    darkBgHover: 'dark:hover:bg-blue-900/60',
    darkBorder: 'dark:border-blue-500',
    darkText: 'dark:text-blue-300',
  },
  dev: {
    bg: 'bg-emerald-50',
    bgHover: 'hover:bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-700',
    icon: 'text-emerald-500',
    emoji: '💻',
    label: 'Fullstack Dev',
    darkBg: 'dark:bg-emerald-950/50',
    darkBgHover: 'dark:hover:bg-emerald-900/60',
    darkBorder: 'dark:border-emerald-500',
    darkText: 'dark:text-emerald-300',
  },
  qa: {
    bg: 'bg-amber-50',
    bgHover: 'hover:bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-700',
    icon: 'text-amber-500',
    emoji: '🔍',
    label: 'QA Engineer',
    darkBg: 'dark:bg-amber-950/50',
    darkBgHover: 'dark:hover:bg-amber-900/60',
    darkBorder: 'dark:border-amber-500',
    darkText: 'dark:text-amber-300',
  },
  devops: {
    bg: 'bg-red-50',
    bgHover: 'hover:bg-red-100',
    border: 'border-red-400',
    text: 'text-red-700',
    icon: 'text-red-500',
    emoji: '🚀',
    label: 'DevOps Engineer',
    darkBg: 'dark:bg-red-950/50',
    darkBgHover: 'dark:hover:bg-red-900/60',
    darkBorder: 'dark:border-red-500',
    darkText: 'dark:text-red-300',
  },
  advisor: {
    bg: 'bg-purple-50',
    bgHover: 'hover:bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-700',
    icon: 'text-purple-500',
    emoji: '🧠',
    label: 'Board Advisor',
    darkBg: 'dark:bg-purple-950/50',
    darkBgHover: 'dark:hover:bg-purple-900/60',
    darkBorder: 'dark:border-purple-500',
    darkText: 'dark:text-purple-300',
  },
  historian: {
    bg: 'bg-indigo-50',
    bgHover: 'hover:bg-indigo-100',
    border: 'border-indigo-400',
    text: 'text-indigo-700',
    icon: 'text-indigo-500',
    emoji: '📜',
    label: 'Company Historian',
    darkBg: 'dark:bg-indigo-950/50',
    darkBgHover: 'dark:hover:bg-indigo-900/60',
    darkBorder: 'dark:border-indigo-500',
    darkText: 'dark:text-indigo-300',
  },
  content: {
    bg: 'bg-pink-50',
    bgHover: 'hover:bg-pink-100',
    border: 'border-pink-400',
    text: 'text-pink-700',
    icon: 'text-pink-500',
    emoji: '✍️',
    label: 'Content Writer',
    darkBg: 'dark:bg-pink-950/50',
    darkBgHover: 'dark:hover:bg-pink-900/60',
    darkBorder: 'dark:border-pink-500',
    darkText: 'dark:text-pink-300',
  },
  growth: {
    bg: 'bg-teal-50',
    bgHover: 'hover:bg-teal-100',
    border: 'border-teal-400',
    text: 'text-teal-700',
    icon: 'text-teal-500',
    emoji: '📈',
    label: 'Growth Marketer',
    darkBg: 'dark:bg-teal-950/50',
    darkBgHover: 'dark:hover:bg-teal-900/60',
    darkBorder: 'dark:border-teal-500',
    darkText: 'dark:text-teal-300',
  },
  chairman: {
    bg: 'bg-yellow-50',
    bgHover: 'hover:bg-yellow-100',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    icon: 'text-yellow-500',
    emoji: '👑',
    label: 'Chairman',
    darkBg: 'dark:bg-yellow-950/50',
    darkBgHover: 'dark:hover:bg-yellow-900/60',
    darkBorder: 'dark:border-yellow-500',
    darkText: 'dark:text-yellow-300',
  },
};

// ---------------------------------------------------------------------------
// Node Type Styles Map
// ---------------------------------------------------------------------------
export const NODE_TYPE_STYLES: Record<WorkflowNodeType, NodeTypeStyle> = {
  process: {
    shape: 'rectangle',
    borderRadius: 'rounded-lg',
    minWidth: 180,
    minHeight: 60,
    padding: 'px-4 py-3',
  },
  decision: {
    shape: 'diamond',
    borderRadius: 'rounded-lg',
    minWidth: 140,
    minHeight: 140,
    padding: 'px-3 py-2',
  },
  gate: {
    shape: 'shield',
    borderRadius: 'rounded-xl',
    minWidth: 160,
    minHeight: 70,
    padding: 'px-4 py-3',
  },
  document: {
    shape: 'document',
    borderRadius: 'rounded-lg rounded-b-none',
    minWidth: 160,
    minHeight: 60,
    padding: 'px-4 py-3',
  },
  start: {
    shape: 'circle',
    borderRadius: 'rounded-full',
    minWidth: 80,
    minHeight: 80,
    padding: 'p-4',
  },
  end: {
    shape: 'circle',
    borderRadius: 'rounded-full',
    minWidth: 80,
    minHeight: 80,
    padding: 'p-4',
  },
};

// ---------------------------------------------------------------------------
// Edge Type Colors
// ---------------------------------------------------------------------------
export type EdgeType = 'default' | 'success' | 'fail' | 'conditional';

export const EDGE_COLORS: Record<EdgeType, { stroke: string; darkStroke: string }> = {
  default: {
    stroke: '#9ca3af',  // gray-400
    darkStroke: '#6b7280', // gray-500
  },
  success: {
    stroke: '#22c55e',  // green-500
    darkStroke: '#4ade80', // green-400
  },
  fail: {
    stroke: '#ef4444',  // red-500
    darkStroke: '#f87171', // red-400
  },
  conditional: {
    stroke: '#f59e0b',  // amber-500
    darkStroke: '#fbbf24', // amber-400
  },
};

// ---------------------------------------------------------------------------
// Utility: Get role classes as a combined string
// ---------------------------------------------------------------------------
export function getRoleClasses(role: AgentRole): string {
  const c = ROLE_COLORS[role];
  return [
    c.bg, c.bgHover, c.border, c.text,
    c.darkBg, c.darkBgHover, c.darkBorder, c.darkText,
  ].join(' ');
}
