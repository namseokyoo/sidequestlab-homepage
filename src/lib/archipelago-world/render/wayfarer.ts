/**
 * Procedural chibi Wayfarer renderer.
 * 2.8–3.2 head-tall proportions per DESIGN.md §7.
 * Two roles: Code Engineer (goggles + tool belt) and QA Navigator
 * (magnifier + clipboard). Fully vector-drawn, animated idle/walk/task.
 */

import { Container, Graphics, Sprite } from 'pixi.js';

import type { WorldPalette } from '../palette.ts';
import { getSpriteTexture, getWalkFrames, onSpriteLoaded, type SpriteKey } from './sprite-assets.ts';

export type WayfarerRole = 'CODE_ENGINEER' | 'QA_NAVIGATOR';

export type WayfarerState = 'IDLE' | 'WALKING' | 'WORKING' | 'INSPECTING' | 'WAVING';

export type WayfarerSystem = {
  readonly container: Container;
  readonly tick: (timeMs: number, deltaMs: number, motionOn: boolean) => void;
  readonly repaint: (palette: WorldPalette, night: number) => void;
  readonly setState: (state: WayfarerState) => void;
  readonly setFacing: (facing: 1 | -1) => void;
  readonly moveTo: (x: number, y: number, durationMs: number) => void;
  readonly position: () => { x: number; y: number };
  readonly dispose?: () => void;
};

const HEAD_R = 11;
const BODY_H = 14;
const LEG_H = 8;
// Total ≈ HEAD_R*2 + BODY_H + LEG_H = 44 → head ratio ≈ 2.9 heads tall
/** Visual scale so characters read at ~1/8 viewport height when focused. */
const WAYFARER_SCALE = 2.2;

