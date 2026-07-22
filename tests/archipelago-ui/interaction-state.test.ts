import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import type { FleetSemanticGuide } from '../../src/lib/archipelago/model.ts';
import {
  createInteractionState,
  getInteractionEligibility,
  openCrewDialog,
  selectProject,
  settleFocus,
} from '../../src/lib/archipelago/interaction-state.ts';
import {
  deriveMotionDecision,
  isSceneMotionAllowed,
} from '../../src/lib/archipelago/motion-policy.ts';
import { buildFleetSemanticProjection } from '../../src/lib/archipelago/projection.ts';
import { getGuideDisplayState } from '../../src/components/home/Archipelago/state.ts';

function readFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(
      new URL(`../../src/data/archipelago/${name}`, import.meta.url),
      'utf8',
    ),
  );
}

function fixtureProjection() {
  return buildFleetSemanticProjection({
    canonicalInput: readFixture('canonical-projects.v1.json'),
    snapshotInput: readFixture('approved-public-snapshot.v1.json'),
    manifestInput: readFixture('presentation-manifest.v1.json'),
    now: new Date('2026-07-21T00:00:00Z'),
  });
}

function activeGuide(): FleetSemanticGuide {
  const guide = fixtureProjection().projects[0]?.guides[0];
  assert.notEqual(guide, undefined);
  return guide ?? {
    id: 'unreachable',
    role: 'CODE_ENGINEER',
    state: 'IDLE',
    source: 'SYMBOLIC',
    workSignifying: false,
  };
}

test('Given three projected projects, When guide truth is inspected, Then active and symbolic roles stay distinct', () => {
  const projection = fixtureProjection();

  assert.deepEqual(
    projection.projects.map((project) => ({
      id: project.id,
      guides: project.guides.map((guide) => ({
        role: guide.role,
        source: guide.source,
        workSignifying: guide.workSignifying,
      })),
    })),
    [
      {
        id: 'displaylab',
        guides: [
          { role: 'CODE_ENGINEER', source: 'SNAPSHOT', workSignifying: true },
          { role: 'QA_NAVIGATOR', source: 'SNAPSHOT', workSignifying: true },
        ],
      },
      {
        id: 'booksalon',
        guides: [
          { role: 'CODE_ENGINEER', source: 'SYMBOLIC', workSignifying: false },
          { role: 'QA_NAVIGATOR', source: 'SYMBOLIC', workSignifying: false },
        ],
      },
      {
        id: 'nbbang',
        guides: [
          { role: 'CODE_ENGINEER', source: 'SYMBOLIC', workSignifying: false },
          { role: 'QA_NAVIGATOR', source: 'SYMBOLIC', workSignifying: false },
        ],
      },
    ],
  );
});

test('Given rapid project selections, When stale and current transitions settle, Then the final request wins', () => {
  const initial = createInteractionState();
  const displaylab = selectProject(initial, 'displaylab', 'ANIMATED');
  const withDialog = openCrewDialog(displaylab, 'CODE_ENGINEER');
  const booksalon = selectProject(withDialog, 'booksalon', 'ANIMATED');
  const staleSettlement = settleFocus(booksalon, displaylab.camera.revision);
  const settled = settleFocus(staleSettlement, booksalon.camera.revision);

  assert.deepEqual(displaylab.camera, {
    phase: 'FOCUSING',
    projectId: 'displaylab',
    revision: 1,
  });
  assert.deepEqual(getInteractionEligibility(displaylab), {
    canOpenCrewDialog: true,
    canUseProjectActions: true,
    canReturnToOverview: true,
  });
  assert.equal(withDialog.dialog.phase, 'OPEN');
  assert.equal(booksalon.dialog.phase, 'CLOSED');
  assert.deepEqual(staleSettlement.camera, booksalon.camera);
  assert.deepEqual(settled.camera, {
    phase: 'FOCUSED',
    projectId: 'booksalon',
    revision: 2,
  });
});

test('Given a selected project, When it is selected again, Then no action revision changes', () => {
  const selected = selectProject(
    createInteractionState(),
    'displaylab',
    'IMMEDIATE',
  );
  const reselected = selectProject(selected, 'displaylab', 'ANIMATED');

  assert.equal(reselected, selected);
  assert.deepEqual(reselected.camera, {
    phase: 'FOCUSED',
    projectId: 'displaylab',
    revision: 1,
  });
});

