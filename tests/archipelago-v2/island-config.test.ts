// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — vitest types not in tsconfig; test runs via npx vitest
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseIslandConfig } from '../../src/lib/archipelago-world/island-config.ts';

const CONFIG_PATH = resolve(import.meta.dirname, '../../src/data/archipelago/island-config.json');

describe('island-config', () => {
  it('parses the shipped island-config.json successfully', () => {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    const result = parseIslandConfig(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.version).toBe(1);
      expect(result.config.islands.length).toBe(3);
    }
  });

  it('validates all three island ids', () => {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    const result = parseIslandConfig(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = result.config.islands.map((i) => i.id).sort();
      expect(ids).toEqual(['booksalon', 'displaylab', 'nbbang']);
    }
  });

  it('rejects a non-object root', () => {
    const result = parseIslandConfig('not an object');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('rejects missing islands array', () => {
    const result = parseIslandConfig({ version: 1 });
    expect(result.ok).toBe(false);
  });

  it('rejects invalid island id', () => {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    raw.islands[0].id = 'invalid-island';
    const result = parseIslandConfig(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('id'))).toBe(true);
    }
  });

  it('rejects out-of-range vegetation counts', () => {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    raw.islands[0].vegetation.trees = 999;
    const result = parseIslandConfig(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('trees'))).toBe(true);
    }
  });

  it('rejects invalid spritePath prefix', () => {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    raw.islands[0].landmark.spritePath = 'https://evil.com/sprite.png';
    const result = parseIslandConfig(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('spritePath'))).toBe(true);
    }
  });

  it('rejects zero/negative island radii', () => {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    raw.islands[0].position.rx = 0;
    const result = parseIslandConfig(raw);
    expect(result.ok).toBe(false);
  });
});
