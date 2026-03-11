'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import {
  AGENT_COUNT,
  DECISION_COUNT,
  HARNESS_VERSION_COUNT,
} from '@/lib/stats';

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

type PermissionStatus =
  | 'blocked'
  | 'allowed'
  | 'open'
  | 'allowlist'
  | 'limited'
  | 'subcontract'
  | 'direct'
  | 'none';

interface AgentPermission {
  name: string;
  write_edit: PermissionStatus;
  bash: PermissionStatus;
  coding: PermissionStatus;
}

interface LayerConfig {
  key: 'l0' | 'l1' | 'l2';
  cardClassName: string;
  itemClassName: string;
}

const AGENTS: AgentPermission[] = [
  { name: 'CEO Agent', write_edit: 'blocked', bash: 'allowlist', coding: 'none' },
  { name: 'Fullstack Dev', write_edit: 'blocked', bash: 'open', coding: 'subcontract' },
  { name: 'QA Engineer', write_edit: 'blocked', bash: 'open', coding: 'subcontract' },
  { name: 'DevOps Engineer', write_edit: 'allowed', bash: 'open', coding: 'direct' },
  { name: 'Board Advisor', write_edit: 'blocked', bash: 'limited', coding: 'subcontract' },
  { name: 'Historian', write_edit: 'allowed', bash: 'limited', coding: 'direct' },
  { name: 'Content Writer', write_edit: 'allowed', bash: 'limited', coding: 'direct' },
];

const LAYERS: LayerConfig[] = [
  {
    key: 'l0',
    cardClassName:
      'border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/40',
    itemClassName:
      'border-blue-100 bg-white/70 text-blue-900 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-100',
  },
  {
    key: 'l1',
    cardClassName:
      'border-violet-200 bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/40',
    itemClassName:
      'border-violet-100 bg-white/70 text-violet-900 dark:border-violet-900/50 dark:bg-violet-900/20 dark:text-violet-100',
  },
  {
    key: 'l2',
    cardClassName:
      'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40',
    itemClassName:
      'border-emerald-100 bg-white/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-100',
  },
];

const VERSIONS = ['v1', 'v2', 'v3', 'v4', 'v5'] as const;
const KPI_ITEMS = ['item1', 'item2', 'item3'] as const;

function getStatusClassName(status: PermissionStatus): string {
  if (status === 'blocked') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300';
  }

  if (status === 'allowed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300';
  }

  return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

export default function HarnessPageContent() {
  const t = useTranslations('harness');

  return (
    <div>
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              {t('hero.badge')}
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              {t('hero.title')
                .split('\n')
                .map((line, index, lines) => (
                  <Fragment key={`${line}-${index}`}>
                    {line}
                    {index < lines.length - 1 ? <br /> : null}
                  </Fragment>
                ))}
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-500 dark:text-gray-400">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                value: `${DECISION_COUNT}${t('hero.stat_decisions_suffix')}`,
                label: t('hero.stat_decisions_label'),
              },
              {
                value: `${AGENT_COUNT}`,
                label: t('hero.stat_agents_label'),
              },
              {
                value: `${HARNESS_VERSION_COUNT}`,
                label: t('hero.stat_versions_label'),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  {item.value}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 sm:py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              {t('architecture.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {t('architecture.subtitle')}
            </p>
          </motion.div>

          <motion.div
            {...fadeInScale}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10"
          >
            <div className="flex flex-col items-stretch justify-center gap-4 lg:flex-row lg:items-center">
              {LAYERS.map((layer, index) => (
                <Fragment key={layer.key}>
                  <div
                    className={`flex-1 rounded-2xl border p-6 shadow-sm ${layer.cardClassName}`}
                  >
                    <div className="mb-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        {layer.key.toUpperCase()}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                        {t(`architecture.${layer.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {t(`architecture.${layer.key}_subtitle`)}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {(['item1', 'item2', 'item3'] as const).map((itemKey) => (
                        <li
                          key={itemKey}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium ${layer.itemClassName}`}
                        >
                          {t(`architecture.${layer.key}_${itemKey}`)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {index < LAYERS.length - 1 ? (
                    <div className="flex items-center justify-center py-2 lg:py-0">
                      <svg
                        className="h-10 w-10 text-gray-300 dark:text-gray-700 lg:hidden"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 5v14m0 0 5-5m-5 5-5-5"
                        />
                      </svg>
                      <svg
                        className="hidden h-10 w-10 text-gray-300 dark:text-gray-700 lg:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M5 12h14m0 0-5-5m5 5-5 5"
                        />
                      </svg>
                    </div>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              {t('matrix.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {t('matrix.subtitle')}
            </p>
          </motion.div>

          <motion.div
            {...fadeInScale}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/70">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('matrix.col_agent')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('matrix.col_write_edit')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('matrix.col_bash')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('matrix.col_coding')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                  {AGENTS.map((agent) => (
                    <tr key={agent.name}>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {agent.name}
                      </td>
                      {(['write_edit', 'bash', 'coding'] as const).map((column) => (
                        <td key={column} className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(agent[column])}`}
                          >
                            {t(`matrix.${agent[column]}`)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              {t('versions.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {t('versions.subtitle')}
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10"
          >
            <div className="relative">
              <div className="absolute left-[0.6875rem] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-8">
                {VERSIONS.map((versionKey) => (
                  <div key={versionKey} className="relative flex gap-5">
                    <div className="relative z-10 mt-1.5 h-6 w-6 flex-shrink-0 rounded-full border-4 border-white bg-blue-600 shadow-sm dark:border-gray-950" />
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t(`versions.${versionKey}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {t(`versions.${versionKey}_desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 sm:py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              {t('kpi.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {t('kpi.subtitle')}
            </p>
          </motion.div>

          <motion.div
            {...fadeInScale}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 grid gap-4 md:grid-cols-3"
          >
            {KPI_ITEMS.map((itemKey) => (
              <div
                key={itemKey}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t(`kpi.${itemKey}_value`)}
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {t(`kpi.${itemKey}_label`)}
                </div>
                <div className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {t(`kpi.${itemKey}_note`)}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
