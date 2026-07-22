import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArchipelagoExperience } from '@/components/home/Archipelago/ArchipelagoExperience';
import { buildArchipelagoView } from '@/components/home/Archipelago/server';
import type { ArchipelagoLocale } from '@/components/home/Archipelago/types';

type ArchipelagoPreviewPageProps = {
  readonly params: Promise<{ readonly locale: string }>;
};

function isArchipelagoLocale(locale: string): locale is ArchipelagoLocale {
  return locale === 'ko' || locale === 'en';
}

export const metadata: Metadata = {
  title: 'Living Archipelago Preview',
  description: 'A responsive preview of the SidequestLab Living Archipelago.',
  robots: { index: false, follow: false },
};

export default async function ArchipelagoPreviewPage({
  params,
}: ArchipelagoPreviewPageProps) {
  const { locale } = await params;
  if (!isArchipelagoLocale(locale)) notFound();

  const view = buildArchipelagoView(locale, new Date());
  return <ArchipelagoExperience view={view} experienceMode="preview" />;
}
