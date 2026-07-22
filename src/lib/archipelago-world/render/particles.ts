/**
 * Lightweight particle systems: chimney smoke, fireflies (night),
 * butterflies (day), and release sparkles.
 */

import { Container, Graphics } from 'pixi.js';

import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';
import { circle } from '../shapes.ts';

export type ParticleSystem = {
  readonly container: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean, night: number) => void;
  readonly repaint: (palette: WorldPalette) => void;
  readonly addSmokeSource: (x: number, y: number) => void;
  readonly burstSparkles: (x: number, y: number, count: number) => void;
};

type SmokePuff = {
  readonly g: Graphics;
  readonly sourceX: number;
  readonly sourceY: number;
  readonly phase: number;
  readonly drift: number;
  readonly period: number;
};

type Firefly = {
  readonly g: Graphics;
  readonly baseX: number;
  readonly baseY: number;
  readonly phase: number;
  readonly wanderRadius: number;
  readonly blinkPeriod: number;
};

type Butterfly = {
  readonly g: Graphics;
  readonly wingL: Graphics;
  readonly wingR: Graphics;
  readonly baseX: number;
  readonly baseY: number;
  readonly phase: number;
  readonly wanderRadius: number;
  readonly color: number;
};

type Sparkle = {
  readonly g: Graphics;
  vx: number;
  vy: number;
  life: number;
  readonly maxLife: number;
};

