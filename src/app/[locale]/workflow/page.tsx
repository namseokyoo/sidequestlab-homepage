import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { workflows } from '@/lib/workflows';
import MermaidDiagram from '@/components/ui/MermaidDiagram';

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
  const t = useTranslations('workflow_page');
  const locale = useLocale() as 'ko' | 'en';

  const sectionKeys = [
    'project_lifecycle',
    'tech_review',
    'org_structure',
    'decision_process',
  ] as const;

  return (
    <div>
      {/* Hero Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              {t('title')}
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-500 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Sections */}
      {sectionKeys.map((key, index) => {
        const workflow = workflows.find((w) => w.id === key);
        if (!workflow) return null;

        const hasConstraints =
          key === 'project_lifecycle' ||
          key === 'tech_review' ||
          key === 'decision_process';

        const isEven = index % 2 === 0;

        return (
          <section
            key={key}
            className={`py-20 sm:py-24 ${
              isEven
                ? 'bg-gray-50 dark:bg-gray-900'
                : ''
            }`}
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  {t(`sections.${key}.description`)}
                </p>
              </div>

              {/* Mermaid Diagram */}
              <div className="mx-auto max-w-4xl">
                <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-950">
                  <MermaidDiagram
                    chart={workflow.chart[locale]}
                    className="flex justify-center"
                  />
                </div>
              </div>

              {/* Key Constraints */}
              {hasConstraints && (
                <div className="mx-auto mt-8 max-w-2xl">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/50 dark:bg-amber-900/20">
                    <h3 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {locale === 'ko' ? '핵심 제약 조건' : 'Key Constraints'}
                    </h3>
                    <ul className="space-y-2">
                      {(
                        t.raw(`sections.${key}.constraints`) as string[]
                      ).map((constraint: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400"
                        >
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
