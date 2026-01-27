import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const koParams = getBlogPosts('ko').map((post) => ({
    locale: 'ko',
    slug: post.slug,
  }));
  const enParams = getBlogPosts('en').map((post) => ({
    locale: 'en',
    slug: post.slug,
  }));

  return [...koParams, ...enParams];
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const t = await getTranslations('blog');
  const locale = await getLocale();
  const post = getBlogPost(locale, slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <article className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('backToList')}
          </Link>

          {/* Header */}
          <header className="mb-8">
            <time className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
              {formatDate(post.date)}
            </time>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {post.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {post.description}
            </p>
          </header>

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none">
            <MDXRemote source={post.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
