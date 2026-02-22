import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  const workflowSteps = ['planning', 'init', 'execute', 'verify', 'complete'];
  const documents = ['decisions', 'history', 'projects', 'lessons', 'organization'];

  const values = [1, 2, 3, 4, 5].map(i => ({
    name: t(`values.items_${i}_name`),
    desc: t(`values.items_${i}_desc`),
    icon: t(`values.items_${i}_icon`),
  }));

  const memberKeys = ['neumann', 'turing', 'hamilton', 'torvalds', 'oppenheimer', 'herodotus', 'sagan', 'fermi'];
  const teamMembers = memberKeys.map(key => ({
    name: t(`team.members.${key}.name`),
    role: t(`team.members.${key}.role`),
    desc: t(`team.members.${key}.desc`),
  }));

  const avatarColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-orange-500',
  ];

  return (
    <div>
      {/* Vision & Mission Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              {t('vision.title')}
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-500 italic dark:text-gray-400">
              &ldquo;{t('vision.quote')}&rdquo;
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Vision Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {t('vision.vision_title')}
              </h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                {t('vision.vision_desc')}
              </p>
            </div>

            {/* Mission Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {t('vision.mission_title')}
              </h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                {t('vision.mission_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-gray-50 py-20 sm:py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('values.title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.slice(0, 3).map((value, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="mb-4 text-3xl">{value.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {value.name}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 md:mx-auto md:max-w-2xl">
            {values.slice(3, 5).map((value, index) => (
              <div
                key={index + 3}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="mb-4 text-3xl">{value.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {value.name}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Structure */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t('organization.title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('organization.subtitle')}
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              {/* Owner */}
              <div className="flex justify-center mb-6">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 text-center dark:border-gray-700 dark:bg-gray-800">
                  <div className="font-semibold text-gray-900 dark:text-white">{t('organization.owner')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('organization.ownerRole')}</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* CEO */}
              <div className="flex justify-center mb-6">
                <div className="rounded-lg border border-gray-300 bg-gray-900 px-6 py-3 text-center dark:border-gray-600 dark:bg-white">
                  <div className="font-semibold text-white dark:text-gray-900">{t('organization.ceo')}</div>
                  <div className="text-xs text-gray-300 dark:text-gray-500">{t('organization.ceoRole')}</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* Teams Grid */}
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {['advisor', 'dev', 'devops', 'content', 'growth', 'historian'].map((team) => (
                  <div
                    key={team}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(`organization.teams.${team}.name`)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t(`organization.teams.${team}.role`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="bg-gray-50 py-20 sm:py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('team.title')}
          </h2>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-800 dark:bg-gray-950"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-bold ${avatarColors[index % avatarColors.length]}`}>
                  {member.name.charAt(0)}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {member.name}
                </div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {member.role}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Protocol */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t('workflow.title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('workflow.subtitle')}
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap justify-center gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="w-48 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {t(`workflow.steps.${step}.title`)}
                    </h3>
                    <ul className="space-y-1">
                      {(t.raw(`workflow.steps.${step}.items`) as string[]).map((item: string, i: number) => (
                        <li key={i} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                          <span className="mr-1.5 text-gray-400">-</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <svg className="mx-2 h-5 w-5 text-gray-300 hidden md:block dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Document System */}
      <section className="bg-gray-50 py-20 sm:py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t('documents.title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('documents.subtitle')}
            </p>
          </div>

          <div className="mx-auto max-w-3xl grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div key={doc} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      </section>

      {/* Contact */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
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
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                href={`mailto:${t('contact.email')}`}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {t('contact.email')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
