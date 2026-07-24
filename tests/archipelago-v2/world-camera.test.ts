import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FOCUS_TRANSITION_MS,
  OVERVIEW_CAMERA,
  focusCameraTarget,
  screenToWorld,
  tweenCamera,
  voyageCameraAt,
  worldToScreen,
  type VoyageWaypoint,
} from '../../src/lib/archipelago-world/camera.ts';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../../src/lib/archipelago-world/islands.ts';

// worldToScreen/screenToWorld take the *viewport* size (matching the
// engine's applyCamera convention). Tests use a representative stage.
const VIEWPORT = { width: 1440, height: 640 };

test('Given the camera contract, When transitions are configured, Then duration stays within 240–600ms', () => {
  assert.ok(FOCUS_TRANSITION_MS >= 240 && FOCUS_TRANSITION_MS <= 600);
});

test('Given a focus box, When the camera target is computed, Then zoom respects the scale cap', () => {
  const target = focusCameraTarget(
    { x: 0.28, y: 0.1, width: 0.44, height: 0.38, scaleCap: 1.9 },
    { width: WORLD_WIDTH, height: WORLD_HEIGHT },
  );
  assert.ok(target.zoom >= 1);
  assert.ok(target.zoom <= 1.9);
});

test('Given a tiny focus box, When the camera target is computed, Then zoom never exceeds the cap', () => {
  const target = focusCameraTarget(
    { x: 0.4, y: 0.4, width: 0.05, height: 0.05, scaleCap: 2.0 },
    { width: WORLD_WIDTH, height: WORLD_HEIGHT },
  );
  assert.ok(target.zoom <= 2.0);
});

test('Given an out-of-range focus box center, When the camera target is computed, Then position is clamped to [0, 1]', () => {
  const target = focusCameraTarget(
    { x: -0.5, y: 1.5, width: 0.3, height: 0.3, scaleCap: 2 },
    { width: WORLD_WIDTH, height: WORLD_HEIGHT },
  );
  assert.ok(target.x >= 0 && target.x <= 1);
  assert.ok(target.y >= 0 && target.y <= 1);
});

test('Given a camera tween, When t is 0 or 1, Then endpoints are exact', () => {
  const from = { x: 0.1, y: 0.2, zoom: 1 };
  const to = { x: 0.8, y: 0.7, zoom: 1.8 };
  assert.deepEqual(tweenCamera(from, to, 0), from);
  const end = tweenCamera(from, to, 1);
  assert.ok(Math.abs(end.x - to.x) < 1e-10);
  assert.ok(Math.abs(end.y - to.y) < 1e-10);
  assert.ok(Math.abs(end.zoom - to.zoom) < 1e-10);
});

test('Given a camera tween, When t is out of range, Then it clamps rather than extrapolates', () => {
  const from = { x: 0, y: 0, zoom: 1 };
  const to = { x: 1, y: 1, zoom: 2 };
  const below = tweenCamera(from, to, -0.5);
  const above = tweenCamera(from, to, 1.5);
  assert.deepEqual(below, from);
  assert.ok(Math.abs(above.x - 1) < 1e-10);
});

test('Given any camera, When the camera center is projected, Then it lands at the viewport center', () => {
  for (const camera of [OVERVIEW_CAMERA, { x: 0.3, y: 0.7, zoom: 1.4 }, { x: 0.8, y: 0.2, zoom: 2.5 }]) {
    const screen = worldToScreen({ x: camera.x, y: camera.y }, camera, VIEWPORT);
    assert.ok(Math.abs(screen.x - VIEWPORT.width / 2) < 1e-6, `x centered at zoom ${camera.zoom}`);
    assert.ok(Math.abs(screen.y - VIEWPORT.height / 2) < 1e-6, `y centered at zoom ${camera.zoom}`);
  }
});

test('Given a zoomed camera, When a world point is projected, Then screen coordinates scale accordingly', () => {
  const camera = { x: 0.5, y: 0.5, zoom: 2 };
  const center = worldToScreen({ x: 0.5, y: 0.5 }, camera, VIEWPORT);
  assert.ok(Math.abs(center.x - VIEWPORT.width / 2) < 1);
  // A point offset in world space moves twice as far on screen at zoom 2
  const offset = worldToScreen({ x: 0.6, y: 0.5 }, camera, VIEWPORT);
  const expected = 0.1 * WORLD_WIDTH * 2;
  assert.ok(Math.abs(offset.x - center.x - expected) < 1);
});

test('Given screen coordinates, When converted to world and back, Then the round trip is stable', () => {
  const camera = { x: 0.42, y: 0.61, zoom: 1.35 };
  for (const screen of [{ x: 0, y: 0 }, { x: 720, y: 320 }, { x: 1440, y: 640 }, { x: 133, y: 501 }]) {
    const world = screenToWorld(screen, camera, VIEWPORT);
    const back = worldToScreen(world, camera, VIEWPORT);
    assert.ok(Math.abs(back.x - screen.x) < 1e-6, `x round trip for ${screen.x},${screen.y}`);
    assert.ok(Math.abs(back.y - screen.y) < 1e-6, `y round trip for ${screen.x},${screen.y}`);
  }
});

test('Given worldToScreen and screenToWorld, Then screenToWorld is the exact inverse', () => {
  const camera = { x: 0.5, y: 0.5, zoom: 0.62 };
  const world = { x: 0.79, y: 0.33 };
  const round = screenToWorld(worldToScreen(world, camera, VIEWPORT), camera, VIEWPORT);
  assert.ok(Math.abs(round.x - world.x) < 1e-9);
  assert.ok(Math.abs(round.y - world.y) < 1e-9);
});
test('Given voyage waypoints, When progress is 0 or 1, Then the camera sits at the first or last waypoint', () => {
  const waypoints: readonly VoyageWaypoint[] = [
    { x: 0.2, y: 0.3, projectId: null },
    { x: 0.5, y: 0.5, projectId: 'displaylab' },
    { x: 0.8, y: 0.7, projectId: 'nbbang' },
  ];
  const start = voyageCameraAt(waypoints, 0);
  const end = voyageCameraAt(waypoints, 1);
  assert.ok(Math.abs(start.x - 0.2) < 1e-10);
  assert.ok(Math.abs(start.y - 0.3) < 1e-10);
  assert.ok(Math.abs(end.x - 0.8) < 1e-10);
  assert.ok(Math.abs(end.y - 0.7) < 1e-10);
});

test('Given empty or single waypoints, When voyage progress is requested, Then it degrades gracefully', () => {
  const empty = voyageCameraAt([], 0.5);
  assert.deepEqual(empty, OVERVIEW_CAMERA);
  const single = voyageCameraAt([{ x: 0.4, y: 0.6, projectId: 'booksalon' }], 0.5);
  assert.equal(single.x, 0.4);
  assert.equal(single.y, 0.6);
});

test('Given voyage progress beyond [0, 1], When computed, Then it clamps', () => {
  const waypoints: readonly VoyageWaypoint[] = [
    { x: 0, y: 0, projectId: null },
    { x: 1, y: 1, projectId: null },
  ];
  const below = voyageCameraAt(waypoints, -1);
  const above = voyageCameraAt(waypoints, 2);
  assert.ok(Math.abs(below.x - 0) < 1e-10);
  assert.ok(Math.abs(above.x - 1) < 1e-10);
});