export function createWayfarer(
  role: WayfarerRole,
  x: number,
  y: number,
  spriteKey?: SpriteKey,
): WayfarerSystem {
  const container = new Container();
  container.label = `wayfarer-${role.toLowerCase()}`;
  container.x = x;
  container.y = y;

  const shadow = new Graphics();
  const body = new Container();
  /** AI sprite body — replaces procedural art when the texture is loaded. */
  const spriteBody = new Container();
  const legL = new Graphics();
  const legR = new Graphics();
  const torso = new Graphics();
  const armL = new Graphics();
  const armR = new Graphics();
  const head = new Container();
  const headG = new Graphics();
  const faceG = new Graphics();
  const hairG = new Graphics();
  const toolG = new Graphics();
  head.addChild(headG, faceG, hairG);
  body.addChild(legL, legR, torso, armL, armR, head, toolG);
  body.addChild(spriteBody);
  // Scale wrapper: feet at container origin, character extends upward
  const inner = new Container();
  inner.scale.set(WAYFARER_SCALE);
  inner.y = -(BODY_H + LEG_H) * WAYFARER_SCALE;
  inner.addChild(shadow, body);
  container.addChild(inner);

  let state: WayfarerState = 'IDLE';
  let facing: 1 | -1 = 1;
  let palette: WorldPalette | null = null;
  let nightTint = 0;
  let spriteActive = false;
  let walkFrames: import('pixi.js').Texture[] | null = null;
  let walkFrameIndex = 0;
  // Movement
  let moveFrom = { x, y };
  let moveTarget = { x, y };
  let moveStart = 0;
  let moveDuration = 0;
  let moving = false;

  // Wave reaction
  let waveUntil = 0;

  // ── AI sprite integration ───────────────────────────────────────
  // The sprite replaces the procedural head/torso/legs as a single
  // body image. Procedural arms stay on top so walk/work/wave
  // animations keep moving. Sprite canvas is 512×512 with feet at
  // the bottom; we scale it to match the procedural character height
  // (44 units) plus a little extra for the richer art.
  const SPRITE_DISPLAY_H = 54;
  let spriteImg: Sprite | null = null;

  function applySpriteTexture(texture: import('pixi.js').Texture): void {
    spriteBody.removeChildren().forEach((c) => c.destroy({ children: true }));
    spriteImg = new Sprite(texture);
    spriteImg.anchor.set(0.5, 1); // feet at origin
    const scale = SPRITE_DISPLAY_H / texture.height;
    spriteImg.width = texture.width * scale;
    spriteImg.height = SPRITE_DISPLAY_H;
    spriteImg.y = (BODY_H + LEG_H) * 0.98;
    spriteBody.addChild(spriteImg);
    spriteActive = true;
    syncSpriteVisibility();
    applyNightTint();
    // Try to load walk frames for this role
    const walkRole = role === 'CODE_ENGINEER' ? 'engineer' : 'qa';
    walkFrames = getWalkFrames(walkRole);
  }

  function syncSpriteVisibility(): void {
    const show = spriteActive;
    legL.visible = !show;
    legR.visible = !show;
    armL.visible = !show;
    armR.visible = !show;
    torso.visible = !show;
    head.visible = !show;
    toolG.visible = !show;
    spriteBody.visible = show;
  }

  function applyNightTint(): void {
    if (!spriteImg) return;
    const r = Math.round(255 - nightTint * 60);
    const g = Math.round(255 - nightTint * 40);
    const b = Math.round(255 - nightTint * 10);
    spriteImg.tint = (r << 16) | (g << 8) | b;
  }

  let unsubscribeSprite: (() => void) | null = null;
  if (spriteKey) {
    const existing = getSpriteTexture(spriteKey);
    if (existing) {
      applySpriteTexture(existing);
    } else {
      unsubscribeSprite = onSpriteLoaded(spriteKey, (texture) => {
        if (texture) applySpriteTexture(texture);
      });
    }
  }

  function repaint(p: WorldPalette, night: number): void {
    palette = p;
    nightTint = night;
    applyNightTint();
    const skin = mixNum(0xffd9b8, 0xd4a882, night * 0.4);
    const isEngineer = role === 'CODE_ENGINEER';
    const outfitMain = isEngineer ? mixNum(0x4a7fa5, 0x35607e, night * 0.4) : mixNum(0x5a9e6f, 0x3d7a52, night * 0.4);
    const outfitAccent = isEngineer ? p.coral : p.gold;
    const hairColor = isEngineer ? mixNum(0x5c4033, 0x3e2b22, night * 0.4) : mixNum(0x2c3e50, 0x1e2b38, night * 0.4);
    const bootColor = mixNum(0x6b4f3a, 0x4a3628, night * 0.4);

    // Shadow
    shadow.clear();
    shadow.ellipse(0, BODY_H + LEG_H, 11, 4.5);
    shadow.fill({ color: 0x17343a, alpha: 0.2 });

    // Legs
    legL.clear();
    legR.clear();
    legL.roundRect(-6, BODY_H - 2, 5, LEG_H + 2, 2);
    legL.fill({ color: outfitMain, alpha: 1 });
    legL.roundRect(-7, BODY_H + LEG_H - 3, 7, 4, 2);
    legL.fill({ color: bootColor, alpha: 1 });
    legR.roundRect(1, BODY_H - 2, 5, LEG_H + 2, 2);
    legR.fill({ color: outfitMain, alpha: 1 });
    legR.roundRect(0, BODY_H + LEG_H - 3, 7, 4, 2);
    legR.fill({ color: bootColor, alpha: 1 });

    // Torso
    torso.clear();
    torso.roundRect(-8, 0, 16, BODY_H + 2, 4);
    torso.fill({ color: outfitMain, alpha: 1 });
    // Vest / jacket front
    torso.roundRect(-8, 0, 7, BODY_H + 2, 4);
    torso.fill({ color: mixNum(outfitMain, 0xffffff, 0.15), alpha: 0.6 });
    // Belt
    torso.rect(-8, BODY_H - 4, 16, 3);
    torso.fill({ color: bootColor, alpha: 1 });
    // Belt buckle
    torso.rect(-2, BODY_H - 4, 4, 3);
    torso.fill({ color: p.gold, alpha: 0.9 });
    // Collar accent
    torso.roundRect(-5, -1, 10, 4, 2);
    torso.fill({ color: outfitAccent, alpha: 0.85 });

    // Tool belt pouches (engineer) or satchel (QA)
    if (isEngineer) {
      torso.roundRect(5, BODY_H - 6, 5, 5, 1.5);
      torso.fill({ color: bootColor, alpha: 1 });
      torso.roundRect(-10, BODY_H - 6, 5, 5, 1.5);
      torso.fill({ color: bootColor, alpha: 1 });
    } else {
      // Satchel strap
      torso.moveTo(-7, 1);
      torso.lineTo(7, BODY_H - 3);
      torso.stroke({ color: bootColor, alpha: 0.9, width: 2.5 });
      torso.roundRect(4, BODY_H - 6, 7, 6, 2);
      torso.fill({ color: bootColor, alpha: 1 });
      torso.roundRect(5.5, BODY_H - 4.5, 4, 3, 1);
      torso.fill({ color: p.gold, alpha: 0.5 });
    }

    // Arms
    armL.clear();
    armR.clear();
    armL.roundRect(-11, 2, 4, 11, 2);
    armL.fill({ color: outfitMain, alpha: 1 });
    armL.circle(-9, 13, 2.5);
    armL.fill({ color: skin, alpha: 1 });
    armR.roundRect(7, 2, 4, 11, 2);
    armR.fill({ color: outfitMain, alpha: 1 });
    armR.circle(9, 13, 2.5);
    armR.fill({ color: skin, alpha: 1 });

    // Head
    headG.clear();
    headG.circle(0, -HEAD_R - 2, HEAD_R);
    headG.fill({ color: skin, alpha: 1 });
    // Ears
    headG.circle(-HEAD_R + 1, -HEAD_R - 2, 2.5);
    headG.fill({ color: skin, alpha: 1 });
    headG.circle(HEAD_R - 1, -HEAD_R - 2, 2.5);
    headG.fill({ color: skin, alpha: 1 });

    // Hair
    hairG.clear();
    hairG.arc(0, -HEAD_R - 2, HEAD_R + 0.5, Math.PI * 0.95, Math.PI * 2.05);
    hairG.quadraticCurveTo(HEAD_R * 0.6, -HEAD_R * 1.6, 0, -HEAD_R * 1.55);
    hairG.closePath();
    hairG.fill({ color: hairColor, alpha: 1 });
    // Side hair tufts
    hairG.ellipse(-HEAD_R + 2, -HEAD_R - 6, 3.5, 6);
    hairG.fill({ color: hairColor, alpha: 1 });
    hairG.ellipse(HEAD_R - 2, -HEAD_R - 6, 3.5, 6);
    hairG.fill({ color: hairColor, alpha: 1 });

    if (isEngineer) {
      // Goggles pushed up on forehead
      hairG.roundRect(-8, -HEAD_R * 2 + 2, 16, 6, 3);
      hairG.fill({ color: 0x8a6d4a, alpha: 1 });
      hairG.circle(-4, -HEAD_R * 2 + 5, 3.5);
      hairG.fill({ color: 0xb8d8e8, alpha: 0.9 });
      hairG.circle(4, -HEAD_R * 2 + 5, 3.5);
      hairG.fill({ color: 0xb8d8e8, alpha: 0.9 });
      hairG.circle(-4, -HEAD_R * 2 + 5, 3.5);
      hairG.stroke({ color: 0x6b5540, alpha: 1, width: 1.5 });
      hairG.circle(4, -HEAD_R * 2 + 5, 3.5);
      hairG.stroke({ color: 0x6b5540, alpha: 1, width: 1.5 });
    } else {
      // QA: small beret / cap
      hairG.ellipse(0, -HEAD_R * 2 + 4, HEAD_R * 0.85, 4.5);
      hairG.fill({ color: outfitAccent, alpha: 1 });
      hairG.circle(0, -HEAD_R * 2 + 1, 2);
      hairG.fill({ color: outfitAccent, alpha: 1 });
    }

    // Face
    faceG.clear();
    const eyeY = -HEAD_R - 3;
    // Eyes
    faceG.circle(-4, eyeY, 2.2);
    faceG.fill({ color: 0x2c3e50, alpha: 1 });
    faceG.circle(4, eyeY, 2.2);
    faceG.fill({ color: 0x2c3e50, alpha: 1 });
    // Eye highlights
    faceG.circle(-3.3, eyeY - 0.8, 0.8);
    faceG.fill({ color: 0xffffff, alpha: 0.9 });
    faceG.circle(4.7, eyeY - 0.8, 0.8);
    faceG.fill({ color: 0xffffff, alpha: 0.9 });
    // Blush
    faceG.ellipse(-6.5, eyeY + 3.5, 2.5, 1.5);
    faceG.fill({ color: 0xf0a08a, alpha: 0.5 });
    faceG.ellipse(6.5, eyeY + 3.5, 2.5, 1.5);
    faceG.fill({ color: 0xf0a08a, alpha: 0.5 });
    // Mouth — small smile
    faceG.moveTo(-2, eyeY + 5);
    faceG.quadraticCurveTo(0, eyeY + 7, 2, eyeY + 5);
    faceG.stroke({ color: 0x8a5a4a, alpha: 0.8, width: 1.2, cap: 'round' });

    // Role tool in hand
    toolG.clear();
    if (isEngineer) {
      // Hammer in right hand
      toolG.rect(8, 8, 2.5, 10);
      toolG.fill({ color: bootColor, alpha: 1 });
      toolG.roundRect(5.5, 5, 8, 5, 1.5);
      toolG.fill({ color: 0x888888, alpha: 1 });
    } else {
      // Magnifier in right hand
      toolG.circle(11, 10, 4.5);
      toolG.stroke({ color: p.gold, alpha: 1, width: 2 });
      toolG.circle(11, 10, 3);
      toolG.fill({ color: 0xc8e8f0, alpha: 0.4 });
      toolG.moveTo(8, 13.5);
      toolG.lineTo(5.5, 17);
      toolG.stroke({ color: bootColor, alpha: 1, width: 2, cap: 'round' });
      // Clipboard on left arm
      toolG.roundRect(-14, 6, 8, 11, 1.5);
      toolG.fill({ color: p.paper, alpha: 0.95 });
      toolG.rect(-12.5, 8.5, 5, 1.2);
      toolG.fill({ color: 0x88aaaa, alpha: 0.7 });
      toolG.rect(-12.5, 11, 5, 1.2);
      toolG.fill({ color: 0x88aaaa, alpha: 0.7 });
      toolG.rect(-12.5, 13.5, 3.5, 1.2);
      toolG.fill({ color: 0x88aaaa, alpha: 0.7 });
    }
  }

  function setState(next: WayfarerState): void {
    state = next;
    if (next === 'WAVING') {
      waveUntil = performance.now() + 1800;
    }
  }

  function setFacing(next: 1 | -1): void {
    facing = next;
  }

  function moveTo(tx: number, ty: number, durationMs: number): void {
    moveFrom = { x: container.x, y: container.y };
    moveTarget = { x: tx, y: ty };
    moveStart = performance.now();
    moveDuration = Math.max(durationMs, 1);
    moving = true;
    state = 'WALKING';
    facing = tx >= container.x ? 1 : -1;
  }

  function tick(timeMs: number, _deltaMs: number, motionOn: boolean): void {
    if (palette === null) return;
    const now = performance.now();
    syncSpriteVisibility();

    // Movement interpolation
    if (moving) {
      const t = Math.min(1, (now - moveStart) / moveDuration);
      const e = t * t * (3 - 2 * t);
      container.x = moveFrom.x + (moveTarget.x - moveFrom.x) * e;
      container.y = moveFrom.y + (moveTarget.y - moveFrom.y) * e;
      if (t >= 1) {
        moving = false;
        state = role === 'CODE_ENGINEER' ? 'WORKING' : 'INSPECTING';
      }
    }

    // Wave expiry
    if (state === 'WAVING' && now > waveUntil) {
      state = role === 'CODE_ENGINEER' ? 'WORKING' : 'INSPECTING';
    }

    body.scale.x = facing;

    if (!motionOn) {
      // Static pose
      legL.rotation = 0;
      legR.rotation = 0;
      armL.rotation = 0;
      armR.rotation = 0;
      head.y = 0;
      body.y = 0;
      spriteBody.y = 0;
      spriteBody.rotation = 0;
      spriteBody.scale.set(1, 1);
      return;
    }

    // ── Sprite mode: animate the whole sprite as one body ─────────
    // Procedural limbs are hidden; the sprite itself bounces, sways,
    // and tilts per state so the character still feels alive.
    if (spriteActive) {
      const walkCycle = Math.sin(timeMs / 110);
      const isWalking = state === 'WALKING' && moving;
      const breathe = Math.sin(timeMs / 1800);
      if (isWalking) {
        // Walk-cycle frame animation at 8fps (125ms per frame)
        if (walkFrames && spriteImg) {
          const newFrame = Math.floor(timeMs / 125) % 4;
          if (newFrame !== walkFrameIndex) {
            walkFrameIndex = newFrame;
            spriteImg.texture = walkFrames[walkFrameIndex];
          }
          spriteBody.y = Math.abs(walkCycle) * -1.5;
          spriteBody.rotation = 0;
          spriteBody.scale.set(1, 1);
        } else {
          spriteBody.y = Math.abs(walkCycle) * -2.5;
          spriteBody.rotation = walkCycle * 0.045;
          spriteBody.scale.set(1 + walkCycle * 0.012, 1 - Math.abs(walkCycle) * 0.025);
        }
      } else {
        // Reset to single-pose sprite when not walking
        if (walkFrames && spriteImg) {
          const poseKey: SpriteKey = role === 'CODE_ENGINEER' ? 'wayfarer-engineer' : 'wayfarer-qa';
          const poseTex = getSpriteTexture(poseKey);
          if (poseTex && spriteImg.texture !== poseTex) {
            spriteImg.texture = poseTex;
          }
        }
        switch (state) {
          case 'WORKING': {
            const hammer = Math.sin(timeMs / 350);
            spriteBody.y = Math.max(0, hammer) * -2.2;
            spriteBody.rotation = hammer * 0.045;
            spriteBody.scale.set(1, 1);
            break;
          }
          case 'INSPECTING': {
            const look = Math.sin(timeMs / 2400);
            spriteBody.rotation = look * 0.06;
            spriteBody.y = breathe * -0.9;
            spriteBody.scale.set(1, 1 + breathe * 0.008);
            break;
          }
          case 'WAVING': {
            const wave = Math.sin(timeMs / 150);
            spriteBody.y = Math.abs(wave) * -3.2;
            spriteBody.rotation = wave * 0.09;
            spriteBody.scale.set(1, 1);
            break;
          }
          default: {
            spriteBody.y = breathe * -1.1;
            spriteBody.rotation = Math.sin(timeMs / 4000) * 0.025;
            spriteBody.scale.set(1, 1 + breathe * 0.012);
          }
        }
      }
      return;
    }

    const walkCycle = Math.sin(timeMs / 110);
    const isWalking = state === 'WALKING' && moving;

    // Legs
    if (isWalking) {
      legL.rotation = walkCycle * 0.45;
      legR.rotation = -walkCycle * 0.45;
      body.y = Math.abs(Math.sin(timeMs / 110)) * -1.5;
    } else {
      legL.rotation = 0;
      legR.rotation = 0;
      body.y = 0;
    }

    // Idle breathing
    const breathe = Math.sin(timeMs / 1800) * 0.8;
    head.y = -breathe * 0.5;
    torso.scale.y = 1 + Math.sin(timeMs / 1800) * 0.015;

    // Blink
    const blinkCycle = (timeMs % 3600) / 3600;
    const blinkScale = blinkCycle > 0.96 ? Math.max(0.1, Math.sin((blinkCycle - 0.96) / 0.04 * Math.PI)) : 1;
    faceG.scale.y = blinkScale;

    // Arms per state
    switch (state) {
      case 'WALKING':
        armL.rotation = -walkCycle * 0.35;
        armR.rotation = walkCycle * 0.35;
        break;
      case 'WORKING': {
        // Hammering motion
        const hammer = Math.sin(timeMs / 350);
        armR.rotation = -0.6 + hammer * 0.5;
        armR.pivot.set(9, 3);
        armR.position.set(9, 3);
        armL.rotation = 0.15;
        // Slight body lean
        body.rotation = Math.sin(timeMs / 350) * 0.03;
        break;
      }
      case 'INSPECTING': {
        // Raise magnifier, look around
        const look = Math.sin(timeMs / 2400);
        armR.rotation = -0.9 + look * 0.15;
        armR.pivot.set(9, 3);
        armR.position.set(9, 3);
        armL.rotation = 0.1;
        head.rotation = look * 0.12;
        body.rotation = 0;
        break;
      }
      case 'WAVING': {
        const wave = Math.sin(timeMs / 150);
        armR.rotation = -2.2 + wave * 0.3;
        armR.pivot.set(9, 3);
        armR.position.set(9, 3);
        armL.rotation = 0;
        body.rotation = 0;
        head.rotation = wave * 0.06;
        break;
      }
      default: {
        // Idle — gentle sway
        armL.rotation = Math.sin(timeMs / 2200) * 0.08;
        armR.rotation = -Math.sin(timeMs / 2200) * 0.08;
        body.rotation = 0;
        head.rotation = Math.sin(timeMs / 4000) * 0.05;
      }
    }
  }

  return {
    container,
    tick,
    repaint,
    setState,
    setFacing,
    moveTo,
    position: () => ({ x: container.x, y: container.y }),
    dispose: () => {
      unsubscribeSprite?.();
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
