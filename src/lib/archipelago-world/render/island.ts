/**
 * Procedural island renderer: layered terrain, project-specific
 * landmarks, vegetation, piers, boats, and night lighting.
 *
 * Each island is drawn from its IslandLayout + WorldPalette so the
 * entire scene can repaint during day/night transitions.
 */

import { Container, Graphics, Sprite } from 'pixi.js';

import { CLIFF_HEIGHT, generateBlob, scatterOnIsland, signaturePropFor, type IslandLayout, type IslandTier, type SignaturePropKind } from '../islands.ts';
import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';
import { circle, drawBlob, ellipse, roundedBox, triangle } from '../shapes.ts';
import { getSpriteSize, getSpriteTexture, onSpriteLoaded, type SpriteKey } from './sprite-assets.ts';
import type { TerrainTextures } from './terrain-textures.ts';

export type IslandSystem = {
  readonly container: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean, night: number) => void;
  readonly repaint: (palette: WorldPalette, night: number, textures?: TerrainTextures) => void;
  /** Toggle the selection/highlight glow ring around the island edge. */
  readonly setGlow: (active: boolean) => void;
  /** Smoke source positions registered with the particle system. */
  readonly smokeSources: readonly { readonly x: number; readonly y: number }[];
  readonly dispose?: () => void;
};

type TreeAnim = {
  readonly canopy: Graphics;
  readonly phase: number;
  readonly baseY: number;
};

/** Unified sprite animation entry for vegetation/cliff sprites. */
type SpriteAnim = {
  readonly sprite: Sprite;
  readonly phase: number;
  readonly baseY: number;
  readonly baseScaleX: number;
  readonly baseScaleY: number;
  readonly kind: 'tree' | 'bush' | 'flower' | 'tuft' | 'vine';
};

type FlagAnim = {
  readonly g: Graphics;
  readonly phase: number;
  readonly x: number;
  readonly y: number;
  readonly color: number;
};

type WindowGlow = {
  readonly g: Graphics;
  readonly phase: number;
};

type LanternGlow = {
  readonly g: Graphics;
  readonly phase: number;
};

/** Vegetation density multiplier by tier — flagships feel lush, standards sparse. */
const VEGETATION_SCALE: Record<IslandTier, number> = { flagship: 1.5, core: 1.0, standard: 0.6 };
/** Landmark sprite height multiplier by tier — flagships read as destinations. */
const LANDMARK_SCALE: Record<IslandTier, number> = { flagship: 1.25, core: 1.0, standard: 0.8 };

function vegCount(tier: IslandTier, base: number): number {
  return Math.max(1, Math.round(base * VEGETATION_SCALE[tier]));
}

/** Lifecycle-driven animated props (crane, antenna, hologram). */
type LifecycleAnim = {
  readonly g: Graphics | Sprite;
  readonly kind: 'crane' | 'antenna' | 'hologram' | 'beacon';
  readonly phase: number;
  readonly baseX: number;
  readonly baseY: number;
  /** True when `g` is an AI lifecycle sprite (crane) or a sprite-mode overlay (antenna/beacon). */
  readonly spriteMode?: boolean;
};

