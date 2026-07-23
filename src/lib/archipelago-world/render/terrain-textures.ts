/**
 * Procedural terrain textures for the Living Archipelago world engine.
 *
 * Soft plaster / paper-clay material is rendered once into small tileable
 * RenderTextures, then used as fills for island terrain blobs. This gives
 * large soft color areas with subtle tonal variation — the hand-painted
 * miniature feel of the visual target — instead of flat single-color fills.
 *
 * Textures are rebuilt only when the palette changes (day/night bucket),
 * so the per-frame cost is zero.
 */

import { Graphics, RenderTexture, Texture, TextureSource, type Renderer } from 'pixi.js';

import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';

const TILE = 128;

export type TerrainTextures = {
  readonly grass: Texture;
  readonly sand: Texture;
  readonly cliff: Texture;
  readonly destroy: () => void;
};

function makeTile(renderer: Renderer, draw: (g: Graphics) => void): Texture {
  const source = new TextureSource({ width: TILE, height: TILE, wrapMode: 'repeat' });
  const rt = new RenderTexture({ source });
  const g = new Graphics();
  draw(g);
  renderer.render({ container: g, target: rt });
  g.destroy();
  return rt;
}

function drawGrass(g: Graphics, p: WorldPalette): void {
  g.rect(0, 0, TILE, TILE);
  g.fill({ color: p.grass });
  const rand = createSeededRandom(101);
  // Large soft light patches (sun from upper-left)
  for (let i = 0; i < 5; i++) {
    g.circle(rand() * TILE, rand() * TILE, 20 + rand() * 30);
    g.fill({ color: mixNum(p.grass, 0xffffff, 0.12), alpha: 0.5 });
  }
  // Soft shadow patches
  for (let i = 0; i < 4; i++) {
    g.circle(rand() * TILE, rand() * TILE, 15 + rand() * 25);
    g.fill({ color: p.grassShadow, alpha: 0.35 });
  }
  // Fine grain
  for (let i = 0; i < 120; i++) {
    g.circle(rand() * TILE, rand() * TILE, 0.8 + rand() * 1.2);
    g.fill({
      color: rand() > 0.5 ? mixNum(p.grass, 0xffffff, 0.2) : p.grassShadow,
      alpha: 0.25,
    });
  }
}

function drawSand(g: Graphics, p: WorldPalette): void {
  g.rect(0, 0, TILE, TILE);
  g.fill({ color: p.sand });
  const rand = createSeededRandom(303);
  for (let i = 0; i < 4; i++) {
    g.circle(rand() * TILE, rand() * TILE, 18 + rand() * 26);
    g.fill({ color: mixNum(p.sand, 0xffffff, 0.1), alpha: 0.4 });
  }
  for (let i = 0; i < 140; i++) {
    g.circle(rand() * TILE, rand() * TILE, 0.6 + rand());
    g.fill({
      color: rand() > 0.5 ? mixNum(p.sand, 0xffffff, 0.18) : mixNum(p.sand, p.wood, 0.3),
      alpha: 0.3,
    });
  }
}

function drawCliff(g: Graphics, p: WorldPalette): void {
  const base = mixNum(p.sand, p.forest, 0.45);
  const dark = mixNum(base, p.ink, 0.25);
  // Vertical gradient: lighter top, darker base
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    g.rect(0, (i * TILE) / steps, TILE, TILE / steps + 1);
    g.fill({ color: mixNum(base, dark, t * 0.6) });
  }
  // Horizontal strata lines
  const rand = createSeededRandom(202);
  for (let i = 0; i < 5; i++) {
    g.rect(0, 10 + rand() * (TILE - 20), TILE, 1.5);
    g.fill({ color: dark, alpha: 0.3 });
  }
  // Speckles
  for (let i = 0; i < 60; i++) {
    g.circle(rand() * TILE, rand() * TILE, 0.6 + rand());
    g.fill({ color: rand() > 0.5 ? mixNum(base, 0xffffff, 0.15) : dark, alpha: 0.2 });
  }
}

/** Build the terrain texture set for the current palette. */
export function createTerrainTextures(
  renderer: Renderer,
  palette: WorldPalette,
): TerrainTextures {
  const grass = makeTile(renderer, (g) => drawGrass(g, palette));
  const sand = makeTile(renderer, (g) => drawSand(g, palette));
  const cliff = makeTile(renderer, (g) => drawCliff(g, palette));
  return {
    grass,
    sand,
    cliff,
    destroy(): void {
      grass.destroy(true);
      sand.destroy(true);
      cliff.destroy(true);
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
