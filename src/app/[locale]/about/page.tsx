import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  const teamRoles = ['ceo', 'advisor', 'historian', 'fullstack', 'qa', 'devops', 'content', 'growth'];
  const workflowSteps = ['planning', 'init', 'execute', 'verify', 'complete'];
  const documents = ['decisions', 'history', 'projects', 'lessons', 'organization'];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {t('title')}
          </h1>
        </div>

        {/* Vision & Mission */}
        <div className="mb-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              {t('vision.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('vision.content')}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              {t('mission.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('mission.content')}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('values.title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <svg
                  className="h-7 w-7 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t('values.simplicity.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('values.simplicity.description')}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <svg
                  className="h-7 w-7 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t('values.speed.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('values.speed.description')}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="h-7 w-7 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t('values.value.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('values.value.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Organization Structure */}
        <div className="mb-16">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('organization.title')}
          </h2>
          <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
            {t('organization.subtitle')}
          </p>

          <div className="mx-auto max-w-4xl">
            {/* Organization Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              {/* Owner */}
              <div className="flex justify-center mb-4">
                <div className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-center text-white shadow-md">
                  <div className="font-bold">{t('organization.owner')}</div>
                  <div className="text-xs opacity-90">{t('organization.ownerRole')}</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-4">
                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* CEO */}
              <div className="flex justify-center mb-4">
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-center text-white shadow-md">
                  <div className="font-bold">{t('organization.ceo')}</div>
                  <div className="text-xs opacity-90">{t('organization.ceoRole')}</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-4">
                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* Teams Grid */}
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {/* Board Advisor */}
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-800 dark:bg-purple-900/30">
                  <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">{t('organization.teams.advisor.name')}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">{t('organization.teams.advisor.role')}</div>
                </div>

                {/* Dev Team */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/30">
                  <div className="text-sm font-semibold text-green-700 dark:text-green-300">{t('organization.teams.dev.name')}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">{t('organization.teams.dev.role')}</div>
                </div>

                {/* DevOps Team */}
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center dark:border-orange-800 dark:bg-orange-900/30">
                  <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">{t('organization.teams.devops.name')}</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">{t('organization.teams.devops.role')}</div>
                </div>

                {/* Content Team */}
                <div className="rounded-lg border border-pink-200 bg-pink-50 p-3 text-center dark:border-pink-800 dark:bg-pink-900/30">
                  <div className="text-sm font-semibold text-pink-700 dark:text-pink-300">{t('organization.teams.content.name')}</div>
                  <div className="text-xs text-pink-600 dark:text-pink-400">{t('organization.teams.content.role')}</div>
                </div>

                {/* Growth Team */}
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-center dark:border-cyan-800 dark:bg-cyan-900/30">
                  <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">{t('organization.teams.growth.name')}</div>
                  <div className="text-xs text-cyan-600 dark:text-cyan-400">{t('organization.teams.growth.role')}</div>
                </div>

                {/* Historian */}
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-center dark:border-indigo-800 dark:bg-indigo-900/30">
                  <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{t('organization.teams.historian.name')}</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">{t('organization.teams.historian.role')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('team.title')}
          </h2>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Task
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {teamRoles.map((role) => (
                  <tr key={role}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {t(`team.roles.${role}.name`)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {t(`team.roles.${role}.task`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow Protocol */}
        <div className="mb-16">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('workflow.title')}
          </h2>
          <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
            {t('workflow.subtitle')}
          </p>

          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap justify-center gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 w-48">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {t(`workflow.steps.${step}.title`)}
                    </h3>
                    <ul className="space-y-1">
                      {(t.raw(`workflow.steps.${step}.items`) as string[]).map((item: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="mr-1 text-blue-500">-</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <svg className="mx-2 h-6 w-6 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document System */}
        <div className="mb-16">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('documents.title')}
          </h2>
          <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
            {t('documents.subtitle')}
          </p>

          <div className="mx-auto max-w-3xl grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div key={doc} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {t(`documents.items.${doc}.name`)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t(`documents.items.${doc}.desc`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {t('contact.title')}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">
              {t('contact.email')}:
            </span>
            <a
              href="mailto:namseok.yoo@gmail.com"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              namseok.yoo@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
