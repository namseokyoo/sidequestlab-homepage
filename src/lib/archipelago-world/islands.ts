/**
 * Island layout and procedural terrain generation for the world engine.
 * Pure functions — no PixiJS dependency, safe for Node tests.
 *
 * World space is 2400×1000 units — a wide panorama matching the
 * desktop stage aspect ratio so the whole archipelago reads at a
 * glance with open water between islands.
 */

import { createSeededRandom } from './math.ts';

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1000;

/** Vertical extrusion height of the main island cliff face. */
export const CLIFF_HEIGHT = 22;

/** Island identifiers are project ids — the archipelago grows with the fleet. */
export type IslandKind = string;

/**
 * Visual hierarchy tier. Flagship islands are the three headline
 * projects; they get richer vegetation, larger landmarks, and bolder
 * name cards. Geometry footprints (rx/ry) stay unchanged so the
 * curated no-overlap layout is preserved — hierarchy is expressed
 * through detail density and label weight, not landmass size.
 */
export type IslandTier = 'flagship' | 'core' | 'standard';

/** The three headline projects that anchor the archipelago's story. */
export const FLAGSHIP_IDS: readonly string[] = ['displaylab', 'booksalon', 'nbbang'];

/**
 * Assign a tier to a project id. Flagships are fixed; the remaining
 * projects split by build order — the first five non-flagship ids are
 * 'core', the rest 'standard'. Deterministic for a given id list.
 */
export function islandTier(id: string, nonFlagshipIndex: number): IslandTier {
  if (FLAGSHIP_IDS.includes(id)) return 'flagship';
  return nonFlagshipIndex <= 4 ? 'core' : 'standard';
}

export type IslandLayout = {
  readonly id: IslandKind;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly seed: number;
  readonly rotation: number;
  /** Visual hierarchy tier (see islandTier). */
  readonly tier: IslandTier;
  /** Secondary landmass for split islands (N-Bang). */
  readonly companion?: {
    readonly cx: number;
    readonly cy: number;
    readonly rx: number;
    readonly ry: number;
    readonly seed: number;
  };
};

/**
 * Hand-tuned anchor positions for the known fleet. Each island is
 * curated so the full set spreads across the panorama with open
 * water between neighbors (verified: no ellipse overlaps, minimum
 * visual gap ≈ 50 world units). New project ids fall through to the
 * deterministic spiral below.
 */
const CURATED_LAYOUTS: Record<string, Omit<IslandLayout, 'id' | 'tier'>> = {
  displaylab: { cx: 1180, cy: 460, rx: 240, ry: 140, seed: 42, rotation: -0.12 },
  booksalon: { cx: 460, cy: 640, rx: 185, ry: 110, seed: 77, rotation: 0.08 },
  nbbang: {
    cx: 1900, cy: 580, rx: 170, ry: 100, seed: 123, rotation: 0.15,
    companion: { cx: 2160, cy: 470, rx: 85, ry: 55, seed: 124 },
  },
  pulseup: { cx: 810, cy: 280, rx: 130, ry: 80, seed: 301, rotation: -0.08 },
  'spectrum-visualizer': { cx: 1560, cy: 250, rx: 125, ry: 78, seed: 302, rotation: 0.1 },
  'pomodoro-timer': { cx: 250, cy: 340, rx: 115, ry: 72, seed: 303, rotation: -0.05 },
  thisor: { cx: 700, cy: 850, rx: 110, ry: 70, seed: 304, rotation: 0.12 },
  livenote: { cx: 2260, cy: 720, rx: 115, ry: 72, seed: 305, rotation: -0.1 },
  'todo-app': { cx: 1010, cy: 790, rx: 106, ry: 67, seed: 306, rotation: 0.06 },
  'sidequestlab-homepage': { cx: 2060, cy: 230, rx: 110, ry: 70, seed: 307, rotation: -0.14 },
  'fdtd-lab-mcp': { cx: 145, cy: 770, rx: 100, ry: 64, seed: 308, rotation: 0.09 },
  'n8n-automation': { cx: 1750, cy: 810, rx: 106, ry: 67, seed: 309, rotation: -0.07 },
  'monitoring-system': { cx: 420, cy: 150, rx: 100, ry: 64, seed: 310, rotation: 0.11 },
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
 * Curated projects keep their hand-tuned positions; every additional
 * project gets a deterministic spiral placement with collision
 * avoidance, so the archipelago grows gracefully as the fleet expands.
 */
export function buildIslandLayouts(projectIds: readonly string[]): readonly IslandLayout[] {
  const layouts: IslandLayout[] = [];
  let nonFlagshipIndex = 0;

  for (const id of projectIds) {
    const tier = islandTier(id, nonFlagshipIndex);
    if (!FLAGSHIP_IDS.includes(id)) nonFlagshipIndex += 1;
    const curated = CURATED_LAYOUTS[id];
    if (curated) {
      layouts.push({ ...curated, id, tier });
      continue;
    }

    const seed = hashId(id);
    const rand = createSeededRandom(seed);
    const rx = 105 + rand() * 60;
    const ry = 68 + rand() * 38;
    const rotation = (rand() - 0.5) * 0.3;

    // Golden-angle spiral outward from the world center, with
    // collision nudging to keep islands from overlapping.
    const index = layouts.length;
    let placed = false;
    for (let ring = 0; ring < 12 && !placed; ring++) {
      const spiralR = 420 + ring * 190 + rand() * 70;
      const baseAngle = index * GOLDEN_ANGLE + ring * 0.7;
      for (let attempt = 0; attempt < 8 && !placed; attempt++) {
        const angle = baseAngle + attempt * 0.55;
        const cx = WORLD_WIDTH / 2 + Math.cos(angle) * spiralR * 1.4;
        const cy = WORLD_HEIGHT / 2 + Math.sin(angle) * spiralR * 0.55;
        // Keep the island fully inside the world bounds
        const clampedX = Math.max(rx + 20, Math.min(WORLD_WIDTH - rx - 20, cx));
        const clampedY = Math.max(ry + 20, Math.min(WORLD_HEIGHT - ry - 40, cy));
        if (!overlapsIslands(clampedX, clampedY, rx, ry, layouts)) {
          layouts.push({ id, tier, cx: clampedX, cy: clampedY, rx, ry, seed, rotation });
          placed = true;
        }
      }
    }
    // Fallback: place at a jittered corner region
    if (!placed) {
      const fx = 100 + rand() * (WORLD_WIDTH - 200);
      const fy = 100 + rand() * (WORLD_HEIGHT - 200);
      layouts.push({ id, tier, cx: fx, cy: fy, rx, ry, seed, rotation });
    }
  }

  return layouts;
}

/** Default layouts for the founding fleet (backwards compatible). */
export const ISLAND_LAYOUTS: readonly IslandLayout[] = buildIslandLayouts(
  Object.keys(CURATED_LAYOUTS),
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
