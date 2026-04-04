'use client';

import { track } from '@vercel/analytics';
import { Link } from '@/i18n/routing';

interface HeroCTAProps {
  projectsLabel: string;
  harnessLabel: string;
  aboutLabel: string;
}

export default function HeroCTA({ projectsLabel, harnessLabel, aboutLabel }: HeroCTAProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/projects"
          onClick={() => track('hero_cta_click', { label: 'services' })}
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
      <Link
        href="/about"
        onClick={() => track('hero_cta_click', { label: 'about' })}
        className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        {aboutLabel}
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
