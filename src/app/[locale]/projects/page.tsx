'use client';

import { useTranslations, useLocale } from 'next-intl';
import { projects } from '@/lib/projects';
import { Link } from '@/i18n/routing';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const locale = useLocale() as 'ko' | 'en';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'planned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'product':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'internal':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'homepage':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                  {t(`status.${project.status}`)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(project.category)}`}>
                  {t(`category.${project.category}`)}
                </span>
              </div>

              {/* Title */}
              <div className="mb-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project.name[locale]}
                </h3>
              </div>

              {/* Description */}
              <p className="mb-4 flex-grow text-sm text-gray-600 dark:text-gray-400">
                {project.description[locale]}
              </p>

              {/* Tech Stack */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-500">
                  {t('techStack')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {/* Detail page link for products with longDescription */}
                {project.longDescription && (
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    {t('viewDetails')}
                  </Link>
                )}

                {/* Visit site button */}
                {project.url !== '#' && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    {t('visitSite')}
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
