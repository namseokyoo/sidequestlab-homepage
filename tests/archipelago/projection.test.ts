import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROJECT_LIFECYCLES,
  WAYFARER_STATES,
  type ApprovedPublicSnapshot,
  type CanonicalProjectCatalog,
  type FleetPresentationManifest,
} from '../../src/lib/archipelago/model.ts';
import { buildFleetSemanticProjection } from '../../src/lib/archipelago/projection.ts';

function makeInputs(count: number): {
  readonly catalog: CanonicalProjectCatalog;
  readonly snapshot: ApprovedPublicSnapshot;
  readonly manifest: FleetPresentationManifest;
} {
  const ids = Array.from({ length: count }, (_, index) => `project-${index + 1}`);
  return {
    catalog: {
      schemaVersion: '1.0',
      projects: ids.map((id, index) => ({
        id,
        visibility: 'PUBLIC',
        name: { ko: `프로젝트 ${index + 1}`, en: `Project ${index + 1}` },
        summary: { ko: '공개 프로젝트', en: 'Public project' },
      })),
    },
    snapshot: {
      schemaVersion: '1.0',
      snapshotVersion: 1,
      dataMode: 'DEMO',
      approvalState: 'APPROVED',
      publishedAt: '2026-07-20T00:00:00Z',
      reviewAfter: '2026-07-22T00:00:00Z',
      selectedProjectId: ids[0] ?? null,
      projects: ids.map((id) => ({
        projectId: id,
        lifecycle: 'BUILDING',
        progressPercent: 50,
        version: 'v0.1.0',
        health: 'NORMAL',
        crew: [],
      })),
    },
    manifest: {
      schemaVersion: '1.0',
      navigatorBoatKey: 'visitor-navigator-boat',
      projects: ids.map((projectId, index) => ({
        projectId,
        order: index,
        portKey: `port-${index + 1}`,
        islandKey: `island-${index + 1}`,
        routeKey: `route-${index + 1}`,
        focusBox: { x: 0, y: 0, width: 1, height: 1 },
        focusScaleCap: 2,
        crewAnchors: {
          codeEngineer: { x: 0.4, y: 0.6 },
          qaNavigator: { x: 0.6, y: 0.6 },
        },
        mobileCrewAnchors: {
          codeEngineer: { x: 0.3, y: 0.64 },
          qaNavigator: { x: 0.7, y: 0.64 },
        },
        landmarkAnchors: [
          { key: `landmark-a-${index + 1}`, anchor: { x: 0.3, y: 0.3 } },
          { key: `landmark-b-${index + 1}`, anchor: { x: 0.7, y: 0.3 } },
        ],
        emblem: {
          key: `emblem-${index + 1}`,
          anchor: { x: 0.5, y: 0.15 },
        },
        labelSafeRegion: { x: 0.3, y: 0.05, width: 0.4, height: 0.15 },
      })),
    },
  };
}

test('declares the complete lifecycle and Wayfarer state contracts', () => {
  assert.deepEqual(PROJECT_LIFECYCLES, [
    'IDEA',
    'PLANNING',
    'DESIGNING',
    'BUILDING',
    'REVIEWING',
    'TESTING',
    'WAITING_FOR_RELEASE',
    'DEPLOYING',
    'OPERATING',
    'MAINTENANCE',
    'BLOCKED',
    'PAUSED',
    'ARCHIVED',
  ]);
  assert.deepEqual(WAYFARER_STATES, [
    'IDLE',
    'PLANNING',
    'WORKING',
    'REVIEWING',
    'TESTING',
    'WAITING_FOR_HUMAN',
    'BLOCKED',
    'COMPLETED',
    'MONITORING',
  ]);
});

test('projects every supported fleet count without truncation or hard-cap failure', () => {
  for (const count of [0, 1, 3, 7, 8, 13, 24, 50]) {
    const inputs = makeInputs(count);
    const projection = buildFleetSemanticProjection({
      canonicalInput: inputs.catalog,
      snapshotInput: inputs.snapshot,
      manifestInput: inputs.manifest,
      now: new Date('2026-07-21T00:00:00Z'),
    });

    assert.equal(projection.freshness, count === 0 ? 'EMPTY' : 'FRESH');
    assert.equal(projection.projects.length, count);
    assert.equal(projection.omittedInternalProjectCount, 0);
  }
});

