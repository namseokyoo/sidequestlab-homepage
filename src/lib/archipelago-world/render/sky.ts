/**
 * Sky system: gradient backdrop, drifting clouds with shadows,
 * sun (day) and moon + stars (night), seagulls.
 */

import { Container, Graphics } from 'pixi.js';

import { WORLD_HEIGHT, WORLD_WIDTH } from '../islands.ts';
import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';
import { circle, ellipse } from '../shapes.ts';

export type SkySystem = {
  readonly container: Container;
  /** Cloud shadow layer rendered between water and islands. */
  readonly shadowLayer: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean) => void;
  readonly repaint: (palette: WorldPalette, night: number) => void;
};

type Cloud = {
  readonly g: Graphics;
  readonly shadow: Graphics;
  readonly baseY: number;
  readonly speed: number;
  readonly scale: number;
  readonly phase: number;
};

type Seagull = {
  readonly g: Graphics;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly speed: number;
  readonly phase: number;
};

export function createSkySystem(): SkySystem {
  const container = new Container();
  container.label = 'sky';
  const shadowLayer = new Container();
  shadowLayer.label = 'cloud-shadows';

  const backdrop = new Graphics();
  const celestial = new Container();
  const sunG = new Graphics();
  const moonG = new Graphics();
  const starsG = new Graphics();
  celestial.addChild(starsG, sunG, moonG);
  const cloudLayer = new Container();
  const gullLayer = new Container();
  container.addChild(backdrop, celestial, cloudLayer, gullLayer);

  const random = createSeededRandom(314);

  const clouds: Cloud[] = [];
  for (let i = 0; i < 5; i++) {
    const g = new Graphics();
    const shadow = new Graphics();
    const cloud: Cloud = {
      g,
      shadow,
      baseY: 60 + random() * 300,
      speed: 6 + random() * 10,
      scale: 0.7 + random() * 0.8,
      phase: random() * WORLD_WIDTH * 1.5,
    };
    cloudLayer.addChild(g);
    shadowLayer.addChild(shadow);
    clouds.push(cloud);
  }

  const seagulls: Seagull[] = [];
  for (let i = 0; i < 7; i++) {
    const g = new Graphics();
    seagulls.push({
      g,
      cx: 300 + random() * 1000,
      cy: 120 + random() * 250,
      radius: 60 + random() * 120,
      speed: 0.0003 + random() * 0.0003,
      phase: random() * Math.PI * 2,
    });
    gullLayer.addChild(g);
  }

  function repaint(palette: WorldPalette, night: number): void {
    // Sky gradient
    backdrop.clear();
    const steps = 6;
    const h = WORLD_HEIGHT * 0.55;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const color = mixNum(palette.skyTop, palette.skyBottom, t);
      backdrop.rect(-200, -200 + (i * (h + 200)) / steps, WORLD_WIDTH + 400, (h + 200) / steps + 1);
      backdrop.fill({ color, alpha: 1 });
    }

    // Sun
    sunG.clear();
    sunG.visible = night < 0.6;
    sunG.alpha = 1 - night;
    circle(sunG, 180, 120, 52, 0xfff4d6, 0.9);
    circle(sunG, 180, 120, 40, 0xffe9a8, 1);
    // Sun rays
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      sunG.moveTo(180 + Math.cos(angle) * 60, 120 + Math.sin(angle) * 60);
      sunG.lineTo(180 + Math.cos(angle) * 74, 120 + Math.sin(angle) * 74);
      sunG.stroke({ color: 0xffe9a8, alpha: 0.5, width: 4, cap: 'round' });
    }

    // Moon + stars
    moonG.clear();
    moonG.visible = night > 0.3;
    moonG.alpha = Math.min(1, (night - 0.3) / 0.4);
    circle(moonG, 1350, 110, 36, palette.moonlight, 0.95);
    circle(moonG, 1364, 100, 30, palette.skyTop, 1); // crescent cut

    starsG.clear();
    starsG.visible = night > 0.3;
    starsG.alpha = Math.min(1, (night - 0.3) / 0.4);
    const starRandom = createSeededRandom(777);
    for (let i = 0; i < 40; i++) {
      const sx = starRandom() * WORLD_WIDTH;
      const sy = starRandom() * 380;
      const sr = 1 + starRandom() * 2;
      circle(starsG, sx, sy, sr, palette.moonlight, 0.4 + starRandom() * 0.5);
    }

    // Clouds
    for (const c of clouds) {
      c.g.clear();
      const cw = 120 * c.scale;
      ellipse(c.g, 0, 0, cw * 0.5, 22 * c.scale, palette.foam, 0.85);
      ellipse(c.g, -cw * 0.25, -10 * c.scale, cw * 0.3, 18 * c.scale, palette.foam, 0.9);
      ellipse(c.g, cw * 0.22, -6 * c.scale, cw * 0.28, 16 * c.scale, palette.foam, 0.8);
      c.g.alpha = 1 - night * 0.5;

      c.shadow.clear();
      ellipse(c.shadow, 0, 0, cw * 0.45, 16 * c.scale, palette.waterDeep, 0.12);
    }

    // Seagulls
    for (const s of seagulls) {
      s.g.clear();
      const wing = 7;
      s.g.moveTo(-wing, 0);
      s.g.quadraticCurveTo(-wing * 0.4, -5, 0, 0);
      s.g.quadraticCurveTo(wing * 0.4, -5, wing, 0);
      s.g.stroke({ color: night > 0.5 ? palette.foam : 0xffffff, alpha: 0.8, width: 2.5, cap: 'round' });
      s.g.alpha = 1 - night * 0.7;
    }
  }

  function tick(timeMs: number, _deltaMs: number, motionOn: boolean): void {
    for (const c of clouds) {
      const span = WORLD_WIDTH + 500;
      const x = motionOn
        ? ((c.phase + timeMs * c.speed * 0.001) % span) - 250
        : (c.phase % span) - 250;
      c.g.x = x;
      c.g.y = c.baseY + (motionOn ? Math.sin(timeMs / 6000 + c.phase) * 6 : 0);
      c.shadow.x = x + 60;
      c.shadow.y = c.baseY + 320;
    }
    for (const s of seagulls) {
      const angle = motionOn ? timeMs * s.speed + s.phase : s.phase;
      s.g.x = s.cx + Math.cos(angle) * s.radius;
      s.g.y = s.cy + Math.sin(angle * 0.7) * s.radius * 0.35;
      s.g.scale.x = Math.cos(angle) > 0 ? 1 : -1;
      // Wing flap
      s.g.scale.y = 0.8 + Math.sin(timeMs / 180 + s.phase * 10) * 0.25;
    }
  }

  return { container, shadowLayer, tick, repaint };
}

function mixNum(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}
