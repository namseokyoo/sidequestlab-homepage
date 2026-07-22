export const WORKSHOP_STAGES = [
  'brief',
  'plan',
  'build',
  'qa',
  'release',
  'observe',
  'proof',
] as const;

export const WORKSHOP_ACTIVITY_MODES = [
  'working',
  'reviewing',
  'observing',
  'resting',
] as const;

export type WorkshopStage = (typeof WORKSHOP_STAGES)[number];
export type WorkshopActivityMode = (typeof WORKSHOP_ACTIVITY_MODES)[number];
export type WorkshopMotion = 'assemble' | 'inspect' | 'carry' | 'observe' | 'static';
export type LabNoteKind = 'started' | 'progress' | 'review' | 'released' | 'observed';

export interface LocalizedText {
  ko: string;
  en: string;
}

export interface PublicLabProject {
  projectId: string;
  stage: WorkshopStage;
  activityMode: WorkshopActivityMode;
  update: LocalizedText;
  publicProofHref?: string;
}

export interface PublicLabNote {
  id: string;
  projectId: string;
  date: string;
  kind: LabNoteKind;
  text: LocalizedText;
  href?: string;
}

export interface PublicLabSnapshot {
  schemaVersion: '1.0';
  snapshotVersion: number;
  updatedOn: string;
  reviewAfter: string;
  publishedDefaultProjectId: string | null;
  projects: PublicLabProject[];
  notes: PublicLabNote[];
}

export interface CanonicalProjectSummary {
  id: string;
  name: LocalizedText;
}

export interface WorkshopProject extends PublicLabProject {
  id: string;
  name: LocalizedText;
  motion: WorkshopMotion;
}

export interface WorkshopNote extends PublicLabNote {
  projectName: LocalizedText;
}

export interface WorkshopModel {
  freshness: 'fresh' | 'stale' | 'empty' | 'invalid';
  updatedOn: string | null;
  publishedDefaultProjectId: string | null;
  projects: WorkshopProject[];
  notes: WorkshopNote[];
}

export interface LivingPortfolioProject {
  id: string;
  name: string;
  description: string;
  update: string;
  stage: WorkshopStage;
  activityMode: WorkshopActivityMode;
  motion: WorkshopMotion;
  serviceHref: string;
  serviceCta: string;
  detailHref: string;
}

export interface LivingPortfolioCard {
  id: string;
  name: string;
  description: string;
  detailHref: string;
  stage?: WorkshopStage;
  activityMode?: WorkshopActivityMode;
  update?: string;
}

export interface LivingPortfolioNote {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  kind: LabNoteKind;
  text: string;
  href?: string;
}

export interface LivingPortfolioViewModel {
  freshness: WorkshopModel['freshness'];
  updatedOn: string | null;
  publishedDefaultProjectId: string | null;
  projects: LivingPortfolioProject[];
  cards: LivingPortfolioCard[];
  notes: LivingPortfolioNote[];
}

export interface WorkshopSelectionState {
  selectedProjectId: string | null;
  animatedProjectId: string | null;
  motionEligibleAt: number;
}

const NON_RESTING_MOTION: Partial<
  Record<WorkshopStage, Partial<Record<WorkshopActivityMode, WorkshopMotion>>>
> = {
  brief: { working: 'carry' },
  plan: { working: 'assemble' },
  build: { working: 'assemble' },
  qa: { reviewing: 'inspect' },
  release: { working: 'carry' },
  observe: { observing: 'observe' },
  proof: { reviewing: 'inspect', observing: 'observe' },
};

const NOTE_KINDS: LabNoteKind[] = [
  'started',
  'progress',
  'review',
  'released',
  'observed',
];

