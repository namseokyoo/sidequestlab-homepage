'use client';

import { track } from '@vercel/analytics';
import { useLocale, useTranslations } from 'next-intl';
import type { Project } from '@/lib/projects';

interface FeaturedShowcaseProps {
  projects: Project[];
  variant: 'hero' | 'compare';
}

function getUpdateBadge(updatedAt: string | undefined, locale: string, recentlyUpdatedLabel: string, daysAgoLabel: (days: number) => string) {
  if (!updatedAt) return null;
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-300 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        {recentlyUpdatedLabel}
      </span>
    );
  } else if (diffDays <= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
        {daysAgoLabel(diffDays)}
      </span>
    );
  }
  return null;
}

export default function FeaturedShowcase({ projects, variant }: FeaturedShowcaseProps) {
  const locale = useLocale() as 'ko' | 'en';
  const t = useTranslations('projects');

  if (variant === 'compare') {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project, index) => {
          const showcase = project.showcase!;
          const gradient = project.gradient || 'from-gray-500 to-gray-400';
          const badge = getUpdateBadge(
            showcase.updatedAt,
            locale,
            t('recently_updated'),
            (days) => t('days_ago_updated', { days })
          );

          return (
            <div
              key={project.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} h-48 sm:h-56 transition-transform duration-200 hover:-translate-y-0.5`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />

              {badge && (
                <div className="absolute top-3 right-3 z-10">
                  {badge}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <p className="mb-1 text-sm font-medium text-white/70">
                  {project.name[locale]}
                </p>
                <h3 className="mb-4 max-w-md text-2xl font-bold leading-snug text-white sm:text-3xl">
                  {showcase.headline[locale]}
                </h3>
                <a
                  href={showcase.cta.href}
                  target={showcase.cta.external ? '_blank' : undefined}
                  rel={showcase.cta.external ? 'noopener noreferrer' : undefined}
                  onClick={() => track('project_outbound_click', {
                    project_id: project.id,
                    url: showcase.cta.href,
                  })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                >
                  {showcase.cta.label[locale]}
                  {showcase.cta.external && (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {projects.map((project, index) => {
        const showcase = project.showcase!;
        const gradient = project.gradient || 'from-gray-500 to-gray-400';
        const badge = getUpdateBadge(
          showcase.updatedAt,
          locale,
          t('recently_updated'),
          (days) => t('days_ago_updated', { days })
        );

        return (
          <div
            key={project.id}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} h-56 sm:h-64 transition-transform duration-200 hover:-translate-y-1`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="absolute inset-0 bg-black/35 dark:bg-black/45" />

            {badge && (
              <div className="absolute top-3 right-3 z-10">
                {badge}
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
              <p className="mb-1 text-xs font-medium text-white/70 sm:text-sm">
                {project.name[locale]}
              </p>
              <h3 className="mb-4 text-xl font-bold leading-snug text-white sm:text-2xl">
                {showcase.headline[locale]}
              </h3>
              <a
                href={showcase.cta.href}
                target={showcase.cta.external ? '_blank' : undefined}
                rel={showcase.cta.external ? 'noopener noreferrer' : undefined}
                onClick={() => track('project_outbound_click', {
                  project_id: project.id,
                  url: showcase.cta.href,
                })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              >
                {showcase.cta.label[locale]}
                {showcase.cta.external && (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
