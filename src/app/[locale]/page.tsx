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
  const showcaseProjects = getShowcaseProjects().slice(0, 3);
  const otherFeatured = featuredProjects.filter(p => !p.showcase || p.showcase.rank > 3);
  const recentPosts = getBlogPosts(locale).slice(0, 3);

  return (
    <div>
      <PortfolioLanding locale={locale} />

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
