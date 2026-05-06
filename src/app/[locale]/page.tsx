import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getFeaturedProjects, getShowcaseProjects } from '@/lib/projects';
import { getBlogPosts } from '@/lib/blog';
import ProjectCard from '@/components/ui/ProjectCard';
import BlogCard from '@/components/ui/BlogCard';
import FeaturedShowcase from '@/components/ui/FeaturedShowcase';
import PortfolioLanding from '@/components/home/PortfolioLanding';

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();
  const featuredProjects = getFeaturedProjects();
  const showcaseProjects = getShowcaseProjects().slice(0, 4);
  const otherFeatured = featuredProjects.filter(p => !p.showcase || p.showcase.rank > 4);
  const recentPosts = getBlogPosts(locale).slice(0, 3);

  return (
    <div>
      <PortfolioLanding locale={locale} />

      {/* Featured Projects Section */}
      <section className="bg-[var(--sql-ivory)] py-20 text-[var(--sql-ink)] sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 border-b border-[rgba(17,16,14,0.14)] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sql-red)]">Portfolio proof</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-[var(--sql-ink)] sm:text-4xl">
                {t('featured_projects.title')}
              </h2>
            </div>
            <p className="max-w-xl break-keep text-sm leading-7 text-[rgba(17,16,14,0.68)] sm:text-base">
              {t('featured_projects.subtitle')}
            </p>
          </div>

          {showcaseProjects.length > 0 && (
            <div className="mb-8">
              <FeaturedShowcase projects={showcaseProjects} variant="hero" />
            </div>
          )}

          {otherFeatured.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherFeatured.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

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
        <section data-canvas-theme="graphite" className="bg-[var(--sql-charcoal)] py-20 text-[var(--canvas-text)] sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 border-b border-[rgba(243,238,229,0.13)] pb-8">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--canvas-accent)]">Operating notes</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-[var(--canvas-text)]">
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
                className="inline-flex items-center gap-1 border-b border-[rgba(209,44,36,0.55)] pb-1 text-sm font-semibold text-[var(--canvas-text)] transition-colors hover:text-[var(--canvas-accent)]"
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