export function createParticleSystem(): ParticleSystem {
  const container = new Container();
  container.label = 'particles';

  const smokeLayer = new Container();
  const fireflyLayer = new Container();
  const butterflyLayer = new Container();
  const sparkleLayer = new Container();
  container.addChild(smokeLayer, fireflyLayer, butterflyLayer, sparkleLayer);

  const random = createSeededRandom(2026);
  const smokePuffs: SmokePuff[] = [];
  const fireflies: Firefly[] = [];
  const butterflies: Butterfly[] = [];
  const sparkles: Sparkle[] = [];
  let palette: WorldPalette | null = null;

  // Pre-create fireflies
  const fireflySpots = [
    { x: 500, y: 600 }, { x: 700, y: 350 }, { x: 1100, y: 620 },
    { x: 350, y: 700 }, { x: 1300, y: 700 }, { x: 900, y: 250 },
    { x: 600, y: 750 }, { x: 1000, y: 400 }, { x: 450, y: 500 },
    { x: 1250, y: 550 }, { x: 800, y: 700 }, { x: 550, y: 300 },
  ];
  for (const spot of fireflySpots) {
    const g = new Graphics();
    fireflies.push({
      g,
      baseX: spot.x + (random() - 0.5) * 80,
      baseY: spot.y + (random() - 0.5) * 60,
      phase: random() * Math.PI * 2,
      wanderRadius: 20 + random() * 40,
      blinkPeriod: 1400 + random() * 2000,
    });
    fireflyLayer.addChild(g);
  }

  // Pre-create butterflies
  const butterflyColors = [0xee7459, 0xe5aa45, 0xf7fff8, 0x69cdc4];
  const butterflySpots = [
    { x: 480, y: 620 }, { x: 850, y: 280 }, { x: 1150, y: 650 },
    { x: 380, y: 680 }, { x: 1350, y: 600 }, { x: 750, y: 350 },
  ];
  for (let i = 0; i < butterflySpots.length; i++) {
    const spot = butterflySpots[i];
    const g = new Container() as unknown as Graphics;
    const wingL = new Graphics();
    const wingR = new Graphics();
    const body = new Graphics();
    (g as unknown as Container).addChild(wingL, wingR, body);
    butterflies.push({
      g,
      wingL,
      wingR,
      baseX: spot.x,
      baseY: spot.y,
      phase: random() * Math.PI * 2,
      wanderRadius: 30 + random() * 50,
      color: butterflyColors[i % butterflyColors.length],
    });
    butterflyLayer.addChild(g as unknown as Container);
  }

  function addSmokeSource(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const g = new Graphics();
      smokePuffs.push({
        g,
        sourceX: x,
        sourceY: y,
        phase: i / 5,
        drift: (random() - 0.5) * 24,
        period: 3200 + random() * 1200,
      });
      smokeLayer.addChild(g);
    }
  }

  function burstSparkles(x: number, y: number, count: number): void {
    if (!palette) return;
    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      circle(g, 0, 0, 2 + random() * 3, random() > 0.5 ? palette.gold : palette.foam, 1);
      g.x = x;
      g.y = y;
      const angle = random() * Math.PI * 2;
      const speed = 0.02 + random() * 0.06;
      sparkles.push({
        g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.04,
        life: 0,
        maxLife: 900 + random() * 600,
      });
      sparkleLayer.addChild(g);
    }
  }

  function repaint(p: WorldPalette): void {
    palette = p;
    for (const puff of smokePuffs) {
      puff.g.clear();
      circle(puff.g, 0, 0, 5, p.foam, 0.5);
    }
    for (const f of fireflies) {
      f.g.clear();
      circle(f.g, 0, 0, 2.5, p.lanternGlow, 0.9);
      circle(f.g, 0, 0, 5, p.lanternGlow, 0.25);
    }
    for (const b of butterflies) {
      b.wingL.clear();
      b.wingR.clear();
      b.wingL.ellipse(-3, 0, 4, 3);
      b.wingL.fill({ color: b.color, alpha: 0.85 });
      b.wingR.ellipse(3, 0, 4, 3);
      b.wingR.fill({ color: b.color, alpha: 0.85 });
      const bodyG = (b.g as unknown as Container).children[2] as Graphics;
      bodyG.clear();
      bodyG.roundRect(-1, -3, 2, 6, 1);
      bodyG.fill({ color: 0x444444, alpha: 0.8 });
    }
  }

  function tick(timeMs: number, deltaMs: number, motionOn: boolean, night: number): void {
    // Smoke
    for (const puff of smokePuffs) {
      const cycle = motionOn
        ? ((timeMs / puff.period + puff.phase) % 1 + 1) % 1
        : 0.3;
      puff.g.x = puff.sourceX + puff.drift * cycle + (motionOn ? Math.sin(timeMs / 1800 + puff.phase * 10) * 4 : 0);
      puff.g.y = puff.sourceY - cycle * 46;
      puff.g.alpha = (1 - cycle) * 0.45;
      const s = 0.5 + cycle * 1.4;
      puff.g.scale.set(s, s);
    }

    // Fireflies — visible at night
    fireflyLayer.visible = night > 0.35;
    fireflyLayer.alpha = Math.min(1, (night - 0.35) / 0.3);
    if (fireflyLayer.visible) {
      for (const f of fireflies) {
        if (motionOn) {
          f.g.x = f.baseX + Math.sin(timeMs / 3000 + f.phase) * f.wanderRadius;
          f.g.y = f.baseY + Math.cos(timeMs / 4200 + f.phase * 1.7) * f.wanderRadius * 0.6;
        } else {
          f.g.x = f.baseX;
          f.g.y = f.baseY;
        }
        const blink = Math.sin((timeMs / f.blinkPeriod) * Math.PI * 2 + f.phase);
        f.g.alpha = Math.max(0.05, blink) * 0.9;
      }
    }

    // Butterflies — visible during day
    butterflyLayer.visible = night < 0.55;
    butterflyLayer.alpha = 1 - night;
    if (butterflyLayer.visible) {
      for (const b of butterflies) {
        if (motionOn) {
          b.g.x = b.baseX + Math.sin(timeMs / 2600 + b.phase) * b.wanderRadius;
          b.g.y = b.baseY + Math.cos(timeMs / 3400 + b.phase * 2.1) * b.wanderRadius * 0.5
            + Math.sin(timeMs / 700 + b.phase) * 4;
        } else {
          b.g.x = b.baseX;
          b.g.y = b.baseY;
        }
        const flap = motionOn ? Math.sin(timeMs / 90 + b.phase * 20) : 0.4;
        b.wingL.scale.x = 0.3 + Math.abs(flap) * 0.7;
        b.wingR.scale.x = 0.3 + Math.abs(flap) * 0.7;
      }
    }

    // Burst sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life += deltaMs;
      if (s.life >= s.maxLife) {
        sparkleLayer.removeChild(s.g);
        s.g.destroy();
        sparkles.splice(i, 1);
        continue;
      }
      s.g.x += s.vx * deltaMs;
      s.g.y += s.vy * deltaMs;
      s.vy += 0.00004 * deltaMs;
      s.g.alpha = 1 - s.life / s.maxLife;
    }
  }

  return { container, tick, repaint, addSmokeSource, burstSparkles };
}