export function createIslandSystem(layout: IslandLayout, lifecycle?: string | null): IslandSystem {
  const container = new Container();
  container.label = `island-${layout.id}`;

  const staticLayer = new Graphics();
  const animLayer = new Container();
  /** Static sprite details (rocks, shells, tide pools, moss patches). */
  const detailLayer = new Container();
  /** AI terrain sprite — replaces procedural terrain blobs when loaded. */
  const terrainLayer = new Container();
  // Glow ring first: drawn behind the island mass, its outer stroke
  // extends past the shoreline so it reads as a halo on the water.
  const glowRing = new Graphics();
  glowRing.label = `glow-ring-${layout.id}`;
  glowRing.alpha = 0;
  container.addChild(glowRing, terrainLayer, staticLayer, detailLayer, animLayer);

  /** Target alpha the glow ring lerps toward each tick (0 = off). */
  let glowTarget = 0;

  const trees: TreeAnim[] = [];
  const spriteAnims: SpriteAnim[] = [];
  const flags: FlagAnim[] = [];
  const windows: WindowGlow[] = [];
  const lanterns: LanternGlow[] = [];
  const lifecycleAnims: LifecycleAnim[] = [];
  let boat: Graphics | null = null;
  let boatBaseY = 0;
  const smokeSources: { x: number; y: number }[] = [];

  // ── AI terrain sprite state ─────────────────────────────────────
  let terrainSprite: Sprite | null = null;
  let terrainNight = 0;
  let terrainUnsub: (() => void) | null = null;

  // ── AI landmark sprite state ────────────────────────────────────
  // When a sprite texture is available it replaces the procedural
  // landmark art. Procedural fallback stays drawn until then.
  let landmarkSprite: Sprite | null = null;
  let landmarkGlow: Graphics | null = null;
  let spriteNight = 0;
  let spriteUnsub: (() => void) | null = null;
  let lifecycleUnsub: (() => void) | null = null;

  /** Which sprite key maps to this island's signature landmark. */
  const landmarkKey: SpriteKey | null =
    layout.id === 'displaylab'
      ? 'landmark-lighthouse'
      : layout.id === 'booksalon'
        ? 'landmark-booksalon'
        : layout.id === 'nbbang'
          ? 'landmark-pavilion'
          : null;

  /** World-space anchor for the landmark sprite (feet/base position). */
  function landmarkAnchor(): { x: number; y: number; h: number } {
    const { cx, cy, rx, ry } = layout;
    const hScale = LANDMARK_SCALE[layout.tier];
    if (layout.id === 'displaylab') {
      return { x: cx + rx * 0.35, y: cy - ry * 0.35 + 12, h: 100 * hScale };
    }
    if (layout.id === 'nbbang') {
      return { x: cx + rx * 0.15, y: cy - ry * 0.35 + 12, h: 96 * hScale };
    }
    // booksalon reading house
    return { x: cx - rx * 0.05, y: cy - ry * 0.2 + 4, h: 92 * hScale };
  }

  /** Attach (or re-attach) the landmark sprite without triggering a repaint. */
  function attachLandmarkSprite(texture: import('pixi.js').Texture): void {
    removeLandmarkSprite();
    const anchor = landmarkAnchor();
    landmarkSprite = new Sprite(texture);
    landmarkSprite.anchor.set(0.5, 1); // base at anchor
    const scale = anchor.h / texture.height;
    landmarkSprite.width = texture.width * scale;
    landmarkSprite.height = anchor.h;
    landmarkSprite.x = anchor.x;
    landmarkSprite.y = anchor.y;
    landmarkSprite.label = `landmark-sprite-${layout.id}`;

    // Soft night glow behind the sprite
    landmarkGlow = new Graphics();
    landmarkGlow.circle(anchor.x, anchor.y - anchor.h * 0.45, anchor.h * 0.5);
    landmarkGlow.fill({ color: 0xffd08a, alpha: 0.12 });
    landmarkGlow.visible = false;

    animLayer.addChild(landmarkGlow, landmarkSprite);
    updateLandmarkNight(spriteNight);
  }

  /** Attach the landmark sprite and repaint so procedural art hides itself. */
  function applyLandmarkSprite(texture: import('pixi.js').Texture): void {
    attachLandmarkSprite(texture);
    repaintLandmarkFallback();
  }

  function removeLandmarkSprite(): void {
    landmarkSprite?.destroy();
    landmarkSprite = null;
    landmarkGlow?.destroy();
    landmarkGlow = null;
  }

  function updateLandmarkNight(night: number): void {
    spriteNight = night;
    if (!landmarkSprite) return;
    const r = Math.round(255 - night * 55);
    const g = Math.round(255 - night * 35);
    const b = Math.round(255 - night * 5);
    landmarkSprite.tint = (r << 16) | (g << 8) | b;
    if (landmarkGlow) landmarkGlow.visible = night > 0.25;
  }

  /** Re-run the static repaint so procedural landmark art can hide itself. */
  let lastRepaintArgs: { p: WorldPalette; night: number; textures?: TerrainTextures } | null = null;
  function repaintLandmarkFallback(): void {
    if (!lastRepaintArgs) return;
    repaint(lastRepaintArgs.p, lastRepaintArgs.night, lastRepaintArgs.textures);
  }

  if (landmarkKey) {
    const existing = getSpriteTexture(landmarkKey);
    if (existing) {
      applyLandmarkSprite(existing);
    } else {
      spriteUnsub = onSpriteLoaded(landmarkKey, (texture) => {
        if (texture) applyLandmarkSprite(texture);
      });
    }
  }

  // ── AI lifecycle sprite subscription ────────────────────────────
  // When the lifecycle sprite for this island's state loads late, repaint
  // so the procedural prop swaps out for the AI sprite (same pattern as
  // the landmark sprite above).

  /** Which AI lifecycle sprite (if any) matches this island's lifecycle state. */
  function lifecycleSpriteKey(): SpriteKey | null {
    if (!lifecycle) return null;
    const lc = lifecycle.toUpperCase();
    if (lc === 'BUILDING' || lc === 'DEPLOYING') return 'lifecycle-crane';
    if (lc === 'OPERATING' || lc === 'MAINTENANCE') return 'lifecycle-antenna';
    if (lc === 'TESTING' || lc === 'REVIEWING') return 'lifecycle-beacon';
    // PLANNING/DESIGNING/IDEA hologram stays fully procedural.
    return null;
  }

  {
    const lcKey = lifecycleSpriteKey();
    if (lcKey && !getSpriteTexture(lcKey)) {
      lifecycleUnsub = onSpriteLoaded(lcKey, (texture) => {
        if (texture) repaintLandmarkFallback();
      });
    }
  }

  // ── AI terrain sprite ───────────────────────────────────────────
  // The terrain sprite replaces the procedural blob terrain (water
  // shadow, wet sand, cliff, beach, terrace, grass, patches) with a
  // hand-painted AC-style island base. Structures (paths, piers,
  // landmarks, vegetation) still render on top.

  /** Pick a terrain sprite variant by island size. */
  const terrainKey: SpriteKey =
    layout.rx >= 300
      ? 'island-large'
      : layout.rx >= 230
        ? 'island-medium'
        : 'island-small';

  function updateTerrainNight(): void {
    terrainNight = spriteNight;
    if (!terrainSprite) return;
    const r = Math.round(255 - terrainNight * 55);
    const g = Math.round(255 - terrainNight * 35);
    const b = Math.round(255 - terrainNight * 5);
    terrainSprite.tint = (r << 16) | (g << 8) | b;
  }

  /** Attach the terrain sprite without triggering a repaint. */
  function attachTerrainSprite(texture: import('pixi.js').Texture): void {
    terrainLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    terrainSprite = new Sprite(texture);
    // Anchor slightly above center — the cliff face occupies the bottom
    terrainSprite.anchor.set(0.5, 0.42);
    const targetW = layout.rx * 2.35;
    const scale = targetW / texture.width;
    terrainSprite.width = targetW;
    terrainSprite.height = texture.height * scale;
    terrainSprite.x = layout.cx;
    terrainSprite.y = layout.cy + 6;
    terrainSprite.label = `terrain-sprite-${layout.id}`;
    terrainLayer.addChild(terrainSprite);
    updateTerrainNight();
  }

  /** Attach the terrain sprite and repaint so procedural terrain hides. */
  function applyTerrainSprite(texture: import('pixi.js').Texture): void {
    attachTerrainSprite(texture);
    repaintLandmarkFallback();
  }

  {
    const existingTerrain = getSpriteTexture(terrainKey);
    if (existingTerrain) {
      applyTerrainSprite(existingTerrain);
    } else {
      terrainUnsub = onSpriteLoaded(terrainKey, (texture) => {
        if (texture) applyTerrainSprite(texture);
      });
    }
  }

  function repaint(p: WorldPalette, night: number, textures?: TerrainTextures): void {
    lastRepaintArgs = { p, night, textures };
    updateLandmarkNight(night);
    updateTerrainNight();
    redrawGlowRing(p);
    staticLayer.clear();
    animLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    detailLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    // Terrain sprite persists across repaints — only clear when absent
    if (!terrainSprite) {
      terrainLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    }
    trees.length = 0;
    spriteAnims.length = 0;
    flags.length = 0;
    windows.length = 0;
    lanterns.length = 0;
    lifecycleAnims.length = 0;
    boat = null;
    smokeSources.length = 0;
    landmarkSprite = null;
    landmarkGlow = null;

    const random = createSeededRandom(layout.seed);
    const { cx, cy, rx, ry } = layout;
    const terrainOn = terrainSprite !== null;

    // beachPts is needed by cliff details and structures regardless
    const beachPts = generateBlob(cx, cy, rx, ry, layout.seed + 2, { noise: 0.13 });

    if (!terrainOn) {
      // ── Procedural terrain layers (fallback) ─────────────────────
      // Water shadow beneath island
      ellipse(staticLayer, cx + 10, cy + 18, rx * 1.1, ry * 1.1, p.waterDeep, 0.4);

      // Wet sand ring (tidal zone)
      const wetBlob = generateBlob(cx, cy + 5, rx * 1.04, ry * 1.04, layout.seed + 1, { noise: 0.12 });
      drawBlob(staticLayer, wetBlob);
      staticLayer.fill({ color: mixNum(p.sand, p.waterLight, 0.35), alpha: 1 });

      // Cliff face — extruded below the beach outline for visible height
      const cliffPts = beachPts.map((pt) => ({ x: pt.x, y: pt.y + CLIFF_HEIGHT }));
      staticLayer.moveTo(beachPts[0].x, beachPts[0].y);
      for (const pt of cliffPts) staticLayer.lineTo(pt.x, pt.y);
      for (let i = beachPts.length - 1; i >= 0; i--) staticLayer.lineTo(beachPts[i].x, beachPts[i].y);
      staticLayer.closePath();
      staticLayer.fill(textures ? { texture: textures.cliff } : { color: mixNum(p.sand, p.forest, 0.45) });
      // Cliff shading overlay
      staticLayer.moveTo(beachPts[0].x, beachPts[0].y);
      for (const pt of cliffPts) staticLayer.lineTo(pt.x, pt.y);
      for (let i = beachPts.length - 1; i >= 0; i--) staticLayer.lineTo(beachPts[i].x, beachPts[i].y);
      staticLayer.closePath();
      staticLayer.fill({ color: p.ink, alpha: 0.12 });

      // Sand beach (top surface)
      drawBlob(staticLayer, beachPts);
      staticLayer.fill(textures ? { texture: textures.sand } : { color: p.sand });

      // Cliff rim highlight (sunlit edge between beach and cliff face)
      drawBlob(staticLayer, beachPts);
      staticLayer.stroke({ color: mixNum(p.sand, 0xffffff, 0.35), alpha: 0.5, width: 3 });

      // Terrace step (mid band between beach and plateau)
      const terraceBlob = generateBlob(cx, cy - 5, rx * 0.86, ry * 0.86, layout.seed + 3, { noise: 0.12 });
      drawBlob(staticLayer, terraceBlob);
      staticLayer.fill({ color: mixNum(p.sand, p.grass, 0.35), alpha: 1 });

      // Grass plateau
      const grassBlob = generateBlob(cx, cy - 10, rx * 0.78, ry * 0.78, layout.seed + 4, { noise: 0.15 });
      drawBlob(staticLayer, grassBlob);
      staticLayer.fill(textures ? { texture: textures.grass } : { color: p.grass });

      // Grass rim highlight
      drawBlob(staticLayer, grassBlob);
      staticLayer.stroke({ color: mixNum(p.grass, 0xffffff, 0.25), alpha: 0.4, width: 2.5 });

      // Grass highlight patches
      const patches = scatterOnIsland(layout, layout.seed + 5, 6, { innerScale: 0.6 });
      for (const patch of patches) {
        ellipse(staticLayer, patch.x, patch.y - 6, 18 + random() * 22, 8 + random() * 8, mixNum(p.grass, 0xffffff, 0.18), 0.5);
      }

      // Grass shadow patches (lower-right, sun from upper-left)
      const shadows = scatterOnIsland(layout, layout.seed + 6, 5, { innerScale: 0.65 });
      for (const s of shadows) {
        ellipse(staticLayer, s.x + 6, s.y + 4, 14 + random() * 16, 6 + random() * 6, p.grassShadow, 0.45);
      }
    }

    // ── Paths ───────────────────────────────────────────────────────
    // Winding path from pier to center
    staticLayer.moveTo(cx - rx * 0.5, cy + ry * 0.55);
    staticLayer.quadraticCurveTo(cx - rx * 0.15, cy + ry * 0.2, cx, cy - ry * 0.1);
    staticLayer.stroke({ color: mixNum(p.sand, p.paper, 0.4), alpha: 0.7, width: 14, cap: 'round' });
    staticLayer.moveTo(cx - rx * 0.5, cy + ry * 0.55);
    staticLayer.quadraticCurveTo(cx - rx * 0.15, cy + ry * 0.2, cx, cy - ry * 0.1);
    staticLayer.stroke({ color: mixNum(p.sand, p.paper, 0.6), alpha: 0.5, width: 8, cap: 'round' });

    // ── Pier + boat ─────────────────────────────────────────────────
    const pierX = cx - rx * 0.55;
    const pierY = cy + ry * 0.6;
    // Pier planks
    for (let i = 0; i < 5; i++) {
      roundedBox(staticLayer, pierX - 40 + i * 16, pierY - 6, 13, 40, 2, i % 2 === 0 ? p.wood : p.woodDark, 1);
    }
    // Pier posts
    circle(staticLayer, pierX - 38, pierY + 36, 4, p.woodDark, 1);
    circle(staticLayer, pierX + 26, pierY + 36, 4, p.woodDark, 1);

    // Moored boat
    boat = new Graphics();
    boatBaseY = pierY + 46;
    drawBoat(boat, pierX - 8, boatBaseY, p);
    animLayer.addChild(boat);

    // ── Project-specific landmarks ──────────────────────────────────
    if (layout.id === 'displaylab') drawDisplayLab(staticLayer, animLayer, layout, p, night, random);
    else if (layout.id === 'booksalon') drawBookSalon(staticLayer, animLayer, layout, p, night, random);
    else if (layout.id === 'nbbang') drawNbbang(staticLayer, animLayer, layout, p, night, random);
    else drawGenericOutpost(staticLayer, animLayer, layout, p, night, random);

    // ── Signature prop — per-project contextual object ─────────────
    drawSignatureProp(staticLayer, layout, p, night);

    // Re-attach landmark sprite on top of freshly rebuilt layers
    if (landmarkKey) {
      const tex = getSpriteTexture(landmarkKey);
      if (tex) attachLandmarkSprite(tex);
    }

    // ── Vegetation ──────────────────────────────────────────────────
    const treeSpots = scatterOnIsland(layout, layout.seed + 10, vegCount(layout.tier, 6), { innerScale: 0.75, avoidCenter: 0.25 });
    for (const spot of treeSpots) {
      drawTree(staticLayer, animLayer, spot.x, spot.y, p, random, trees, spriteAnims);
    }

    // Bushes
    const bushSpots = scatterOnIsland(layout, layout.seed + 11, vegCount(layout.tier, 7), { innerScale: 0.78, avoidCenter: 0.2 });
    for (const spot of bushSpots) {
      drawBush(staticLayer, animLayer, spot.x, spot.y, p, random, spriteAnims);
    }

    // Flowers
    const flowerSpots = scatterOnIsland(layout, layout.seed + 12, vegCount(layout.tier, 8), { innerScale: 0.7, avoidCenter: 0.15 });
    for (let i = 0; i < flowerSpots.length; i++) {
      drawFlower(staticLayer, animLayer, flowerSpots[i].x, flowerSpots[i].y, p, i, random, spriteAnims);
    }

    // Rocks
    const rockSpots = scatterOnIsland(layout, layout.seed + 13, vegCount(layout.tier, 2), { innerScale: 0.8, avoidCenter: 0.3 });
    for (const spot of rockSpots) {
      drawRock(staticLayer, detailLayer, spot.x, spot.y, p, random, false);
    }
    // Extra mossy rocks
    const mossyRockSpots = scatterOnIsland(layout, layout.seed + 15, vegCount(layout.tier, 1), { innerScale: 0.8, avoidCenter: 0.3 });
    for (const spot of mossyRockSpots) {
      drawRock(staticLayer, detailLayer, spot.x, spot.y, p, random, true);
    }

    // Grass tufts
    const tuftSpots = scatterOnIsland(layout, layout.seed + 14, vegCount(layout.tier, 10), { innerScale: 0.75, avoidCenter: 0.1 });
    for (const spot of tuftSpots) {
      drawTuft(staticLayer, animLayer, spot.x, spot.y, p, random, spriteAnims);
    }

    // ── Coastal details (shells, conchs, tide pools) ───────────────
    const shellSpots = scatterOnIsland(layout, layout.seed + 20, 4, { innerScale: 0.92, avoidCenter: 0.7 });
    for (const spot of shellSpots) {
      drawShell(detailLayer, spot.x, spot.y, random);
    }
    const conchSpots = scatterOnIsland(layout, layout.seed + 21, 2, { innerScale: 0.95, avoidCenter: 0.8 });
    for (const spot of conchSpots) {
      drawConch(detailLayer, spot.x, spot.y, random);
    }
    const tidepoolSpots = scatterOnIsland(layout, layout.seed + 22, 2, { innerScale: 0.95, avoidCenter: 0.82 });
    for (const spot of tidepoolSpots) {
      drawTidepool(detailLayer, spot.x, spot.y, random);
    }

    // ── Cliff details (vines + moss patches) ───────────────────────
    drawCliffDetails(animLayer, detailLayer, beachPts, random, spriteAnims);

    // ── Companion island (N-Bang) + bridge ──────────────────────────
    if (layout.companion) {
      const c = layout.companion;
      const tinyTex = getSpriteTexture('island-tiny');
      if (tinyTex) {
        const tiny = new Sprite(tinyTex);
        tiny.anchor.set(0.5, 0.42);
        const tw = c.rx * 2.35;
        const ts = tw / tinyTex.width;
        tiny.width = tw;
        tiny.height = tinyTex.height * ts;
        tiny.x = c.cx;
        tiny.y = c.cy + 4;
        tiny.tint = terrainSprite ? terrainSprite.tint : 0xffffff;
        detailLayer.addChild(tiny);
      } else {
        ellipse(staticLayer, c.cx + 6, c.cy + 10, c.rx * 1.06, c.ry * 1.06, p.waterDeep, 0.4);
        const cCliffH = Math.round(CLIFF_HEIGHT * 0.7);
        const cBeach = generateBlob(c.cx, c.cy + 2, c.rx * 1.01, c.ry * 1.01, c.seed + 1, { noise: 0.12 });
        const cCliff = cBeach.map((pt) => ({ x: pt.x, y: pt.y + cCliffH }));
        staticLayer.moveTo(cBeach[0].x, cBeach[0].y);
        for (const pt of cCliff) staticLayer.lineTo(pt.x, pt.y);
        for (let i = cBeach.length - 1; i >= 0; i--) staticLayer.lineTo(cBeach[i].x, cBeach[i].y);
        staticLayer.closePath();
        staticLayer.fill(textures ? { texture: textures.cliff } : { color: mixNum(p.sand, p.forest, 0.45) });
        drawBlob(staticLayer, cBeach);
        staticLayer.fill(textures ? { texture: textures.sand } : { color: p.sand });
        const cGrass = generateBlob(c.cx, c.cy - 4, c.rx * 0.82, c.ry * 0.82, c.seed + 2, { noise: 0.14 });
        drawBlob(staticLayer, cGrass);
        staticLayer.fill(textures ? { texture: textures.grass } : { color: p.grass });
      }

      // Small house cluster on companion
      drawHouse(staticLayer, c.cx - 20, c.cy - 18, 34, 26, p, night, windows, random, 0);
      drawHouse(staticLayer, c.cx + 22, c.cy + 4, 28, 22, p, night, windows, random, 1);

      // Equal-share bridge
      const bx1 = cx + rx * 0.72;
      const by1 = cy - ry * 0.1;
      const bx2 = c.cx - c.rx * 0.75;
      const by2 = c.cy + c.ry * 0.2;
      staticLayer.moveTo(bx1, by1);
      staticLayer.lineTo(bx2, by2);
      staticLayer.stroke({ color: p.wood, alpha: 1, width: 16, cap: 'round' });
      staticLayer.moveTo(bx1, by1);
      staticLayer.lineTo(bx2, by2);
      staticLayer.stroke({ color: mixNum(p.wood, 0xffffff, 0.25), alpha: 0.6, width: 8, cap: 'round' });
      // Bridge posts
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = bx1 + (bx2 - bx1) * t;
        const py = by1 + (by2 - by1) * t;
        circle(staticLayer, px, py - 8, 3, p.woodDark, 1);
      }
      // Equal-share markers (gold dots on bridge)
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        circle(staticLayer, bx1 + (bx2 - bx1) * t, by1 + (by2 - by1) * t, 2.5, p.gold, 0.9);
      }
    }

    // ── Night overlay tint ──────────────────────────────────────────
    if (night > 0.01 && !terrainOn) {
      const overlay = generateBlob(cx, cy, rx * 1.05, ry * 1.05, layout.seed + 20, { noise: 0.1 });
      drawBlob(staticLayer, overlay);
      staticLayer.fill({ color: 0x0e2a33, alpha: p.nightOverlayAlpha * 0.5 });
    }

    // ── Lifecycle status props ──────────────────────────────────────
    // The island's silhouette language communicates project state at a
    // glance: construction gear while building, signal hardware while
    // operating, a holographic blueprint while planning.
    // AI sprites replace procedural art when loaded; procedural fallback
    // renders immediately and is swapped out via onSpriteLoaded repaint.
    if (lifecycle) {
      const lc = lifecycle.toUpperCase();
      if (lc === 'BUILDING' || lc === 'DEPLOYING') {
        const craneX = cx + rx * 0.52;
        const craneY = cy - ry * 0.28;
        const craneTex = getSpriteTexture('lifecycle-crane');
        if (craneTex) {
          const craneSprite = makeLifecycleSprite(craneTex, 'lifecycle-crane', craneX, craneY, 62, night);
          animLayer.addChild(craneSprite);
          lifecycleAnims.push({ g: craneSprite, kind: 'crane', phase: 0, baseX: craneX, baseY: craneY, spriteMode: true });
        } else {
          drawCrane(animLayer, craneX, craneY, p);
        }
        drawScaffold(staticLayer, cx - rx * 0.48, cy + ry * 0.1, p);
      } else if (lc === 'OPERATING' || lc === 'MAINTENANCE') {
        const antX = cx - rx * 0.42;
        const antY = cy - ry * 0.38;
        const antTex = getSpriteTexture('lifecycle-antenna');
        if (antTex) {
          const antSprite = makeLifecycleSprite(antTex, 'lifecycle-antenna', antX, antY, 48, night);
          animLayer.addChild(antSprite);
          // Pulsing signal ring overlay on top of the static sprite
          const ringG = new Graphics();
          ringG.x = antX;
          ringG.y = antY;
          for (let i = 1; i <= 3; i++) {
            ringG.arc(0, -48 * 0.82, 6 + i * 7, -Math.PI * 0.7, -Math.PI * 0.3);
            ringG.stroke({ color: 0x4dabf7, alpha: 0.45 - i * 0.1, width: 2 });
          }
          animLayer.addChild(ringG);
          lifecycleAnims.push({ g: ringG, kind: 'antenna', phase: 0, baseX: antX, baseY: antY, spriteMode: true });
        } else {
          drawAntenna(animLayer, antX, antY, p);
        }
      } else if (lc === 'PLANNING' || lc === 'DESIGNING' || lc === 'IDEA') {
        drawHologram(animLayer, cx, cy - ry * 0.15, rx, ry);
      } else if (lc === 'TESTING' || lc === 'REVIEWING') {
        const bcnX = cx + rx * 0.45;
        const bcnY = cy - ry * 0.2;
        const bcnTex = getSpriteTexture('lifecycle-beacon');
        if (bcnTex) {
          const bcnSprite = makeLifecycleSprite(bcnTex, 'lifecycle-beacon', bcnX, bcnY, 30, night);
          animLayer.addChild(bcnSprite);
          // Rotating sweep overlay on top of the static sprite
          const sweepG = new Graphics();
          sweepG.x = bcnX;
          sweepG.y = bcnY;
          sweepG.moveTo(0, -30 * 0.72);
          sweepG.arc(0, -30 * 0.72, 18, -0.35, 0.35);
          sweepG.closePath();
          sweepG.fill({ color: 0x4dabf7, alpha: 0.35 });
          animLayer.addChild(sweepG);
          lifecycleAnims.push({ g: sweepG, kind: 'beacon', phase: 0, baseX: bcnX, baseY: bcnY, spriteMode: true });
        } else {
          drawScanBeacon(animLayer, bcnX, bcnY, p);
        }
      }
    }
  }

  // ── Landmark painters ───────────────────────────────────────────

  function drawDisplayLab(
    g: Graphics,
    anim: Container,
    isl: IslandLayout,
    p: WorldPalette,
    night: number,
    rand: () => number,
  ): void {
    const { cx, cy, rx, ry } = isl;
    const spriteOn = landmarkSprite !== null;

    // Prism lighthouse (signature landmark)
    const lx = cx + rx * 0.35;
    const ly = cy - ry * 0.35;
    if (!spriteOn) {
      // Tower body — tapered with rounded silhouette
      g.moveTo(lx - 15, ly + 12);
      g.quadraticCurveTo(lx - 12, ly - 20, lx - 9, ly - 52);
      g.quadraticCurveTo(lx, ly - 57, lx + 9, ly - 52);
      g.quadraticCurveTo(lx + 12, ly - 20, lx + 15, ly + 12);
      g.closePath();
      g.fill({ color: p.stone, alpha: 1 });
      // Sunlit edge
      g.moveTo(lx - 11, ly + 8);
      g.quadraticCurveTo(lx - 9, ly - 20, lx - 6, ly - 48);
      g.stroke({ color: mixNum(p.stone, 0xffffff, 0.3), alpha: 0.5, width: 4, cap: 'round' });
      // Stripes
      for (let i = 0; i < 3; i++) {
        const sy = ly - 40 + i * 18;
        g.rect(lx - 12 + i * 1.2, sy, 24 - i * 2.4, 8);
        g.fill({ color: p.coral, alpha: 0.85 });
        g.rect(lx - 12 + i * 1.2, sy, 24 - i * 2.4, 2.5);
        g.fill({ color: mixNum(p.coral, 0xffffff, 0.3), alpha: 0.5 });
      }
      // Prism top — glass triangle with inner glow
      triangle(g, lx, ly - 80, lx - 14, ly - 52, lx + 14, ly - 52, mixNum(p.stone, 0xffffff, 0.55), 0.95);
      triangle(g, lx, ly - 74, lx - 8, ly - 54, lx + 8, ly - 54, night > 0.3 ? p.windowGlow : 0xc8e8f0, night > 0.3 ? 0.8 : 0.5);
      // Rainbow refraction beams
      const beamColors = [0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x4dabf7, 0x9775fa];
      for (let i = 0; i < beamColors.length; i++) {
        const angle = -0.5 + (i / (beamColors.length - 1)) * 1.0;
        g.moveTo(lx, ly - 64);
        g.lineTo(lx + Math.cos(angle + 0.8) * 70, ly - 64 + Math.sin(angle + 0.8) * 46);
        g.stroke({ color: beamColors[i], alpha: night > 0.4 ? 0.55 : 0.35, width: 3.5, cap: 'round' });
      }
      // Beacon glow at night
      if (night > 0.3) {
        const glow = new Graphics();
        circle(glow, lx, ly - 64, 12, p.windowGlow, 0.7);
        circle(glow, lx, ly - 64, 24, p.windowGlow, 0.2);
        anim.addChild(glow);
        windows.push({ g: glow, phase: rand() * Math.PI * 2 });
      }
    }

    // Presentation pavilion — open structure with projection sail
    const px = cx - rx * 0.25;
    const py = cy - ry * 0.15;
    const pavilionTex = getSpriteTexture('landmark-pavilion');
    if (pavilionTex) {
      const pav = new Sprite(pavilionTex);
      pav.anchor.set(0.5, 1);
      const pavH = 62;
      const pavScale = pavH / pavilionTex.height;
      pav.width = pavilionTex.width * pavScale;
      pav.height = pavH;
      pav.x = px;
      pav.y = py + 14;
      pav.label = 'landmark-sprite-pavilion';
      const r = Math.round(255 - night * 55);
      const gr = Math.round(255 - night * 35);
      const b = Math.round(255 - night * 5);
      pav.tint = (r << 16) | (gr << 8) | b;
      anim.addChild(pav);
    } else {
      // Posts
      g.rect(px - 30, py - 28, 5, 34);
      g.fill({ color: p.woodDark, alpha: 1 });
      g.rect(px + 26, py - 28, 5, 34);
      g.fill({ color: p.woodDark, alpha: 1 });
      // Sail / screen
      g.moveTo(px - 32, py - 28);
      g.quadraticCurveTo(px, py - 38, px + 33, py - 28);
      g.lineTo(px + 30, py - 6);
      g.quadraticCurveTo(px, py - 14, px - 29, py - 6);
      g.closePath();
      g.fill({ color: p.paper, alpha: 0.95 });
      // Color swatches on screen
      const swatchColors = [p.coral, p.gold, 0x69cdc4, p.grass];
      for (let i = 0; i < 4; i++) {
        g.rect(px - 22 + i * 13, py - 24, 9, 12);
        g.fill({ color: swatchColors[i], alpha: 0.85 });
      }
      // Platform
      roundedBox(g, px - 36, py + 4, 74, 10, 3, p.wood, 1);
    }

    // Swatch garden — color swatches planted like flowers
    const gardenX = cx + rx * 0.05;
    const gardenY = cy + ry * 0.25;
    const gardenColors = [p.coral, p.gold, 0x69cdc4, 0x4dabf7, p.grass, 0xd98bb6];
    for (let i = 0; i < 6; i++) {
      const gx = gardenX + (i % 3) * 22 - 22;
      const gy = gardenY + Math.floor(i / 3) * 18;
      g.rect(gx - 1, gy - 10, 2, 10);
      g.fill({ color: p.forest, alpha: 0.8 });
      g.rect(gx - 6, gy - 18, 12, 9);
      g.fill({ color: gardenColors[i], alpha: 0.9 });
    }

    // Workbench with glowing monitors
    const wx = cx - rx * 0.05;
    const wy = cy + ry * 0.05;
    roundedBox(g, wx - 24, wy - 4, 48, 8, 2, p.wood, 1);
    g.rect(wx - 20, wy + 4, 4, 10);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.rect(wx + 16, wy + 4, 4, 10);
    g.fill({ color: p.woodDark, alpha: 1 });
    // Monitors
    for (let i = 0; i < 2; i++) {
      const mx = wx - 12 + i * 24;
      roundedBox(g, mx - 7, wy - 20, 14, 12, 2, p.ink, 1);
      const screen = new Graphics();
      roundedBox(screen, mx - 5, wy - 18, 10, 8, 1, night > 0.3 ? p.windowGlow : 0x8ecdc8, 0.9);
      anim.addChild(screen);
      windows.push({ g: screen, phase: rand() * Math.PI * 2 });
    }

    // Chimney smoke source
    smokeSources.push({ x: lx, y: ly + 2 });

    // Flags on pavilion
    addFlag(anim, px - 30, py - 34, p.coral, rand, flags);
    addFlag(anim, px + 30, py - 34, p.gold, rand, flags);
  }

  function drawBookSalon(
    g: Graphics,
    anim: Container,
    isl: IslandLayout,
    p: WorldPalette,
    night: number,
    rand: () => number,
  ): void {
    const { cx, cy, rx, ry } = isl;
    const spriteOn = landmarkSprite !== null;

    // Reading house — two-story signature building
    const hx = cx - rx * 0.05;
    const hy = cy - ry * 0.2;
    if (!spriteOn) {
      drawHouse(g, hx, hy, 64, 48, p, night, windows, rand, 0, true);
      smokeSources.push({ x: hx + 22, y: hy - 44 });
    }

    // Round reading terrace
    const tx = cx + rx * 0.32;
    const ty = cy + ry * 0.1;
    ellipse(g, tx, ty, 34, 20, mixNum(p.wood, p.sand, 0.4), 1);
    ellipse(g, tx, ty, 30, 17, mixNum(p.wood, p.sand, 0.6), 1);
    // Parasol
    g.rect(tx - 1.5, ty - 26, 3, 24);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.moveTo(tx - 18, ty - 24);
    g.quadraticCurveTo(tx, ty - 38, tx + 18, ty - 24);
    g.closePath();
    g.fill({ color: p.coral, alpha: 1 });
    // Tiny tables + books
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + 0.5;
      const ttx = tx + Math.cos(angle) * 18;
      const tty = ty + Math.sin(angle) * 10;
      ellipse(g, ttx, tty, 6, 4, p.wood, 1);
      g.rect(ttx - 3, tty - 5, 6, 3);
      g.fill({ color: [p.coral, p.gold, 0x4dabf7][i], alpha: 0.9 });
    }

    // Book terraces (stepped shelves on the slope)
    const bx = cx - rx * 0.42;
    const by = cy - ry * 0.05;
    for (let i = 0; i < 3; i++) {
      roundedBox(g, bx - 20 + i * 6, by + i * 12, 40 - i * 8, 10, 2, p.wood, 1);
      // Books on shelf
      for (let j = 0; j < 4 - i; j++) {
        g.rect(bx - 16 + i * 6 + j * 8, by + i * 12 - 6, 5, 6);
        g.fill({ color: [p.coral, p.gold, 0x4dabf7, p.forest][j % 4], alpha: 0.85 });
      }
    }

    // Lantern path
    const lanternSpots = [
      { x: cx - rx * 0.3, y: cy + ry * 0.35 },
      { x: cx - rx * 0.05, y: cy + ry * 0.45 },
      { x: cx + rx * 0.2, y: cy + ry * 0.4 },
    ];
    for (const spot of lanternSpots) {
      g.rect(spot.x - 1.5, spot.y - 16, 3, 16);
      g.fill({ color: p.woodDark, alpha: 1 });
      const glow = new Graphics();
      roundedBox(glow, spot.x - 5, spot.y - 24, 10, 9, 3, p.lanternGlow, night > 0.3 ? 0.95 : 0.6);
      circle(glow, spot.x, spot.y - 20, night > 0.3 ? 14 : 6, p.lanternGlow, night > 0.3 ? 0.25 : 0.08);
      anim.addChild(glow);
      lanterns.push({ g: glow, phase: rand() * Math.PI * 2 });
    }

    // Communal table
    const ctx = cx + rx * 0.05;
    const cty = cy + ry * 0.28;
    roundedBox(g, ctx - 22, cty - 4, 44, 10, 3, p.wood, 1);
    g.rect(ctx - 18, cty + 6, 4, 8);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.rect(ctx + 14, cty + 6, 4, 8);
    g.fill({ color: p.woodDark, alpha: 1 });

    // Laundry line with book covers
    const lx1 = cx - rx * 0.35;
    const ly1 = cy - ry * 0.35;
    g.rect(lx1 - 1.5, ly1 - 20, 3, 22);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.rect(lx1 + 42, ly1 - 20, 3, 22);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.moveTo(lx1, ly1 - 18);
    g.quadraticCurveTo(lx1 + 22, ly1 - 12, lx1 + 44, ly1 - 18);
    g.stroke({ color: p.muted, alpha: 0.6, width: 1.5 });
    const coverColors = [p.coral, p.gold, 0x4dabf7, p.forest];
    for (let i = 0; i < 4; i++) {
      const fx = lx1 + 6 + i * 10;
      const fy = ly1 - 16 + Math.sin((i / 3) * Math.PI) * 3;
      g.rect(fx, fy, 7, 9);
      g.fill({ color: coverColors[i], alpha: 0.85 });
    }

    addFlag(anim, hx - 30, hy - 52, p.gold, rand, flags);
  }

  function drawNbbang(
    g: Graphics,
    anim: Container,
    isl: IslandLayout,
    p: WorldPalette,
    night: number,
    rand: () => number,
  ): void {
    const { cx, cy, rx, ry } = isl;

    // Scale-shaped lighthouse (signature)
    const lx = cx + rx * 0.15;
    const ly = cy - ry * 0.35;
    // Tower — rounded taper
    g.moveTo(lx - 11, ly + 10);
    g.quadraticCurveTo(lx - 9, ly - 15, lx - 7, ly - 40);
    g.quadraticCurveTo(lx, ly - 44, lx + 7, ly - 40);
    g.quadraticCurveTo(lx + 9, ly - 15, lx + 11, ly + 10);
    g.closePath();
    g.fill({ color: p.stone, alpha: 1 });
    g.moveTo(lx - 8, ly + 6);
    g.quadraticCurveTo(lx - 7, ly - 15, lx - 5, ly - 36);
    g.stroke({ color: mixNum(p.stone, 0xffffff, 0.3), alpha: 0.5, width: 3, cap: 'round' });
    g.rect(lx - 8, ly - 24, 16, 7);
    g.fill({ color: p.coral, alpha: 0.8 });
    g.rect(lx - 8, ly - 24, 16, 2.5);
    g.fill({ color: mixNum(p.coral, 0xffffff, 0.3), alpha: 0.5 });
    // Scale beam on top
    g.rect(lx - 24, ly - 46, 48, 3);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.rect(lx - 1.5, ly - 52, 3, 8);
    g.fill({ color: p.woodDark, alpha: 1 });
    // Scale pans
    for (const side of [-1, 1]) {
      const panX = lx + side * 22;
      g.moveTo(panX, ly - 44);
      g.lineTo(panX - 6, ly - 34);
      g.lineTo(panX + 6, ly - 34);
      g.closePath();
      g.fill({ color: p.gold, alpha: 0.9 });
    }
    // Beacon
    if (night > 0.3) {
      const glow = new Graphics();
      circle(glow, lx, ly - 48, 8, p.windowGlow, 0.7);
      circle(glow, lx, ly - 48, 16, p.windowGlow, 0.2);
      anim.addChild(glow);
      windows.push({ g: glow, phase: rand() * Math.PI * 2 });
    }

    // Ledger kiosk
    const kx = cx - rx * 0.25;
    const ky = cy - ry * 0.05;
    roundedBox(g, kx - 18, ky - 16, 36, 24, 3, p.wood, 1);
    triangle(g, kx, ky - 32, kx - 22, ky - 16, kx + 22, ky - 16, p.roofCoral, 1);
    // Kiosk window
    const kWin = new Graphics();
    roundedBox(kWin, kx - 10, ky - 10, 20, 12, 2, night > 0.3 ? p.windowGlow : p.paper, 0.9);
    anim.addChild(kWin);
    windows.push({ g: kWin, phase: rand() * Math.PI * 2 });
    // Ledger board
    g.rect(kx + 22, ky - 14, 12, 16);
    g.fill({ color: p.paper, alpha: 0.9 });
    for (let i = 0; i < 3; i++) {
      g.rect(kx + 24, ky - 11 + i * 5, 8, 2);
      g.fill({ color: p.muted, alpha: 0.6 });
    }

    // House cluster
    drawHouse(g, cx - rx * 0.05, cy + ry * 0.2, 44, 34, p, night, windows, rand, 0);
    drawHouse(g, cx + rx * 0.3, cy + ry * 0.12, 36, 28, p, night, windows, rand, 1);
    smokeSources.push({ x: cx - rx * 0.05 + 16, y: cy + ry * 0.2 - 30 });

    // Market stalls with awnings
    const mx = cx - rx * 0.4;
    const my = cy + ry * 0.3;
    for (let i = 0; i < 2; i++) {
      const sx = mx + i * 34;
      roundedBox(g, sx - 12, my - 8, 24, 14, 2, p.wood, 1);
      // Awning stripes
      for (let s = 0; s < 4; s++) {
        g.rect(sx - 14 + s * 7, my - 16, 7, 8);
        g.fill({ color: s % 2 === 0 ? p.coral : p.paper, alpha: 0.9 });
      }
      // Crates
      roundedBox(g, sx - 8, my + 6, 8, 7, 1, p.woodDark, 1);
      roundedBox(g, sx + 1, my + 6, 8, 7, 1, p.wood, 1);
    }

    // Coin stepping stones toward bridge
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      circle(g, cx + rx * 0.4 + t * rx * 0.3, cy + ry * 0.05 - t * ry * 0.12, 6, p.gold, 0.7);
      circle(g, cx + rx * 0.4 + t * rx * 0.3, cy + ry * 0.05 - t * ry * 0.12, 3.5, mixNum(p.gold, 0xffffff, 0.35), 0.8);
    }

    addFlag(anim, lx, ly - 56, p.coral, rand, flags);
  }

  /**
   * Generic outpost for islands without bespoke landmark art.
   * A compact camp: workshop hut, signal flag, lantern, and crates —
   * enough personality to feel inhabited while staying neutral.
   */
  function drawGenericOutpost(
    g: Graphics,
    anim: Container,
    isl: IslandLayout,
    p: WorldPalette,
    night: number,
    rand: () => number,
  ): void {
    const { cx, cy, rx, ry } = isl;

    // Workshop hut
    const hx = cx - rx * 0.1;
    const hy = cy - ry * 0.15;
    drawHouse(g, hx, hy, 48, 36, p, night, windows, rand, Math.floor(rand() * 2));
    smokeSources.push({ x: hx + 16, y: hy - 30 });

    // Supply crates
    for (let i = 0; i < 3; i++) {
      const bx = cx + rx * 0.25 + i * 12;
      const by = cy + ry * 0.15 - (i % 2) * 8;
      roundedBox(g, bx - 6, by - 6, 12, 12, 2, i % 2 === 0 ? p.wood : p.woodDark, 1);
      g.rect(bx - 6, by - 1, 12, 2);
      g.fill({ color: mixNum(p.wood, 0xffffff, 0.25), alpha: 0.5 });
    }

    // Lantern post
    const lx = cx - rx * 0.35;
    const ly = cy + ry * 0.25;
    g.rect(lx - 1.5, ly - 18, 3, 18);
    g.fill({ color: p.woodDark, alpha: 1 });
    const glow = new Graphics();
    roundedBox(glow, lx - 5, ly - 26, 10, 9, 3, p.lanternGlow, night > 0.3 ? 0.95 : 0.6);
    circle(glow, lx, ly - 22, night > 0.3 ? 13 : 5, p.lanternGlow, night > 0.3 ? 0.25 : 0.08);
    anim.addChild(glow);
    lanterns.push({ g: glow, phase: rand() * Math.PI * 2 });

    // Signpost
    const sx = cx + rx * 0.05;
    const sy = cy + ry * 0.32;
    g.rect(sx - 1.5, sy - 16, 3, 16);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.rect(sx - 12, sy - 14, 24, 7);
    g.fill({ color: p.wood, alpha: 1 });

    addFlag(anim, hx + 28, hy - 40, p.gold, rand, flags);
  }

  // ── Signature prop painter ──────────────────────────────────────
  /**
   * Draw the per-project signature prop on a small wooden sign stand,
   * placed front-right of the landmark so each island carries its
   * project's identity at a glance. All props share the same stand
   * and footprint (~26 world units) for visual consistency.
   */
  function drawSignatureProp(g: Graphics, isl: IslandLayout, p: WorldPalette, night: number): void {
    const kind: SignaturePropKind = signaturePropFor(isl.id);
    const px = isl.cx + isl.rx * 0.38;
    const py = isl.cy + isl.ry * 0.32;
    const ink = mixNum(0x17343a, 0x0d2226, night * 0.5);
    const paper = mixNum(0xfff9ec, 0xd8d0c0, night * 0.4);

    // Wooden stand (shared by every prop)
    g.rect(px - 2, py - 4, 4, 16);
    g.fill({ color: p.woodDark, alpha: 1 });
    g.roundRect(px - 16, py - 22, 32, 20, 3);
    g.fill({ color: p.wood, alpha: 1 });
    g.roundRect(px - 14, py - 20, 28, 16, 2);
    g.fill({ color: paper, alpha: 0.95 });

    const bx = px; // board center x
    const by = py - 12; // board center y

    switch (kind) {
      case 'monitor': {
        // Color-bar test screen
        const bars = [0xee7459, 0xe5aa45, 0x7bbe67, 0x69cdc4];
        for (let i = 0; i < 4; i++) {
          g.rect(bx - 12 + i * 6, by - 6, 6, 12);
          g.fill({ color: mixNum(bars[i], 0x000000, night * 0.3), alpha: 1 });
        }
        break;
      }
      case 'books': {
        const cols = [0xee7459, 0x397457, 0xe5aa45];
        for (let i = 0; i < 3; i++) {
          g.roundRect(bx - 11 + i * 3, by - 7 + i * 3, 18 - i * 4, 4, 1);
          g.fill({ color: mixNum(cols[i], 0x000000, night * 0.3), alpha: 1 });
        }
        break;
      }
      case 'bread': {
        g.ellipse(bx, by, 11, 7);
        g.fill({ color: mixNum(0xd8944a, 0x000000, night * 0.3), alpha: 1 });
        g.moveTo(bx - 6, by - 3);
        g.quadraticCurveTo(bx, by - 7, bx + 6, by - 3);
        g.stroke({ color: mixNum(0xa06830, 0x000000, night * 0.3), alpha: 1, width: 1.5 });
        break;
      }
      case 'pulse': {
        g.moveTo(bx - 12, by);
        g.lineTo(bx - 5, by);
        g.lineTo(bx - 2, by - 7);
        g.lineTo(bx + 2, by + 6);
        g.lineTo(bx + 5, by);
        g.lineTo(bx + 12, by);
        g.stroke({ color: mixNum(0xee7459, 0x000000, night * 0.3), alpha: 1, width: 2, cap: 'round', join: 'round' });
        break;
      }
      case 'spectrum': {
        const hs = [5, 10, 7, 12, 6];
        for (let i = 0; i < 5; i++) {
          g.rect(bx - 12 + i * 5, by + 6 - hs[i], 3.5, hs[i]);
          g.fill({ color: mixNum(i % 2 === 0 ? 0x69cdc4 : 0xe5aa45, 0x000000, night * 0.3), alpha: 1 });
        }
        break;
      }
      case 'tomato': {
        g.circle(bx, by + 1, 8);
        g.fill({ color: mixNum(0xee7459, 0x000000, night * 0.3), alpha: 1 });
        g.ellipse(bx, by - 7, 3, 2);
        g.fill({ color: mixNum(0x7bbe67, 0x000000, night * 0.3), alpha: 1 });
        g.moveTo(bx, by + 1);
        g.lineTo(bx, by - 4);
        g.stroke({ color: paper, alpha: 0.9, width: 1.5 });
        break;
      }
      case 'scale': {
        g.rect(bx - 1, by - 8, 2, 14);
        g.fill({ color: ink, alpha: 1 });
        g.moveTo(bx - 10, by - 6);
        g.lineTo(bx + 10, by - 6);
        g.stroke({ color: ink, alpha: 1, width: 2 });
        g.circle(bx - 10, by - 2, 3.5);
        g.fill({ color: mixNum(0xe5aa45, 0x000000, night * 0.3), alpha: 1 });
        g.circle(bx + 10, by - 2, 3.5);
        g.fill({ color: mixNum(0x69cdc4, 0x000000, night * 0.3), alpha: 1 });
        break;
      }
      case 'notebook': {
        g.roundRect(bx - 10, by - 7, 20, 14, 2);
        g.fill({ color: paper, alpha: 1 });
        g.rect(bx - 0.75, by - 7, 1.5, 14);
        g.fill({ color: ink, alpha: 0.5 });
        for (let i = 0; i < 3; i++) {
          g.rect(bx + 3, by - 4 + i * 4, 6, 1.2);
          g.fill({ color: ink, alpha: 0.5 });
        }
        break;
      }
      case 'checklist': {
        for (let i = 0; i < 3; i++) {
          const yy = by - 5 + i * 5;
          g.rect(bx - 11, yy, 4, 4);
          g.stroke({ color: ink, alpha: 0.8, width: 1 });
          if (i < 2) {
            g.moveTo(bx - 10.5, yy + 2);
            g.lineTo(bx - 9, yy + 3.5);
            g.lineTo(bx - 7, yy + 0.5);
            g.stroke({ color: mixNum(0x7bbe67, 0x000000, night * 0.3), alpha: 1, width: 1.2 });
          }
          g.rect(bx - 4, yy + 1, 14, 1.5);
          g.fill({ color: ink, alpha: 0.5 });
        }
        break;
      }
      case 'compass': {
        g.circle(bx, by, 8);
        g.stroke({ color: ink, alpha: 0.9, width: 1.5 });
        g.moveTo(bx, by - 6);
        g.lineTo(bx + 3, by);
        g.lineTo(bx, by + 6);
        g.lineTo(bx - 3, by);
        g.closePath();
        g.fill({ color: mixNum(0xee7459, 0x000000, night * 0.3), alpha: 1 });
        break;
      }
      case 'wave': {
        g.rect(bx - 1, by - 4, 2, 10);
        g.fill({ color: ink, alpha: 1 });
        for (let i = 1; i <= 3; i++) {
          g.arc(bx, by - 4, i * 3.5, -Math.PI * 0.75, -Math.PI * 0.25);
          g.stroke({ color: mixNum(0x69cdc4, 0x000000, night * 0.3), alpha: 1 - i * 0.2, width: 1.5 });
        }
        break;
      }
      case 'nodes': {
        const pts: [number, number][] = [[bx - 9, by - 5], [bx + 7, by - 6], [bx - 2, by + 6]];
        for (const [ax, ay] of pts) {
          for (const [bx2, by2] of pts) {
            if (ax !== bx2 || ay !== by2) {
              g.moveTo(ax, ay);
              g.lineTo(bx2, by2);
              g.stroke({ color: ink, alpha: 0.4, width: 1 });
            }
          }
        }
        const nCols = [0xee7459, 0xe5aa45, 0x69cdc4];
        pts.forEach(([nx, ny], i) => {
          g.circle(nx, ny, 3.5);
          g.fill({ color: mixNum(nCols[i], 0x000000, night * 0.3), alpha: 1 });
        });
        break;
      }
      case 'gauge': {
        g.arc(bx, by + 2, 8, Math.PI, Math.PI * 2);
        g.stroke({ color: ink, alpha: 0.9, width: 1.5 });
        g.moveTo(bx, by + 2);
        g.lineTo(bx + 5, by - 4);
        g.stroke({ color: mixNum(0xee7459, 0x000000, night * 0.3), alpha: 1, width: 2, cap: 'round' });
        g.circle(bx, by + 2, 1.5);
        g.fill({ color: ink, alpha: 1 });
        break;
      }
      default: {
        // Crate fallback
        g.roundRect(bx - 7, by - 6, 14, 12, 2);
        g.fill({ color: mixNum(p.wood, 0x000000, night * 0.3), alpha: 1 });
        g.rect(bx - 7, by - 1, 14, 2);
        g.fill({ color: mixNum(p.woodDark, 0x000000, night * 0.3), alpha: 0.7 });
        break;
      }
    }
  }

  // ── Shared painters ─────────────────────────────────────────────

  /**
   * Build an AI lifecycle sprite (crane/antenna/beacon) anchored bottom-center
   * at (x, y), scaled to `targetH` world units tall, with the same night tint
   * the landmark sprite uses. Mirrors the pavilion/landmark sprite pattern.
   */
  function makeLifecycleSprite(
    texture: import('pixi.js').Texture,
    key: SpriteKey,
    x: number,
    y: number,
    targetH: number,
    night: number,
  ): Sprite {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 1); // base at anchor
    const scale = targetH / texture.height;
    sprite.width = texture.width * scale;
    sprite.height = targetH;
    sprite.x = x;
    sprite.y = y;
    sprite.label = `lifecycle-sprite-${key}`;
    const r = Math.round(255 - night * 55);
    const g = Math.round(255 - night * 35);
    const b = Math.round(255 - night * 5);
    sprite.tint = (r << 16) | (g << 8) | b;
    return sprite;
  }

  // ── Lifecycle status prop painters ──────────────────────────────

  /** Construction crane — signals active building. */
  function drawCrane(anim: Container, x: number, y: number, p: WorldPalette): void {
    const g = new Graphics();
    g.x = x;
    g.y = y;
    // Mast
    g.rect(-3, -52, 6, 52);
    g.fill({ color: p.gold, alpha: 1 });
    // Counter-jib
    g.rect(-28, -52, 28, 4);
    g.fill({ color: p.gold, alpha: 1 });
    g.rect(-28, -56, 8, 8);
    g.fill({ color: mixNum(p.gold, p.ink, 0.3), alpha: 1 });
    // Jib
    g.rect(0, -52, 38, 4);
    g.fill({ color: p.gold, alpha: 1 });
    // Cable + hook
    g.moveTo(30, -48);
    g.lineTo(30, -28);
    g.stroke({ color: p.ink, alpha: 0.7, width: 1.5 });
    g.rect(27, -28, 6, 5);
    g.fill({ color: p.ink, alpha: 0.8 });
    // Cab
    g.rect(-6, -58, 12, 8);
    g.fill({ color: p.coral, alpha: 1 });
    anim.addChild(g);
    lifecycleAnims.push({ g, kind: 'crane', phase: 0, baseX: x, baseY: y });
  }

  /** Scaffolding on the island edge — under-construction feel. */
  function drawScaffold(g: Graphics, x: number, y: number, p: WorldPalette): void {
    const w = 36;
    const h = 30;
    // Verticals
    for (let i = 0; i <= 2; i++) {
      g.rect(x + i * (w / 2) - 1.5, y - h, 3, h);
      g.fill({ color: mixNum(p.wood, 0x888888, 0.4), alpha: 0.9 });
    }
    // Horizontals
    for (let j = 0; j <= 2; j++) {
      g.rect(x - 2, y - h + j * (h / 2), w + 4, 2.5);
      g.fill({ color: mixNum(p.wood, 0x888888, 0.3), alpha: 0.85 });
    }
    // Diagonal brace
    g.moveTo(x, y);
    g.lineTo(x + w, y - h);
    g.stroke({ color: mixNum(p.wood, 0x888888, 0.5), alpha: 0.6, width: 2 });
  }

  /** Signal antenna with pulsing rings — signals live operation. */
  function drawAntenna(anim: Container, x: number, y: number, p: WorldPalette): void {
    const g = new Graphics();
    g.x = x;
    g.y = y;
    // Pole
    g.rect(-2, -36, 4, 36);
    g.fill({ color: mixNum(p.stone, 0xffffff, 0.2), alpha: 1 });
    // Dish
    g.ellipse(0, -36, 8, 5);
    g.fill({ color: p.paper, alpha: 1 });
    g.ellipse(0, -36, 8, 5);
    g.stroke({ color: p.muted, alpha: 0.8, width: 1.5 });
    // Signal rings (animated in tick)
    for (let i = 1; i <= 3; i++) {
      g.arc(0, -38, 6 + i * 7, -Math.PI * 0.7, -Math.PI * 0.3);
      g.stroke({ color: 0x4dabf7, alpha: 0.5 - i * 0.12, width: 2 });
    }
    // Blinking light
    g.circle(0, -40, 3);
    g.fill({ color: p.coral, alpha: 1 });
    anim.addChild(g);
    lifecycleAnims.push({ g, kind: 'antenna', phase: 0, baseX: x, baseY: y });
  }

  /** Holographic blueprint grid — signals planning/design phase. */
  function drawHologram(anim: Container, cx: number, cy: number, rx: number, ry: number): void {
    const g = new Graphics();
    g.x = cx;
    g.y = cy;
    const hw = rx * 0.5;
    const hh = ry * 0.35;
    // Grid lines
    for (let i = -3; i <= 3; i++) {
      g.moveTo(i * (hw / 3), -hh);
      g.lineTo(i * (hw / 3), hh);
      g.stroke({ color: 0x4dabf7, alpha: 0.2, width: 1 });
    }
    for (let j = -2; j <= 2; j++) {
      g.moveTo(-hw, j * (hh / 2));
      g.lineTo(hw, j * (hh / 2));
      g.stroke({ color: 0x4dabf7, alpha: 0.2, width: 1 });
    }
    // Blueprint outline (dashed island shape)
    g.ellipse(0, 0, hw * 0.8, hh * 0.8);
    g.stroke({ color: 0x4dabf7, alpha: 0.5, width: 2 });
    // Corner markers
    for (const [mx, my] of [[-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh]] as const) {
      g.rect(mx - 3, my - 3, 6, 6);
      g.fill({ color: 0x4dabf7, alpha: 0.6 });
    }
    anim.addChild(g);
    lifecycleAnims.push({ g, kind: 'hologram', phase: 0, baseX: cx, baseY: cy });
  }

  /** Scanning beacon with rotating sweep — signals testing/review. */
  function drawScanBeacon(anim: Container, x: number, y: number, p: WorldPalette): void {
    const g = new Graphics();
    g.x = x;
    g.y = y;
    // Tripod base
    g.moveTo(0, 0);
    g.lineTo(-8, 12);
    g.moveTo(0, 0);
    g.lineTo(8, 12);
    g.moveTo(0, 0);
    g.lineTo(0, 14);
    g.stroke({ color: p.woodDark, alpha: 1, width: 2.5 });
    // Beacon dome
    g.circle(0, -4, 7);
    g.fill({ color: p.gold, alpha: 0.9 });
    g.circle(0, -4, 4);
    g.fill({ color: 0xffffff, alpha: 0.7 });
    anim.addChild(g);
    lifecycleAnims.push({ g, kind: 'beacon', phase: 0, baseX: x, baseY: y });
  }

  function drawHouse(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    p: WorldPalette,
    night: number,
    windowList: WindowGlow[],
    rand: () => number,
    variant: number,
    twoStory = false,
  ): void {
    const roofH = h * 0.6;
    const bodyH = twoStory ? h : h * 0.7;
    const roofColor = variant % 2 === 0 ? p.roofCoral : p.roofTeal;

    const wallColor = mixNum(p.paper, p.wood, 0.25);

    // Foundation stone band
    roundedBox(g, x - w / 2 - 2, y - 5, w + 4, 6, 2, mixNum(p.stone, p.ink, 0.1), 1);

    // Body — rounded
    roundedBox(g, x - w / 2, y - bodyH, w, bodyH - 3, 5, wallColor, 1);
    // Siding lines
    for (let i = 1; i < 4; i++) {
      g.rect(x - w / 2 + 3, y - bodyH + (bodyH / 4) * i, w - 6, 1);
      g.fill({ color: mixNum(wallColor, p.woodDark, 0.25), alpha: 0.35 });
    }
    // Corner trim
    g.rect(x - w / 2, y - bodyH, 3, bodyH - 3);
    g.fill({ color: p.woodDark, alpha: 0.5 });
    g.rect(x + w / 2 - 3, y - bodyH, 3, bodyH - 3);
    g.fill({ color: p.woodDark, alpha: 0.5 });

    if (twoStory) {
      g.rect(x - w / 2 + 3, y - bodyH * 0.55, w - 6, 2.5);
      g.fill({ color: p.woodDark, alpha: 0.5 });
    }

    // Roof — puffy curved AC-style
    const roofW = w / 2 + 12;
    const roofBase = y - bodyH + 3;
    const roofTop = y - bodyH - roofH;
    g.moveTo(x - roofW, roofBase);
    g.quadraticCurveTo(x - roofW * 0.55, roofBase - roofH * 0.15, x, roofTop);
    g.quadraticCurveTo(x + roofW * 0.55, roofBase - roofH * 0.15, x + roofW, roofBase);
    g.quadraticCurveTo(x, roofBase + 6, x - roofW, roofBase);
    g.closePath();
    g.fill({ color: roofColor, alpha: 1 });
    // Roof tile lines
    for (let i = 1; i <= 2; i++) {
      const t = i / 3;
      const ly = roofTop + (roofBase - roofTop) * t;
      const lw = roofW * (0.35 + t * 0.6);
      g.moveTo(x - lw, ly + 2);
      g.quadraticCurveTo(x, ly - 3, x + lw, ly + 2);
      g.stroke({ color: mixNum(roofColor, p.ink, 0.2), alpha: 0.4, width: 1.5 });
    }
    // Roof highlight (sun from upper-left)
    g.moveTo(x - roofW * 0.7, roofBase - 2);
    g.quadraticCurveTo(x - roofW * 0.35, roofBase - roofH * 0.5, x - roofW * 0.05, roofTop + 2);
    g.stroke({ color: mixNum(roofColor, 0xffffff, 0.35), alpha: 0.5, width: 3, cap: 'round' });
    // Ridge cap
    circle(g, x, roofTop, 3.5, mixNum(roofColor, 0xffffff, 0.25), 1);

    // Door — arched
    g.moveTo(x - 6, y - 3);
    g.lineTo(x - 6, y - 14);
    g.quadraticCurveTo(x, y - 20, x + 6, y - 14);
    g.lineTo(x + 6, y - 3);
    g.closePath();
    g.fill({ color: p.woodDark, alpha: 1 });
    circle(g, x + 3.5, y - 10, 1.3, p.gold, 0.9);

    // Windows (glow at night)
    const winPositions = twoStory
      ? [
          { wx: x - w / 4 - 2, wy: y - bodyH * 0.75 },
          { wx: x + w / 4 - 2, wy: y - bodyH * 0.75 },
          { wx: x - w / 4 - 2, wy: y - bodyH * 0.3 },
          { wx: x + w / 4 - 2, wy: y - bodyH * 0.3 },
        ]
      : [
          { wx: x - w / 4 - 2, wy: y - bodyH * 0.55 },
          { wx: x + w / 4 - 2, wy: y - bodyH * 0.55 },
        ];
    for (const wp of winPositions) {
      // Frame
      roundedBox(g, wp.wx - 1.5, wp.wy - 1.5, 12, 12, 2, p.woodDark, 1);
      // Glass
      const glow = new Graphics();
      roundedBox(glow, wp.wx, wp.wy, 9, 9, 1.5, night > 0.25 ? p.windowGlow : mixNum(p.windowGlow, p.skyTop, 0.5), night > 0.25 ? 0.95 : 0.5);
      // Cross mullion
      glow.rect(wp.wx + 3.8, wp.wy, 1.4, 9);
      glow.fill({ color: p.woodDark, alpha: 0.7 });
      glow.rect(wp.wx, wp.wy + 3.8, 9, 1.4);
      glow.fill({ color: p.woodDark, alpha: 0.7 });
      if (night > 0.25) {
        circle(glow, wp.wx + 4.5, wp.wy + 4.5, 10, p.windowGlow, 0.12);
      }
      animLayer.addChild(glow);
      windowList.push({ g: glow, phase: rand() * Math.PI * 2 });
    }

    // Chimney
    roundedBox(g, x + w / 4, y - bodyH - roofH * 0.5, 8, roofH * 0.45, 2, mixNum(p.stone, p.woodDark, 0.3), 1);
    g.rect(x + w / 4 - 1.5, y - bodyH - roofH * 0.5, 11, 3);
    g.fill({ color: mixNum(p.stone, p.ink, 0.15), alpha: 1 });
  }

  function drawTree(
    g: Graphics,
    anim: Container,
    x: number,
    y: number,
    p: WorldPalette,
    rand: () => number,
    treeList: TreeAnim[],
    spriteAnimList: SpriteAnim[],
  ): void {
    const kind = rand();
    const scale = 0.85 + rand() * 0.5;

    // ── Sprite path (preferred) ───────────────────────────────────
    const treeKey: SpriteKey = kind < 0.45 ? 'tree-deciduous' : kind < 0.75 ? 'tree-conifer' : 'tree-palm';
    const treeTex = getSpriteTexture(treeKey);
    if (treeTex) {
      ellipse(g, x + 6 * scale, y + 3, 16 * scale, 6 * scale, p.grassShadow, 0.45);
      const sprite = new Sprite(treeTex);
      sprite.anchor.set(0.5, 1);
      const size = getSpriteSize(treeKey);
      sprite.width = size.w * scale;
      sprite.height = size.h * scale;
      sprite.x = x;
      sprite.y = y;
      anim.addChild(sprite);
      spriteAnimList.push({ sprite, phase: rand() * Math.PI * 2, baseY: y, baseScaleX: sprite.scale.x, baseScaleY: sprite.scale.y, kind: 'tree' });
      return;
    }

    // ── Procedural fallback ───────────────────────────────────────
    // Contact shadow (sun from upper-left)
    ellipse(g, x + 6 * scale, y + 3, 16 * scale, 6 * scale, p.grassShadow, 0.45);

    if (kind < 0.45) {
      // ── Round deciduous ─────────────────────────────────────────
      const trunkH = (16 + rand() * 8) * scale;
      const r = (14 + rand() * 8) * scale;
      // Curved trunk
      g.moveTo(x - 3 * scale, y);
      g.quadraticCurveTo(x - 1 * scale, y - trunkH * 0.6, x + 1 * scale, y - trunkH);
      g.lineTo(x + 5 * scale, y - trunkH);
      g.quadraticCurveTo(x + 4 * scale, y - trunkH * 0.5, x + 3 * scale, y);
      g.closePath();
      g.fill({ color: p.woodDark, alpha: 1 });
      // Canopy cluster — shadow side, main, light side, highlight
      const canopy = new Graphics();
      const cy0 = -trunkH - r * 0.4;
      circle(canopy, r * 0.3, cy0 + r * 0.3, r * 0.8, mixNum(p.forest, p.ink, 0.15), 1);
      circle(canopy, 0, cy0, r, mixNum(p.grass, p.forest, 0.3), 1);
      circle(canopy, -r * 0.35, cy0 - r * 0.25, r * 0.75, mixNum(p.grass, p.forest, 0.1), 1);
      circle(canopy, -r * 0.3, cy0 - r * 0.55, r * 0.4, mixNum(p.grass, 0xffffff, 0.3), 0.7);
      canopy.x = x;
      canopy.y = y;
      anim.addChild(canopy);
      treeList.push({ canopy, phase: rand() * Math.PI * 2, baseY: y });
    } else if (kind < 0.75) {
      // ── Conifer — stacked tiers ─────────────────────────────────
      const h = (34 + rand() * 14) * scale;
      const w = (16 + rand() * 6) * scale;
      g.rect(x - 2.5 * scale, y - h * 0.25, 5 * scale, h * 0.25);
      g.fill({ color: p.woodDark, alpha: 1 });
      const canopy = new Graphics();
      for (let i = 0; i < 3; i++) {
        const ty = -h * 0.2 - i * h * 0.26;
        const tw = w * (1 - i * 0.28);
        triangle(
          canopy,
          0, ty - h * 0.3,
          -tw, ty,
          tw, ty,
          i === 0 ? mixNum(p.forest, p.ink, 0.1) : mixNum(p.forest, p.grass, i * 0.15),
          1,
        );
        // Light tip on each tier
        triangle(
          canopy,
          0, ty - h * 0.3,
          -tw * 0.4, ty - h * 0.18,
          tw * 0.4, ty - h * 0.18,
          mixNum(p.forest, 0xffffff, 0.15),
          0.5,
        );
      }
      canopy.x = x;
      canopy.y = y;
      anim.addChild(canopy);
      treeList.push({ canopy, phase: rand() * Math.PI * 2, baseY: y });
    } else {
      // ── Palm — leaning trunk + fronds ───────────────────────────
      const h = (26 + rand() * 10) * scale;
      const lean = (rand() - 0.5) * 16 * scale;
      g.moveTo(x - 2.5 * scale, y);
      g.quadraticCurveTo(x + lean * 0.3, y - h * 0.6, x + lean, y - h);
      g.lineTo(x + lean + 4 * scale, y - h);
      g.quadraticCurveTo(x + lean * 0.3 + 4 * scale, y - h * 0.55, x + 3 * scale, y);
      g.closePath();
      g.fill({ color: p.wood, alpha: 1 });
      const canopy = new Graphics();
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI * 0.85 + (i / 4) * Math.PI * 0.7 + 0.15;
        const fx = Math.cos(angle) * 20 * scale;
        const fy = Math.sin(angle) * 12 * scale;
        canopy.moveTo(lean + 2 * scale, -h);
        canopy.quadraticCurveTo(lean + fx * 0.6, -h + fy - 6 * scale, lean + fx, -h + fy + 4 * scale);
        canopy.quadraticCurveTo(lean + fx * 0.5, -h + fy + 2 * scale, lean + 2 * scale, -h + 3 * scale);
        canopy.closePath();
        canopy.fill({ color: i % 2 === 0 ? mixNum(p.grass, p.forest, 0.2) : p.grass, alpha: 1 });
      }
      circle(canopy, lean, -h + 2 * scale, 3 * scale, p.woodDark, 1);
      circle(canopy, lean + 4 * scale, -h + 3 * scale, 2.5 * scale, p.woodDark, 1);
      canopy.x = x;
      canopy.y = y;
      anim.addChild(canopy);
      treeList.push({ canopy, phase: rand() * Math.PI * 2, baseY: y });
    }
  }

  // ── Sprite helper functions ─────────────────────────────────────

  function drawBush(g: Graphics, anim: Container, x: number, y: number, p: WorldPalette, rand: () => number, spriteAnimList: SpriteAnim[]): void {
    const scale = 0.8 + rand() * 0.5;
    const tex = getSpriteTexture('bush');
    if (tex) {
      ellipse(g, x + 3, y + 2, 10 * scale, 4 * scale, p.grassShadow, 0.4);
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      const size = getSpriteSize('bush');
      sprite.width = size.w * scale;
      sprite.height = size.h * scale;
      sprite.x = x;
      sprite.y = y;
      anim.addChild(sprite);
      spriteAnimList.push({ sprite, phase: rand() * Math.PI * 2, baseY: y, baseScaleX: sprite.scale.x, baseScaleY: sprite.scale.y, kind: 'bush' });
      return;
    }
    // Procedural fallback
    const size = 8 + rand() * 10;
    ellipse(g, x + 3, y + 2, size * 0.9, size * 0.4, p.grassShadow, 0.4);
    circle(g, x + size * 0.35, y, size * 0.7, mixNum(p.forest, p.ink, 0.1), 1);
    circle(g, x, y - size * 0.15, size, mixNum(p.grass, p.forest, 0.35), 1);
    circle(g, x - size * 0.4, y - size * 0.35, size * 0.6, mixNum(p.grass, p.forest, 0.15), 1);
    circle(g, x - size * 0.3, y - size * 0.55, size * 0.3, mixNum(p.grass, 0xffffff, 0.25), 0.6);
  }

  const FLOWER_KEYS: SpriteKey[] = ['flower-coral', 'flower-gold', 'flower-white', 'flower-pink'];

  function drawFlower(g: Graphics, anim: Container, x: number, y: number, p: WorldPalette, index: number, rand: () => number, spriteAnimList: SpriteAnim[]): void {
    const key = FLOWER_KEYS[index % FLOWER_KEYS.length];
    const tex = getSpriteTexture(key);
    if (tex) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      const size = getSpriteSize(key);
      sprite.width = size.w;
      sprite.height = size.h;
      sprite.x = x;
      sprite.y = y;
      anim.addChild(sprite);
      spriteAnimList.push({ sprite, phase: rand() * Math.PI * 2, baseY: y, baseScaleX: sprite.scale.x, baseScaleY: sprite.scale.y, kind: 'flower' });
      return;
    }
    // Procedural fallback
    const flowerColors = [p.coral, p.gold, p.foam, 0xd98bb6];
    g.moveTo(x, y);
    g.quadraticCurveTo(x - 1, y - 5, x, y - 7);
    g.stroke({ color: mixNum(p.grass, p.forest, 0.3), alpha: 0.8, width: 1.5, cap: 'round' });
    const pc = flowerColors[index % flowerColors.length];
    for (let petal = 0; petal < 5; petal++) {
      const angle = (petal / 5) * Math.PI * 2;
      circle(g, x + Math.cos(angle) * 2.6, y - 7 + Math.sin(angle) * 2.6, 2.2, pc, 0.9);
    }
    circle(g, x, y - 7, 1.6, p.gold, 1);
  }

  function drawRock(g: Graphics, detail: Container, x: number, y: number, p: WorldPalette, rand: () => number, mossy: boolean): void {
    const key: SpriteKey = mossy ? 'rock-moss-variant' : 'rock';
    const tex = getSpriteTexture(key);
    if (tex) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      const size = getSpriteSize(key);
      const s = 0.8 + rand() * 0.5;
      sprite.width = size.w * s;
      sprite.height = size.h * s;
      sprite.x = x;
      sprite.y = y;
      detail.addChild(sprite);
      return;
    }
    // Procedural fallback
    const rw = 8 + rand() * 8;
    const rh = 6 + rand() * 5;
    ellipse(g, x + 3, y + 2, rw * 0.9, rh * 0.45, p.grassShadow, 0.4);
    ellipse(g, x, y, rw, rh, mixNum(p.stone, p.ink, 0.15), 1);
    ellipse(g, x - rw * 0.15, y - rh * 0.25, rw * 0.75, rh * 0.7, p.stone, 1);
    ellipse(g, x - rw * 0.25, y - rh * 0.4, rw * 0.4, rh * 0.35, mixNum(p.stone, 0xffffff, 0.3), 0.7);
  }

  function drawTuft(g: Graphics, anim: Container, x: number, y: number, p: WorldPalette, rand: () => number, spriteAnimList: SpriteAnim[]): void {
    const tex = getSpriteTexture('grass-tuft');
    if (tex) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      const size = getSpriteSize('grass-tuft');
      const s = 0.7 + rand() * 0.6;
      sprite.width = size.w * s;
      sprite.height = size.h * s;
      sprite.x = x;
      sprite.y = y;
      anim.addChild(sprite);
      spriteAnimList.push({ sprite, phase: rand() * Math.PI * 2, baseY: y, baseScaleX: sprite.scale.x, baseScaleY: sprite.scale.y, kind: 'tuft' });
      return;
    }
    // Procedural fallback
    const th = 5 + rand() * 5;
    for (let b = -1; b <= 1; b++) {
      g.moveTo(x + b * 3, y);
      g.quadraticCurveTo(x + b * 4, y - th, x + b * 5, y - th - 2);
      g.stroke({ color: mixNum(p.grass, p.forest, 0.25), alpha: 0.8, width: 1.8, cap: 'round' });
    }
  }

  function drawShell(detail: Container, x: number, y: number, rand: () => number): void {
    const tex = getSpriteTexture('shell');
    if (tex) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      const size = getSpriteSize('shell');
      sprite.width = size.w;
      sprite.height = size.h;
      sprite.x = x;
      sprite.y = y;
      sprite.rotation = (rand() - 0.5) * 0.6;
      detail.addChild(sprite);
    }
    // No procedural fallback for shells — tiny detail
  }

  function drawConch(detail: Container, x: number, y: number, rand: () => number): void {
    const tex = getSpriteTexture('conch');
    if (tex) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      const size = getSpriteSize('conch');
      sprite.width = size.w;
      sprite.height = size.h;
      sprite.x = x;
      sprite.y = y;
      sprite.rotation = (rand() - 0.5) * 0.8;
      detail.addChild(sprite);
    }
  }

  function drawTidepool(detail: Container, x: number, y: number, rand: () => number): void {
    const tex = getSpriteTexture('tidepool');
    if (tex) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 0.5);
      const size = getSpriteSize('tidepool');
      const s = 0.8 + rand() * 0.4;
      sprite.width = size.w * s;
      sprite.height = size.h * s;
      sprite.x = x;
      sprite.y = y;
      sprite.alpha = 0.85;
      detail.addChild(sprite);
    }
  }

  function drawCliffDetails(anim: Container, detail: Container, beachPts: readonly { readonly x: number; readonly y: number }[], rand: () => number, spriteAnimList: SpriteAnim[]): void {
    const { cx, rx } = layout;
    // Vines hanging from cliff top
    const vineCount = 3 + Math.floor(rand() * 3); // 3-5
    const vineTex = getSpriteTexture('vine');
    for (let i = 0; i < vineCount; i++) {
      const angle = Math.PI * 0.15 + rand() * Math.PI * 0.7; // spread along front cliff
      const vx = cx + Math.cos(angle) * rx * (0.4 + rand() * 0.4);
      const vy = layout.cy + Math.sin(angle) * layout.ry + 2;
      if (vineTex) {
        const sprite = new Sprite(vineTex);
        sprite.anchor.set(0.5, 0);
        const size = getSpriteSize('vine');
        const s = 0.7 + rand() * 0.6;
        sprite.width = size.w * s;
        sprite.height = size.h * s;
        sprite.x = vx;
        sprite.y = vy;
        anim.addChild(sprite);
        spriteAnimList.push({ sprite, phase: rand() * Math.PI * 2, baseY: vy, baseScaleX: sprite.scale.x, baseScaleY: sprite.scale.y, kind: 'vine' });
      } else {
        // Procedural fallback: simple quadratic curve vine
        const vg = new Graphics();
        vg.moveTo(0, 0);
        vg.quadraticCurveTo(3, 12, -2, 24);
        vg.stroke({ color: 0x397457, alpha: 0.8, width: 2, cap: 'round' });
        for (let l = 0; l < 4; l++) {
          circle(vg, (l % 2 === 0 ? -3 : 3), 4 + l * 5, 3, 0x7bbe67, 0.9);
        }
        vg.x = vx;
        vg.y = vy;
        anim.addChild(vg);
      }
    }
    // Moss patches on cliff face
    const mossCount = 4 + Math.floor(rand() * 3); // 4-6
    const mossTex = getSpriteTexture('moss-patch');
    for (let i = 0; i < mossCount; i++) {
      const angle = Math.PI * 0.1 + rand() * Math.PI * 0.8;
      const mx = cx + Math.cos(angle) * rx * (0.3 + rand() * 0.5);
      const my = layout.cy + Math.sin(angle) * layout.ry + 4 + rand() * (CLIFF_HEIGHT - 8);
      if (mossTex) {
        const sprite = new Sprite(mossTex);
        sprite.anchor.set(0.5, 0.5);
        const size = getSpriteSize('moss-patch');
        const s = 0.6 + rand() * 0.6;
        sprite.width = size.w * s;
        sprite.height = size.h * s;
        sprite.x = mx;
        sprite.y = my;
        sprite.alpha = 0.7;
        detail.addChild(sprite);
      } else {
        const mossG = new Graphics();
        mossG.circle(0, 0, 4 + rand() * 4);
        mossG.fill({ color: 0x7bbe67, alpha: 0.4 });
        mossG.x = mx;
        mossG.y = my;
        detail.addChild(mossG);
      }
    }
  }

  function addFlag(
    anim: Container,
    x: number,
    y: number,
    color: number,
    rand: () => number,
    flagList: FlagAnim[],
  ): void {
    const g = new Graphics();
    g.x = x;
    g.y = y;
    anim.addChild(g);
    flagList.push({ g, phase: rand() * Math.PI * 2, x, y, color });
  }

  function drawBoat(g: Graphics, x: number, y: number, p: WorldPalette): void {
    // Hull — rounded bottom
    g.moveTo(x - 20, y - 5);
    g.quadraticCurveTo(x - 22, y + 7, x - 10, y + 9);
    g.lineTo(x + 10, y + 9);
    g.quadraticCurveTo(x + 22, y + 7, x + 20, y - 5);
    g.closePath();
    g.fill({ color: p.wood, alpha: 1 });
    // Gunwale rim
    g.moveTo(x - 20, y - 5);
    g.quadraticCurveTo(x, y - 1, x + 20, y - 5);
    g.stroke({ color: p.woodDark, alpha: 1, width: 3 });
    // Inner hull
    g.moveTo(x - 15, y - 3);
    g.quadraticCurveTo(x - 16, y + 5, x - 8, y + 6);
    g.lineTo(x + 8, y + 6);
    g.quadraticCurveTo(x + 16, y + 5, x + 15, y - 3);
    g.closePath();
    g.fill({ color: p.woodDark, alpha: 0.75 });
    // Seat plank
    g.rect(x - 7, y - 1, 14, 3.5);
    g.fill({ color: mixNum(p.wood, 0xffffff, 0.2), alpha: 0.9 });
    // Oar
    g.moveTo(x + 12, y - 2);
    g.lineTo(x + 26, y + 8);
    g.stroke({ color: p.woodDark, alpha: 0.9, width: 2.5, cap: 'round' });
    // Mooring rope
    g.moveTo(x - 18, y - 4);
    g.quadraticCurveTo(x - 30, y - 10, x - 38, y - 16);
    g.stroke({ color: mixNum(p.woodDark, p.muted, 0.5), alpha: 0.6, width: 1.5 });
  }

  // ── Highlight glow ring ─────────────────────────────────────────
  // Elliptical halo just outside the shoreline; redrawn on repaint so
  // the stroke tracks the day/night palette gold.

  function redrawGlowRing(p: WorldPalette): void {
    glowRing.clear();
    glowRing.ellipse(layout.cx, layout.cy, layout.rx * 1.12, layout.ry * 1.12);
    glowRing.stroke({ color: p.gold, alpha: 1, width: 3 });
  }

  function setGlow(active: boolean): void {
    glowTarget = active ? 0.75 : 0;
  }

  // ── Animation tick ──────────────────────────────────────────────

  function tick(timeMs: number, _deltaMs: number, motionOn: boolean, night: number): void {
    // Highlight glow ring: ease toward target, pulse while active
    const glowBase = glowRing.alpha + (glowTarget - glowRing.alpha) * 0.12;
    glowRing.alpha =
      glowTarget > 0 && motionOn
        ? Math.min(1, Math.max(0, glowBase + Math.sin(timeMs / 400) * 0.15))
        : Math.min(1, Math.max(0, glowBase));

    // Tree sway
    for (const tree of trees) {
      if (motionOn) {
        tree.canopy.rotation = Math.sin(timeMs / 2800 + tree.phase) * 0.035;
        tree.canopy.y = tree.baseY + Math.sin(timeMs / 3400 + tree.phase * 1.3) * 1.2;
      } else {
        tree.canopy.rotation = 0;
        tree.canopy.y = tree.baseY;
      }
    }

    // Sprite vegetation/cliff animation
    for (const sa of spriteAnims) {
      if (!motionOn) {
        sa.sprite.rotation = 0;
        sa.sprite.y = sa.baseY;
        sa.sprite.scale.set(sa.baseScaleX, sa.baseScaleY);
        continue;
      }
      switch (sa.kind) {
        case 'tree':
          sa.sprite.rotation = Math.sin(timeMs / 2800 + sa.phase) * 0.035;
          sa.sprite.y = sa.baseY + Math.sin(timeMs / 3400 + sa.phase * 1.3) * 1.2;
          break;
        case 'bush': {
          const pulse = 1 + Math.sin(timeMs / 3200 + sa.phase) * 0.04;
          sa.sprite.scale.set(sa.baseScaleX * pulse, sa.baseScaleY * pulse);
          break;
        }
        case 'flower':
          sa.sprite.rotation = Math.sin(timeMs / 2200 + sa.phase) * 0.06;
          sa.sprite.y = sa.baseY + Math.sin(timeMs / 2800 + sa.phase * 1.4) * 0.8;
          break;
        case 'tuft':
          sa.sprite.rotation = Math.sin(timeMs / 1800 + sa.phase) * 0.08;
          break;
        case 'vine':
          sa.sprite.rotation = Math.sin(timeMs / 3000 + sa.phase) * 0.04;
          break;
      }
    }

    // Flag wave
    for (const flag of flags) {
      flag.g.clear();
      const wave = motionOn ? Math.sin(timeMs / 400 + flag.phase) : 0;
      // Pole
      flag.g.rect(-1, 0, 2, 14);
      flag.g.fill({ color: 0x5a4a3a, alpha: 0.9 });
      // Pennant
      flag.g.moveTo(1, 0);
      flag.g.quadraticCurveTo(8 + wave * 2, 2 + wave, 14 + wave * 3, 4);
      flag.g.lineTo(1, 8);
      flag.g.closePath();
      flag.g.fill({ color: flag.color, alpha: 0.9 });
    }

    // Boat bob
    if (boat) {
      if (motionOn) {
        boat.y = boatBaseY + Math.sin(timeMs / 2200) * 2.5;
        boat.rotation = Math.sin(timeMs / 2600 + 1) * 0.04;
      } else {
        boat.y = boatBaseY;
        boat.rotation = 0;
      }
    }

    // Window flicker at night
    for (const w of windows) {
      if (night > 0.25) {
        w.g.alpha = 0.8 + Math.sin(timeMs / 1600 + w.phase) * 0.15 + Math.sin(timeMs / 470 + w.phase * 3) * 0.05;
      } else {
        w.g.alpha = 1;
      }
    }

    // Lantern pulse
    for (const l of lanterns) {
      if (night > 0.25 && motionOn) {
        const pulse = 0.85 + Math.sin(timeMs / 1200 + l.phase) * 0.15;
        l.g.scale.set(pulse, pulse);
      } else {
        l.g.scale.set(1, 1);
      }
    }

    // Lifecycle status prop animations
    for (const la of lifecycleAnims) {
      if (!motionOn) {
        la.g.alpha = 1;
        la.g.rotation = 0;
        continue;
      }
      switch (la.kind) {
        case 'crane': {
          if (la.spriteMode) {
            // Gentle sway for the AI crane sprite
            la.g.rotation = Math.sin(timeMs / 4000) * 0.02;
          } else {
            // Slow jib swing + hook bob
            la.g.rotation = Math.sin(timeMs / 4000) * 0.06;
          }
          break;
        }
        case 'antenna': {
          if (la.spriteMode) {
            // Pulse the overlay ring alpha (sprite stays static)
            la.g.alpha = 0.25 + Math.abs(Math.sin(timeMs / 900)) * 0.25;
          } else {
            // Blinking beacon light
            const blink = Math.sin(timeMs / 500) > 0 ? 1 : 0.25;
            la.g.alpha = blink;
            // Rings pulse outward
            const ringPulse = 1 + Math.sin(timeMs / 900) * 0.08;
            la.g.scale.set(ringPulse, ringPulse);
          }
          break;
        }
        case 'hologram': {
          // Flickering holographic shimmer
          const flicker = 0.55 + Math.sin(timeMs / 300) * 0.12 + Math.sin(timeMs / 1700) * 0.18;
          la.g.alpha = Math.max(0.2, Math.min(0.85, flicker));
          la.g.scale.y = 1 + Math.sin(timeMs / 2200) * 0.04;
          break;
        }
        case 'beacon': {
          if (la.spriteMode) {
            // Rotate the sweep overlay around the dome
            la.g.rotation = (timeMs / 1400) % (Math.PI * 2);
          } else {
            // Rotating sweep glow
            const sweep = (timeMs / 1400) % (Math.PI * 2);
            la.g.rotation = Math.sin(sweep) * 0.15;
            la.g.alpha = 0.7 + Math.sin(timeMs / 350) * 0.3;
          }
          break;
        }
      }
    }
  }

  return {
    container,
    tick,
    repaint,
    setGlow,
    smokeSources,
    dispose: () => {
      spriteUnsub?.();
      terrainUnsub?.();
      lifecycleUnsub?.();
      removeLandmarkSprite();
      terrainLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
      terrainSprite = null;
    },
  };
}

function mixNum(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}
