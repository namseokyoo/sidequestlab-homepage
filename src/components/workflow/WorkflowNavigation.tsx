'use client';

// =============================================================================
// WorkflowNavigation.tsx - 워크플로우 섹션 간 이동 네비게이션
// Sticky 탭 바 + Scroll Spy + 스무스 스크롤
// =============================================================================

import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------
interface TabItem {
  id: string;
  key: string;
}

const TABS: TabItem[] = [
  { id: 'project-lifecycle', key: 'project_lifecycle' },
  { id: 'decision-process', key: 'decision_process' },
  { id: 'quality-gate', key: 'quality_gate' },
  { id: 'tech-review', key: 'tech_review' },
];

// ---------------------------------------------------------------------------
// WorkflowNavigation component
// ---------------------------------------------------------------------------
const WorkflowNavigation: FC = () => {
  const t = useTranslations('workflow_page.navigation');
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------------------------------------
  // Scroll to section
  // -------------------------------------------------------------------------
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(`workflow-${id}`);
    if (!element) return;

    // Prevent scroll spy from overriding during programmatic scroll
    isScrollingRef.current = true;
    setActiveTab(id);

    const offset = 128; // Header + navigation height
    const y =
      element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });

    // Re-enable scroll spy after scroll completes
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  }, []);

  // -------------------------------------------------------------------------
  // Scroll Spy with IntersectionObserver
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const sectionElements = TABS.map((tab) =>
      document.getElementById(`workflow-${tab.id}`)
    ).filter(Boolean) as HTMLElement[];

    if (sectionElements.length === 0) return;

    // Track visibility ratios
    const visibilityMap = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        entries.forEach((entry) => {
          const id = entry.target.id.replace('workflow-', '');
          visibilityMap.set(id, entry.intersectionRatio);
        });

        // Find the most visible section
        let maxRatio = 0;
        let mostVisibleId = activeTab;

        visibilityMap.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleId = id;
          }
        });

        if (maxRatio > 0) {
          setActiveTab(mostVisibleId);
        }
      },
      {
        rootMargin: '-128px 0px -40% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }
    );

    sectionElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav
      className="sticky top-16 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80"
      aria-label="Workflow navigation"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="scrollbar-hide relative flex gap-1 overflow-x-auto p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="workflow-nav-indicator"
                    className="absolute inset-0 rounded-lg bg-blue-50 dark:bg-blue-950/50"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{t(tab.key)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default WorkflowNavigation;
export { WorkflowNavigation };
