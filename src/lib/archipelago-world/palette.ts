/**
 * Color system for the Living Archipelago world engine.
 * Day tokens follow DESIGN.md §2; night palette follows visual-target-v2 (03).
 * No PixiJS dependency — safe for Node tests.
 */

export type Rgb = readonly [number, number, number];

/** DESIGN.md §2 tokens as hex strings (source of truth stays in DESIGN.md). */
export const DESIGN_TOKENS = {
  sky: '#DDF3F3',
  horizon: '#B9E5E2',
  waterLight: '#69CDC4',
  waterDeep: '#257E83',
  foam: '#F7FFF8',
  sand: '#E8C983',
  grass: '#7BBE67',
  forest: '#397457',
  coral: '#EE7459',
  gold: '#E5AA45',
  paper: '#FFF9EC',
  ink: '#17343A',
  muted: '#557379',
  danger: '#A43F3B',
} as const;

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export function rgbToHex(rgb: Rgb): number {
  return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
}

export function hexToNumber(hex: string): number {
  return rgbToHex(hexToRgb(hex));
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function mixHex(a: string, b: string, t: number): number {
  return rgbToHex(mixRgb(hexToRgb(a), hexToRgb(b), t));
}

export function withAlpha(color: number, alpha: number): { color: number; alpha: number } {
  return { color, alpha };
}

/**
 * World palette interpolated between day and night.
 * `night` is 0 (full day) to 1 (full night).
 */
export type WorldPalette = {
  readonly skyTop: number;
  readonly skyBottom: number;
  readonly waterLight: number;
  readonly waterMid: number;
  readonly waterDeep: number;
  readonly foam: number;
  readonly sand: number;
  readonly grass: number;
  readonly grassShadow: number;
  readonly forest: number;
  readonly coral: number;
  readonly gold: number;
  readonly paper: number;
  readonly ink: number;
  readonly muted: number;
  readonly wood: number;
  readonly woodDark: number;
  readonly stone: number;
  readonly roofCoral: number;
  readonly roofTeal: number;
  readonly windowGlow: number;
  readonly lanternGlow: number;
  readonly moonlight: number;
  readonly nightOverlayAlpha: number;
};

const NIGHT = {
  skyTop: '#0E2A33',
  skyBottom: '#163A42',
  waterLight: '#1E5E63',
  waterMid: '#185058',
  waterDeep: '#0F3A42',
  foam: '#8EC5C0',
  sand: '#8A7A55',
  grass: '#3E6B4A',
  grassShadow: '#2C5240',
  forest: '#1F4436',
  coral: '#C4604C',
  gold: '#D9A44A',
  paper: '#B8B0A0',
  ink: '#0A1E24',
  muted: '#4A6A70',
  wood: '#5E4A38',
  woodDark: '#46362A',
  stone: '#5A6E72',
  roofCoral: '#9E5040',
  roofTeal: '#2E6468',
  windowGlow: '#FFC96B',
  lanternGlow: '#FFB347',
  moonlight: '#C8E8E8',
} as const;

const DAY = {
  skyTop: DESIGN_TOKENS.sky,
  skyBottom: DESIGN_TOKENS.horizon,
  waterLight: DESIGN_TOKENS.waterLight,
  waterMid: '#4DBAB2',
  waterDeep: DESIGN_TOKENS.waterDeep,
  foam: DESIGN_TOKENS.foam,
  sand: DESIGN_TOKENS.sand,
  grass: DESIGN_TOKENS.grass,
  grassShadow: '#5FA354',
  forest: DESIGN_TOKENS.forest,
  coral: DESIGN_TOKENS.coral,
  gold: DESIGN_TOKENS.gold,
  paper: DESIGN_TOKENS.paper,
  ink: DESIGN_TOKENS.ink,
  muted: DESIGN_TOKENS.muted,
  wood: '#A07850',
  woodDark: '#7A5C40',
  stone: '#C8CFC8',
  roofCoral: DESIGN_TOKENS.coral,
  roofTeal: '#3A9490',
  windowGlow: '#FFE8B0',
  lanternGlow: '#FFD080',
  moonlight: '#FFFFFF',
} as const;

export function buildWorldPalette(night: number): WorldPalette {
  const t = Math.max(0, Math.min(1, night));
  return {
    skyTop: mixHex(DAY.skyTop, NIGHT.skyTop, t),
    skyBottom: mixHex(DAY.skyBottom, NIGHT.skyBottom, t),
    waterLight: mixHex(DAY.waterLight, NIGHT.waterLight, t),
    waterMid: mixHex(DAY.waterMid, NIGHT.waterMid, t),
    waterDeep: mixHex(DAY.waterDeep, NIGHT.waterDeep, t),
    foam: mixHex(DAY.foam, NIGHT.foam, t),
    sand: mixHex(DAY.sand, NIGHT.sand, t),
    grass: mixHex(DAY.grass, NIGHT.grass, t),
    grassShadow: mixHex(DAY.grassShadow, NIGHT.grassShadow, t),
    forest: mixHex(DAY.forest, NIGHT.forest, t),
    coral: mixHex(DAY.coral, NIGHT.coral, t),
    gold: mixHex(DAY.gold, NIGHT.gold, t),
    paper: mixHex(DAY.paper, NIGHT.paper, t),
    ink: mixHex(DAY.ink, NIGHT.ink, t),
    muted: mixHex(DAY.muted, NIGHT.muted, t),
    wood: mixHex(DAY.wood, NIGHT.wood, t),
    woodDark: mixHex(DAY.woodDark, NIGHT.woodDark, t),
    stone: mixHex(DAY.stone, NIGHT.stone, t),
    roofCoral: mixHex(DAY.roofCoral, NIGHT.roofCoral, t),
    roofTeal: mixHex(DAY.roofTeal, NIGHT.roofTeal, t),
    windowGlow: mixHex(DAY.windowGlow, NIGHT.windowGlow, t),
    lanternGlow: mixHex(DAY.lanternGlow, NIGHT.lanternGlow, t),
    moonlight: mixHex(DAY.moonlight, NIGHT.moonlight, t),
    nightOverlayAlpha: t * 0.35,
  };
}
