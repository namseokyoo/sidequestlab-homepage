import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';

const EMAIL = 'namseok.yoo@gmail.com';

type Locale = 'ko' | 'en';

type PageProps = {
  params: Promise<{ locale: string }>;
};

const copy = {
  ko: {
    metadata: {
      title: 'AI Ops Audit / Setup',
      description:
        'AI 에이전트 작업을 제품처럼 운영하기 위한 intake, routing, evidence gate, reporting 체계를 진단하고 세팅합니다.',
    },
    hero: {
      eyebrow: 'AI OPS AUDIT / SETUP',
      title: 'AI 에이전트 작업, 빠른 산출물보다 먼저 운영 통제가 필요합니다.',
      body:
        'SidequestLab은 AI 작업에서 무엇을 시켰고, 무엇이 검증됐고, 어디서 멈춰야 하는지를 확인할 수 있도록 작업 접수, 실행 라우팅, evidence gate, 보고 루프를 진단하고 세팅합니다.',
      primaryCta: '진단 대화 문의하기',
      secondaryCta: '운영 증거 보기',
      note: '초기 v0.1 오퍼입니다. 실제 고객 성과나 ROI 보장이 아니라, SidequestLab 내부 운영 증거를 바탕으로 한 진단·세팅 범위입니다.',
    },
    forWhom: {
      eyebrow: 'WHO IT IS FOR',
      title: 'AI가 만든 결과보다, AI 작업을 어떻게 맡기고 검증할지가 더 중요한 팀',
      items: [
        'AI 코딩/업무 에이전트를 쓰고 싶지만 결과를 그대로 믿기 어려운 1인 창업자와 소규모 제품팀',
        'Codex, Cline, Cursor, 사내 LLM 도구를 쓰지만 작업 관리와 검증 체계가 약한 기술 리더',
        '사내망·로컬망·전문 도메인처럼 일반 SaaS agent 흐름을 그대로 적용하기 어려운 운영자',
      ],
    },
    audit: {
      eyebrow: 'WHAT GETS AUDITED',
      title: '진단 범위',
      items: [
        ['Task intake', '작업 요청이 목표, 범위, 완료조건, 금지조건으로 정리되는지 봅니다.'],
        ['Execution routing', '사람, AI executor, 자동화, 외부 도구의 역할 분리가 있는지 확인합니다.'],
        ['Evidence model', '테스트, 로그, 스크린샷, artifact, PR/CI 상태가 남는지 점검합니다.'],
        ['Quality gate', 'AI가 self-certify하지 않고 별도 검증 흐름을 거치는지 봅니다.'],
        ['Continuity', '스레드가 바뀌어도 active sprint, ledger, report로 이어받을 수 있는지 확인합니다.'],
        ['Risk boundary', '배포, 공개, 결제, credential, destructive action에 stop gate가 있는지 점검합니다.'],
        ['Reporting loop', '일일/주간 보고가 다음 행동 판단에 도움이 되는지 봅니다.'],
        ['Knowledge capture', '반복 실패가 skill, runbook, policy로 승격되는지 확인합니다.'],
      ],
    },
    setup: {
      eyebrow: 'WHAT GETS SET UP',
      title: '세팅 가능한 산출물',
      items: [
        '작업 intake template / brief format',
        'active sprint / task ledger 운영 방식',
        'AI executor와 verifier 역할 분리',
        'evidence checklist와 final review format',
        'daily / weekly operating report format',
        'stop conditions / escalation ladder',
        'project proof asset ranking과 lightweight proof spine',
        '사내/로컬망 AI agent PoC를 위한 안전한 운영 경계 초안',
      ],
    },
    proof: {
      eyebrow: 'PROOF SPINE',
      title: 'SidequestLab 내부 운영 증거에서 출발합니다.',
      body:
        '이 페이지는 고객 성과를 주장하지 않습니다. 현재 근거는 SidequestLab이 자체 포트폴리오를 운영하며 남긴 작업 접수, 라우팅, 검증, 보고 구조입니다.',
      items: [
        ['Lab operating spine', 'active sprint와 ledger로 Discord thread/UI가 아니라 durable source of truth를 재고정한 운영 케이스'],
        ['Harness smoke', 'fresh checkout에서도 테스트, validator, smoke 흐름을 통과시키며 명령 오류를 수정한 검증 케이스'],
        ['Specialist proof lanes', 'FDTD Lab MCP는 전문 도메인 proof 후보입니다. 실제 Lumerical 운영은 로컬·라이선스 환경에 묶인 gated evidence로 다룹니다.'],
        ['Support cases with limits', 'today-what-to-bring, PocketMic Native는 보조 proof 후보이며 결제 sandbox/submission, 실기기 검증 등 pending gate를 명시합니다.'],
      ],
    },
    model: {
      eyebrow: 'CURRENT OPERATING MODEL',
      title: '현재 런타임 설명은 좁고 검증 가능한 범위로 둡니다.',
      body:
        'Core는 commander/router/verifier 역할을 맡고, Codex/OMX는 실제로 사용된 작업에서 execution route로 기록합니다. 과거의 AI-agent/team 표현을 현재 운영 런타임처럼 포장하지 않습니다.',
    },
    limits: {
      eyebrow: 'HONESTY / LIMITATIONS',
      title: '명시적으로 하지 않는 약속',
      items: [
        '매출, 전환, ROI, 생산성 향상을 보장하지 않습니다.',
        '보안·법무·컴플라이언스 인증을 대체하지 않습니다.',
        '고객 credential, 결제, production deploy를 직접 변경하지 않습니다.',
        '완전 자율 운영이나 자동 공개 게시를 약속하지 않습니다.',
        '모든 팀에 같은 프로세스를 강제하지 않습니다.',
      ],
    },
    next: {
      eyebrow: 'NEXT ACTION',
      title: '작은 실제 작업 1개로 진단 대화를 시작합니다.',
      body:
        '최근 AI 작업 1~3개, 사용 도구, 완료 판단 방식, 막힌 지점을 공유하면 risk/gap audit과 운영 세팅 우선순위를 제안합니다.',
      cta: '이메일로 문의하기',
    },
  },
  en: {
    metadata: {
      title: 'AI Ops Audit / Setup',
      description:
        'An audit and setup offer for intake, routing, evidence gates, and reporting loops around AI-agent work.',
    },
    hero: {
      eyebrow: 'AI OPS AUDIT / SETUP',
      title: 'AI-agent work needs operational control before faster output.',
      body:
        'SidequestLab audits and sets up task intake, execution routing, evidence gates, and reporting loops so AI-agent work can be requested, verified, handed off, and stopped safely.',
      primaryCta: 'Ask for a diagnostic call',
      secondaryCta: 'View operating proof',
      note: 'This is an early v0.1 offer. It does not claim customer results or ROI; it is scoped around audit/setup work backed by SidequestLab internal operating evidence.',
    },
    forWhom: {
      eyebrow: 'WHO IT IS FOR',
      title: 'Teams that care more about assigning and verifying AI work than simply generating output',
      items: [
        'Solo founders and small product teams that want to use AI coding or work agents but cannot simply trust their output',
        'Technical leads using Codex, Cline, Cursor, or internal LLM tools without a clear work-management and verification loop',
        'Operators in local, internal-network, or specialist-domain environments where a generic SaaS-agent workflow does not fit cleanly',
      ],
    },
    audit: {
      eyebrow: 'WHAT GETS AUDITED',
      title: 'Audit scope',
      items: [
        ['Task intake', 'Whether requests are framed with goal, scope, done criteria, and explicit stop conditions.'],
        ['Execution routing', 'How work is split across people, AI executors, automation, and external tools.'],
        ['Evidence model', 'Whether tests, logs, screenshots, artifacts, and PR/CI states are captured.'],
        ['Quality gate', 'Whether AI output is reviewed by a separate verification path instead of self-certified.'],
        ['Continuity', 'Whether active sprint, ledger, and reports survive thread or tool changes.'],
        ['Risk boundary', 'Whether deploys, public posting, payments, credentials, and destructive actions have stop gates.'],
        ['Reporting loop', 'Whether daily/weekly reports help decide the next action, not just show status.'],
        ['Knowledge capture', 'Whether repeated failures become skills, runbooks, or policies.'],
      ],
    },
    setup: {
      eyebrow: 'WHAT GETS SET UP',
      title: 'Setup deliverables',
      items: [
        'Task intake template / brief format',
        'Active sprint / task ledger operating pattern',
        'Separation between AI executor and verifier roles',
        'Evidence checklist and final review format',
        'Daily / weekly operating report format',
        'Stop conditions / escalation ladder',
        'Project proof asset ranking and lightweight proof spine',
        'Draft safe operating boundaries for local/internal AI-agent PoCs',
      ],
    },
    proof: {
      eyebrow: 'PROOF SPINE',
      title: 'The offer starts from SidequestLab internal operating evidence.',
      body:
        'This page does not claim customer outcomes. The current proof base is SidequestLab’s own work-intake, routing, verification, and reporting structure around its portfolio work.',
      items: [
        ['Lab operating spine', 'An operating case that re-anchored durable source of truth in active sprint and ledger records instead of Discord threads or UI state.'],
        ['Harness smoke', 'A verification case where a fresh checkout passed test, validator, and smoke flows while command issues were fixed.'],
        ['Specialist proof lanes', 'FDTD Lab MCP is a specialist proof candidate. Real Lumerical operation remains local/licensed/gated evidence.'],
        ['Support cases with limits', 'today-what-to-bring and PocketMic Native are support proof candidates with pending gates such as payment sandbox/submission and real-device validation.'],
      ],
    },
    model: {
      eyebrow: 'CURRENT OPERATING MODEL',
      title: 'Runtime language stays narrow and checkable.',
      body:
        'Core acts as commander/router/verifier. Codex/OMX are recorded as execution routes only when actually used on a task. Historical AI-agent/team language is not presented as the current runtime.',
    },
    limits: {
      eyebrow: 'HONESTY / LIMITATIONS',
      title: 'Promises this page does not make',
      items: [
        'No revenue, conversion, ROI, or productivity guarantee.',
        'No replacement for security, legal, or compliance certification.',
        'No direct handling of customer credentials, payments, or production deploys.',
        'No promise of fully autonomous operation or automatic public posting.',
        'No one-size-fits-all process forced onto every team.',
      ],
    },
    next: {
      eyebrow: 'NEXT ACTION',
      title: 'Start with one small real task.',
      body:
        'Share one to three recent AI-agent tasks, the tools involved, how completion was judged, and where the workflow broke down. SidequestLab can then map risks, gaps, and setup priorities.',
      cta: 'Email an inquiry',
    },
  },
} satisfies Record<Locale, {
  metadata: { title: string; description: string };
  hero: { eyebrow: string; title: string; body: string; primaryCta: string; secondaryCta: string; note: string };
  forWhom: { eyebrow: string; title: string; items: string[] };
  audit: { eyebrow: string; title: string; items: [string, string][] };
  setup: { eyebrow: string; title: string; items: string[] };
  proof: { eyebrow: string; title: string; body: string; items: [string, string][] };
  model: { eyebrow: string; title: string; body: string };
  limits: { eyebrow: string; title: string; items: string[] };
  next: { eyebrow: string; title: string; body: string; cta: string };
}>;

function resolveLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'ko';
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sql-red)]">
      {children}
    </p>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const text = copy[resolveLocale(locale)];

  return {
    title: text.metadata.title,
    description: text.metadata.description,
    openGraph: {
      title: text.metadata.title,
      description: text.metadata.description,
    },
  };
}

export default async function AiOpsAuditPage({ params }: PageProps) {
  const { locale } = await params;
  const text = copy[resolveLocale(locale)];

  return (
    <div className="bg-[var(--sql-ivory)] text-[var(--sql-ink)]">
      <section className="relative overflow-hidden border-b border-[rgba(17,16,14,0.12)] bg-[var(--sql-paper)] py-20 sm:py-28">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[var(--sql-charcoal)] lg:block" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.75fr] lg:px-8">
          <div>
            <Eyebrow>{text.hero.eyebrow}</Eyebrow>
            <h1 className="mt-5 max-w-4xl break-keep text-4xl font-black leading-[0.98] tracking-[-0.07em] sm:text-6xl lg:text-7xl">
              {text.hero.title}
            </h1>
            <p className="mt-7 max-w-2xl break-keep text-lg leading-8 text-[rgba(17,16,14,0.72)] sm:text-xl">
              {text.hero.body}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={`mailto:${EMAIL}?subject=AI%20Ops%20Audit%20%2F%20Setup%20inquiry`}
                className="inline-flex rounded-full bg-[var(--sql-ink)] px-6 py-3 text-sm font-bold text-[var(--sql-ivory)] transition-colors hover:bg-[var(--sql-red-muted)]"
              >
                {text.hero.primaryCta}
              </a>
              <Link
                href="/harness"
                className="inline-flex rounded-full border border-[rgba(17,16,14,0.22)] px-6 py-3 text-sm font-bold text-[var(--sql-ink)] hover:border-[var(--sql-red)] hover:text-[var(--sql-red)]"
              >
                {text.hero.secondaryCta}
              </Link>
            </div>
          </div>
          <aside className="rounded-[1.75rem] border border-[rgba(17,16,14,0.14)] bg-white/55 p-6 shadow-xl shadow-black/5 lg:border-[rgba(243,238,229,0.18)] lg:bg-[rgba(243,238,229,0.08)] lg:text-[var(--sql-ivory)]">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sql-red)]">v0.1 scope</p>
            <p className="mt-4 break-keep text-base leading-8 text-[rgba(17,16,14,0.74)] lg:text-[rgba(243,238,229,0.82)]">
              {text.hero.note}
            </p>
          </aside>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-[rgba(17,16,14,0.14)] bg-white/45 p-6 shadow-sm shadow-black/5 sm:p-8">
            <Eyebrow>{text.forWhom.eyebrow}</Eyebrow>
            <h2 className="mt-4 max-w-3xl break-keep text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              {text.forWhom.title}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {text.forWhom.items.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-[rgba(17,16,14,0.12)] bg-[rgba(255,255,255,0.64)] p-5">
                  <p className="break-keep text-sm leading-7 text-[rgba(17,16,14,0.72)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(17,16,14,0.12)] bg-[var(--sql-charcoal)] py-16 text-[var(--sql-ivory)] sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <Eyebrow>{text.audit.eyebrow}</Eyebrow>
            <h2 className="mt-4 break-keep text-3xl font-black tracking-[-0.05em] sm:text-4xl">{text.audit.title}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {text.audit.items.map(([title, body], index) => (
              <article key={title} className="rounded-[1.25rem] border border-[rgba(243,238,229,0.14)] bg-[rgba(243,238,229,0.055)] p-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(243,238,229,0.56)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-lg font-black tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 break-keep text-sm leading-7 text-[rgba(243,238,229,0.74)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="rounded-[1.75rem] border border-[rgba(17,16,14,0.14)] bg-white/50 p-6 sm:p-8">
            <Eyebrow>{text.setup.eyebrow}</Eyebrow>
            <h2 className="mt-4 break-keep text-3xl font-black tracking-[-0.05em] sm:text-4xl">{text.setup.title}</h2>
            <ul className="mt-7 grid gap-3">
              {text.setup.items.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-[rgba(17,16,14,0.1)] bg-white/55 p-4 text-sm leading-7 text-[rgba(17,16,14,0.74)]">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--sql-red)]" />
                  <span className="break-keep">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-[rgba(17,16,14,0.14)] bg-[var(--sql-ink)] p-6 text-[var(--sql-ivory)] shadow-xl shadow-black/10 sm:p-8">
            <Eyebrow>{text.model.eyebrow}</Eyebrow>
            <h2 className="mt-4 break-keep text-3xl font-black tracking-[-0.05em] sm:text-4xl">{text.model.title}</h2>
            <p className="mt-6 break-keep text-base leading-8 text-[rgba(243,238,229,0.78)]">{text.model.body}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(17,16,14,0.12)] bg-[var(--sql-paper)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <Eyebrow>{text.proof.eyebrow}</Eyebrow>
            <h2 className="mt-4 break-keep text-3xl font-black tracking-[-0.05em] sm:text-4xl">{text.proof.title}</h2>
            <p className="mt-5 break-keep text-base leading-8 text-[rgba(17,16,14,0.72)]">{text.proof.body}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {text.proof.items.map(([title, body]) => (
              <article key={title} className="rounded-[1.25rem] border border-[rgba(17,16,14,0.12)] bg-[rgba(255,255,255,0.62)] p-5 shadow-sm shadow-black/5">
                <h3 className="text-xl font-black tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 break-keep text-sm leading-7 text-[rgba(17,16,14,0.72)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <Eyebrow>{text.limits.eyebrow}</Eyebrow>
            <h2 className="mt-4 break-keep text-3xl font-black tracking-[-0.05em] sm:text-4xl">{text.limits.title}</h2>
          </div>
          <ul className="grid gap-3">
            {text.limits.items.map((item) => (
              <li key={item} className="rounded-2xl border border-[rgba(201,32,25,0.18)] bg-[rgba(255,255,255,0.58)] p-4 text-sm font-semibold leading-7 text-[rgba(17,16,14,0.74)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--sql-ink)] py-16 text-[var(--sql-ivory)] sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Eyebrow>{text.next.eyebrow}</Eyebrow>
          <h2 className="mt-4 break-keep text-3xl font-black tracking-[-0.05em] sm:text-5xl">{text.next.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl break-keep text-base leading-8 text-[rgba(243,238,229,0.78)]">{text.next.body}</p>
          <a
            href={`mailto:${EMAIL}?subject=AI%20Ops%20Audit%20%2F%20Setup%20inquiry`}
            className="mt-8 inline-flex rounded-full bg-[var(--sql-red)] px-7 py-3 text-sm font-bold text-white hover:bg-[var(--sql-red-muted)]"
          >
            {text.next.cta}
          </a>
        </div>
      </section>
    </div>
  );
}
