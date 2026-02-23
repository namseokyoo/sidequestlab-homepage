import { getTranslations } from 'next-intl/server';
import WorkflowPageContent from './WorkflowPageContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'workflow_page' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function WorkflowPage() {
  return <WorkflowPageContent />;
}