const FORBIDDEN_PUBLIC_TEXT = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /(?:\/Users\/|\/home\/|[A-Z]:\\)/i,
  /(?:^|[\/\\])\.env(?:\b|[./\\])/i,
  /\b[0-9a-f]{40}\b/i,
  /\b(?:feature\/|refs\/heads\/|worktree)\S*/i,
  /\b(?:api[_-]?key|secret|token|password|passwd|authorization)\s*[:=]\s*[^\s]+/i,
  /\b(?:sk|ghp|github_pat)-[A-Z0-9_-]{8,}\b/i,
  /(?:매출|사용자\s*수|고객\s*수|revenue|customer\s+count|user\s+count)/i,
];

const ALLOWED_PUBLIC_HOSTS = new Set([
  'github.com',
  'sidequestlab-homepage.vercel.app',
  'displaylab.vercel.app',
  'booksalon-nine.vercel.app',
  'nbbang.click',
]);

function isDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isLocalizedText(
  value: unknown,
  maxKo: number,
  maxEn: number,
): value is LocalizedText {
  if (!value || typeof value !== 'object') return false;
  const text = value as Record<string, unknown>;
  const containsForbiddenText = (candidate: string) =>
    FORBIDDEN_PUBLIC_TEXT.some((pattern) => pattern.test(candidate));
  return (
    typeof text.ko === 'string' &&
    text.ko.trim().length > 0 &&
    text.ko.length <= maxKo &&
    !containsForbiddenText(text.ko) &&
    typeof text.en === 'string' &&
    text.en.trim().length > 0 &&
    text.en.length <= maxEn &&
    !containsForbiddenText(text.en)
  );
}

function isWorkshopStage(value: unknown): value is WorkshopStage {
  return WORKSHOP_STAGES.includes(value as WorkshopStage);
}

function isActivityMode(value: unknown): value is WorkshopActivityMode {
  return WORKSHOP_ACTIVITY_MODES.includes(value as WorkshopActivityMode);
}

