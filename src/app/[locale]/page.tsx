import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getFeaturedProjects, getShowcaseProjects } from '@/lib/projects';
import { getBlogPosts } from '@/lib/blog';
import { TOTAL_PROJECT_COUNT, SERVICE_COUNT } from '@/lib/stats';
import ProjectCard from '@/components/ui/ProjectCard';
import BlogCard from '@/components/ui/BlogCard';
import FeaturedShowcase from '@/components/ui/FeaturedShowcase';
import HeroCTA from '@/components/ui/HeroCTA';
import { track } from '@vercel/analytics';

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();
  const featuredProjects = getFeaturedProjects();
  const showcaseProjects = getShowcaseProjects().slice(0, 3);
  const otherFeatured = featuredProjects.filter(p => !p.showcase || p.showcase.rank > 3);
  const recentPosts = getBlogPosts(locale).slice(0, 3);

  const heroTitle = t('hero.title');
  const titleParts = heroTitle.split('\n');

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white py-24 sm:py-32 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            {titleParts.map((part, index) => (
              <span key={index}>
                {part}
                {index < titleParts.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            {t('hero.subtitle')}
          </p>
          <HeroCTA
            projectsLabel={t('hero.cta_projects')}
            harnessLabel={t('hero.cta_about')}
            aboutLabel={t('hero.cta_collaborate')}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
            <div className="px-4 text-center">
              <div className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
                {TOTAL_PROJECT_COUNT}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('stats.projects')}
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
                {SERVICE_COUNT}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('stats.services')}
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
                {t('stats.techstack_count')}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('stats.techstack')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Paths Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* 서비스 이용 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t('paths.use.title')}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t('paths.use.desc')}
              </p>
              <Link
                href="/projects"
                onClick={() => track('path_card_click', { label: 'use' })}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
              >
                {t('paths.use.cta')}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 빌드 과정 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
                <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t('paths.build.title')}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t('paths.build.desc')}
              </p>
              <Link
                href="/harness"
                onClick={() => track('path_card_click', { label: 'build' })}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
              >
                {t('paths.build.cta')}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 협업 알아보기 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t('paths.collaborate.title')}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t('paths.collaborate.desc')}
              </p>
              <Link
                href="/about"
                onClick={() => track('path_card_click', { label: 'collaborate' })}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
              >
                {t('paths.collaborate.cta')}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t('featured_projects.title')}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {t('featured_projects.subtitle')}
            </p>
          </div>

          {showcaseProjects.length > 0 && (
            <div className="mb-8">
              <FeaturedShowcase projects={showcaseProjects} variant="hero" />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherFeatured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {t('featured_projects.view_all')}
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts Section */}
      {recentPosts.length > 0 && (
        <section className="bg-gray-50 py-20 sm:py-24 dark:bg-gray-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t('recent_blog.title')}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {t('recent_blog.view_all')}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
