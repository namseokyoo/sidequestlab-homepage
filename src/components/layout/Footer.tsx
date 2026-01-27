import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="text-lg font-bold text-blue-600 dark:text-blue-400">
              SidequestLab
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('description')}
            </p>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} {t('copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}
