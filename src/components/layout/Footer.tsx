import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(17,16,14,0.12)] bg-[var(--sql-ivory)] dark:border-[rgba(243,238,229,0.12)] dark:bg-[var(--sql-charcoal)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            SidequestLab
          </Link>
          <p className="max-w-md text-sm leading-7 text-gray-700 dark:text-[rgba(243,238,229,0.72)]">
            {t('description')}
          </p>
          <div className="mt-4 text-sm text-gray-600 dark:text-[rgba(243,238,229,0.6)]">
            &copy; {currentYear} {t('copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}
