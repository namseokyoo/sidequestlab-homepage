import { Link } from '@/i18n/routing';
import type { BlogPost } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-2">
        <time className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(post.date)}
        </time>
      </div>

      <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        <Link href={`/blog/${post.slug}`}>
          {post.title}
        </Link>
      </h3>

      <p className="mb-4 flex-grow text-sm text-gray-600 dark:text-gray-400">
        {post.description}
      </p>

      <Link
        href={`/blog/${post.slug}`}
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <span>Read More</span>
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
