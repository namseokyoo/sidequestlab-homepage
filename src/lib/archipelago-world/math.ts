/**
 * Pure math utilities for the Living Archipelago world engine.
 * No PixiJS dependency — safe for Node tests.
 */

/** Deterministic seeded PRNG (mulberry32). */
export function createSeededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Sine-based ambient oscillation with per-element phase offset. */
export function ambientWave(
  timeMs: number,
  periodMs: number,
  phase: number,
  amplitude: number,
): number {
  return Math.sin((timeMs / periodMs) * Math.PI * 2 + phase) * amplitude;
}

/** Wrap a value into [0, span). */
export function wrap(value: number, span: number): number {
  return ((value % span) + span) % span;
}