function isSafePublicHref(value: unknown): value is string | undefined {
  if (value === undefined) return true;
  if (typeof value !== 'string') return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ALLOWED_PUBLIC_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function daysBetween(from: string, to: string): number {
  const fromMs = Date.parse(`${from}T12:00:00Z`);
  const toMs = Date.parse(`${to}T12:00:00Z`);
  return Math.floor((toMs - fromMs) / 86_400_000);
}

export function deriveMotionMode(
  stage: WorkshopStage,
  activityMode: WorkshopActivityMode,
): WorkshopMotion | null {
  if (activityMode === 'resting') return 'static';
  return NON_RESTING_MOTION[stage]?.[activityMode] ?? null;
}

function invalidModel(): WorkshopModel {
  return {
    freshness: 'invalid',
    updatedOn: null,
    publishedDefaultProjectId: null,
    projects: [],
    notes: [],
  };
}

export function buildWorkshopModel(
  input: unknown,
  canonicalProjects: CanonicalProjectSummary[],
  now = new Date(),
): WorkshopModel {
  if (!input || typeof input !== 'object') return invalidModel();
  const snapshot = input as Partial<PublicLabSnapshot>;
  const todayInKorea = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  if (
    snapshot.schemaVersion !== '1.0' ||
    !Number.isInteger(snapshot.snapshotVersion) ||
    !isDateString(snapshot.updatedOn) ||
    !isDateString(snapshot.reviewAfter) ||
    snapshot.updatedOn > todayInKorea ||
    snapshot.updatedOn > snapshot.reviewAfter ||
    !Array.isArray(snapshot.projects) ||
    snapshot.projects.length > 3 ||
    !Array.isArray(snapshot.notes) ||
    snapshot.notes.length > 3
  ) {
    return invalidModel();
  }

  if (snapshot.projects.length === 0) {
    if (snapshot.publishedDefaultProjectId !== null || snapshot.notes.length > 0) {
      return invalidModel();
    }
    return {
      freshness: 'empty',
      updatedOn: snapshot.updatedOn,
      publishedDefaultProjectId: null,
      projects: [],
      notes: [],
    };
  }

  const canonicalById = new Map(
    canonicalProjects.map((project) => [project.id, project]),
  );
  const seenProjects = new Set<string>();
  const joinedProjects: WorkshopProject[] = [];

  for (const entry of snapshot.projects) {
    if (!entry || typeof entry !== 'object') return invalidModel();
    const candidate = entry as Partial<PublicLabProject>;
    const canonical =
      typeof candidate.projectId === 'string'
        ? canonicalById.get(candidate.projectId)
        : undefined;
    if (
      !canonical ||
      seenProjects.has(canonical.id) ||
      !isWorkshopStage(candidate.stage) ||
      !isActivityMode(candidate.activityMode) ||
      !isLocalizedText(candidate.update, 90, 90) ||
      !isSafePublicHref(candidate.publicProofHref)
    ) {
      return invalidModel();
    }
    const motion = deriveMotionMode(candidate.stage, candidate.activityMode);
    if (!motion) return invalidModel();

    seenProjects.add(canonical.id);
    joinedProjects.push({
      id: canonical.id,
      projectId: canonical.id,
      name: canonical.name,
      stage: candidate.stage,
      activityMode: candidate.activityMode,
      update: candidate.update,
      publicProofHref: candidate.publicProofHref,
      motion,
    });
  }

  if (
    typeof snapshot.publishedDefaultProjectId !== 'string' ||
    !seenProjects.has(snapshot.publishedDefaultProjectId)
  ) {
    return invalidModel();
  }

  const seenNotes = new Set<string>();
  const joinedNotes: WorkshopNote[] = [];
  for (const note of snapshot.notes) {
    if (!note || typeof note !== 'object') return invalidModel();
    const candidate = note as Partial<PublicLabNote>;
    const canonical =
      typeof candidate.projectId === 'string'
        ? canonicalById.get(candidate.projectId)
        : undefined;
    if (
      typeof candidate.id !== 'string' ||
      candidate.id.trim().length === 0 ||
      seenNotes.has(candidate.id) ||
      !canonical ||
      !seenProjects.has(canonical.id) ||
      !isDateString(candidate.date) ||
      candidate.date > snapshot.updatedOn ||
      daysBetween(candidate.date, snapshot.updatedOn) > 30 ||
      !NOTE_KINDS.includes(candidate.kind as LabNoteKind) ||
      !isLocalizedText(candidate.text, 120, 120) ||
      !isSafePublicHref(candidate.href)
    ) {
      return invalidModel();
    }
    seenNotes.add(candidate.id);
    joinedNotes.push({
      id: candidate.id,
      projectId: canonical.id,
      projectName: canonical.name,
      date: candidate.date,
      kind: candidate.kind as LabNoteKind,
      text: candidate.text,
      href: candidate.href,
    });
  }

  return {
    freshness: todayInKorea >= snapshot.reviewAfter ? 'stale' : 'fresh',
    updatedOn: snapshot.updatedOn,
    publishedDefaultProjectId: snapshot.publishedDefaultProjectId,
    projects: joinedProjects,
    notes: joinedNotes.sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export function createSelectionState(
  selectedProjectId: string | null,
): WorkshopSelectionState {
  return {
    selectedProjectId,
    animatedProjectId: null,
    motionEligibleAt: Number.POSITIVE_INFINITY,
  };
}

export function selectProject(
  state: WorkshopSelectionState,
  selectedProjectId: string,
  at: number,
): WorkshopSelectionState {
  if (state.selectedProjectId === selectedProjectId) return state;
  return {
    selectedProjectId,
    animatedProjectId: null,
    motionEligibleAt: at + 9_000,
  };
}

export function getAdjacentStages(stage: WorkshopStage): WorkshopStage[] {
  const index = WORKSHOP_STAGES.indexOf(stage);
  return WORKSHOP_STAGES.slice(Math.max(0, index - 1), index + 2);
}
