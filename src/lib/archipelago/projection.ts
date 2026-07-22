import type {
  FleetGuideRole,
  FleetProjectionFreshness,
  FleetSemanticGuide,
  FleetSemanticProject,
  FleetSemanticProjection,
  WayfarerState,
} from './model.ts';
import { parseCanonicalProjectCatalog } from './parse-catalog.ts';
import { parseFleetPresentationManifest } from './parse-manifest.ts';
import { parseApprovedPublicSnapshot } from './parse-snapshot.ts';

const WORK_SIGNIFYING_STATES = new Set<WayfarerState>([
  'PLANNING',
  'WORKING',
  'REVIEWING',
  'TESTING',
  'MONITORING',
]);

const STATIC_LIFECYCLES = new Set([
  'WAITING_FOR_RELEASE',
  'BLOCKED',
  'PAUSED',
  'ARCHIVED',
]);

const GUIDE_ROLES = [
  'CODE_ENGINEER',
  'QA_NAVIGATOR',
] as const satisfies readonly FleetGuideRole[];

export type FleetProjectionInput = {
  readonly canonicalInput: unknown;
  readonly snapshotInput: unknown;
  readonly manifestInput: unknown;
  readonly now: Date;
};

function invalidProjection(): FleetSemanticProjection {
  return {
    schemaVersion: '1.0',
    snapshotVersion: null,
    dataMode: null,
    freshness: 'INVALID',
    publishedAt: null,
    reviewAfter: null,
    selectedProjectId: null,
    navigatorBoatKey: null,
    projects: [],
    omittedInternalProjectCount: 0,
  };
}

function projectGuides(
  projectId: string,
  crew: FleetSemanticProject['crew'],
): readonly FleetSemanticGuide[] {
  return GUIDE_ROLES.map((role) => {
    const member = crew.find((candidate) => candidate.role === role);
    return member === undefined
      ? {
          id: `${projectId}-symbolic-${role.toLowerCase().replaceAll('_', '-')}`,
          role,
          state: 'IDLE',
          source: 'SYMBOLIC',
          workSignifying: false,
        }
      : {
          id: member.id,
          role,
          state: member.state,
          source: 'SNAPSHOT',
          workSignifying: member.workSignifying,
        };
  });
}

export function buildFleetSemanticProjection({
  canonicalInput,
  snapshotInput,
  manifestInput,
  now,
}: FleetProjectionInput): FleetSemanticProjection {
  const catalog = parseCanonicalProjectCatalog(canonicalInput);
  const snapshot = parseApprovedPublicSnapshot(snapshotInput);
  const manifest = parseFleetPresentationManifest(manifestInput);
  if (
    catalog === null ||
    snapshot === null ||
    manifest === null ||
    !Number.isFinite(now.getTime()) ||
    Date.parse(snapshot.publishedAt) > now.getTime()
  ) {
    return invalidProjection();
  }

  const canonicalById = new Map(
    catalog.projects.map((project) => [project.id, project]),
  );
  const presentationById = new Map(
    manifest.projects.map((presentation) => [presentation.projectId, presentation]),
  );
  if (
    snapshot.projects.some((project) => !canonicalById.has(project.projectId)) ||
    manifest.projects.some((presentation) => !canonicalById.has(presentation.projectId))
  ) {
    return invalidProjection();
  }

  const freshness: FleetProjectionFreshness =
    snapshot.projects.length === 0
      ? 'EMPTY'
      : now.getTime() >= Date.parse(snapshot.reviewAfter)
        ? 'STALE'
        : 'FRESH';
  const projects: FleetSemanticProject[] = [];
  let omittedInternalProjectCount = 0;

  for (const state of snapshot.projects) {
    const canonical = canonicalById.get(state.projectId);
    if (canonical === undefined) return invalidProjection();
    if (canonical.visibility === 'INTERNAL') {
      omittedInternalProjectCount += 1;
      continue;
    }
    const presentation = presentationById.get(state.projectId);
    if (presentation === undefined) return invalidProjection();
    const canSignifyWork =
      freshness === 'FRESH' && !STATIC_LIFECYCLES.has(state.lifecycle);
    const crew = state.crew.map((member) => ({
      ...member,
      workSignifying:
        canSignifyWork && WORK_SIGNIFYING_STATES.has(member.state),
    }));
    projects.push({
      id: canonical.id,
      name: canonical.name,
      summary: canonical.summary,
      lifecycle: state.lifecycle,
      progressPercent: state.progressPercent,
      version: state.version,
      health: state.health,
      crew,
      guides: projectGuides(canonical.id, crew),
      activityPolicy: crew.some((member) => member.workSignifying)
        ? 'ACTIVE'
        : 'STATIC',
      presentation,
    });
  }

  projects.sort((left, right) =>
    left.presentation.order - right.presentation.order ||
    left.id.localeCompare(right.id),
  );
  const selectedProjectId = projects.some(
    (project) => project.id === snapshot.selectedProjectId,
  )
    ? snapshot.selectedProjectId
    : projects[0]?.id ?? null;

  return {
    schemaVersion: '1.0',
    snapshotVersion: snapshot.snapshotVersion,
    dataMode: snapshot.dataMode,
    freshness: projects.length === 0 ? 'EMPTY' : freshness,
    publishedAt: snapshot.publishedAt,
    reviewAfter: snapshot.reviewAfter,
    selectedProjectId,
    navigatorBoatKey: manifest.navigatorBoatKey,
    projects,
    omittedInternalProjectCount,
  };
}
