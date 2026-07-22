import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ambientWave,
  clamp,
  createSeededRandom,
  easeInOutCubic,
  lerp,
  smoothstep,
  wrap,
} from '../../src/lib/archipelago-world/math.ts';

test('Given a seeded PRNG, When called with the same seed, Then sequences are deterministic', () => {
  const a = createSeededRandom(42);
  const b = createSeededRandom(42);
  for (let i = 0; i < 20; i++) {
    assert.equal(a(), b());
  }
});

test('Given a seeded PRNG, When called with different seeds, Then sequences differ', () => {
  const a = createSeededRandom(42);
  const b = createSeededRandom(43);
  const seqA = Array.from({ length: 5 }, () => a());
  const seqB = Array.from({ length: 5 }, () => b());
  assert.notDeepEqual(seqA, seqB);
});

test('Given a seeded PRNG, When sampled, Then values stay within [0, 1)', () => {
  const random = createSeededRandom(7);
  for (let i = 0; i < 200; i++) {
    const value = random();
    assert.ok(value >= 0 && value < 1, `value ${value} out of range`);
  }
});

test('Given clamp, When values exceed bounds, Then they are constrained', () => {
  assert.equal(clamp(5, 0, 1), 1);
  assert.equal(clamp(-3, 0, 1), 0);
  assert.equal(clamp(0.5, 0, 1), 0.5);
});

test('Given lerp, When t is 0 or 1, Then endpoints are returned', () => {
  assert.equal(lerp(10, 20, 0), 10);
  assert.equal(lerp(10, 20, 1), 20);
  assert.equal(lerp(10, 20, 0.5), 15);
});

test('Given easeInOutCubic, When t is 0, 0.5, or 1, Then boundary values hold', () => {
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  assert.ok(Math.abs(easeInOutCubic(0.5) - 0.5) < 1e-10);
});

test('Given smoothstep, When x is outside edges, Then output is clamped', () => {
  assert.equal(smoothstep(0, 1, -1), 0);
  assert.equal(smoothstep(0, 1, 2), 1);
  assert.ok(Math.abs(smoothstep(0, 1, 0.5) - 0.5) < 1e-10);
});

test('Given ambientWave, When time advances by one period, Then the wave returns to its start', () => {
  const start = ambientWave(0, 2000, 0.5, 3);
  const end = ambientWave(2000, 2000, 0.5, 3);
  assert.ok(Math.abs(start - end) < 1e-10);
});

test('Given ambientWave, When amplitude is set, Then peaks never exceed it', () => {
  for (let t = 0; t < 4000; t += 50) {
    const value = ambientWave(t, 2000, 0, 5);
    assert.ok(Math.abs(value) <= 5 + 1e-10);
  }
});

test('Given wrap, When values are negative or exceed span, Then they wrap into [0, span)', () => {
  assert.equal(wrap(110, 100), 10);
  assert.equal(wrap(-10, 100), 90);
  assert.equal(wrap(50, 100), 50);
});
