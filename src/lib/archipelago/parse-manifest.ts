import type {
  FleetPresentationManifest,
  NormalizedBox,
  NormalizedPoint,
  ProjectCrewAnchors,
  ProjectEmblem,
  ProjectLandmarkAnchor,
  ProjectPresentation,
} from './model.ts';
import {
  hasExactKeys,
  isRecord,
  readFiniteNumber,
  readInteger,
  readPresentationKey,
  readPublicId,
} from './parse-utils.ts';

function readPoint(value: unknown): NormalizedPoint | null {
  if (!isRecord(value) || !hasExactKeys(value, ['x', 'y'])) return null;
  const x = readFiniteNumber(value.x, 0, 1);
  const y = readFiniteNumber(value.y, 0, 1);
  return x === null || y === null ? null : { x, y };
}

function readBox(value: unknown): NormalizedBox | null {
  if (
    !isRecord(value)
    || !hasExactKeys(value, ['x', 'y', 'width', 'height'])
  ) {
    return null;
  }
  const x = readFiniteNumber(value.x, 0, 1);
  const y = readFiniteNumber(value.y, 0, 1);
  const width = readFiniteNumber(value.width, 0, 1);
  const height = readFiniteNumber(value.height, 0, 1);
  return x === null
    || y === null
    || width === null
    || height === null
    || width === 0
    || height === 0
    || x + width > 1
    || y + height > 1
    ? null
    : { x, y, width, height };
}

function pointInside(point: NormalizedPoint, box: NormalizedBox): boolean {
  return point.x >= box.x
    && point.x <= box.x + box.width
    && point.y >= box.y
    && point.y <= box.y + box.height;
}

function boxInside(inner: NormalizedBox, outer: NormalizedBox): boolean {
  return pointInside(inner, outer)
    && pointInside(
      { x: inner.x + inner.width, y: inner.y + inner.height },
      outer,
    );
}

function readCrewAnchors(value: unknown): ProjectCrewAnchors | null {
  if (
    !isRecord(value)
    || !hasExactKeys(value, ['codeEngineer', 'qaNavigator'])
  ) {
    return null;
  }
  const codeEngineer = readPoint(value.codeEngineer);
  const qaNavigator = readPoint(value.qaNavigator);
  return codeEngineer === null || qaNavigator === null
    ? null
    : { codeEngineer, qaNavigator };
}

function readLandmarkAnchors(
  value: unknown,
): readonly ProjectLandmarkAnchor[] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const anchors: ProjectLandmarkAnchor[] = [];
  const keys = new Set<string>();
  for (const candidate of value) {
    if (!isRecord(candidate) || !hasExactKeys(candidate, ['key', 'anchor'])) {
      return null;
    }
    const key = readPresentationKey(candidate.key);
    const anchor = readPoint(candidate.anchor);
    if (key === null || anchor === null || keys.has(key)) return null;
    keys.add(key);
    anchors.push({ key, anchor });
  }
  return anchors;
}

function readEmblem(value: unknown): ProjectEmblem | null {
  if (!isRecord(value) || !hasExactKeys(value, ['key', 'anchor'])) return null;
  const key = readPresentationKey(value.key);
  const anchor = readPoint(value.anchor);
  return key === null || anchor === null ? null : { key, anchor };
}

function readPresentation(value: unknown): ProjectPresentation | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      'projectId',
      'order',
      'portKey',
      'islandKey',
      'routeKey',
      'focusBox',
      'focusScaleCap',
      'crewAnchors',
      'mobileCrewAnchors',
      'landmarkAnchors',
      'emblem',
      'labelSafeRegion',
    ])
  ) {
    return null;
  }
  const projectId = readPublicId(value.projectId);
  const order = readInteger(value.order, 0, Number.MAX_SAFE_INTEGER);
  const portKey = readPresentationKey(value.portKey);
  const islandKey = readPresentationKey(value.islandKey);
  const routeKey = readPresentationKey(value.routeKey);
  const focusBox = readBox(value.focusBox);
  const focusScaleCap = readFiniteNumber(value.focusScaleCap, 1, 2.5);
  const crewAnchors = readCrewAnchors(value.crewAnchors);
  const mobileCrewAnchors = readCrewAnchors(value.mobileCrewAnchors);
  const landmarkAnchors = readLandmarkAnchors(value.landmarkAnchors);
  const emblem = readEmblem(value.emblem);
  const labelSafeRegion = readBox(value.labelSafeRegion);
  return projectId === null ||
    order === null ||
    portKey === null ||
    islandKey === null ||
    routeKey === null ||
    focusBox === null ||
    focusScaleCap === null ||
    crewAnchors === null ||
    mobileCrewAnchors === null ||
    landmarkAnchors === null ||
    emblem === null ||
    labelSafeRegion === null ||
    !pointInside(crewAnchors.codeEngineer, focusBox) ||
    !pointInside(crewAnchors.qaNavigator, focusBox) ||
    !landmarkAnchors.every((landmark) => pointInside(landmark.anchor, focusBox)) ||
    !pointInside(emblem.anchor, focusBox) ||
    !boxInside(labelSafeRegion, focusBox)
    ? null
    : {
        projectId,
        order,
        portKey,
        islandKey,
        routeKey,
        focusBox,
        focusScaleCap,
        crewAnchors,
        mobileCrewAnchors,
        landmarkAnchors,
        emblem,
        labelSafeRegion,
      };
}

export function parseFleetPresentationManifest(
  input: unknown,
): FleetPresentationManifest | null {
  if (
    !isRecord(input) ||
    !hasExactKeys(input, ['schemaVersion', 'navigatorBoatKey', 'projects']) ||
    input.schemaVersion !== '1.0' ||
    !Array.isArray(input.projects)
  ) {
    return null;
  }

  const navigatorBoatKey = readPresentationKey(input.navigatorBoatKey);
  if (navigatorBoatKey === null) return null;

  const projects: ProjectPresentation[] = [];
  const projectIds = new Set<string>();
  const orders = new Set<number>();
  const emblemKeys = new Set<string>();
  for (const candidate of input.projects) {
    const presentation = readPresentation(candidate);
    if (
      presentation === null ||
      projectIds.has(presentation.projectId) ||
      orders.has(presentation.order) ||
      emblemKeys.has(presentation.emblem.key)
    ) {
      return null;
    }
    projectIds.add(presentation.projectId);
    orders.add(presentation.order);
    emblemKeys.add(presentation.emblem.key);
    projects.push(presentation);
  }
  return { schemaVersion: '1.0', navigatorBoatKey, projects };
}
