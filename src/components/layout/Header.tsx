'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/projects', label: t('projects') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
    { href: '/workflow', label: t('workflow') },
    { href: '/harness', label: t('harness') },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d8d0c4] bg-[#f7f3ed]/95 text-[#171716] backdrop-blur-lg dark:border-[rgba(243,238,229,0.14)] dark:bg-[#161513]/95 dark:text-[#f2ece2]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-[-0.04em] text-[#171716] dark:text-[#f2ece2]">
            SidequestLab
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-sm font-medium transition-colors hover:text-[#171716] dark:hover:text-[#f2ece2] ${
                isActive(item.href)
                  ? 'text-[#171716] dark:text-[#f2ece2]'
                  : 'text-[#665f56] dark:text-[rgba(242,236,226,0.66)]'
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute -bottom-[1.19rem] left-0 right-0 h-[2px] bg-[#ef6f51]" />
              )}
            </Link>
          ))}
          <ThemeToggle />
          <LanguageSwitcher />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="grid h-11 w-11 place-items-center text-[#292724] hover:text-[#ef6f51] dark:text-[rgba(242,236,226,0.85)] dark:hover:text-[#ef6f51]"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="border-t border-[#d8d0c4] bg-[#f7f3ed]/98 p-4 backdrop-blur-lg lg:hidden dark:border-[rgba(243,238,229,0.14)] dark:bg-[#161513]/98">
          <div className="mb-3 flex items-center justify-end gap-3 border-b border-[#ded7cd] pb-3 dark:border-[rgba(243,238,229,0.12)]">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                  ? 'bg-[#ebe4da] text-[#171716] dark:bg-[rgba(243,238,229,0.1)] dark:text-[#f2ece2]'
                    : 'text-[#5f5950] hover:bg-[#eee8df] hover:text-[#171716] dark:text-[rgba(242,236,226,0.62)] dark:hover:bg-[rgba(243,238,229,0.07)] dark:hover:text-[#f2ece2]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
