import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildWorkshopModel,
  type CanonicalProjectSummary,
  type PublicLabSnapshot,
} from '../../src/lib/living-workshop/model.ts';

const publicProjects: readonly CanonicalProjectSummary[] = [
  { id: 'displaylab', name: { ko: '디스플레이랩', en: 'DisplayLab' } },
];

function snapshotWithUpdate(update: string): PublicLabSnapshot {
  return {
    schemaVersion: '1.0',
    snapshotVersion: 1,
    updatedOn: '2026-07-20',
    reviewAfter: '2026-07-22',
    publishedDefaultProjectId: 'displaylab',
    projects: [
      {
        projectId: 'displaylab',
        stage: 'build',
        activityMode: 'working',
        update: { ko: '공개 작업을 진행하고 있어요.', en: update },
      },
    ],
    notes: [],
  };
}

test('characterizes rejection of privacy-shaped public copy', () => {
  const unsafeCopy = [
    'Ask operator@example.com for details.',
    'Read /Users/operator/private-plan.md.',
    'API_KEY=secret-public-value',
    'Use feature/private-branch for the worktree.',
  ];

  for (const update of unsafeCopy) {
    const model = buildWorkshopModel(
      snapshotWithUpdate(update),
      [...publicProjects],
      new Date('2026-07-21T00:00:00Z'),
    );
    assert.equal(model.freshness, 'invalid');
    assert.deepEqual(model.projects, []);
  }
});

test('characterizes allowlisted proof links and rejection of unknown projects', () => {
  const safeSnapshot = snapshotWithUpdate('Building the approved public slice.');
  safeSnapshot.projects[0].publicProofHref = 'https://github.com/namseokyoo/displaylab';
  const safeModel = buildWorkshopModel(
    safeSnapshot,
    [...publicProjects],
    new Date('2026-07-21T00:00:00Z'),
  );

  const unknownSnapshot = snapshotWithUpdate('Building the approved public slice.');
  unknownSnapshot.projects[0].projectId = 'internal-control-plane';
  const unknownModel = buildWorkshopModel(
    unknownSnapshot,
    [...publicProjects],
    new Date('2026-07-21T00:00:00Z'),
  );

  assert.equal(safeModel.freshness, 'fresh');
  assert.deepEqual(safeModel.projects.map((project) => project.id), ['displaylab']);
  assert.equal(unknownModel.freshness, 'invalid');
  assert.deepEqual(unknownModel.projects, []);
});
