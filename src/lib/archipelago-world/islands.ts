/**
 * Island layout and procedural terrain generation for the world engine.
 * Pure functions — no PixiJS dependency, safe for Node tests.
 *
 * World space is 1600×1000 units. Island positions align with the
 * presentation-manifest focusBox regions so camera targets match art.
 */

import { createSeededRandom } from './math.ts';

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1000;

/** Vertical extrusion height of the main island cliff face. */
export const CLIFF_HEIGHT = 22;

/** Island identifiers are project ids — the archipelago grows with the fleet. */
export type IslandKind = string;

export type IslandLayout = {
  readonly id: IslandKind;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly seed: number;
  readonly rotation: number;
  /** Secondary landmass for split islands (N-Bang). */
  readonly companion?: {
    readonly cx: number;
    readonly cy: number;
    readonly rx: number;
    readonly ry: number;
    readonly seed: number;
  };
};

/** Hand-tuned anchor positions for the founding islands. */
const FOUNDING_LAYOUTS: Record<string, Omit<IslandLayout, 'id'>> = {
  displaylab: { cx: 800, cy: 300, rx: 340, ry: 190, seed: 42, rotation: -0.12 },
  booksalon: { cx: 400, cy: 660, rx: 285, ry: 180, seed: 77, rotation: 0.08 },
  nbbang: {
    cx: 1190, cy: 680, rx: 250, ry: 162, seed: 123, rotation: 0.15,
    companion: { cx: 1420, cy: 620, rx: 120, ry: 88, seed: 124 },
  },
};

/** Deterministic hash for seeding island generation from a project id. */
function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const MARGIN = 60;

function overlapsIslands(
  cx: number, cy: number, rx: number, ry: number,
  placed: readonly IslandLayout[],
): boolean {
  for (const other of placed) {
    const dx = (cx - other.cx) / (rx + other.rx + MARGIN);
    const dy = (cy - other.cy) / (ry + other.ry + MARGIN);
    if (dx * dx + dy * dy < 1) return true;
  }
  return false;
}

/**
 * Build island layouts for an arbitrary set of project ids.
 *
 * Founding projects keep their hand-tuned positions; every additional
 * project gets a deterministic spiral placement with collision
 * avoidance, so the archipelago grows gracefully as the fleet expands.
 */
export function buildIslandLayouts(projectIds: readonly string[]): readonly IslandLayout[] {
  const layouts: IslandLayout[] = [];

  for (const id of projectIds) {
    const founding = FOUNDING_LAYOUTS[id];
    if (founding) {
      layouts.push({ id, ...founding });
      continue;
    }

    const seed = hashId(id);
    const rand = createSeededRandom(seed);
    const rx = 170 + rand() * 110;
    const ry = 115 + rand() * 65;
    const rotation = (rand() - 0.5) * 0.3;

    // Golden-angle spiral outward from the world center, with
    // collision nudging to keep islands from overlapping.
    const index = layouts.length;
    let placed = false;
    for (let ring = 0; ring < 12 && !placed; ring++) {
      const spiralR = 320 + ring * 155 + rand() * 60;
      const baseAngle = index * GOLDEN_ANGLE + ring * 0.7;
      for (let attempt = 0; attempt < 8 && !placed; attempt++) {
        const angle = baseAngle + attempt * 0.55;
        const cx = WORLD_WIDTH / 2 + Math.cos(angle) * spiralR * 1.15;
        const cy = WORLD_HEIGHT / 2 + Math.sin(angle) * spiralR * 0.72;
        // Keep the island fully inside the world bounds
        const clampedX = Math.max(rx + 20, Math.min(WORLD_WIDTH - rx - 20, cx));
        const clampedY = Math.max(ry + 20, Math.min(WORLD_HEIGHT - ry - 40, cy));
        if (!overlapsIslands(clampedX, clampedY, rx, ry, layouts)) {
          layouts.push({ id, cx: clampedX, cy: clampedY, rx, ry, seed, rotation });
          placed = true;
        }
      }
    }
    // Fallback: place at a jittered corner region
    if (!placed) {
      const fx = 100 + rand() * (WORLD_WIDTH - 200);
      const fy = 100 + rand() * (WORLD_HEIGHT - 200);
      layouts.push({ id, cx: fx, cy: fy, rx, ry, seed, rotation });
    }
  }

  return layouts;
}

/** Default layouts for the founding fleet (backwards compatible). */
export const ISLAND_LAYOUTS: readonly IslandLayout[] = buildIslandLayouts(
  Object.keys(FOUNDING_LAYOUTS),
);

/**
 * Maximum focus zoom that keeps an entire island (including its cliff
 * face and any companion landmass) visible in the viewport.
 */
export function islandFocusZoom(
  layout: IslandLayout,
  viewport: { readonly width: number; readonly height: number },
  padding = 1.22,
): number {
  const west = layout.cx - layout.rx;
  const east = layout.companion
    ? layout.companion.cx + layout.companion.rx
    : layout.cx + layout.rx;
  const north = layout.cy - layout.ry;
  const south = Math.max(
    layout.cy + layout.ry,
    layout.companion ? layout.companion.cy + layout.companion.ry : 0,
  ) + CLIFF_HEIGHT;
  const spanX = (east - west) * padding;
  const spanY = (south - north) * padding;
  return Math.min(viewport.width / spanX, viewport.height / spanY);
}

export type BlobPoint = { readonly x: number; readonly y: number };

/**
 * Generate an organic blob outline: ellipse base + seeded radial noise,
 * smoothed with Catmull-Rom subdivision.
 */
export function generateBlob(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  options?: { readonly points?: number; readonly noise?: number; readonly subdivisions?: number },
): readonly BlobPoint[] {
  const count = options?.points ?? 14;
  const noise = options?.noise ?? 0.14;
  const subdivisions = options?.subdivisions ?? 2;
  const random = createSeededRandom(seed);

  let pts: BlobPoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const wobble = 1 + (random() - 0.5) * 2 * noise;
    pts.push({
      x: cx + Math.cos(angle) * rx * wobble,
      y: cy + Math.sin(angle) * ry * wobble,
    });
  }

  for (let s = 0; s < subdivisions; s++) {
    const next: BlobPoint[] = [];
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[(i - 1 + pts.length) % pts.length];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const p3 = pts[(i + 2) % pts.length];
      next.push(catmullRom(p0, p1, p2, p3, 0.5));
      next.push(p2);
    }
    pts = next;
  }
  return pts;
}

function catmullRom(
  p0: BlobPoint,
  p1: BlobPoint,
  p2: BlobPoint,
  p3: BlobPoint,
  t: number,
): BlobPoint {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/** Deterministic scatter positions on an island surface (grass area). */
export function scatterOnIsland(
  island: IslandLayout,
  seed: number,
  count: number,
  options?: { readonly innerScale?: number; readonly avoidCenter?: number },
): readonly BlobPoint[] {
  const random = createSeededRandom(seed);
  const inner = options?.innerScale ?? 0.72;
  const avoid = options?.avoidCenter ?? 0;
  const result: BlobPoint[] = [];
  let attempts = 0;
  while (result.length < count && attempts < count * 20) {
    attempts++;
    const angle = random() * Math.PI * 2;
    const dist = avoid + random() * (inner - avoid);
    result.push({
      x: island.cx + Math.cos(angle) * island.rx * dist,
      y: island.cy + Math.sin(angle) * island.ry * dist,
    });
  }
  return result;
}
