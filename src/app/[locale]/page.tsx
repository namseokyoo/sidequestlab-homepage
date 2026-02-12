import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getFeaturedProjects } from '@/lib/projects';
import { getBlogPosts } from '@/lib/blog';
import ProjectCard from '@/components/ui/ProjectCard';
import BlogCard from '@/components/ui/BlogCard';

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();
  const featuredProjects = getFeaturedProjects();
  const recentPosts = getBlogPosts(locale).slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-xl text-blue-600 dark:text-blue-400">
            {t('hero.subtitle')}
          </p>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            {t('hero.description')}
          </p>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              {t('featured.title')}
            </h2>
            <Link
              href="/projects"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('featured.viewAll')}
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blog Posts Section */}
      {recentPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {t('recentPosts.title')}
              </h2>
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t('recentPosts.viewAll')}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
