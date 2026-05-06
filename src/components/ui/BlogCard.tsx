'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { BlogPost } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
  locale?: string;
}

export default function BlogCard({ post, locale = 'ko' }: BlogCardProps) {
  const t = useTranslations('blog');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = {
      ko: 'ko-KR',
      en: 'en-US',
    };
    return date.toLocaleDateString(localeMap[locale] || 'ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="group flex flex-col rounded-[1.2rem] border border-[rgba(243,238,229,0.13)] bg-[rgba(243,238,229,0.045)] p-6 shadow-sm transition-all hover:border-[rgba(209,44,36,0.45)] hover:bg-[rgba(243,238,229,0.065)]">
      <div className="mb-2">
        <time className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(243,238,229,0.86)]">
          {formatDate(post.date)}
        </time>
      </div>

      <h3 className="mb-3 text-xl font-bold tracking-[-0.025em] text-[var(--canvas-text)] transition-colors group-hover:text-[var(--canvas-accent)]">
        <Link href={`/blog/${post.slug}`}>
          {post.title}
        </Link>
      </h3>

      <p className="mb-5 flex-grow text-sm leading-7 text-[rgba(243,238,229,0.9)]">
        {post.description}
      </p>

      <Link
        href={`/blog/${post.slug}`}
        className="inline-flex items-center text-sm font-semibold text-[var(--canvas-text)] hover:text-[var(--canvas-accent)]"
      >
        <span>{t('read_more')}</span>
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
    </article>
  );
}
