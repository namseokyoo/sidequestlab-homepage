import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CLIFF_HEIGHT,
  ISLAND_LAYOUTS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  generateBlob,
  islandFocusZoom,
  scatterOnIsland,
  FLAGSHIP_IDS,
  islandTier,
} from '../../src/lib/archipelago-world/islands.ts';

test('Given the island layouts, When inspected, Then the full curated fleet sits within world bounds', () => {
  assert.equal(ISLAND_LAYOUTS.length, 13);
  const ids = ISLAND_LAYOUTS.map((l) => l.id).sort();
  assert.deepEqual(ids, [
    'booksalon',
    'displaylab',
    'fdtd-lab-mcp',
    'livenote',
    'monitoring-system',
    'n8n-automation',
    'nbbang',
    'pomodoro-timer',
    'pulseup',
    'sidequestlab-homepage',
    'spectrum-visualizer',
    'thisor',
    'todo-app',
  ]);
  for (const layout of ISLAND_LAYOUTS) {
    assert.ok(layout.cx - layout.rx >= -50, `${layout.id} left edge`);
    assert.ok(layout.cx + layout.rx <= WORLD_WIDTH + 50, `${layout.id} right edge`);
    assert.ok(layout.cy - layout.ry >= -50, `${layout.id} top edge`);
    assert.ok(layout.cy + layout.ry <= WORLD_HEIGHT + 50, `${layout.id} bottom edge`);
  }
});

test('Given the curated fleet, When every pair is checked, Then no two islands overlap (with a 40-unit water margin)', () => {
  const MARGIN = 40;
  const shapes = ISLAND_LAYOUTS.flatMap((l) =>
    l.companion
      ? [l, { ...l.companion, id: `${l.id}-companion` }]
      : [l],
  );
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      const a = shapes[i];
      const b = shapes[j];
      const dx = (a.cx - b.cx) / (a.rx + b.rx + MARGIN);
      const dy = (a.cy - b.cy) / (a.ry + b.ry + MARGIN);
      assert.ok(dx * dx + dy * dy >= 1, `${a.id} must not overlap ${b.id}`);
    }
  }
});

test('Given N-Bang, When its layout is inspected, Then it has a companion island and bridge-ready geometry', () => {
  const nbbang = ISLAND_LAYOUTS.find((l) => l.id === 'nbbang');
  assert.ok(nbbang, 'nbbang layout exists');
  assert.ok(nbbang?.companion, 'nbbang has a companion island');
  if (nbbang?.companion) {
    assert.ok(nbbang.companion.cx > nbbang.cx, 'companion is east of the main island');
  }
});

test('Given generateBlob, When called with the same seed, Then output is deterministic', () => {
  const a = generateBlob(100, 100, 60, 40, 42);
  const b = generateBlob(100, 100, 60, 40, 42);
  assert.deepEqual(a, b);
});

test('Given generateBlob, When called with different seeds, Then shapes differ', () => {
  const a = generateBlob(100, 100, 60, 40, 42);
  const b = generateBlob(100, 100, 60, 40, 43);
  assert.notDeepEqual(a, b);
});

test('Given generateBlob, When points are generated, Then they stay within a bounded ring around the center', () => {
  const cx = 500;
  const cy = 300;
  const rx = 200;
  const ry = 120;
  const points = generateBlob(cx, cy, rx, ry, 7, { noise: 0.2 });
  assert.ok(points.length >= 14, 'enough points for a smooth outline');
  for (const p of points) {
    const dx = (p.x - cx) / rx;
    const dy = (p.y - cy) / ry;
    const dist = Math.sqrt(dx * dx + dy * dy);
    assert.ok(dist > 0.5 && dist < 1.5, `point distance ${dist.toFixed(2)} within ring`);
  }
});

test('Given generateBlob with subdivisions, When point count is inspected, Then smoothing multiplies points', () => {
  const base = generateBlob(0, 0, 50, 50, 1, { points: 10, subdivisions: 0 });
  const smoothed = generateBlob(0, 0, 50, 50, 1, { points: 10, subdivisions: 2 });
  assert.equal(base.length, 10);
  assert.ok(smoothed.length > base.length * 2);
});

test('Given scatterOnIsland, When points are scattered, Then they stay within the island ellipse', () => {
  const layout = ISLAND_LAYOUTS[0];
  const points = scatterOnIsland(layout, 99, 30, { innerScale: 0.72 });
  assert.equal(points.length, 30);
  for (const p of points) {
    const dx = (p.x - layout.cx) / layout.rx;
    const dy = (p.y - layout.cy) / layout.ry;
    assert.ok(dx * dx + dy * dy <= 0.72 * 0.72 + 1e-9, 'point within inner ellipse');
  }
});

