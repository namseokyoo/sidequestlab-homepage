import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import type {
  FleetSemanticAdapter,
  FleetSemanticProjection,
} from '../../src/lib/archipelago/model.ts';
import { parseFleetPresentationManifest } from '../../src/lib/archipelago/parse-manifest.ts';
import { parseApprovedPublicSnapshot } from '../../src/lib/archipelago/parse-snapshot.ts';
import { buildFleetSemanticProjection } from '../../src/lib/archipelago/projection.ts';

function readFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`../../src/data/archipelago/${name}`, import.meta.url), 'utf8'),
  );
}

function fixtureProjection(): FleetSemanticProjection {
  return buildFleetSemanticProjection({
    canonicalInput: readFixture('canonical-projects.v1.json'),
    snapshotInput: readFixture('approved-public-snapshot.v1.json'),
    manifestInput: readFixture('presentation-manifest.v1.json'),
    now: new Date('2026-07-21T00:00:00Z'),
  });
}

test('the manifest exposes one Navigator boat and only island associations', () => {
  const rawManifest = readFixture('presentation-manifest.v1.json');
  const manifest = parseFleetPresentationManifest(rawManifest);

  assert.notEqual(manifest, null);
  assert.equal(manifest?.navigatorBoatKey, 'visitor-navigator-boat');
  assert.equal(JSON.stringify(rawManifest).includes('vessel'), false);
  assert.equal(
    manifest?.projects.every((project) => project.islandKey.endsWith('-island')),
    true,
  );
});

test('the public fixture uses only the three verified project identities', () => {
  assert.deepEqual(
    fixtureProjection().projects.map((project) => project.id),
    ['displaylab', 'booksalon', 'nbbang'],
  );
});

test('future publication input fails closed with no active work', () => {
  const snapshot = parseApprovedPublicSnapshot(
    readFixture('approved-public-snapshot.v1.json'),
  );
  assert.notEqual(snapshot, null);
  if (snapshot === null) return;

  const projection = buildFleetSemanticProjection({
    canonicalInput: readFixture('canonical-projects.v1.json'),
    snapshotInput: { ...snapshot, publishedAt: '2026-07-22T00:00:00Z' },
    manifestInput: readFixture('presentation-manifest.v1.json'),
    now: new Date('2026-07-21T00:00:00Z'),
  });

  assert.equal(projection.freshness, 'INVALID');
  assert.deepEqual(projection.projects, []);
});

test('impossible and non-increasing publication instants fail closed by chronology', () => {
  const canonicalInput = readFixture('canonical-projects.v1.json');
  const snapshotInput = readFixture('approved-public-snapshot.v1.json');
  const manifestInput = readFixture('presentation-manifest.v1.json');
  assert.equal(typeof snapshotInput, 'object');
  if (snapshotInput === null || Array.isArray(snapshotInput)) return;
  const impossible = buildFleetSemanticProjection({
    canonicalInput,
    snapshotInput: { ...snapshotInput, publishedAt: '2026-02-30T00:00:00Z' },
    manifestInput,
    now: new Date('2026-07-21T00:00:00Z'),
  });
  const equalInstant = buildFleetSemanticProjection({
    canonicalInput,
    snapshotInput: {
      ...snapshotInput,
      publishedAt: '2026-07-20T00:00:00.000Z',
      reviewAfter: '2026-07-20T00:00:00Z',
    },
    manifestInput,
    now: new Date('2026-07-21T00:00:00Z'),
  });

  assert.equal(impossible.freshness, 'INVALID');
  assert.equal(equalInstant.freshness, 'INVALID');
});

test('malformed canonical and presentation inputs fail closed', () => {
  const canonicalFailure = buildFleetSemanticProjection({
    canonicalInput: { schemaVersion: '1.0', projects: [], privateProjects: [] },
    snapshotInput: readFixture('approved-public-snapshot.v1.json'),
    manifestInput: readFixture('presentation-manifest.v1.json'),
    now: new Date('2026-07-21T00:00:00Z'),
  });
  const manifestFailure = buildFleetSemanticProjection({
    canonicalInput: readFixture('canonical-projects.v1.json'),
    snapshotInput: readFixture('approved-public-snapshot.v1.json'),
    manifestInput: {
      schemaVersion: '1.0',
      navigatorBoatKey: 'visitor-navigator-boat',
      projects: [
        {
          projectId: 'displaylab',
          order: 0,
          portKey: 'forge-port',
          islandKey: 'displaylab-island',
          routeKey: 'displaylab-route',
          vesselKey: 'forbidden-project-vessel',
        },
      ],
    },
    now: new Date('2026-07-21T00:00:00Z'),
  });

  assert.equal(canonicalFailure.freshness, 'INVALID');
  assert.equal(manifestFailure.freshness, 'INVALID');
  assert.deepEqual(canonicalFailure.projects, []);
  assert.deepEqual(manifestFailure.projects, []);
});

test('DOM and SVG adapters receive identical semantic project truth', () => {
  const summarize = (projection: FleetSemanticProjection) =>
    projection.projects.map((project) => ({
      id: project.id,
      lifecycle: project.lifecycle,
      progressPercent: project.progressPercent,
      islandKey: project.presentation.islandKey,
      crewStates: project.crew.map((member) => member.state),
    }));
  const domAdapter: FleetSemanticAdapter<ReturnType<typeof summarize>> = {
    render: (projection) => summarize(projection),
  };
  const svgAdapter: FleetSemanticAdapter<ReturnType<typeof summarize>> = {
    render: (projection) => summarize(projection),
  };
  const projection = fixtureProjection();

  assert.deepEqual(domAdapter.render(projection), svgAdapter.render(projection));
});
