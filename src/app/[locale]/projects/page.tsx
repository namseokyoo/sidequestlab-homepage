'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { projects } from '@/lib/projects';
import ProjectCard from '@/components/ui/ProjectCard';

type FilterTab = 'all' | 'in-progress' | 'completed' | 'planned';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('filter.all') },
    { key: 'in-progress', label: t('filter.in_progress') },
    { key: 'completed', label: t('filter.completed') },
    { key: 'planned', label: t('filter.planned') },
  ];

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.status === activeFilter);

    const statusOrder: Record<string, number> = {
      'in-progress': 0,
      'completed': 1,
      'planned': 2,
    };

    return [...filtered].sort((a, b) => {
      // Featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then by status order
      return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    });
  }, [activeFilter]);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeFilter === tab.key
                    ? 'bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedProjects.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {activeFilter === 'planned'
                ? '준비 중인 프로젝트가 없습니다.'
                : '해당 필터에 맞는 프로젝트가 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
