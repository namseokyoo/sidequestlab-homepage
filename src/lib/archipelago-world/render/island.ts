/**
 * Procedural island renderer: layered terrain, project-specific
 * landmarks, vegetation, piers, boats, and night lighting.
 *
 * Each island is drawn from its IslandLayout + WorldPalette so the
 * entire scene can repaint during day/night transitions.
 */

import { Container, Graphics } from 'pixi.js';

import { generateBlob, scatterOnIsland, type IslandLayout } from '../islands.ts';
import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';
import { circle, drawBlob, ellipse, roundedBox, triangle } from '../shapes.ts';

export type IslandSystem = {
  readonly container: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean, night: number) => void;
  readonly repaint: (palette: WorldPalette, night: number) => void;
  /** Smoke source positions registered with the particle system. */
  readonly smokeSources: readonly { readonly x: number; readonly y: number }[];
};

type TreeAnim = {
  readonly canopy: Graphics;
  readonly phase: number;
  readonly baseY: number;
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

export function createIslandSystem(layout: IslandLayout): IslandSystem {
  const container = new Container();
  container.label = `island-${layout.id}`;

  const staticLayer = new Graphics();
  const animLayer = new Container();
  container.addChild(staticLayer, animLayer);

  const trees: TreeAnim[] = [];
  const flags: FlagAnim[] = [];
  const windows: WindowGlow[] = [];
  const lanterns: LanternGlow[] = [];
  let boat: Graphics | null = null;
  let boatBaseY = 0;
  const smokeSources: { x: number; y: number }[] = [];

  function repaint(p: WorldPalette, night: number): void {
    staticLayer.clear();
    animLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    trees.length = 0;
    flags.length = 0;
    windows.length = 0;
    lanterns.length = 0;
    boat = null;
    smokeSources.length = 0;

    const random = createSeededRandom(layout.seed);
    const { cx, cy, rx, ry } = layout;

    // ── Terrain layers ──────────────────────────────────────────────
    // Water shadow beneath island
    ellipse(staticLayer, cx + 8, cy + 14, rx * 1.08, ry * 1.08, p.waterDeep, 0.45);

    // Wet sand ring
    const sandBlob = generateBlob(cx, cy + 4, rx * 1.02, ry * 1.02, layout.seed + 1, { noise: 0.12 });
    drawBlob(staticLayer, sandBlob);
    staticLayer.fill({ color: mixNum(p.sand, p.waterLight, 0.3), alpha: 1 });

    // Sand beach
    const beachBlob = generateBlob(cx, cy, rx, ry, layout.seed + 2, { noise: 0.13 });
    drawBlob(staticLayer, beachBlob);
    staticLayer.fill({ color: p.sand, alpha: 1 });

    // Cliff edge (darker band between sand and grass)
    const cliffBlob = generateBlob(cx, cy - 4, rx * 0.88, ry * 0.88, layout.seed + 3, { noise: 0.12 });
    drawBlob(staticLayer, cliffBlob);
    staticLayer.fill({ color: mixNum(p.sand, p.forest, 0.35), alpha: 1 });

    // Grass plateau
    const grassBlob = generateBlob(cx, cy - 8, rx * 0.8, ry * 0.8, layout.seed + 4, { noise: 0.15 });
    drawBlob(staticLayer, grassBlob);
    staticLayer.fill({ color: p.grass, alpha: 1 });

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
    else drawNbbang(staticLayer, animLayer, layout, p, night, random);

    // ── Vegetation ──────────────────────────────────────────────────
    const treeSpots = scatterOnIsland(layout, layout.seed + 10, 7, { innerScale: 0.75, avoidCenter: 0.25 });
    for (const spot of treeSpots) {
      drawTree(staticLayer, animLayer, spot.x, spot.y, p, random, trees);
    }

    // Bushes
    const bushSpots = scatterOnIsland(layout, layout.seed + 11, 8, { innerScale: 0.78, avoidCenter: 0.2 });
    for (const spot of bushSpots) {
      const size = 8 + random() * 10;
      circle(staticLayer, spot.x, spot.y, size, mixNum(p.grass, p.forest, 0.4), 1);
      circle(staticLayer, spot.x - size * 0.4, spot.y - size * 0.3, size * 0.6, mixNum(p.grass, p.forest, 0.25), 1);
    }

    // Flowers
    const flowerSpots = scatterOnIsland(layout, layout.seed + 12, 12, { innerScale: 0.7, avoidCenter: 0.15 });
    const flowerColors = [p.coral, p.gold, p.foam, 0xd98bb6];
    for (let i = 0; i < flowerSpots.length; i++) {
      const spot = flowerSpots[i];
      circle(staticLayer, spot.x, spot.y, 3, flowerColors[i % flowerColors.length], 0.9);
      circle(staticLayer, spot.x, spot.y, 1.2, p.gold, 0.9);
    }

    // Rocks
    const rockSpots = scatterOnIsland(layout, layout.seed + 13, 4, { innerScale: 0.8, avoidCenter: 0.3 });
    for (const spot of rockSpots) {
      ellipse(staticLayer, spot.x, spot.y, 7 + random() * 6, 5 + random() * 4, p.stone, 0.9);
      ellipse(staticLayer, spot.x - 2, spot.y - 2, 4, 3, mixNum(p.stone, 0xffffff, 0.3), 0.7);
    }

    // ── Companion island (N-Bang) + bridge ──────────────────────────
    if (layout.companion) {
      const c = layout.companion;
      ellipse(staticLayer, c.cx + 6, c.cy + 10, c.rx * 1.06, c.ry * 1.06, p.waterDeep, 0.4);
      const cSand = generateBlob(c.cx, c.cy + 3, c.rx * 1.01, c.ry * 1.01, c.seed + 1, { noise: 0.12 });
      drawBlob(staticLayer, cSand);
      staticLayer.fill({ color: p.sand, alpha: 1 });
      const cGrass = generateBlob(c.cx, c.cy - 4, c.rx * 0.82, c.ry * 0.82, c.seed + 2, { noise: 0.14 });
      drawBlob(staticLayer, cGrass);
      staticLayer.fill({ color: p.grass, alpha: 1 });

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
    if (night > 0.01) {
      const overlay = generateBlob(cx, cy, rx * 1.05, ry * 1.05, layout.seed + 20, { noise: 0.1 });
      drawBlob(staticLayer, overlay);
      staticLayer.fill({ color: 0x0e2a33, alpha: p.nightOverlayAlpha * 0.5 });
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

    // Prism lighthouse (signature landmark)
    const lx = cx + rx * 0.35;
    const ly = cy - ry * 0.35;
    // Tower body — tapered
    g.moveTo(lx - 14, ly + 10);
    g.lineTo(lx - 9, ly - 52);
    g.lineTo(lx + 9, ly - 52);
    g.lineTo(lx + 14, ly + 10);
    g.closePath();
    g.fill({ color: p.stone, alpha: 1 });
    // Stripes
    for (let i = 0; i < 3; i++) {
      const sy = ly - 40 + i * 18;
      g.rect(lx - 12 + i * 1.2, sy, 24 - i * 2.4, 7);
      g.fill({ color: p.coral, alpha: 0.85 });
    }
    // Prism top — triangle with rainbow refraction
    triangle(g, lx, ly - 78, lx - 13, ly - 52, lx + 13, ly - 52, mixNum(p.stone, 0xffffff, 0.5), 1);
    // Rainbow refraction beams
    const beamColors = [0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x4dabf7, 0x9775fa];
    for (let i = 0; i < beamColors.length; i++) {
      const angle = -0.5 + (i / (beamColors.length - 1)) * 1.0;
      g.moveTo(lx, ly - 62);
      g.lineTo(lx + Math.cos(angle + 0.8) * 70, ly - 62 + Math.sin(angle + 0.8) * 46);
      g.stroke({ color: beamColors[i], alpha: night > 0.4 ? 0.5 : 0.3, width: 3, cap: 'round' });
    }
    // Beacon glow at night
    if (night > 0.3) {
      const glow = new Graphics();
      circle(glow, lx, ly - 62, 10, p.windowGlow, 0.7);
      circle(glow, lx, ly - 62, 20, p.windowGlow, 0.2);
      anim.addChild(glow);
      windows.push({ g: glow, phase: rand() * Math.PI * 2 });
    }

    // Presentation pavilion — open structure with projection sail
    const px = cx - rx * 0.25;
    const py = cy - ry * 0.15;
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

    // Reading house — two-story signature building
    const hx = cx - rx * 0.05;
    const hy = cy - ry * 0.2;
    drawHouse(g, hx, hy, 64, 48, p, night, windows, rand, 0, true);
    smokeSources.push({ x: hx + 22, y: hy - 44 });

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
    // Tower
    g.moveTo(lx - 10, ly + 8);
    g.lineTo(lx - 7, ly - 40);
    g.lineTo(lx + 7, ly - 40);
    g.lineTo(lx + 10, ly + 8);
    g.closePath();
    g.fill({ color: p.stone, alpha: 1 });
    g.rect(lx - 8, ly - 24, 16, 6);
    g.fill({ color: p.coral, alpha: 0.8 });
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

  // ── Shared painters ─────────────────────────────────────────────

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
    const roofH = h * 0.55;
    const bodyH = twoStory ? h : h * 0.7;
    const roofColor = variant % 2 === 0 ? p.roofCoral : p.roofTeal;

    // Body
    roundedBox(g, x - w / 2, y - bodyH, w, bodyH, 3, mixNum(p.paper, p.wood, 0.25), 1);
    // Wood trim
    g.rect(x - w / 2, y - 4, w, 4);
    g.fill({ color: p.woodDark, alpha: 0.7 });

    if (twoStory) {
      // Second floor line
      g.rect(x - w / 2 + 3, y - bodyH * 0.55, w - 6, 2.5);
      g.fill({ color: p.woodDark, alpha: 0.5 });
    }

    // Roof — overhanging
    triangle(g, x, y - bodyH - roofH, x - w / 2 - 8, y - bodyH + 2, x + w / 2 + 8, y - bodyH + 2, roofColor, 1);
    // Roof ridge highlight
    g.moveTo(x, y - bodyH - roofH);
    g.lineTo(x + w / 2 + 8, y - bodyH + 2);
    g.stroke({ color: mixNum(roofColor, 0xffffff, 0.3), alpha: 0.5, width: 2 });

    // Door
    roundedBox(g, x - 5, y - 16, 10, 16, 3, p.woodDark, 1);
    circle(g, x + 2.5, y - 8, 1.2, p.gold, 0.9);

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
      g.rect(wp.wx, wp.wy, 9, 9);
      g.fill({ color: p.woodDark, alpha: 1 });
      const glow = new Graphics();
      roundedBox(glow, wp.wx + 1.5, wp.wy + 1.5, 6, 6, 1, p.windowGlow, night > 0.25 ? 0.95 : 0.35);
      if (night > 0.25) {
        circle(glow, wp.wx + 4.5, wp.wy + 4.5, 10, p.windowGlow, 0.12);
      }
      animLayer.addChild(glow);
      windowList.push({ g: glow, phase: rand() * Math.PI * 2 });
    }

    // Chimney
    g.rect(x + w / 4, y - bodyH - roofH * 0.55, 7, roofH * 0.5);
    g.fill({ color: mixNum(p.stone, p.woodDark, 0.3), alpha: 1 });
  }

  function drawTree(
    g: Graphics,
    anim: Container,
    x: number,
    y: number,
    p: WorldPalette,
    rand: () => number,
    treeList: TreeAnim[],
  ): void {
    const trunkH = 12 + rand() * 10;
    const canopyR = 10 + rand() * 10;
    // Contact shadow
    ellipse(g, x + 4, y + 3, canopyR * 0.9, canopyR * 0.35, p.grassShadow, 0.4);
    // Trunk
    g.rect(x - 2.5, y - trunkH, 5, trunkH);
    g.fill({ color: p.woodDark, alpha: 1 });
    // Canopy — animated cluster
    const canopy = new Graphics();
    circle(canopy, 0, -trunkH - canopyR * 0.5, canopyR, mixNum(p.grass, p.forest, 0.35), 1);
    circle(canopy, -canopyR * 0.55, -trunkH - canopyR * 0.2, canopyR * 0.7, mixNum(p.grass, p.forest, 0.2), 1);
    circle(canopy, canopyR * 0.5, -trunkH - canopyR * 0.3, canopyR * 0.65, p.grass, 1);
    // Highlight
    circle(canopy, -canopyR * 0.2, -trunkH - canopyR * 0.7, canopyR * 0.35, mixNum(p.grass, 0xffffff, 0.25), 0.6);
    canopy.x = x;
    canopy.y = y;
    anim.addChild(canopy);
    treeList.push({ canopy, phase: rand() * Math.PI * 2, baseY: y });
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
    // Hull
    g.moveTo(x - 18, y - 4);
    g.quadraticCurveTo(x - 20, y + 6, x - 10, y + 7);
    g.lineTo(x + 10, y + 7);
    g.quadraticCurveTo(x + 20, y + 6, x + 18, y - 4);
    g.closePath();
    g.fill({ color: p.wood, alpha: 1 });
    // Inner
    g.moveTo(x - 13, y - 2);
    g.quadraticCurveTo(x - 14, y + 4, x - 7, y + 4.5);
    g.lineTo(x + 7, y + 4.5);
    g.quadraticCurveTo(x + 14, y + 4, x + 13, y - 2);
    g.closePath();
    g.fill({ color: p.woodDark, alpha: 0.8 });
    // Seat
    g.rect(x - 6, y - 1, 12, 3);
    g.fill({ color: mixNum(p.wood, 0xffffff, 0.2), alpha: 0.9 });
  }

  // ── Animation tick ──────────────────────────────────────────────

  function tick(timeMs: number, _deltaMs: number, motionOn: boolean, night: number): void {
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
  }

  return { container, tick, repaint, smokeSources };
}

function mixNum(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}
