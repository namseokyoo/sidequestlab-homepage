import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentUrl = (name: string) => new URL(
  `../../src/components/home/Archipelago/${name}`,
  import.meta.url,
);

async function source(name: string): Promise<string> {
  return readFile(componentUrl(name), 'utf8');
}

test('Given project islands, When the world map renders, Then desktop owns the stable island anchors', async () => {
  const desktop = await source('DesktopScene.tsx');
  const mobile = await source('MobileFleetFeed.tsx');

  assert.doesNotMatch(desktop, /data-position/);
  assert.doesNotMatch(mobile, /data-position/);
  assert.match(desktop, /data-island=\{project\.islandKey\}/);
  assert.doesNotMatch(mobile, /data-island=\{project\.islandKey\}/);
});

test('Given the approved public catalog, When project cards render, Then every island exposes update and evidence fields', async () => {
  const detail = await source('ProjectDetail.tsx');
  const mobile = await source('MobileFleetFeed.tsx');

  for (const token of ['updatedAtLabel', 'outcome', 'evidenceHref']) {
    assert.match(detail, new RegExp(token));
    assert.match(mobile, new RegExp(token));
  }
});

test('Given mobile project cards, When a project is chosen, Then native buttons expose selection semantics', async () => {
  const mobile = await source('MobileFleetFeed.tsx');

  assert.match(mobile, /projects\.map/);
  assert.match(mobile, /type="button"/);
  assert.match(mobile, /aria-pressed=\{project\.id === selected\.id\}/);
  assert.match(mobile, /onSelect\(project\.id\)/);
});

test('Given the clean-scene contract, When the scene and selected work zone render, Then the visitor and crew have single runtime homes', async () => {
  const scene = await source('DesktopScene.tsx');
  const experience = await source('ArchipelagoExperience.tsx');

  assert.match(scene, /WayfarerParty/);
  assert.doesNotMatch(experience, /<WayfarerParty/);
});

test('Given narrow Korean layouts, When protected phrases render, Then role and activity tokens stay intact', async () => {
  const dialog = await source('CrewGuideDialog.tsx');
  const hero = await source('ProofHero.tsx');

  assert.match(dialog, /roleToken/);
  assert.match(hero, /phraseToken/);
});

test('Given coral actions, When foreground colors are inspected, Then they use the AA ink token', async () => {
  const shell = await source('Shell.module.css');
  const dialog = await source('Dialog.module.css');

  assert.match(shell, /\.actionRow \.primaryLink \{[\s\S]*?color: var\(--arch-ink\)/);
  assert.match(dialog, /\.done \{[\s\S]*?color: var\(--arch-ink\)/);
});
