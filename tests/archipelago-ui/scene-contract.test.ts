import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseFleetPresentationManifest } from '../../src/lib/archipelago/parse-manifest.ts';

function readManifest(): unknown {
  return JSON.parse(
    readFileSync(
      new URL(
        '../../src/data/archipelago/presentation-manifest.v1.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
}

function pointInside(
  point: { readonly x: number; readonly y: number },
  box: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  },
): boolean {
  return point.x >= box.x
    && point.x <= box.x + box.width
    && point.y >= box.y
    && point.y <= box.y + box.height;
}

test('Given the authored scene manifest, When it is parsed, Then every project exposes bounded focus metadata', () => {
  const manifest = parseFleetPresentationManifest(readManifest());

  assert.notEqual(manifest, null);
  if (manifest === null) return;
  assert.deepEqual(
    manifest.projects.map((project) => project.projectId),
    ['displaylab', 'booksalon', 'nbbang'],
  );
  assert.equal(new Set(manifest.projects.map((project) => project.emblem.key)).size, 3);
  for (const project of manifest.projects) {
    assert.equal(project.focusScaleCap >= 1 && project.focusScaleCap <= 2.5, true);
    assert.equal(pointInside(project.crewAnchors.codeEngineer, project.focusBox), true);
    assert.equal(pointInside(project.crewAnchors.qaNavigator, project.focusBox), true);
    assert.equal(project.mobileCrewAnchors.codeEngineer.x >= 0.12, true);
    assert.equal(project.mobileCrewAnchors.qaNavigator.x <= 0.88, true);
    assert.equal(project.mobileCrewAnchors.codeEngineer.y >= 0.56, true);
    assert.equal(project.mobileCrewAnchors.qaNavigator.y <= 0.68, true);
    assert.equal(pointInside(project.emblem.anchor, project.focusBox), true);
    assert.equal(
      project.landmarkAnchors.every((landmark) =>
        pointInside(landmark.anchor, project.focusBox)),
      true,
    );
    assert.equal(project.landmarkAnchors.length >= 2, true);
    assert.equal(
      new Set(project.landmarkAnchors.map((landmark) => landmark.key)).size,
      project.landmarkAnchors.length,
    );
    assert.equal(
      pointInside(
        {
          x: project.labelSafeRegion.x,
          y: project.labelSafeRegion.y,
        },
        project.focusBox,
      )
      && pointInside(
        {
          x: project.labelSafeRegion.x + project.labelSafeRegion.width,
          y: project.labelSafeRegion.y + project.labelSafeRegion.height,
        },
        project.focusBox,
      ),
      true,
    );
  }
});

test('Given a malformed focus region, When the manifest is parsed, Then it fails closed', () => {
  const manifest = {
    schemaVersion: '1.0',
    navigatorBoatKey: 'visitor-navigator-boat',
    projects: [
      {
        projectId: 'displaylab',
        order: 0,
        portKey: 'forge-port',
        islandKey: 'displaylab-island',
        routeKey: 'displaylab-route',
        focusBox: { x: 0.8, y: 0.2, width: 0.3, height: 0.5 },
        focusScaleCap: 1.8,
        crewAnchors: {
          codeEngineer: { x: 0.85, y: 0.5 },
          qaNavigator: { x: 0.9, y: 0.5 },
        },
        landmarkAnchors: [
          { key: 'display-pavilion', anchor: { x: 0.85, y: 0.35 } },
          { key: 'swatch-garden', anchor: { x: 0.9, y: 0.4 } },
        ],
        emblem: { key: 'display-prism', anchor: { x: 0.82, y: 0.25 } },
        labelSafeRegion: { x: 0.82, y: 0.25, width: 0.2, height: 0.1 },
      },
    ],
  };

  assert.equal(parseFleetPresentationManifest(manifest), null);
});

test('Given an anchor outside its authored focus region, When parsed, Then the manifest fails closed', () => {
  const manifest = {
    schemaVersion: '1.0',
    navigatorBoatKey: 'visitor-navigator-boat',
    projects: [
      {
        projectId: 'displaylab',
        order: 0,
        portKey: 'forge-port',
        islandKey: 'displaylab-island',
        routeKey: 'displaylab-route',
        focusBox: { x: 0.2, y: 0.2, width: 0.5, height: 0.5 },
        focusScaleCap: 1.8,
        crewAnchors: {
          codeEngineer: { x: 0.1, y: 0.5 },
          qaNavigator: { x: 0.5, y: 0.5 },
        },
        landmarkAnchors: [
          { key: 'display-pavilion', anchor: { x: 0.35, y: 0.35 } },
          { key: 'swatch-garden', anchor: { x: 0.55, y: 0.4 } },
        ],
        emblem: { key: 'display-prism', anchor: { x: 0.25, y: 0.25 } },
        labelSafeRegion: { x: 0.25, y: 0.25, width: 0.2, height: 0.1 },
      },
    ],
  };

  assert.equal(parseFleetPresentationManifest(manifest), null);
});

test('Given invalid scale or authored geometry, When parsed, Then every focus boundary fails closed', () => {
  const manifest = parseFleetPresentationManifest(readManifest());
  assert.notEqual(manifest, null);
  const project = manifest?.projects[0];
  assert.notEqual(project, undefined);
  if (manifest === null || project === undefined) return;

  const invalidProjects = [
    { ...project, focusScaleCap: 2.6 },
    {
      ...project,
      landmarkAnchors: project.landmarkAnchors.map((landmark, index) =>
        index === 0
          ? { ...landmark, anchor: { x: 0, y: 0 } }
          : landmark),
    },
    { ...project, emblem: { ...project.emblem, anchor: { x: 1, y: 1 } } },
    {
      ...project,
      labelSafeRegion: {
        ...project.labelSafeRegion,
        width: project.focusBox.width,
      },
    },
  ];

  for (const invalidProject of invalidProjects) {
    assert.equal(
      parseFleetPresentationManifest({
        ...manifest,
        projects: [invalidProject, ...manifest.projects.slice(1)],
      }),
      null,
    );
  }
});
