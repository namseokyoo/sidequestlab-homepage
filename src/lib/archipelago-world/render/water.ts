/**
 * Animated water system: layered color bands, shoreline foam,
 * sparkles, fish shadows, and drifting ripples.
 */

import { Container, Graphics } from 'pixi.js';

import { WORLD_HEIGHT, WORLD_WIDTH } from '../islands.ts';
import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';
import { circle, ellipse } from '../shapes.ts';

export type WaterSystem = {
  readonly container: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean) => void;
  readonly repaint: (palette: WorldPalette) => void;
};

type Sparkle = {
  readonly g: Graphics;
  readonly baseX: number;
  readonly baseY: number;
  readonly phase: number;
  readonly period: number;
  readonly size: number;
};

type Fish = {
  readonly g: Graphics;
  readonly cx: number;
  readonly cy: number;
  readonly orbitRx: number;
  readonly orbitRy: number;
  readonly speed: number;
  readonly phase: number;
};

type Ripple = {
  readonly g: Graphics;
  readonly x: number;
  readonly y: number;
  readonly phase: number;
  readonly period: number;
};

export function createWaterSystem(): WaterSystem {
  const container = new Container();
  container.label = 'water';

  const base = new Graphics();
  const bands = new Graphics();
  const foamLayer = new Graphics();
  const animLayer = new Container();
  container.addChild(base, bands, foamLayer, animLayer);

  const random = createSeededRandom(999);

  // Sparkles
  const sparkles: Sparkle[] = [];
  for (let i = 0; i < 36; i++) {
    const g = new Graphics();
    const sparkle: Sparkle = {
      g,
      baseX: random() * WORLD_WIDTH,
      baseY: random() * WORLD_HEIGHT,
      phase: random() * Math.PI * 2,
      period: 2200 + random() * 2600,
      size: 1.5 + random() * 2.5,
    };
    g.x = sparkle.baseX;
    g.y = sparkle.baseY;
    animLayer.addChild(g);
    sparkles.push(sparkle);
  }

  // Fish shadows
  const fishes: Fish[] = [];
  const fishSpots = [
    { cx: 250, cy: 420 },
    { cx: 1050, cy: 480 },
    { cx: 650, cy: 880 },
    { cx: 1450, cy: 850 },
  ];
  for (const spot of fishSpots) {
    const g = new Graphics();
    const fish: Fish = {
      g,
      cx: spot.cx,
      cy: spot.cy,
      orbitRx: 40 + random() * 50,
      orbitRy: 18 + random() * 22,
      speed: 0.00025 + random() * 0.0002,
      phase: random() * Math.PI * 2,
    };
    animLayer.addChild(g);
    fishes.push(fish);
  }

  // Ripples
  const ripples: Ripple[] = [];
  for (let i = 0; i < 10; i++) {
    const g = new Graphics();
    const ripple: Ripple = {
      g,
      x: random() * WORLD_WIDTH,
      y: random() * WORLD_HEIGHT,
      phase: random() * Math.PI * 2,
      period: 3000 + random() * 3000,
    };
    g.x = ripple.x;
    g.y = ripple.y;
    animLayer.addChild(g);
    ripples.push(ripple);
  }

  let currentPalette: WorldPalette | null = null;

  function repaint(palette: WorldPalette): void {
    currentPalette = palette;

    // Base gradient bands (horizontal)
    base.clear();
    const bandCount = 8;
    const bandH = WORLD_HEIGHT / bandCount;
    for (let i = 0; i < bandCount; i++) {
      const t = i / (bandCount - 1);
      const color =
        t < 0.5
          ? mixNum(palette.waterLight, palette.waterMid, t * 2)
          : mixNum(palette.waterMid, palette.waterDeep, (t - 0.5) * 2);
      base.rect(0, i * bandH, WORLD_WIDTH, bandH + 1);
      base.fill({ color, alpha: 1 });
    }

    // Decorative curved bands
    bands.clear();
    const bandRandom = createSeededRandom(555);
    for (let i = 0; i < 14; i++) {
      const y = bandRandom() * WORLD_HEIGHT;
      const x = bandRandom() * WORLD_WIDTH * 0.7;
      const w = 120 + bandRandom() * 280;
      bands.roundRect(x, y, w, 6 + bandRandom() * 8, 6);
      bands.fill({ color: palette.waterLight, alpha: 0.12 + bandRandom() * 0.1 });
    }

    // Foam ring hints near island positions
    foamLayer.clear();
    const foamSpots = [
      { cx: 800, cy: 300, rx: 340, ry: 200 },
      { cx: 400, cy: 660, rx: 290, ry: 190 },
      { cx: 1190, cy: 680, rx: 260, ry: 175 },
      { cx: 1420, cy: 620, rx: 135, ry: 100 },
    ];
    for (const spot of foamSpots) {
      foamLayer.ellipse(spot.cx, spot.cy, spot.rx, spot.ry);
      foamLayer.stroke({ color: palette.foam, alpha: 0.35, width: 10 });
      foamLayer.ellipse(spot.cx, spot.cy, spot.rx + 14, spot.ry + 10);
      foamLayer.stroke({ color: palette.foam, alpha: 0.15, width: 6 });
    }

    // Repaint sparkles
    for (const s of sparkles) {
      s.g.clear();
      circle(s.g, 0, 0, s.size, palette.foam, 0.7);
    }

    // Repaint fish
    for (const f of fishes) {
      f.g.clear();
      ellipse(f.g, 0, 0, 16, 7, palette.waterDeep, 0.5);
      // tail
      f.g.moveTo(-16, 0);
      f.g.lineTo(-26, -7);
      f.g.lineTo(-26, 7);
      f.g.closePath();
      f.g.fill({ color: palette.waterDeep, alpha: 0.45 });
    }

    // Repaint ripples
    for (const r of ripples) {
      r.g.clear();
      r.g.ellipse(0, 0, 22, 8);
      r.g.stroke({ color: palette.foam, alpha: 0.25, width: 2 });
    }
  }

  function tick(timeMs: number, _deltaMs: number, motionOn: boolean): void {
    if (!motionOn) {
      animLayer.visible = true;
      for (const s of sparkles) s.g.alpha = 0.35;
      for (const f of fishes) f.g.alpha = 0.4;
      for (const r of ripples) r.g.alpha = 0.15;
      return;
    }
    for (const s of sparkles) {
      const wave = Math.sin((timeMs / s.period) * Math.PI * 2 + s.phase);
      s.g.alpha = Math.max(0, wave) * 0.65;
      s.g.x = s.baseX + Math.sin(timeMs / 4000 + s.phase) * 6;
      s.g.y = s.baseY + Math.cos(timeMs / 5200 + s.phase) * 4;
    }
    for (const f of fishes) {
      const angle = timeMs * f.speed + f.phase;
      f.g.x = f.cx + Math.cos(angle) * f.orbitRx;
      f.g.y = f.cy + Math.sin(angle) * f.orbitRy;
      f.g.rotation = angle + Math.PI / 2;
      f.g.alpha = 0.3 + Math.sin(angle * 2) * 0.15;
    }
    for (const r of ripples) {
      const cycle = ((timeMs / r.period + r.phase / (Math.PI * 2)) % 1 + 1) % 1;
      const scale = 0.4 + cycle * 1.2;
      r.g.scale.set(scale, scale);
      r.g.alpha = (1 - cycle) * 0.3;
    }
    // Gentle foam breathing
    if (currentPalette) {
      foamLayer.alpha = 0.8 + Math.sin(timeMs / 3000) * 0.2;
    }
  }

  return { container, tick, repaint };
}

function mixNum(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}
