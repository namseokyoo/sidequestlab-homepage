'use client';

import { track } from '@vercel/analytics';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) {
      return;
    }

    track('locale_switch', { from: locale, to: newLocale });

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[rgba(23,21,18,0.16)] p-1 dark:border-[rgba(243,238,229,0.18)]">
      <button
        onClick={() => handleLocaleChange('ko')}
        disabled={isPending}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
          locale === 'ko'
            ? 'bg-[#ef6f51] text-white'
            : 'text-[#5f5950] hover:bg-[rgba(23,21,18,0.06)] dark:text-[rgba(242,236,226,0.66)] dark:hover:bg-[rgba(243,238,229,0.08)]'
        }`}
      >
        KO
      </button>
      <button
        onClick={() => handleLocaleChange('en')}
        disabled={isPending}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
          locale === 'en'
            ? 'bg-[#ef6f51] text-white'
            : 'text-[#5f5950] hover:bg-[rgba(23,21,18,0.06)] dark:text-[rgba(242,236,226,0.66)] dark:hover:bg-[rgba(243,238,229,0.08)]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
