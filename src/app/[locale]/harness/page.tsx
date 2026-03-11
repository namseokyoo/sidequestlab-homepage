import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import HarnessPageContent from './HarnessPageContent';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'harness.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default function HarnessPage() {
  return <HarnessPageContent />;
}
