'use client';

import { track } from '@vercel/analytics';
import { Link } from '@/i18n/routing';

interface HeroCTAProps {
  projectsLabel: string;
  harnessLabel: string;
}

export default function HeroCTA({ projectsLabel, harnessLabel }: HeroCTAProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Link
        href="/projects"
        onClick={() => track('hero_cta_click', { label: 'main' })}
        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        {projectsLabel}
      </Link>
      <Link
        href="/harness"
        onClick={() => track('hero_cta_click', { label: 'harness' })}
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {harnessLabel}
      </Link>
    </div>
  );
}
