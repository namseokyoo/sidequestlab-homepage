import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildWorkshopModel,
  createSelectionState,
  deriveMotionMode,
  getAdjacentStages,
  selectProject,
  type PublicLabSnapshot,
} from '../../src/lib/living-workshop/model.ts';

const projects = [
  { id: 'displaylab', name: { ko: '디스플레이랩', en: 'Display Lab' } },
  { id: 'booksalon', name: { ko: '북살롱', en: 'BookSalon' } },
  { id: 'nbbang', name: { ko: '엔빵 계산기', en: 'N-Bang Calculator' } },
];

function makeSnapshot(
  overrides: Partial<PublicLabSnapshot> = {},
): PublicLabSnapshot {
  return {
    schemaVersion: '1.0',
    snapshotVersion: 1,
    updatedOn: '2026-07-15',
    reviewAfter: '2026-08-15',
    publishedDefaultProjectId: 'displaylab',
    projects: [
      {
        projectId: 'displaylab',
        stage: 'qa',
        activityMode: 'reviewing',
        update: {
          ko: '반응형 화면 흐름을 점검하고 있어요.',
          en: 'Reviewing responsive screen flows.',
        },
      },
      {
        projectId: 'booksalon',
        stage: 'build',
        activityMode: 'working',
        update: {
          ko: '읽기 경험을 다듬고 있어요.',
          en: 'Refining the reading experience.',
        },
      },
      {
        projectId: 'nbbang',
        stage: 'observe',
        activityMode: 'observing',
        update: {
          ko: '정산 흐름을 살펴보고 있어요.',
          en: 'Observing settlement flows.',
        },
      },
    ],
    notes: [
      {
        id: 'displaylab-responsive-review',
        projectId: 'displaylab',
        date: '2026-07-15',
        kind: 'review',
        text: { ko: '반응형 공개 화면 검토', en: 'Responsive public-screen review' },
      },
    ],
    ...overrides,
  };
}

test('joins a fresh public snapshot to canonical project data', () => {
  const model = buildWorkshopModel(
    makeSnapshot(),
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );

  assert.equal(model.freshness, 'fresh');
  assert.equal(model.publishedDefaultProjectId, 'displaylab');
  assert.deepEqual(model.projects.map((project) => project.id), [
    'displaylab',
    'booksalon',
    'nbbang',
  ]);
  assert.equal(model.projects[0]?.motion, 'inspect');
  assert.equal(model.projects[1]?.motion, 'assemble');
  assert.equal(model.projects[2]?.motion, 'observe');
});

test('keeps valid-empty, stale, and invalid states distinct', () => {
  const empty = buildWorkshopModel(
    makeSnapshot({ projects: [], notes: [], publishedDefaultProjectId: null }),
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );
  const stale = buildWorkshopModel(
    makeSnapshot({ reviewAfter: '2026-07-18' }),
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );
  const invalid = buildWorkshopModel(
    makeSnapshot({ publishedDefaultProjectId: 'missing-project' }),
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );

  assert.equal(empty.freshness, 'empty');
  assert.equal(stale.freshness, 'stale');
  assert.equal(invalid.freshness, 'invalid');
  assert.equal(invalid.projects.length, 0);
});

test('invalid stage and activity pairs fail closed', () => {
  const invalid = buildWorkshopModel(
    makeSnapshot({
      projects: [
        {
          projectId: 'displaylab',
          stage: 'brief',
          activityMode: 'reviewing',
          update: { ko: '잘못된 조합', en: 'Invalid pair' },
        },
      ],
    }),
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );

  assert.equal(invalid.freshness, 'invalid');
  assert.equal(invalid.projects.length, 0);
});

test('project selection is atomic and starts with a full rest window', () => {
  const initial = createSelectionState('displaylab');
  const selected = selectProject(initial, 'booksalon', 1_000);

  assert.equal(selected.selectedProjectId, 'booksalon');
  assert.equal(selected.animatedProjectId, null);
  assert.equal(selected.motionEligibleAt, 10_000);
});

test('mobile stage map exposes only the current and adjacent coordinates', () => {
  assert.deepEqual(getAdjacentStages('brief'), ['brief', 'plan']);
  assert.deepEqual(getAdjacentStages('build'), ['plan', 'build', 'qa']);
  assert.deepEqual(getAdjacentStages('proof'), ['observe', 'proof']);
});

test('reviewAfter is the first stale day in Korea', () => {
  const current = buildWorkshopModel(
    makeSnapshot({ reviewAfter: '2026-07-20' }),
    projects,
    new Date('2026-07-19T14:59:59.999Z'),
  );
  const stale = buildWorkshopModel(
    makeSnapshot({ reviewAfter: '2026-07-20' }),
    projects,
    new Date('2026-07-19T15:00:00Z'),
  );
  assert.equal(current.freshness, 'fresh');
  assert.equal(stale.freshness, 'stale');
});

test('the complete stage and activity contract has exactly 15 allowed pairs', () => {
  const stages = ['brief', 'plan', 'build', 'qa', 'release', 'observe', 'proof'] as const;
  const modes = ['working', 'reviewing', 'observing', 'resting'] as const;
  const allowed = stages.flatMap((stage) =>
    modes.flatMap((mode) => {
      const motion = deriveMotionMode(stage, mode);
      return motion ? [[stage, mode, motion] as const] : [];
    }),
  );

  assert.equal(allowed.length, 15);
  assert.deepEqual(allowed.filter(([, mode]) => mode === 'resting').length, 7);
  assert.equal(deriveMotionMode('build', 'working'), 'assemble');
  assert.equal(deriveMotionMode('qa', 'observing'), null);
});

test('privacy-shaped public copy fails closed', () => {
  const snapshot = makeSnapshot();
  snapshot.projects[0]!.update.en = 'Ask operator@example.com for the current branch';

  const model = buildWorkshopModel(
    snapshot,
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );

  assert.equal(model.freshness, 'invalid');
});

test('impossible dates, future snapshots, and secret-shaped copy fail closed', () => {
  const impossible = buildWorkshopModel(
    makeSnapshot({ reviewAfter: '2026-99-99' }),
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );
  const future = buildWorkshopModel(
    makeSnapshot({ updatedOn: '2099-01-01', reviewAfter: '2099-02-01' }),
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );
  const secretSnapshot = makeSnapshot();
  secretSnapshot.notes[0]!.text.en = 'API_KEY=secret-public-value';
  const secret = buildWorkshopModel(
    secretSnapshot,
    projects,
    new Date('2026-07-20T00:00:00Z'),
  );

  assert.equal(impossible.freshness, 'invalid');
  assert.equal(future.freshness, 'invalid');
  assert.equal(secret.freshness, 'invalid');
});
