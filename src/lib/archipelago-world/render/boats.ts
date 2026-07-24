/**
 * Boat traffic between islands — living-world ambient animation.
 * Boats follow curved routes between island pairs, looping forever.
 *
 * Each boat renders as the AI sailboat sprite once its texture is
 * loaded; a procedural hull + sail fallback draws immediately so the
 * water is never empty. Wake foam dots trail the stern while moving.
 */

import { Container, Graphics, Sprite, Texture } from 'pixi.js';

import type { IslandLayout } from '../islands.ts';
import { createSeededRandom } from '../math.ts';
import type { WorldPalette } from '../palette.ts';
import { circle, roundedBox, triangle } from '../shapes.ts';
import { getSpriteTexture, onSpriteLoaded } from './sprite-assets.ts';

export type BoatSystem = {
  readonly container: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean) => void;
  readonly repaint: (palette: WorldPalette) => void;
  readonly setRoutes: (layouts: readonly IslandLayout[]) => void;
  readonly dispose: () => void;
};

type Vec2 = { readonly x: number; readonly y: number };

/** Quadratic bezier route between two island shore points. */
type BoatRoute = {
  readonly a: Vec2;
  readonly c: Vec2;
  readonly b: Vec2;
};

type Boat = {
  readonly holder: Container;
  readonly fallback: Graphics;
  sprite: Sprite | null;
  unsubSprite: (() => void) | null;
  routeIndex: number;
  t: number;
  direction: 1 | -1;
  readonly speed: number;
  readonly phase: number;
  dwellUntil: number;
  lastWakeAt: number;
};

type WakeDot = {
  readonly g: Graphics;
  life: number;
  readonly maxLife: number;
};

/** AI sprite display height in world units (spec: 26). */
const SPRITE_H = 26;
/**
 * The sailboat art faces upper-left in image space, so this rotation
 * aligns the bow with the tangent of travel.
 */
const SPRITE_HEADING_OFFSET = -Math.PI * 0.75;
/** Hold at each endpoint before sailing back (ms). */
const ENDPOINT_DWELL_MS = 2000;
/** Foam dot spawn interval while under way (ms). */
const WAKE_INTERVAL_MS = 800;
/** Foam dot fade duration (ms). */
const WAKE_LIFE_MS = 1500;
/** Hard cap on live foam dots. */
const MAX_WAKE_DOTS = 30;
const BOAT_COUNT = 3;

function bezierPoint(r: BoatRoute, t: number): Vec2 {
  const u = 1 - t;
  return {
    x: u * u * r.a.x + 2 * u * t * r.c.x + t * t * r.b.x,
    y: u * u * r.a.y + 2 * u * t * r.c.y + t * t * r.b.y,
  };
}

function bezierTangent(r: BoatRoute, t: number): Vec2 {
  const u = 1 - t;
  return {
    x: 2 * u * (r.c.x - r.a.x) + 2 * t * (r.b.x - r.c.x),
    y: 2 * u * (r.c.y - r.a.y) + 2 * t * (r.b.y - r.c.y),
  };
}

/**
 * Shore point on `island` facing `toward`, at 0.9 of the ellipse
 * radius along the connecting direction.
 */
function edgePoint(island: IslandLayout, toward: Vec2): Vec2 {
  const dx = toward.x - island.cx;
  const dy = toward.y - island.cy;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: island.cx + (dx / len) * island.rx * 0.9,
    y: island.cy + (dy / len) * island.ry * 0.9,
  };
}

/**
 * One curved route per consecutive island pair (wrapping around the
 * layout ring). The control point sits 40–80 world units off the
 * chord midpoint, alternating sides by route index so traffic arcs
 * read as distinct lanes.
 */
function buildRoutes(layouts: readonly IslandLayout[]): BoatRoute[] {
  if (layouts.length < 2) return [];
  const random = createSeededRandom(9173);
  const routes: BoatRoute[] = [];
  for (let i = 0; i < layouts.length; i++) {
    const from = layouts[i];
    const to = layouts[(i + 1) % layouts.length];
    const a = edgePoint(from, { x: to.cx, y: to.cy });
    const b = edgePoint(to, { x: from.cx, y: from.cy });
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const offset = 40 + random() * 40;
    const side = i % 2 === 0 ? 1 : -1;
    const c = {
      x: midX + (-dy / len) * offset * side,
      y: midY + (dx / len) * offset * side,
    };
    routes.push({ a, c, b });
  }
  return routes;
}

function drawFallback(g: Graphics, palette: WorldPalette | null): void {
  const wood = palette?.wood ?? 0xa07850;
  const woodDark = palette?.woodDark ?? 0x7a5c40;
  const paper = palette?.paper ?? 0xfff9ec;
  g.clear();
  roundedBox(g, -9, -4, 18, 8, 3, wood);
  roundedBox(g, -9, 1, 18, 3, 1.5, woodDark, 0.8);
  g.rect(-0.75, -14, 1.5, 11);
  g.fill({ color: woodDark, alpha: 1 });
  triangle(g, 1, -14, 1, -4, 9, -4, paper);
  triangle(g, -1, -12, -1, -4, -7, -4, paper, 0.92);
}

