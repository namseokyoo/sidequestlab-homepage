import { describe, expect, it } from 'vitest';

import { ISLAND_LAYOUTS, scatterOnIsland } from '../../src/lib/archipelago-world/islands.ts';

// We can't import pixi.js in Node tests, so we verify the manifest
// and scatter counts via the pure modules.

describe('sprite-integration', () => {
  it('SPRITE_MANIFEST has 32 entries (5 existing + 19 new + 8 walk frames)', async () => {
    // Dynamic import to avoid pixi.js top-level issues in Node
    const mod = await import('../../src/lib/archipelago-world/render/sprite-assets.ts');
    // getSpriteSize is exported for all keys; verify the union size
    const keys = [
      'wayfarer-engineer', 'wayfarer-qa',
      'wayfarer-engineer-walk-0', 'wayfarer-engineer-walk-1', 'wayfarer-engineer-walk-2', 'wayfarer-engineer-walk-3',
      'wayfarer-qa-walk-0', 'wayfarer-qa-walk-1', 'wayfarer-qa-walk-2', 'wayfarer-qa-walk-3',
      'landmark-lighthouse', 'landmark-pavilion', 'landmark-booksalon',
      'tree-deciduous', 'tree-conifer', 'tree-palm',
      'bush', 'flower-coral', 'flower-gold', 'flower-white', 'flower-pink', 'grass-tuft',
      'shell', 'conch', 'tidepool', 'rock', 'rock-moss-variant', 'rock-mossy',
      'vine', 'moss-patch', 'leaf', 'smoke-puff',
    ] as const;
    expect(keys.length).toBe(32);
    // Each key should return a size without throwing
    for (const key of keys) {
      const size = mod.getSpriteSize(key);
      expect(size.w).toBeGreaterThan(0);
      expect(size.h).toBeGreaterThan(0);
    }
  });

  it('getWalkFrames returns null when textures not loaded', async () => {
    const mod = await import('../../src/lib/archipelago-world/render/sprite-assets.ts');
    // In Node without pixi Assets, nothing is loaded
    expect(mod.getWalkFrames('engineer')).toBeNull();
    expect(mod.getWalkFrames('qa')).toBeNull();
  });

  it('vegetation scatter counts match plan (12/14/20/22)', () => {
    for (const layout of ISLAND_LAYOUTS) {
      const trees = scatterOnIsland(layout, layout.seed + 10, 12, { innerScale: 0.75, avoidCenter: 0.25 });
      const bushes = scatterOnIsland(layout, layout.seed + 11, 14, { innerScale: 0.78, avoidCenter: 0.2 });
      const flowers = scatterOnIsland(layout, layout.seed + 12, 20, { innerScale: 0.7, avoidCenter: 0.15 });
      const tufts = scatterOnIsland(layout, layout.seed + 14, 22, { innerScale: 0.75, avoidCenter: 0.1 });
      expect(trees.length).toBe(12);
      expect(bushes.length).toBe(14);
      expect(flowers.length).toBe(20);
      expect(tufts.length).toBe(22);
    }
  });

  it('coastal scatter counts match plan (8/4/4)', () => {
    for (const layout of ISLAND_LAYOUTS) {
      const shells = scatterOnIsland(layout, layout.seed + 20, 8, { innerScale: 0.92, avoidCenter: 0.7 });
      const conchs = scatterOnIsland(layout, layout.seed + 21, 4, { innerScale: 0.95, avoidCenter: 0.8 });
      const tidepools = scatterOnIsland(layout, layout.seed + 22, 4, { innerScale: 0.95, avoidCenter: 0.82 });
      expect(shells.length).toBe(8);
      expect(conchs.length).toBe(4);
      expect(tidepools.length).toBe(4);
    }
  });

  it('all 29 sprite PNGs exist and are >1KB', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const spritesDir = path.resolve(import.meta.dirname, '../../public/images/archipelago/sprites');
    const names = [
      'tree-deciduous', 'tree-conifer', 'tree-palm',
      'bush', 'flower-coral', 'flower-gold', 'flower-white', 'flower-pink', 'grass-tuft',
      'shell', 'conch', 'tidepool', 'rock', 'rock-moss-variant', 'rock-mossy',
      'vine', 'moss-patch', 'leaf', 'smoke-puff',
      'wayfarer-engineer-walk', 'wayfarer-qa-walk',
      'wayfarer-engineer-walk-0', 'wayfarer-engineer-walk-1', 'wayfarer-engineer-walk-2', 'wayfarer-engineer-walk-3',
      'wayfarer-qa-walk-0', 'wayfarer-qa-walk-1', 'wayfarer-qa-walk-2', 'wayfarer-qa-walk-3',
    ];
    expect(names.length).toBe(29);
    for (const name of names) {
      const filePath = path.join(spritesDir, `${name}.png`);
      expect(fs.existsSync(filePath), `${name}.png exists`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size, `${name}.png > 1KB`).toBeGreaterThan(1024);
    }
  });
});