test('stale and invalid inputs suppress every work-signifying state', () => {
  const staleInputs = makeInputs(1);
  const stale = buildFleetSemanticProjection({
    canonicalInput: staleInputs.catalog,
    snapshotInput: {
      ...staleInputs.snapshot,
      reviewAfter: '2026-07-21T00:00:00Z',
      projects: [
        {
          ...staleInputs.snapshot.projects[0],
          crew: [
            { id: 'builder', role: 'CODE_ENGINEER', state: 'WORKING' },
            { id: 'qa', role: 'QA_NAVIGATOR', state: 'TESTING' },
          ],
        },
      ],
    },
    manifestInput: staleInputs.manifest,
    now: new Date('2026-07-21T00:00:00Z'),
  });
  const invalid = buildFleetSemanticProjection({
    canonicalInput: staleInputs.catalog,
    snapshotInput: { ...staleInputs.snapshot, schemaVersion: '2.0' },
    manifestInput: staleInputs.manifest,
    now: new Date('2026-07-21T00:00:00Z'),
  });

  assert.equal(stale.freshness, 'STALE');
  assert.equal(stale.projects[0]?.activityPolicy, 'STATIC');
  assert.equal(
    stale.projects[0]?.crew.every((member) => !member.workSignifying),
    true,
  );
  assert.equal(invalid.freshness, 'INVALID');
  assert.deepEqual(invalid.projects, []);
});

test('internal canonical projects never enter the public semantic projection', () => {
  const inputs = makeInputs(3);
  const internalProject = {
    id: 'internal-control-plane',
    visibility: 'INTERNAL',
    name: { ko: '내부 운영', en: 'Internal Operations' },
    summary: { ko: '비공개', en: 'Private' },
  } as const;
  const projection = buildFleetSemanticProjection({
    canonicalInput: {
      ...inputs.catalog,
      projects: [...inputs.catalog.projects, internalProject],
    },
    snapshotInput: {
      ...inputs.snapshot,
      projects: [
        ...inputs.snapshot.projects,
        {
          projectId: internalProject.id,
          lifecycle: 'OPERATING',
          progressPercent: 100,
          version: 'v1.0.0',
          health: 'NORMAL',
          crew: [{ id: 'operator', role: 'OPERATOR', state: 'MONITORING' }],
        },
      ],
    },
    manifestInput: {
      ...inputs.manifest,
      projects: [
        ...inputs.manifest.projects,
        {
          projectId: internalProject.id,
          order: 99,
          portKey: 'internal-port',
          islandKey: 'internal-island',
          routeKey: 'internal-route',
          focusBox: { x: 0, y: 0, width: 1, height: 1 },
          focusScaleCap: 2,
          crewAnchors: {
            codeEngineer: { x: 0.4, y: 0.6 },
            qaNavigator: { x: 0.6, y: 0.6 },
          },
          mobileCrewAnchors: {
            codeEngineer: { x: 0.3, y: 0.64 },
            qaNavigator: { x: 0.7, y: 0.64 },
          },
          landmarkAnchors: [
            { key: 'internal-landmark-a', anchor: { x: 0.3, y: 0.3 } },
            { key: 'internal-landmark-b', anchor: { x: 0.7, y: 0.3 } },
          ],
          emblem: { key: 'internal-emblem', anchor: { x: 0.5, y: 0.15 } },
          labelSafeRegion: { x: 0.3, y: 0.05, width: 0.4, height: 0.15 },
        },
      ],
    },
    now: new Date('2026-07-21T00:00:00Z'),
  });

  assert.equal(projection.freshness, 'FRESH');
  assert.equal(projection.projects.length, 3);
  assert.equal(projection.omittedInternalProjectCount, 1);
  assert.equal(
    projection.projects.some((project) => project.id === internalProject.id),
    false,
  );
});
