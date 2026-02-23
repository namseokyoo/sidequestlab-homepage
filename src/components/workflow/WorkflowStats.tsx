'use client';

// =============================================================================
// WorkflowStats.tsx - Hero 섹션 아래 핵심 수치 배너
// 카운트업 애니메이션 + 그래디언트 텍스트 + 반응형 그리드
// =============================================================================

import { useEffect, useRef, useState, type FC } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StatItem {
  countKey: string;
  labelKey: string;
}

// ---------------------------------------------------------------------------
// Stat items configuration
// ---------------------------------------------------------------------------
const STAT_ITEMS: StatItem[] = [
  { countKey: 'decisions_count', labelKey: 'decisions' },
  { countKey: 'rules_count', labelKey: 'rules' },
  { countKey: 'quality_gates_count', labelKey: 'quality_gates' },
  { countKey: 'llm_models_count', labelKey: 'llm_models' },
];

// ---------------------------------------------------------------------------
// Count-up hook
// ---------------------------------------------------------------------------
function useCountUp(
  target: number,
  isInView: boolean,
  duration: number = 1500
): number {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return count;
}

// ---------------------------------------------------------------------------
// Parse numeric value from translated string
// ---------------------------------------------------------------------------
function parseNumericValue(value: string): number | null {
  const match = value.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// ---------------------------------------------------------------------------
// StatCard component
// ---------------------------------------------------------------------------
interface StatCardProps {
  countValue: string;
  label: string;
  index: number;
  isInView: boolean;
}

const StatCard: FC<StatCardProps> = ({ countValue, label, index, isInView }) => {
  const numericValue = parseNumericValue(countValue);
  const animatedCount = useCountUp(numericValue ?? 0, isInView);

  // Determine display value: animated number or fade-in text
  const displayValue =
    numericValue !== null
      ? countValue.replace(/\d+/, String(animatedCount))
      : countValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
        {displayValue}
      </div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {label}
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// WorkflowStats component
// ---------------------------------------------------------------------------
const WorkflowStats: FC = () => {
  const t = useTranslations('workflow_page.hero_stats');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {STAT_ITEMS.map((item, index) => (
        <StatCard
          key={item.countKey}
          countValue={t(item.countKey)}
          label={t(item.labelKey)}
          index={index}
          isInView={isInView}
        />
      ))}
    </div>
  );
};

export default WorkflowStats;
export { WorkflowStats };
