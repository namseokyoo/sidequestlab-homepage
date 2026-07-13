import { Link } from '@/i18n/routing';
import type { CanvasLocale } from './SystemCanvas/canvasData';

type DisplayLabProofSectionProps = {
  locale: CanvasLocale;
};

type ProofListItem = {
  readonly label: string;
  readonly body: string;
};

const copy: Record<CanvasLocale, {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly toolTitle: string;
  readonly tools: readonly string[];
  readonly evidenceTitle: string;
  readonly evidence: readonly ProofListItem[];
  readonly queueTitle: string;
  readonly queueBody: string;
  readonly queue: readonly ProofListItem[];
  readonly primaryCta: string;
  readonly secondaryCta: string;
}> = {
  ko: {
    eyebrow: 'CURRENT VERIFIED PROOF',
    title: 'Display Lab을 현재 홈페이지의 단일 증거 패키지로 공개합니다.',
    body: 'Display Lab은 색역, 시야각, 스펙트럼, HDR, light-quality 분석을 위한 브라우저 기반 디스플레이 엔지니어링 도구입니다. 업로드한 분석 데이터는 해당 분석 흐름에서 브라우저 안에서 처리되는 것으로만 설명합니다.',
    toolTitle: '검증된 분석 범위',
    tools: ['Gamut analysis', 'Viewing-angle analysis', 'Spectrum analysis', 'HDR analysis', 'Panel comparison', 'Light-quality analysis'],
    evidenceTitle: '로컬 증거',
    evidence: [
      {
        label: 'Checks',
        body: 'lint, type-check, test, build가 로컬에서 통과했습니다.',
      },
      {
        label: 'Tests',
        body: '자동 테스트 스위트 통과 기록이 검토되었습니다.',
      },
      {
        label: 'Screenshots',
        body: '홈, gamut, viewing-angle, spectrum, HDR, panel comparison 화면 캡처가 남아 있습니다.',
      },
    ],
    queueTitle: '검증 대기열',
    queueBody: '아래 항목은 Under review, not homepage proof 상태입니다. 대기열은 공개 증거가 아니라 다음 게이트를 고정하기 위한 목록입니다.',
    queue: [
      {
        label: 'LiveNote deploy/account/privacy gate',
        body: '배포 URL, Firebase/Cloud Run, 공개 노트 기본값, 보존/프라이버시 검토가 필요합니다.',
      },
      {
        label: 'nbbang ad/analytics/privacy gate',
        body: '광고, 분석, Search Console, 수익/트래픽, URL 공유 데이터 검토가 필요합니다.',
      },
      {
        label: 'FDTD Lab MCP specialist gate',
        body: '라이선스와 로컬 실행 환경에 묶인 전문 증거 패키지가 필요합니다.',
      },
    ],
    primaryCta: 'Display Lab 열기',
    secondaryCta: '증거 루프 읽기',
  },
  en: {
    eyebrow: 'CURRENT VERIFIED PROOF',
    title: 'Display Lab is the homepage’s only current proof package.',
    body: 'Display Lab is a browser-based engineering toolkit for gamut, viewing-angle, spectrum, HDR, and light-quality analysis. We describe uploaded data only as being processed in-browser within these analysis flows.',
    toolTitle: 'Verified analysis scope',
    tools: ['Gamut analysis', 'Viewing-angle analysis', 'Spectrum analysis', 'HDR analysis', 'Panel comparison', 'Light-quality analysis'],
    evidenceTitle: 'Local evidence',
    evidence: [
      {
        label: 'Checks',
        body: 'Local lint, type-check, test, and build passed.',
      },
      {
        label: 'Tests',
        body: 'The passing automated test-suite record was reviewed.',
      },
      {
        label: 'Screenshots',
        body: 'Home, gamut, viewing-angle, spectrum, HDR, and panel-comparison screenshots were captured.',
      },
    ],
    queueTitle: 'Verification queue',
    queueBody: 'These items are Under review, not homepage proof. The queue is not a public proof claim; it names the next gates.',
    queue: [
      {
        label: 'LiveNote deploy/account/privacy gate',
        body: 'Needs deployed URL, Firebase/Cloud Run, public-note default, retention, and privacy review.',
      },
      {
        label: 'nbbang ad/analytics/privacy gate',
        body: 'Needs ad, analytics, Search Console, revenue/traffic, and URL-shared data review.',
      },
      {
        label: 'FDTD Lab MCP specialist gate',
        body: 'Needs a specialist proof package bound to licensed/local execution evidence.',
      },
    ],
    primaryCta: 'Open Display Lab',
    secondaryCta: 'Read the proof loop',
  },
};

