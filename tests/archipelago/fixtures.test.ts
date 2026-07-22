import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { buildFleetSemanticProjection } from '../../src/lib/archipelago/projection.ts';

function readFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`../../src/data/archipelago/${name}`, import.meta.url), 'utf8'),
  );
}

test('the approved Vertical Slice fixtures project DisplayLab, BookSalon, and N-Bang', () => {
  const projection = buildFleetSemanticProjection({
    canonicalInput: readFixture('canonical-projects.v1.json'),
    snapshotInput: readFixture('approved-public-snapshot.v1.json'),
    manifestInput: readFixture('presentation-manifest.v1.json'),
    now: new Date('2026-07-21T00:00:00Z'),
  });

  assert.equal(projection.freshness, 'FRESH');
  assert.equal(projection.dataMode, 'DEMO');
  assert.equal(projection.projects.length, 3);
  assert.deepEqual(projection.projects.map((project) => project.name.en), [
    'DisplayLab',
    'BookSalon',
    'N-Bang',
  ]);
  assert.equal(projection.selectedProjectId, 'displaylab');
  assert.equal(projection.navigatorBoatKey, 'visitor-navigator-boat');
  assert.equal(
    projection.projects.reduce((count, project) => count + project.crew.length, 0),
    2,
  );

  const displaylab = projection.projects.find((project) => project.id === 'displaylab');
  assert.equal(displaylab?.lifecycle, 'BUILDING');
  assert.equal(displaylab?.progressPercent, 68);
  assert.equal(displaylab?.version, 'v0.9.2');
  assert.equal(displaylab?.health, 'NORMAL');
  assert.deepEqual(displaylab?.crew, [
    {
      id: 'displaylab-code-engineer',
      role: 'CODE_ENGINEER',
      state: 'WORKING',
      workSignifying: true,
    },
    {
      id: 'displaylab-qa-navigator',
      role: 'QA_NAVIGATOR',
      state: 'TESTING',
      workSignifying: true,
    },
  ]);
  assert.equal(displaylab?.presentation.islandKey, 'displaylab-island');
});

test('unknown fields and privacy-shaped fixture text fail closed', () => {
  const canonicalInput = readFixture('canonical-projects.v1.json');
  const snapshotInput = readFixture('approved-public-snapshot.v1.json');
  const manifestInput = readFixture('presentation-manifest.v1.json');

  const unknownField = buildFleetSemanticProjection({
    canonicalInput,
    snapshotInput: { schemaVersion: '1.0', privatePath: '/Users/operator/private' },
    manifestInput,
    now: new Date('2026-07-21T00:00:00Z'),
  });
  const unsafeCanonical = buildFleetSemanticProjection({
    canonicalInput: {
      schemaVersion: '1.0',
      projects: [
        {
          id: 'displaylab',
          visibility: 'PUBLIC',
          name: { ko: '디스플레이랩', en: 'DisplayLab' },
          summary: { ko: '공개 설명', en: 'Ask operator@example.com for access.' },
        },
      ],
    },
    snapshotInput,
    manifestInput,
    now: new Date('2026-07-21T00:00:00Z'),
  });

  assert.equal(unknownField.freshness, 'INVALID');
  assert.equal(unsafeCanonical.freshness, 'INVALID');
  assert.deepEqual(unknownField.projects, []);
  assert.deepEqual(unsafeCanonical.projects, []);

  for (const unsafeText of [
    'Use hotfix/private-client for the release.',
    'See github.com/acme/private-product.',
    'Read /etc/passwd for configuration.',
    'Authorization: Bearer secretvalue1234',
    'Credential AKIAABCDEFGHIJKLMNOP is configured.',
    'Token eyJheader12345.eyJpayload12345.signature12345',
  ]) {
    const unsafe = buildFleetSemanticProjection({
      canonicalInput: {
        schemaVersion: '1.0',
        projects: [{
          id: 'displaylab',
          visibility: 'PUBLIC',
          name: { ko: '디스플레이랩', en: 'DisplayLab' },
          summary: { ko: '공개 설명', en: unsafeText },
        }],
      },
      snapshotInput,
      manifestInput,
      now: new Date('2026-07-21T00:00:00Z'),
    });
    assert.equal(unsafe.freshness, 'INVALID', unsafeText);
    assert.deepEqual(unsafe.projects, [], unsafeText);
  }
});
