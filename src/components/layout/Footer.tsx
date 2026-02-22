import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            SidequestLab
          </Link>
          <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
            {t('description')}
          </p>
          <div className="mt-4 text-sm text-gray-400 dark:text-gray-500">
            &copy; {currentYear} {t('copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}
