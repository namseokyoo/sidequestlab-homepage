import assert from 'node:assert/strict';
import test from 'node:test';

import { planIdleBehavior } from '../../src/lib/archipelago-world/render/wayfarer.ts';

test('Given planIdleBehavior, When called with the same seed and time, Then output is deterministic', () => {
  for (const t of [0, 1000, 5000, 9000, 12345, 30000]) {
    assert.deepEqual(planIdleBehavior(42, t), planIdleBehavior(42, t), `t=${t}`);
  }
});

test('Given planIdleBehavior, When time is 0, Then no behavior fires', () => {
  assert.deepEqual(planIdleBehavior(42, 0), { type: 'none' });
  assert.deepEqual(planIdleBehavior(7, 0), { type: 'none' });
});

test('Given planIdleBehavior, When scanned over a 13s window, Then a glance fires at least once', () => {
  // Glance cadence is 6–12s, so any 13s window must contain one.
  for (const seed of [1, 42, 0x51de, 0x9a77, 999]) {
    let sawGlance = false;
    for (let t = 0; t <= 13000; t += 20) {
      if (planIdleBehavior(seed, t).type === 'glance') {
        sawGlance = true;
        break;
      }
    }
    assert.ok(sawGlance, `seed ${seed} glances within 13s`);
  }
});

test('Given planIdleBehavior, When scanned over a 41s window, Then a hop fires at least once', () => {
  // Hop cadence is 20–40s, so any 41s window must contain one.
  for (const seed of [1, 42, 0x51de, 0x9a77, 999]) {
    let sawHop = false;
    for (let t = 0; t <= 41000; t += 20) {
      if (planIdleBehavior(seed, t).type === 'hop') {
        sawHop = true;
        break;
      }
    }
    assert.ok(sawHop, `seed ${seed} hops within 41s`);
  }
});

test('Given planIdleBehavior, When a behavior fires, Then strength stays within (0, 1]', () => {
  for (let t = 0; t <= 41000; t += 25) {
    const b = planIdleBehavior(0x51de, t);
    if (b.type !== 'none') {
      assert.ok(b.strength > 0 && b.strength <= 1, `t=${t} strength=${b.strength}`);
    }
  }
});

test('Given planIdleBehavior, When two different seeds are used, Then their phase offsets differ', () => {
  // The two crew seeds must not produce identical behavior timelines.
  const timeline = (seed: number) => {
    const out: string[] = [];
    for (let t = 0; t <= 30000; t += 100) out.push(planIdleBehavior(seed, t).type);
    return out.join(',');
  };
  assert.notEqual(timeline(0x51de), timeline(0x9a77), 'engineer and QA idle timelines differ');
});
