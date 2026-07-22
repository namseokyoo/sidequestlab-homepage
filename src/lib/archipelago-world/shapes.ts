/**
 * PixiJS drawing helpers for the world engine.
 */

import { Graphics } from 'pixi.js';

import type { BlobPoint } from './islands.ts';

/** Draw a smooth closed polygon from blob points. */
export function drawBlob(g: Graphics, points: readonly BlobPoint[]): Graphics {
  if (points.length < 3) return g;
  g.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    g.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  const last = points[points.length - 1];
  const first = points[0];
  g.quadraticCurveTo(last.x, last.y, (last.x + first.x) / 2, (last.y + first.y) / 2);
  g.closePath();
  return g;
}

/** Filled rounded rect. */
export function roundedBox(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: number,
  alpha = 1,
): Graphics {
  g.roundRect(x, y, w, h, r);
  g.fill({ color: fill, alpha });
  return g;
}

/** Simple ellipse fill. */
export function ellipse(
  g: Graphics,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: number,
  alpha = 1,
): Graphics {
  g.ellipse(cx, cy, rx, ry);
  g.fill({ color: fill, alpha });
  return g;
}

/** Circle fill. */
export function circle(
  g: Graphics,
  cx: number,
  cy: number,
  r: number,
  fill: number,
  alpha = 1,
): Graphics {
  g.circle(cx, cy, r);
  g.fill({ color: fill, alpha });
  return g;
}

/** Triangle / roof shape. */
export function triangle(
  g: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  fill: number,
  alpha = 1,
): Graphics {
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.lineTo(x3, y3);
  g.closePath();
  g.fill({ color: fill, alpha });
  return g;
}