export default function DisplayLabProofSection({ locale }: DisplayLabProofSectionProps) {
  const text = copy[locale];

  return (
    <section className="bg-[var(--sql-ivory)] py-20 text-[var(--sql-ink)] sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-y border-[rgba(17,16,14,0.16)] py-8">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sql-red)]">
              {text.eyebrow}
            </p>
            <h2 className="mt-4 max-w-3xl break-keep text-3xl font-black leading-tight tracking-[-0.055em] sm:text-5xl">
              {text.title}
            </h2>
            <p className="mt-6 max-w-2xl break-keep text-base leading-8 text-[rgba(17,16,14,0.72)]">
              {text.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://displaylab.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-[var(--sql-ink)] px-5 py-2.5 text-sm font-bold text-[var(--sql-ivory)] transition-colors hover:bg-[var(--sql-red-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sql-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sql-ivory)]"
              >
                {text.primaryCta}
              </a>
              <Link
                href="/blog/portfolio-content-proof-loop"
                className="inline-flex rounded-full border border-[rgba(17,16,14,0.22)] px-5 py-2.5 text-sm font-bold text-[var(--sql-ink)] transition-colors hover:border-[var(--sql-red-muted)] hover:text-[var(--sql-red-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sql-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sql-ivory)]"
              >
                {text.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.35rem] border border-[rgba(17,16,14,0.14)] bg-white/50 p-5 shadow-sm shadow-black/5 sm:p-6">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(201,32,25,0.86)]">
                {text.toolTitle}
              </h3>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {text.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-lg border border-[rgba(17,16,14,0.11)] bg-[rgba(243,238,229,0.72)] px-3 py-2 text-sm font-semibold text-[rgba(17,16,14,0.78)]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-[1.35rem] border border-[rgba(17,16,14,0.14)] bg-[var(--sql-ink)] p-5 text-[var(--sql-ivory)] shadow-xl shadow-black/10 sm:p-6">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(243,238,229,0.78)]">
                {text.evidenceTitle}
              </h3>
              <div className="mt-5 grid gap-4">
                {text.evidence.map((item) => (
                  <div key={item.label} className="border-l border-[rgba(209,44,36,0.58)] pl-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--sql-red)]">
                      {item.label}
                    </p>
                    <p className="mt-1 break-keep text-sm leading-7 text-[rgba(243,238,229,0.78)]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="mt-8 rounded-[1.35rem] border border-[rgba(17,16,14,0.14)] bg-[rgba(255,255,255,0.48)] p-5 shadow-sm shadow-black/5 sm:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sql-red)]">
                {text.queueTitle}
              </p>
              <p className="mt-3 max-w-3xl break-keep text-sm leading-7 text-[rgba(17,16,14,0.72)]">
                {text.queueBody}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {text.queue.map((item) => (
              <article
                key={item.label}
                className="rounded-xl border border-dashed border-[rgba(17,16,14,0.2)] bg-[rgba(243,238,229,0.55)] p-4"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(17,16,14,0.58)]">
                  Under review, not homepage proof
                </p>
                <h3 className="mt-3 break-keep text-base font-black leading-snug tracking-[-0.025em]">
                  {item.label}
                </h3>
                <p className="mt-2 break-keep text-sm leading-7 text-[rgba(17,16,14,0.7)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
