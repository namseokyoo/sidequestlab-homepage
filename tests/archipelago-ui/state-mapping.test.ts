import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SIMULATOR_STATES,
  deriveWayfarerVisualState,
  getWayfarerPoseFrame,
} from '../../src/components/home/Archipelago/state.ts';

test('Given the five simulator states, When they are projected, Then each has a meaningful pose', () => {
  const poses = SIMULATOR_STATES.map((state) =>
    deriveWayfarerVisualState({ state, workMotionAllowed: true }).pose,
  );

  assert.deepEqual(poses, ['resting', 'working', 'waiting', 'blocked', 'completed']);
});

test('Given five simulator states and four approved frames, When poses map to art, Then only blocked shares the calm idle fallback', () => {
  const frames = SIMULATOR_STATES.map((state) => {
    const visual = deriveWayfarerVisualState({ state, workMotionAllowed: true });
    return getWayfarerPoseFrame(visual.pose);
  });

  assert.deepEqual(frames, [0, 2, 1, 0, 3]);
});

test('Given stale public data, When a work state is projected, Then work-signifying motion stays off', () => {
  const visual = deriveWayfarerVisualState({
    state: 'WORKING',
    workMotionAllowed: false,
  });

  assert.equal(visual.animated, false);
  assert.equal(visual.workSignifying, false);
  assert.equal(visual.pose, 'observing');
});

test('Given invalid public data, When a testing state is projected, Then it is not announced as active testing', () => {
  const visual = deriveWayfarerVisualState({
    state: 'TESTING',
    workMotionAllowed: false,
  });

  assert.equal(visual.pose, 'observing');
  assert.equal(visual.animated, false);
  assert.equal(visual.workSignifying, false);
});

test('Given a testing Wayfarer, When fresh activity is projected, Then the testing tool pose animates', () => {
  const visual = deriveWayfarerVisualState({
    state: 'TESTING',
    workMotionAllowed: true,
  });

  assert.equal(visual.pose, 'testing');
  assert.equal(visual.animated, true);
  assert.equal(visual.workSignifying, true);
});