export function createBoatSystem(): BoatSystem {
  const container = new Container();
  container.label = 'boats';

  const boatLayer = new Container();
  const wakeLayer = new Container();
  container.addChild(wakeLayer, boatLayer);

  const random = createSeededRandom(4127);
  let palette: WorldPalette | null = null;
  let routes: BoatRoute[] = [];
  const boats: Boat[] = [];
  const wakes: WakeDot[] = [];
  let lastTickMs = 0;

  function applySpriteTexture(boat: Boat, texture: Texture): void {
    if (!boat.sprite) {
      boat.sprite = new Sprite(texture);
      boat.sprite.anchor.set(0.5, 0.5);
      boat.holder.addChild(boat.sprite);
    } else {
      boat.sprite.texture = texture;
    }
    const scale = SPRITE_H / texture.height;
    boat.sprite.width = texture.width * scale;
    boat.sprite.height = SPRITE_H;
    boat.fallback.visible = false;
    boat.sprite.visible = true;
  }

  function spawnBoat(routeIndex: number, t: number, direction: 1 | -1): Boat {
    const holder = new Container();
    const fallback = new Graphics();
    drawFallback(fallback, palette);
    holder.addChild(fallback);
    boatLayer.addChild(holder);

    const boat: Boat = {
      holder,
      fallback,
      sprite: null,
      unsubSprite: null,
      routeIndex,
      t,
      direction,
      // ~25–40 seconds per crossing at 60fps.
      speed: 0.00004 + random() * 0.000015,
      phase: random() * Math.PI * 2,
      dwellUntil: 0,
      lastWakeAt: 0,
    };

    const existing = getSpriteTexture('boat-sail');
    if (existing) {
      applySpriteTexture(boat, existing);
    } else {
      boat.unsubSprite = onSpriteLoaded('boat-sail', (texture) => {
        if (texture) applySpriteTexture(boat, texture);
      });
    }
    return boat;
  }

  function destroyBoat(boat: Boat): void {
    boat.unsubSprite?.();
    boat.holder.destroy({ children: true });
  }

  function setRoutes(layouts: readonly IslandLayout[]): void {
    routes = buildRoutes(layouts);
    for (const boat of boats) destroyBoat(boat);
    boats.length = 0;
    if (routes.length === 0) return;

    const count = Math.min(BOAT_COUNT, routes.length);
    for (let i = 0; i < count; i++) {
      // Spread boats across routes and along the curve so traffic
      // never clumps on one lane.
      const routeIndex = i % routes.length;
      const t = (0.2 + i * 0.33) % 1;
      const direction: 1 | -1 = i % 2 === 0 ? 1 : -1;
      boats.push(spawnBoat(routeIndex, t, direction));
    }
    lastTickMs = 0;
  }

  function spawnWake(x: number, y: number): void {
    if (wakes.length >= MAX_WAKE_DOTS) return;
    const g = new Graphics();
    circle(g, 0, 0, 2, palette?.foam ?? 0xf7fff8, 0.5);
    g.x = x;
    g.y = y;
    wakeLayer.addChild(g);
    wakes.push({ g, life: 0, maxLife: WAKE_LIFE_MS });
  }

  function repaint(p: WorldPalette): void {
    palette = p;
    for (const boat of boats) drawFallback(boat.fallback, p);
  }

  function tick(timeMs: number, deltaMs: number, motionOn: boolean): void {
    if (routes.length === 0 || boats.length === 0) return;
    const now = lastTickMs > 0 ? lastTickMs + deltaMs : timeMs;
    lastTickMs = timeMs;

    for (const boat of boats) {
      const route = routes[boat.routeIndex % routes.length];
      const sailing = motionOn && now >= boat.dwellUntil;

      if (sailing) {
        boat.t += boat.speed * deltaMs * boat.direction;

        if (boat.t >= 1) {
          boat.t = 1;
          boat.direction = -1;
          boat.dwellUntil = now + ENDPOINT_DWELL_MS;
        } else if (boat.t <= 0) {
          boat.t = 0;
          boat.direction = 1;
          // Hop to the route whose start shore point sits nearest to
          // where the boat just landed, so it reads as continuous travel.
          const pos = bezierPoint(route, 0);
          let best = boat.routeIndex % routes.length;
          let bestDist = Infinity;
          for (let i = 0; i < routes.length; i++) {
            const start = routes[i].a;
            const d = (start.x - pos.x) * (start.x - pos.x) + (start.y - pos.y) * (start.y - pos.y);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          }
          boat.routeIndex = best;
        }
      }

      const active = routes[boat.routeIndex % routes.length];
      const pos = bezierPoint(active, boat.t);
      const tan = bezierTangent(active, boat.t);
      const heading = Math.atan2(tan.y * boat.direction, tan.x * boat.direction);

      const bob = Math.sin(timeMs / 700 + boat.phase) * 2;
      const rock = Math.sin(timeMs / 900 + boat.phase) * 0.04;
      boat.holder.x = pos.x;
      boat.holder.y = pos.y + bob;
      boat.holder.rotation =
        (boat.sprite ? heading + SPRITE_HEADING_OFFSET : heading) + rock;

      if (sailing && now - boat.lastWakeAt >= WAKE_INTERVAL_MS) {
        boat.lastWakeAt = now;
        const tanLen = Math.hypot(tan.x, tan.y) || 1;
        const sternX = pos.x - (tan.x / tanLen) * 10 * boat.direction;
        const sternY = pos.y + bob - (tan.y / tanLen) * 10 * boat.direction;
        spawnWake(sternX, sternY);
      }
    }

    for (let i = wakes.length - 1; i >= 0; i--) {
      const w = wakes[i];
      w.life += deltaMs;
      if (w.life >= w.maxLife) {
        wakeLayer.removeChild(w.g);
        w.g.destroy();
        wakes.splice(i, 1);
        continue;
      }
      w.g.alpha = 0.5 * (1 - w.life / w.maxLife);
    }
  }

  function dispose(): void {
    for (const boat of boats) destroyBoat(boat);
    boats.length = 0;
    for (const w of wakes) w.g.destroy();
    wakes.length = 0;
  }

  return { container, tick, repaint, setRoutes, dispose };
}
