import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getBlogPosts } from '@/lib/blog';
import BlogCard from '@/components/ui/BlogCard';
import PortfolioLanding from '@/components/home/PortfolioLanding';
import OperatingProofSection from '@/components/home/OperatingProofSection';
import DisplayLabProofSection from '@/components/home/DisplayLabProofSection';

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();
  const recentPosts = getBlogPosts(locale).slice(0, 3);
  const normalizedLocale = locale === 'en' ? 'en' : 'ko';

  return (
    <div>
      <PortfolioLanding locale={locale} />
      <OperatingProofSection locale={normalizedLocale} />
      <DisplayLabProofSection locale={normalizedLocale} />

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
                className="inline-flex items-center gap-1 border-b border-[rgba(209,44,36,0.55)] pb-1 text-sm font-semibold text-[var(--canvas-text)] transition-colors hover:text-[var(--canvas-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--canvas-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas-bg)]"
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
