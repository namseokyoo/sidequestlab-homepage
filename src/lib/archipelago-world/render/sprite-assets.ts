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
  | 'landmark-lighthouse'
  | 'landmark-pavilion'
  | 'landmark-booksalon';

const SPRITE_MANIFEST: Record<SpriteKey, string> = {
  'wayfarer-engineer': '/images/archipelago/sprites/wayfarer-engineer.png',
  'wayfarer-qa': '/images/archipelago/sprites/wayfarer-qa.png',
  'landmark-lighthouse': '/images/archipelago/sprites/landmark-lighthouse.png',
  'landmark-pavilion': '/images/archipelago/sprites/landmark-pavilion.png',
  'landmark-booksalon': '/images/archipelago/sprites/landmark-booksalon.png',
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
