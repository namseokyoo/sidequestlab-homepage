import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArchipelagoV2Experience } from '@/components/home/ArchipelagoV2/ArchipelagoV2Experience';
import { buildArchipelagoView } from '@/components/home/Archipelago/server';
import type { ArchipelagoLocale } from '@/components/home/Archipelago/types';

type ArchipelagoV2PageProps = {
  readonly params: Promise<{ readonly locale: string }>;
};

function isArchipelagoLocale(locale: string): locale is ArchipelagoLocale {
  return locale === 'ko' || locale === 'en';
}

export const metadata: Metadata = {
  title: 'Living Archipelago V2 — World Engine Preview',
  description: 'A PixiJS-powered living archipelago preview with day/night cycle, animated Wayfarers, and harbor log.',
  robots: { index: false, follow: false },
};

export default async function ArchipelagoV2Page({ params }: ArchipelagoV2PageProps) {
  const { locale } = await params;
  if (!isArchipelagoLocale(locale)) notFound();

  const view = buildArchipelagoView(locale, new Date());
  return <ArchipelagoV2Experience view={view} />;
}
