/**
 * Animated water system: layered color bands, shoreline foam,
 * sparkles, fish shadows, and drifting ripples.
 */

import { Container, Graphics } from 'pixi.js';

import { ISLAND_LAYOUTS, WORLD_HEIGHT, WORLD_WIDTH } from '../islands.ts';
import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';
import { circle, ellipse } from '../shapes.ts';

export type WaterSystem = {
  readonly container: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean) => void;
  readonly repaint: (palette: WorldPalette, night?: number) => void;
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
  const shallows = new Graphics();
  const foamLayer = new Graphics();
  const foamDots = new Container();
  const animLayer = new Container();
  const moonGlade = new Graphics();
  container.addChild(base, bands, shallows, foamLayer, foamDots, animLayer, moonGlade);

  const random = createSeededRandom(999);

  // Sparkles
  const sparkles: Sparkle[] = [];
  for (let i = 0; i < 52; i++) {
    const g = new Graphics();
    const sparkle: Sparkle = {
      g,
      // Bias 60% near island edges
      baseX: i < 31
        ? ISLAND_LAYOUTS[i % ISLAND_LAYOUTS.length].cx + (random() - 0.5) * ISLAND_LAYOUTS[i % ISLAND_LAYOUTS.length].rx * 2.6
        : random() * WORLD_WIDTH,
      baseY: i < 31
        ? ISLAND_LAYOUTS[i % ISLAND_LAYOUTS.length].cy + (random() - 0.5) * ISLAND_LAYOUTS[i % ISLAND_LAYOUTS.length].ry * 2.6
        : random() * WORLD_HEIGHT,
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

  // Foam dots along shorelines
  type FoamDot = { readonly g: Graphics; readonly phase: number; readonly baseX: number; readonly baseY: number };
  const dots: FoamDot[] = [];
  const dotRand = createSeededRandom(808);

  // Wave arcs around islands
  type WaveArc = { readonly g: Graphics; readonly cx: number; readonly cy: number; readonly rx: number; readonly ry: number; readonly phase: number; readonly period: number };
  const waveArcs: WaveArc[] = [];
  const arcRand = createSeededRandom(707);
  for (const layout of ISLAND_LAYOUTS) {
    const offsets = [35, 50, 65];
    for (const off of offsets) {
      const g = new Graphics();
      waveArcs.push({
        g,
        cx: layout.cx,
        cy: layout.cy,
        rx: layout.rx + off,
        ry: layout.ry + off * 0.8,
        phase: arcRand() * Math.PI * 2,
        period: 4000 + arcRand() * 2000,
      });
      animLayer.addChild(g);
    }
  }

  for (const layout of ISLAND_LAYOUTS) {
    const spots = layout.companion
      ? [layout, { cx: layout.companion.cx, cy: layout.companion.cy, rx: layout.companion.rx, ry: layout.companion.ry }]
      : [layout];
    for (const s of spots) {
      for (let i = 0; i < 14; i++) {
        const angle = dotRand() * Math.PI * 2;
        const g = new Graphics();
        const dot: FoamDot = {
          g,
          phase: dotRand() * Math.PI * 2,
          baseX: s.cx + Math.cos(angle) * (s.rx + 18 + dotRand() * 16),
          baseY: s.cy + Math.sin(angle) * (s.ry + 14 + dotRand() * 12),
        };
        g.x = dot.baseX;
        g.y = dot.baseY;
        foamDots.addChild(g);
        dots.push(dot);
      }
    }
  }

  let currentPalette: WorldPalette | null = null;

  function repaint(palette: WorldPalette, night = 0): void {
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
      const amp = 4 + bandRandom() * 8;
      bands.moveTo(x, y);
      bands.quadraticCurveTo(x + w * 0.25, y - amp, x + w * 0.5, y);
      bands.quadraticCurveTo(x + w * 0.75, y + amp, x + w, y);
      bands.stroke({ color: palette.waterLight, alpha: 0.12 + bandRandom() * 0.1, width: 5 + bandRandom() * 5, cap: 'round' });
    }

    // Shallow water halos around islands
    shallows.clear();
    for (const layout of ISLAND_LAYOUTS) {
      ellipse(shallows, layout.cx, layout.cy + 6, layout.rx + 42, layout.ry + 34, palette.waterLight, 0.28);
      ellipse(shallows, layout.cx, layout.cy + 4, layout.rx + 22, layout.ry + 18, palette.foam, 0.1);
      if (layout.companion) {
        ellipse(shallows, layout.companion.cx, layout.companion.cy + 5, layout.companion.rx + 34, layout.companion.ry + 26, palette.waterLight, 0.28);
      }
    }

    // Foam ring hints near island positions
    foamLayer.clear();
    const foamSpots: { cx: number; cy: number; rx: number; ry: number }[] = [];
    for (const layout of ISLAND_LAYOUTS) {
      foamSpots.push({ cx: layout.cx, cy: layout.cy, rx: layout.rx + 30, ry: layout.ry + 25 });
      if (layout.companion) {
        foamSpots.push({
          cx: layout.companion.cx,
          cy: layout.companion.cy,
          rx: layout.companion.rx + 25,
          ry: layout.companion.ry + 20,
        });
      }
    }
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

    // Repaint foam dots
    for (const d of dots) {
      d.g.clear();
      circle(d.g, 0, 0, 2 + (d.phase % 2), palette.foam, 0.6);
    }

    // Repaint wave arcs
    for (const arc of waveArcs) {
      arc.g.clear();
      arc.g.ellipse(arc.cx, arc.cy, arc.rx, arc.ry);
      arc.g.stroke({ color: palette.foam, alpha: 0.3, width: 4 + (arc.phase % 4) });
    }

    // Moonlight glade on water (night)
    moonGlade.clear();
    moonGlade.visible = night > 0.3;
    if (night > 0.3) {
      const alpha = Math.min(1, (night - 0.3) / 0.4) * 0.5;
      const mx = 1350;
      for (let i = 0; i < 8; i++) {
        const gy = 380 + i * 55;
        const gw = 30 + i * 14;
        moonGlade.roundRect(mx - gw / 2, gy, gw, 8 + i * 2, 6);
        moonGlade.fill({ color: palette.moonlight, alpha: alpha * (1 - i * 0.08) });
      }
    }
  }

  function tick(timeMs: number, _deltaMs: number, motionOn: boolean): void {
    if (!motionOn) {
      animLayer.visible = true;
      for (const s of sparkles) s.g.alpha = 0.35;
      for (const f of fishes) f.g.alpha = 0.4;
      for (const r of ripples) r.g.alpha = 0.15;
      for (const d of dots) d.g.alpha = 0.35;
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
    // Foam dots drift and pulse
    for (const d of dots) {
      const wave = Math.sin(timeMs / 2400 + d.phase);
      // Radial drift toward/away from nearest island center
      const radial = Math.sin(timeMs / 3000 + d.phase) * 3;
      d.g.x = d.baseX + Math.sin(timeMs / 3800 + d.phase * 2) * 5 + radial;
      d.g.y = d.baseY + Math.cos(timeMs / 3200 + d.phase) * 3 + radial * 0.6;
      d.g.alpha = 0.25 + Math.max(0, wave) * 0.45;
    }
    // Wave arcs pulse
    for (const arc of waveArcs) {
      const cycle = Math.sin(timeMs / arc.period + arc.phase);
      arc.g.alpha = 0.1 + Math.max(0, cycle) * 0.4;
      const offset = cycle * 8;
      arc.g.scale.set(1 + offset / arc.rx, 1 + offset / arc.ry);
    }
    // Moon glade shimmer
    if (moonGlade.visible) {
      moonGlade.alpha = 0.85 + Math.sin(timeMs / 2600) * 0.15;
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
