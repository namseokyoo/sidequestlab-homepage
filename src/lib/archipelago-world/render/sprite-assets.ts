/**
 * AI-generated sprite asset manifest and loader.
 *
 * Sprites are chroma-keyed transparent PNGs stored under
 * public/images/archipelago/sprites/. They load asynchronously —
 * procedural vector art renders immediately and sprites swap in
 * when ready, so there is never a blank flash.
 */

import { Assets, Texture } from 'pixi.js';

export type SpriteKey =
  | 'wayfarer-engineer'
  | 'wayfarer-qa'
  | 'wayfarer-engineer-walk-0'
  | 'wayfarer-engineer-walk-1'
  | 'wayfarer-engineer-walk-2'
  | 'wayfarer-engineer-walk-3'
  | 'wayfarer-qa-walk-0'
  | 'wayfarer-qa-walk-1'
  | 'wayfarer-qa-walk-2'
  | 'wayfarer-qa-walk-3'
  | 'landmark-lighthouse'
  | 'landmark-pavilion'
  | 'landmark-booksalon'
  | 'tree-deciduous'
  | 'tree-conifer'
  | 'tree-palm'
  | 'bush'
  | 'flower-coral'
  | 'flower-gold'
  | 'flower-white'
  | 'flower-pink'
  | 'grass-tuft'
  | 'shell'
  | 'conch'
  | 'tidepool'
  | 'rock'
  | 'rock-moss-variant'
  | 'rock-mossy'
  | 'vine'
  | 'moss-patch'
  | 'leaf'
  | 'smoke-puff'
  | 'island-large'
  | 'island-medium'
  | 'island-small'
  | 'island-tiny';

const SPRITE_MANIFEST: Record<SpriteKey, string> = {
  'wayfarer-engineer': '/images/archipelago/sprites/wayfarer-engineer.png',
  'wayfarer-qa': '/images/archipelago/sprites/wayfarer-qa.png',
  'wayfarer-engineer-walk-0': '/images/archipelago/sprites/wayfarer-engineer-walk-0.png',
  'wayfarer-engineer-walk-1': '/images/archipelago/sprites/wayfarer-engineer-walk-1.png',
  'wayfarer-engineer-walk-2': '/images/archipelago/sprites/wayfarer-engineer-walk-2.png',
  'wayfarer-engineer-walk-3': '/images/archipelago/sprites/wayfarer-engineer-walk-3.png',
  'wayfarer-qa-walk-0': '/images/archipelago/sprites/wayfarer-qa-walk-0.png',
  'wayfarer-qa-walk-1': '/images/archipelago/sprites/wayfarer-qa-walk-1.png',
  'wayfarer-qa-walk-2': '/images/archipelago/sprites/wayfarer-qa-walk-2.png',
  'wayfarer-qa-walk-3': '/images/archipelago/sprites/wayfarer-qa-walk-3.png',
  'landmark-lighthouse': '/images/archipelago/sprites/landmark-lighthouse.png',
  'landmark-pavilion': '/images/archipelago/sprites/landmark-pavilion.png',
  'landmark-booksalon': '/images/archipelago/sprites/landmark-booksalon.png',
  'tree-deciduous': '/images/archipelago/sprites/tree-deciduous.png',
  'tree-conifer': '/images/archipelago/sprites/tree-conifer.png',
  'tree-palm': '/images/archipelago/sprites/tree-palm.png',
  'bush': '/images/archipelago/sprites/bush.png',
  'flower-coral': '/images/archipelago/sprites/flower-coral.png',
  'flower-gold': '/images/archipelago/sprites/flower-gold.png',
  'flower-white': '/images/archipelago/sprites/flower-white.png',
  'flower-pink': '/images/archipelago/sprites/flower-pink.png',
  'grass-tuft': '/images/archipelago/sprites/grass-tuft.png',
  'shell': '/images/archipelago/sprites/shell.png',
  'conch': '/images/archipelago/sprites/conch.png',
  'tidepool': '/images/archipelago/sprites/tidepool.png',
  'rock': '/images/archipelago/sprites/rock.png',
  'rock-moss-variant': '/images/archipelago/sprites/rock-moss-variant.png',
  'rock-mossy': '/images/archipelago/sprites/rock-mossy.png',
  'vine': '/images/archipelago/sprites/vine.png',
  'moss-patch': '/images/archipelago/sprites/moss-patch.png',
  'leaf': '/images/archipelago/sprites/leaf.png',
  'smoke-puff': '/images/archipelago/sprites/smoke-puff.png',
  'island-large': '/images/archipelago/sprites/island-large.png',
  'island-medium': '/images/archipelago/sprites/island-medium.png',
  'island-small': '/images/archipelago/sprites/island-small.png',
  'island-tiny': '/images/archipelago/sprites/island-tiny.png',
};

