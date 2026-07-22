import {
  PROJECT_HEALTH_STATES,
  PROJECT_LIFECYCLES,
  PUBLIC_DATA_MODES,
  WAYFARER_ROLES,
  WAYFARER_STATES,
  type ApprovedPublicProjectState,
  type ApprovedPublicSnapshot,
  type ApprovedPublicWayfarer,
} from './model.ts';
import {
  hasExactKeys,
  isRecord,
  readInteger,
  readIsoInstant,
  readOneOf,
  readPublicId,
  readSemanticVersion,
} from './parse-utils.ts';

function readWayfarer(value: unknown): ApprovedPublicWayfarer | null {
  if (!isRecord(value) || !hasExactKeys(value, ['id', 'role', 'state'])) {
    return null;
  }
  const id = readPublicId(value.id);
  const role = readOneOf(value.role, WAYFARER_ROLES);
  const state = readOneOf(value.state, WAYFARER_STATES);
  return id === null || role === null || state === null ? null : { id, role, state };
}

function readProjectState(value: unknown): ApprovedPublicProjectState | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      'projectId',
      'lifecycle',
      'progressPercent',
      'version',
      'health',
      'crew',
    ]) ||
    !Array.isArray(value.crew)
  ) {
    return null;
  }
  const projectId = readPublicId(value.projectId);
  const lifecycle = readOneOf(value.lifecycle, PROJECT_LIFECYCLES);
  const progressPercent = readInteger(value.progressPercent, 0, 100);
  const version = readSemanticVersion(value.version);
  const health = readOneOf(value.health, PROJECT_HEALTH_STATES);
  if (
    projectId === null ||
    lifecycle === null ||
    progressPercent === null ||
    version === null ||
    health === null
  ) {
    return null;
  }

  const crew: ApprovedPublicWayfarer[] = [];
  const crewIds = new Set<string>();
  for (const candidate of value.crew) {
    const member = readWayfarer(candidate);
    if (member === null || crewIds.has(member.id)) return null;
    crewIds.add(member.id);
    crew.push(member);
  }
  return { projectId, lifecycle, progressPercent, version, health, crew };
}

export function parseApprovedPublicSnapshot(
  input: unknown,
): ApprovedPublicSnapshot | null {
  if (
    !isRecord(input) ||
    !hasExactKeys(input, [
      'schemaVersion',
      'snapshotVersion',
      'dataMode',
      'approvalState',
      'publishedAt',
      'reviewAfter',
      'selectedProjectId',
      'projects',
    ]) ||
    input.schemaVersion !== '1.0' ||
    input.approvalState !== 'APPROVED' ||
    !Array.isArray(input.projects)
  ) {
    return null;
  }
  const snapshotVersion = readInteger(input.snapshotVersion, 1, Number.MAX_SAFE_INTEGER);
  const dataMode = readOneOf(input.dataMode, PUBLIC_DATA_MODES);
  const publishedAt = readIsoInstant(input.publishedAt);
  const reviewAfter = readIsoInstant(input.reviewAfter);
  const selectedProjectId =
    input.selectedProjectId === null ? null : readPublicId(input.selectedProjectId);
  if (
    snapshotVersion === null ||
    dataMode === null ||
    publishedAt === null ||
    reviewAfter === null ||
    selectedProjectId === null && input.selectedProjectId !== null ||
    Date.parse(reviewAfter) <= Date.parse(publishedAt)
  ) {
    return null;
  }

  const projects: ApprovedPublicProjectState[] = [];
  const projectIds = new Set<string>();
  for (const candidate of input.projects) {
    const project = readProjectState(candidate);
    if (project === null || projectIds.has(project.projectId)) return null;
    projectIds.add(project.projectId);
    projects.push(project);
  }
  if (
    projects.length === 0
      ? selectedProjectId !== null
      : selectedProjectId === null || !projectIds.has(selectedProjectId)
  ) {
    return null;
  }
  return {
    schemaVersion: '1.0',
    snapshotVersion,
    dataMode,
    approvalState: 'APPROVED',
    publishedAt,
    reviewAfter,
    selectedProjectId,
    projects,
  };
}
