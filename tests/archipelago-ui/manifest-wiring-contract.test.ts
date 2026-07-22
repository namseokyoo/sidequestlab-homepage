import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentRoot = new URL(
  '../../src/components/home/Archipelago/',
  import.meta.url,
);

async function source(name: string): Promise<string> {
  return readFile(new URL(name, componentRoot), 'utf8');
}

test('Given desktop scene wiring, When focus sources and selectors are inspected, Then presentation data owns every project variation', async () => {
  const desktop = await source('DesktopScene.tsx');
  const sceneCss = await source('Scene.module.css');

  assert.doesNotMatch(desktop, /FOCUS_IMAGES/);
  assert.doesNotMatch(
    desktop,
    /project\.id\s*===\s*['"](?:displaylab|booksalon|nbbang)['"]/,
  );
  assert.doesNotMatch(
    sceneCss,
    /\[data-island(?:=|\^=|\$=|\*=).*?(?:displaylab|booksalon|nbbang)/i,
  );
  assert.match(
    desktop,
    /dioramas\/\$\{props\.selected\.id\}-focus-v1\.png/,
  );
  assert.match(desktop, /project\.presentation\.labelSafeRegion\.x/);
  assert.match(desktop, /project\.presentation\.labelSafeRegion\.width/);
  assert.match(desktop, /project\.presentation\.labelSafeRegion\.y/);
  assert.match(desktop, /project\.presentation\.labelSafeRegion\.height/);
});

test('Given Wayfarer placement, When its source is inspected, Then crew anchors are normalized through the authored focus box', async () => {
  const wayfarers = await source('WayfarerParty.tsx');

  assert.match(wayfarers, /project\.presentation\.crewAnchors\.codeEngineer/);
  assert.match(wayfarers, /project\.presentation\.crewAnchors\.qaNavigator/);
  assert.match(wayfarers, /project\.presentation\.mobileCrewAnchors/);
  assert.match(wayfarers, /project\.presentation\.focusBox/);
  assert.doesNotMatch(
    wayfarers,
    /project\.id\s*===\s*['"](?:displaylab|booksalon|nbbang)['"]/,
  );
});

test('Given mobile scene motion, When source and OS preferences are inspected, Then order positioning and reduced motion stay deterministic', async () => {
  const mobile = await source('MobileOverview.tsx');
  const sceneCss = await source('Scene.module.css');

  assert.match(
    mobile,
    /20\s*\+\s*props\.project\.presentation\.order\s*\*\s*30/,
  );
  assert.match(
    sceneCss,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.mobileOverviewArtwork\s*\{\s*transition:\s*none;/,
  );
});