/** Normalized display dimensions (world units) for each sprite key. */
const SPRITE_SIZES: Partial<Record<SpriteKey, { readonly w: number; readonly h: number }>> = {
  'tree-deciduous': { w: 40, h: 40 },
  'tree-conifer': { w: 40, h: 40 },
  'tree-palm': { w: 40, h: 40 },
  'bush': { w: 22, h: 16 },
  'flower-coral': { w: 12, h: 12 },
  'flower-gold': { w: 12, h: 12 },
  'flower-white': { w: 12, h: 12 },
  'flower-pink': { w: 12, h: 12 },
  'grass-tuft': { w: 10, h: 10 },
  'shell': { w: 8, h: 8 },
  'conch': { w: 10, h: 10 },
  'tidepool': { w: 26, h: 20 },
  'rock': { w: 20, h: 16 },
  'rock-moss-variant': { w: 22, h: 16 },
  'rock-mossy': { w: 22, h: 16 },
  'vine': { w: 14, h: 30 },
  'moss-patch': { w: 18, h: 14 },
  'leaf': { w: 6, h: 6 },
  'smoke-puff': { w: 10, h: 10 },
};

type SpriteListener = (texture: Texture | null) => void;

const textureCache = new Map<SpriteKey, Texture>();
const listeners = new Map<SpriteKey, SpriteListener[]>();
let loadStarted = false;

/** True once the sprite for `key` has loaded and is cached. */
export function hasSprite(key: SpriteKey): boolean {
  return textureCache.has(key);
}

/** Get the cached texture for `key`, or null if not yet loaded. */
export function getSpriteTexture(key: SpriteKey): Texture | null {
  return textureCache.get(key) ?? null;
}

/** Subscribe to load completion for a single sprite key. */
export function onSpriteLoaded(key: SpriteKey, cb: SpriteListener): () => void {
  const list = listeners.get(key) ?? [];
  list.push(cb);
  listeners.set(key, list);
  // Already loaded — fire immediately
  if (textureCache.has(key)) {
    cb(textureCache.get(key) ?? null);
  }
  return () => {
    const idx = list.indexOf(cb);
    if (idx >= 0) list.splice(idx, 1);
  };
}

/** Get normalized display size for a sprite key (world units). */
export function getSpriteSize(key: SpriteKey): { readonly w: number; readonly h: number } {
  return SPRITE_SIZES[key] ?? { w: 32, h: 32 };
}

/** Batch-load a category of sprites. Returns count of loaded textures. */
export async function preloadCategory(keys: readonly SpriteKey[]): Promise<number> {
  const results = await Promise.allSettled(
    keys.map(async (key) => {
      if (textureCache.has(key)) return key;
      const url = SPRITE_MANIFEST[key];
      const texture = await Assets.load(url);
      textureCache.set(key, texture);
      for (const cb of listeners.get(key) ?? []) cb(texture);
      return key;
    }),
  );
  return results.filter((r) => r.status === 'fulfilled').length;
}

/** Get the 4 walk-frame textures for a role, or null if any missing. */
export function getWalkFrames(role: 'engineer' | 'qa'): Texture[] | null {
  const keys: SpriteKey[] = [0, 1, 2, 3].map((i) => `wayfarer-${role}-walk-${i}` as SpriteKey);
  const frames = keys.map((k) => textureCache.get(k));
  if (frames.every((f): f is Texture => f != null)) return frames;
  return null;
}

/**
 * Kick off loading of all sprites. Resolves with the number of
 * newly loaded textures (0 if already loaded or all failed).
 * Safe to call multiple times — only the first call loads.
 */
export async function loadArchipelagoSprites(): Promise<number> {
  if (loadStarted) return 0;
  loadStarted = true;

  const entries = Object.entries(SPRITE_MANIFEST) as [SpriteKey, string][];
  const results = await Promise.allSettled(
    entries.map(async ([key, url]) => {
      const texture = await Assets.load(url);
      textureCache.set(key, texture);
      for (const cb of listeners.get(key) ?? []) cb(texture);
      return key;
    }),
  );

  const loaded = results.filter((r) => r.status === 'fulfilled').length;
  if (loaded < entries.length) {
    // Procedural fallback covers any failures — log for visibility
    console.warn(
      `[archipelago] ${entries.length - loaded}/${entries.length} sprites failed to load; procedural fallback active`,
    );
  }
  return loaded;
}

/** Test-only: reset internal state. */
export function __resetSpriteStore(): void {
  textureCache.clear();
  listeners.clear();
  loadStarted = false;
}