test('Given guide-only and camera suppression boundaries, When motion is derived, Then each channel settles independently', () => {
  const guide = activeGuide();
  const active = deriveMotionDecision({
    freshness: 'FRESH',
    motionMode: 'SYSTEM',
    prefersReducedMotion: false,
    dataTransferMode: 'STANDARD',
    documentVisible: true,
    sceneVisible: true,
    selectionChanged: true,
    clipAvailable: true,
    guide,
  });
  const guideOnlySuppressedInputs = [
    { clipAvailable: false },
    {
      guide: {
        ...guide,
        source: 'SYMBOLIC' as const,
        workSignifying: false,
      },
    },
  ];
  const cameraSuppressedInputs = [
    { freshness: 'STALE' as const },
    { freshness: 'INVALID' as const },
    { dataTransferMode: 'SAVE_DATA' as const },
    { documentVisible: false },
    { sceneVisible: false },
    { prefersReducedMotion: true },
    { motionMode: 'REDUCED' as const },
    { motionMode: 'OFF' as const },
    { selectionChanged: false },
  ];

  assert.equal(active.transition, 'ANIMATED');
  assert.equal(active.guideMotion, 'PLAY_ONCE');
  assert.equal(active.activeAnimation, true);
  for (const overrides of guideOnlySuppressedInputs) {
    const decision = deriveMotionDecision({
      freshness: 'FRESH',
      motionMode: 'SYSTEM',
      prefersReducedMotion: false,
      dataTransferMode: 'STANDARD',
      documentVisible: true,
      sceneVisible: true,
      selectionChanged: true,
      clipAvailable: true,
      guide,
      ...overrides,
    });
    assert.deepEqual(decision, {
      transition: 'ANIMATED',
      guideMotion: 'SETTLED',
      activeAnimation: false,
      terminalPose: 'ASSEMBLE_COMPLETE',
    });
  }
  for (const overrides of cameraSuppressedInputs) {
    const decision = deriveMotionDecision({
      freshness: 'FRESH',
      motionMode: 'SYSTEM',
      prefersReducedMotion: false,
      dataTransferMode: 'STANDARD',
      documentVisible: true,
      sceneVisible: true,
      selectionChanged: true,
      clipAvailable: true,
      guide,
      ...overrides,
    });
    assert.deepEqual(decision, {
      transition: 'IMMEDIATE',
      guideMotion: 'SETTLED',
      activeAnimation: false,
      terminalPose: 'ASSEMBLE_COMPLETE',
    });
  }
});

test('Given public guide truth, When display state is derived, Then stale and symbolic guides never imply live work', () => {
  const snapshotGuide = activeGuide();
  const staleGuide = { ...snapshotGuide, workSignifying: false };
  const symbolicGuide = {
    ...snapshotGuide,
    source: 'SYMBOLIC' as const,
    workSignifying: false,
  };

  assert.equal(getGuideDisplayState(snapshotGuide, false), snapshotGuide.state);
  assert.equal(getGuideDisplayState(staleGuide, false), 'OBSERVING_PUBLIC');
  assert.equal(getGuideDisplayState(symbolicGuide, false), 'NO_PUBLIC_ACTIVITY');
  assert.equal(getGuideDisplayState(symbolicGuide, true), symbolicGuide.state);
});

test('Given ambient scene constraints, When any safety boundary is active, Then camera motion is disabled', () => {
  const eligible = {
    freshness: 'FRESH' as const,
    motionMode: 'SYSTEM' as const,
    prefersReducedMotion: false,
    dataTransferMode: 'STANDARD' as const,
    documentVisible: true,
    sceneVisible: true,
  };

  assert.equal(isSceneMotionAllowed(eligible), true);
  for (const overrides of [
    { freshness: 'STALE' as const },
    { freshness: 'INVALID' as const },
    { motionMode: 'REDUCED' as const },
    { motionMode: 'OFF' as const },
    { prefersReducedMotion: true },
    { dataTransferMode: 'SAVE_DATA' as const },
    { documentVisible: false },
    { sceneVisible: false },
  ]) {
    assert.equal(isSceneMotionAllowed({ ...eligible, ...overrides }), false);
  }
});

test('Given overview state, When eligibility is queried, Then project and dialog actions remain unavailable', () => {
  assert.deepEqual(getInteractionEligibility(createInteractionState()), {
    canOpenCrewDialog: false,
    canUseProjectActions: false,
    canReturnToOverview: false,
  });
});
