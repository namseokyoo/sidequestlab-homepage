'use client';

// =============================================================================
// WorkflowPageContent.tsx - 워크플로우 페이지 본체 (클라이언트 컴포넌트)
// React Flow + Framer Motion 기반 인터랙티브 워크플로우 시각화
// =============================================================================

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import WorkflowStats from '@/components/workflow/WorkflowStats';
import WorkflowLegend from '@/components/workflow/WorkflowLegend';
import WorkflowNavigation from '@/components/workflow/WorkflowNavigation';

// ---------------------------------------------------------------------------
// Dynamic imports for React Flow components (ssr: false required)
// ---------------------------------------------------------------------------
const ProjectLifecycleFlow = dynamic(
  () => import('@/components/workflow/flows/ProjectLifecycleFlow'),
  { ssr: false }
);
const DecisionProcessFlow = dynamic(
  () => import('@/components/workflow/flows/DecisionProcessFlow'),
  { ssr: false }
);
const QualityGateFlow = dynamic(
  () => import('@/components/workflow/flows/QualityGateFlow'),
  { ssr: false }
);
const TechReviewFlow = dynamic(
  () => import('@/components/workflow/flows/TechReviewFlow'),
  { ssr: false }
);

// ---------------------------------------------------------------------------
// Section configuration
// ---------------------------------------------------------------------------
interface SectionConfig {
  id: string;
  key: string;
  hasConstraints: boolean;
  flowHeight: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'project-lifecycle',
    key: 'project_lifecycle',
    hasConstraints: true,
    flowHeight: 'h-[600px] sm:h-[700px] md:h-[800px]',
  },
  {
    id: 'decision-process',
    key: 'decision_process',
    hasConstraints: true,
    flowHeight: 'h-[500px] sm:h-[600px] md:h-[700px]',
  },
  {
    id: 'quality-gate',
    key: 'quality_gate',
    hasConstraints: true,
    flowHeight: 'h-[550px] sm:h-[650px] md:h-[750px]',
  },
  {
    id: 'tech-review',
    key: 'tech_review',
    hasConstraints: true,
    flowHeight: 'h-[500px] sm:h-[600px] md:h-[700px]',
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.98 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
};

// ---------------------------------------------------------------------------
// Flow component mapping
// ---------------------------------------------------------------------------
function FlowComponent({
  sectionKey,
  locale,
}: {
  sectionKey: string;
  locale: 'ko' | 'en';
}) {
  switch (sectionKey) {
    case 'project_lifecycle':
      return <ProjectLifecycleFlow locale={locale} />;
    case 'decision_process':
      return <DecisionProcessFlow locale={locale} />;
    case 'quality_gate':
      return <QualityGateFlow locale={locale} />;
    case 'tech_review':
      return <TechReviewFlow locale={locale} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// WorkflowPageContent
// ---------------------------------------------------------------------------
export default function WorkflowPageContent() {
  const t = useTranslations('workflow_page');
  const locale = useLocale() as 'ko' | 'en';

  return (
    <div>
      {/* ================================================================= */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================= */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              {t('title')}
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-500 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Stats banner */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
          >
            <WorkflowStats />
          </motion.div>

          {/* Role legend */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {t('legend.title')}
            </p>
            <WorkflowLegend />
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* STICKY NAVIGATION                                                  */}
      {/* ================================================================= */}
      <WorkflowNavigation />

      {/* ================================================================= */}
      {/* WORKFLOW SECTIONS                                                   */}
      {/* ================================================================= */}
      {SECTIONS.map((section, index) => {
        const isOdd = index % 2 === 0; // 0-indexed: first section gets background

        return (
          <section
            key={section.id}
            id={`workflow-${section.id}`}
            className={`py-16 sm:py-20 ${
              isOdd ? 'bg-gray-50 dark:bg-gray-900/50' : ''
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Section header */}
              <motion.div
                {...fadeInUp}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center"
              >
                <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                  {t(`sections.${section.key}.title`)}
                </h2>
                <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {t(`sections.${section.key}.description`)}
                </p>
              </motion.div>

              {/* React Flow diagram */}
              <motion.div
                {...fadeInScale}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              >
                <div className={section.flowHeight}>
                  <FlowComponent sectionKey={section.key} locale={locale} />
                </div>
              </motion.div>

              {/* Constraints cards */}
              {section.hasConstraints && (
                <motion.div
                  {...fadeInUp}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mx-auto mt-8 max-w-2xl"
                >
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/50 dark:bg-amber-900/20">
                    <h3 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {locale === 'ko' ? '핵심 제약 조건' : 'Key Constraints'}
                    </h3>
                    <ul className="space-y-2">
                      {(
                        t.raw(
                          `sections.${section.key}.constraints`
                        ) as string[]
                      ).map((constraint: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400"
                        >
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        );
      })}

      {/* ================================================================= */}
      {/* FOOTER CTA                                                         */}
      {/* ================================================================= */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              {t('cta.title')}
            </h2>
            <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
              {t('cta.subtitle')}
            </p>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {t('cta.button')}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
