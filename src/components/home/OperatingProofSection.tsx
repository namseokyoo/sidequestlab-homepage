import { Link } from '@/i18n/routing';
import type { CanvasLocale } from './SystemCanvas/canvasData';

type OperatingProofSectionProps = {
  locale: CanvasLocale;
};

const copy = {
  ko: {
    eyebrow: 'CONTENT PROOF',
    title: '포트폴리오가 보여줘야 할 것은 “예쁜 화면”이 아니라 운영 증거입니다.',
    body: 'SidequestLab은 아이디어를 제품으로 만들고, 배포 이후의 QA·회고·하네스까지 함께 공개합니다. 방문자는 서비스, 작업 방식, 검증 기록을 한 흐름으로 확인할 수 있어야 합니다.',
    pillars: [
      {
        label: 'Live services',
        title: '지금 열어볼 수 있는 제품',
        body: 'Display Lab, BookSalon, PulseUp, N-Bang처럼 실제 URL과 저장소가 연결된 프로젝트를 앞에 배치합니다.',
      },
      {
        label: 'Operating system',
        title: '반복 가능한 제작 방식',
        body: '기획, 병렬 실행, QA, 배포, 회고를 하네스와 워크플로우로 묶어 다음 작업의 기준으로 남깁니다.',
      },
      {
        label: 'Public evidence',
        title: '검증 가능한 기록',
        body: '블로그, 리포트, PR, 스크린샷 증거를 연결해 “했다”가 아니라 “검증됐다”를 보여줍니다.',
      },
    ],
    loopTitle: '운영 루프',
    loop: ['아이디어', 'MVP', 'QA', '배포', '회고', '하네스 강화'],
    ctaPrimary: '하네스 보기',
    ctaSecondary: '작업 방식 보기',
    auditBridgeTitle: 'AI Ops Audit / Setup',
    auditBridgeBody: 'AI 에이전트 작업을 믿기 어렵다면, SidequestLab의 운영 증거를 intake, routing, evidence gate, reporting 진단·세팅으로 가져갈 수 있습니다.',
    auditBridgeCta: '진단 페이지 보기',
  },
  en: {
    eyebrow: 'CONTENT PROOF',
    title: 'This portfolio should prove operations, not just show a polished screen.',
    body: 'SidequestLab turns ideas into products and publishes the operating layer around them: QA, deployment, retrospectives, and harness evidence. A visitor should see services, workflow, and verification in one narrative.',
    pillars: [
      {
        label: 'Live services',
        title: 'Products you can open now',
        body: 'Projects such as Display Lab, BookSalon, PulseUp, and N-Bang are presented with real URLs and repositories.',
      },
      {
        label: 'Operating system',
        title: 'A repeatable build method',
        body: 'Planning, parallel execution, QA, deployment, and retrospectives are captured as workflow and harness rules for the next run.',
      },
      {
        label: 'Public evidence',
        title: 'Records that can be checked',
        body: 'Posts, reports, PRs, and screenshot evidence turn “we did it” into “it was verified.”',
      },
    ],
    loopTitle: 'Operating loop',
    loop: ['Idea', 'MVP', 'QA', 'Deploy', 'Retro', 'Harness'],
    ctaPrimary: 'View harness',
    ctaSecondary: 'See workflow',
    auditBridgeTitle: 'AI Ops Audit / Setup',
    auditBridgeBody: 'If AI-agent work is hard to trust, SidequestLab can turn its operating proof into an audit/setup pass for intake, routing, evidence gates, and reporting.',
    auditBridgeCta: 'View audit page',
  },
};

export default function OperatingProofSection({ locale }: OperatingProofSectionProps) {
  const text = copy[locale];

  return (
    <section className="bg-[var(--sql-ivory)] py-16 text-[var(--sql-ink)] sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.25fr] lg:px-8">
        <div className="rounded-[1.75rem] border border-[rgba(17,16,14,0.14)] bg-white/45 p-6 shadow-sm shadow-black/5 sm:p-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sql-red)]">
            {text.eyebrow}
          </p>
          <h2 className="mt-4 max-w-xl break-keep text-3xl font-black leading-tight tracking-[-0.055em] sm:text-4xl">
            {text.title}
          </h2>
          <p className="mt-5 break-keep text-base leading-8 text-[rgba(17,16,14,0.72)]">
            {text.body}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/harness"
              className="inline-flex rounded-full bg-[var(--sql-red)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--sql-red-dark)]"
            >
              {text.ctaPrimary}
            </Link>
            <Link
              href="/workflow"
              className="inline-flex rounded-full border border-[rgba(17,16,14,0.2)] px-5 py-2.5 text-sm font-bold text-[var(--sql-ink)] transition-colors hover:border-[var(--sql-red)] hover:text-[var(--sql-red)]"
            >
              {text.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            {text.pillars.map((pillar) => (
              <article
                key={pillar.label}
                className="rounded-[1.35rem] border border-[rgba(17,16,14,0.12)] bg-[rgba(255,255,255,0.62)] p-5 shadow-sm shadow-black/5"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(201,32,25,0.86)]">
                  {pillar.label}
                </p>
                <h3 className="mt-3 break-keep text-xl font-black leading-snug tracking-[-0.04em]">
                  {pillar.title}
                </h3>
                <p className="mt-3 break-keep text-sm leading-7 text-[rgba(17,16,14,0.72)]">
                  {pillar.body}
                </p>
              </article>
            ))}
          </div>

          <div className="rounded-[1.35rem] border border-[rgba(17,16,14,0.14)] bg-[var(--sql-ink)] p-5 text-[var(--sql-ivory)] shadow-xl shadow-black/10 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(243,238,229,0.86)]">
                {text.loopTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {text.loop.map((step, index) => (
                  <span
                    key={step}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(243,238,229,0.28)] bg-[rgba(243,238,229,0.06)] px-3 py-1.5 text-xs font-semibold text-[rgba(243,238,229,0.96)]"
                  >
                    <span className="font-mono text-[10px] text-[var(--sql-red)]">{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-[rgba(201,32,25,0.22)] bg-[rgba(255,255,255,0.62)] p-5 shadow-sm shadow-black/5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(201,32,25,0.86)]">
                  {text.auditBridgeTitle}
                </p>
                <p className="mt-3 max-w-2xl break-keep text-sm leading-7 text-[rgba(17,16,14,0.72)]">
                  {text.auditBridgeBody}
                </p>
              </div>
              <Link
                href="/ai-ops-audit"
                className="inline-flex shrink-0 rounded-full bg-[var(--sql-red)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--sql-red-muted)]"
              >
                {text.auditBridgeCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