test('Given scatterOnIsland with avoidCenter, When points are scattered, Then none land in the excluded core', () => {
  const layout = ISLAND_LAYOUTS[1];
  const points = scatterOnIsland(layout, 55, 20, { innerScale: 0.7, avoidCenter: 0.3 });
  for (const p of points) {
    const dx = (p.x - layout.cx) / layout.rx;
    const dy = (p.y - layout.cy) / layout.ry;
    const dist = Math.sqrt(dx * dx + dy * dy);
    assert.ok(dist >= 0.3 - 1e-9, `point distance ${dist.toFixed(2)} avoids center`);
  }
});

test('Given scatterOnIsland, When called with the same seed, Then output is deterministic', () => {
  const layout = ISLAND_LAYOUTS[2];
  const a = scatterOnIsland(layout, 12, 15);
  const b = scatterOnIsland(layout, 12, 15);
  assert.deepEqual(a, b);
});

test('Given islandFocusZoom, When computed for each island, Then the island fits inside the viewport', () => {
  const viewport = { width: 1280, height: 720 };
  for (const layout of ISLAND_LAYOUTS) {
    const zoom = islandFocusZoom(layout, viewport);
    assert.ok(zoom > 0.3, `${layout.id} zoom ${zoom} is usable`);
    const west = layout.cx - layout.rx;
    const east = layout.companion
      ? layout.companion.cx + layout.companion.rx
      : layout.cx + layout.rx;
    const north = layout.cy - layout.ry;
    const south = Math.max(
      layout.cy + layout.ry,
      layout.companion ? layout.companion.cy + layout.companion.ry : 0,
    ) + CLIFF_HEIGHT;
    // Allow a floating-point epsilon: zoom is derived from these same spans.
    assert.ok((east - west) * 1.22 * zoom <= viewport.width + 1e-6, `${layout.id} fits horizontally`);
    assert.ok((south - north) * 1.22 * zoom <= viewport.height + 1e-6, `${layout.id} fits vertically`);
  }
});

test('Given islandFocusZoom, When the viewport is small, Then zoom shrinks proportionally', () => {
  const layout = ISLAND_LAYOUTS[0];
  const big = islandFocusZoom(layout, { width: 1600, height: 900 });
  const small = islandFocusZoom(layout, { width: 390, height: 844 });
  assert.ok(small < big, 'mobile viewport yields smaller zoom');
});

test('Given the curated fleet, When tiers are assigned, Then exactly the three flagships are flagship and the split is 3/5/5', () => {
  const byTier = { flagship: 0, core: 0, standard: 0 };
  for (const layout of ISLAND_LAYOUTS) {
    byTier[layout.tier] += 1;
  }
  assert.equal(byTier.flagship, 3, 'three flagships');
  assert.equal(byTier.core, 5, 'five core');
  assert.equal(byTier.standard, 5, 'five standard');
  for (const fid of FLAGSHIP_IDS) {
    const layout = ISLAND_LAYOUTS.find((l) => l.id === fid);
    assert.equal(layout?.tier, 'flagship', `${fid} is flagship`);
  }
});

test('Given islandTier, When called with flagship ids, Then it returns flagship regardless of index', () => {
  for (const fid of FLAGSHIP_IDS) {
    assert.equal(islandTier(fid, 0), 'flagship');
    assert.equal(islandTier(fid, 99), 'flagship');
  }
});

test('Given islandTier, When called with non-flagship ids, Then the first five are core and the rest standard', () => {
  assert.equal(islandTier('pulseup', 0), 'core');
  assert.equal(islandTier('pulseup', 4), 'core');
  assert.equal(islandTier('pulseup', 5), 'standard');
  assert.equal(islandTier('monitoring-system', 9), 'standard');
});

test('Given tier hierarchy, When geometry is inspected, Then footprints are unchanged so the curated no-overlap layout is preserved', () => {
  // Flagships keep their curated radii (hierarchy is label/detail, not landmass).
  const displaylab = ISLAND_LAYOUTS.find((l) => l.id === 'displaylab');
  assert.equal(displaylab?.rx, 240, 'displaylab rx unchanged');
  assert.equal(displaylab?.ry, 140, 'displaylab ry unchanged');
  const booksalon = ISLAND_LAYOUTS.find((l) => l.id === 'booksalon');
  assert.equal(booksalon?.rx, 185, 'booksalon rx unchanged');
});
