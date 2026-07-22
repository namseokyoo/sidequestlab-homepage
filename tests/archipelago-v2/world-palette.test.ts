import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DESIGN_TOKENS,
  buildWorldPalette,
  hexToNumber,
  hexToRgb,
  mixHex,
  mixRgb,
  rgbToHex,
} from '../../src/lib/archipelago-world/palette.ts';

test('Given DESIGN.md tokens, When converted, Then hex round-trips correctly', () => {
  assert.equal(hexToNumber('#EE7459'), 0xee7459);
  assert.equal(hexToNumber('#257E83'), 0x257e83);
  assert.deepEqual(hexToRgb('#69CDC4'), [0x69, 0xcd, 0xc4]);
  assert.equal(rgbToHex([0x69, 0xcd, 0xc4]), 0x69cdc4);
});

test('Given mixRgb, When t is 0 or 1, Then endpoints are returned exactly', () => {
  const a = hexToRgb('#EE7459');
  const b = hexToRgb('#257E83');
  assert.deepEqual(mixRgb(a, b, 0), a);
  assert.deepEqual(mixRgb(a, b, 1), b);
});

test('Given mixHex, When t is 0.5, Then the midpoint is between both channels', () => {
  const mid = mixHex('#000000', '#FFFFFF', 0.5);
  const r = (mid >> 16) & 0xff;
  const g = (mid >> 8) & 0xff;
  const b = mid & 0xff;
  assert.ok(Math.abs(r - 128) <= 1);
  assert.ok(Math.abs(g - 128) <= 1);
  assert.ok(Math.abs(b - 128) <= 1);
});

test('Given buildWorldPalette, When night is 0, Then day tokens match DESIGN.md values', () => {
  const palette = buildWorldPalette(0);
  assert.equal(palette.coral, hexToNumber(DESIGN_TOKENS.coral));
  assert.equal(palette.gold, hexToNumber(DESIGN_TOKENS.gold));
  assert.equal(palette.grass, hexToNumber(DESIGN_TOKENS.grass));
  assert.equal(palette.waterDeep, hexToNumber(DESIGN_TOKENS.waterDeep));
  assert.equal(palette.foam, hexToNumber(DESIGN_TOKENS.foam));
  assert.equal(palette.ink, hexToNumber(DESIGN_TOKENS.ink));
  assert.equal(palette.nightOverlayAlpha, 0);
});

test('Given buildWorldPalette, When night is 1, Then the palette darkens and overlay activates', () => {
  const day = buildWorldPalette(0);
  const night = buildWorldPalette(1);
  // Night sky must be darker than day sky
  assert.ok(night.skyTop < day.skyTop);
  // Water darkens
  assert.ok(night.waterLight < day.waterLight);
  // Night overlay is active
  assert.ok(night.nightOverlayAlpha > 0.3);
  // Window glow stays warm (readable at night)
  const glowR = (night.windowGlow >> 16) & 0xff;
  assert.ok(glowR > 200, 'window glow should stay warm at night');
});

test('Given buildWorldPalette, When night is clamped out of range, Then it does not throw', () => {
  assert.doesNotThrow(() => buildWorldPalette(-0.5));
  assert.doesNotThrow(() => buildWorldPalette(1.5));
  const below = buildWorldPalette(-0.5);
  const above = buildWorldPalette(1.5);
  assert.equal(below.nightOverlayAlpha, 0);
  assert.ok(above.nightOverlayAlpha > 0);
});
