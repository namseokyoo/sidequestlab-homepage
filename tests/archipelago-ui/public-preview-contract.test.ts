import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

import { getArchipelagoCopy } from '../../src/components/home/Archipelago/copy.ts';

const componentRoot = new URL(
  '../../src/components/home/Archipelago/',
  import.meta.url,
);

async function componentSource(name: string): Promise<string> {
  return readFile(new URL(name, componentRoot), 'utf8');
}

async function routeSource(path: string): Promise<string> {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

async function archipelagoComponentSource(): Promise<string> {
  const entries = await readdir(componentRoot, { withFileTypes: true });
  const sources = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
      .map((entry) => componentSource(entry.name)),
  );
  return sources.join('\n');
}

test('Given public and preview routes, When source ownership is inspected, Then only the server route enables preview controls', async () => {
  const previewRoute = await routeSource(
    '../../src/app/[locale]/archipelago-preview/page.tsx',
  );
  const publicRoute = await routeSource('../../src/app/[locale]/page.tsx');
  const experience = await componentSource('ArchipelagoExperience.tsx');

  assert.match(previewRoute, /experienceMode=(?:"preview"|\{'preview'\})/);
  assert.doesNotMatch(previewRoute, /searchParams|useSearchParams|location\.search/);
  assert.match(previewRoute, /index:\s*false[\s\S]*follow:\s*false/);
  assert.doesNotMatch(
    publicRoute,
    /ArchipelagoExperience|ExperienceControls|experienceMode=(?:"preview"|\{'preview'\})/,
  );
  assert.doesNotMatch(publicRoute, /searchParams|useSearchParams|location\.search/);
  assert.match(experience, /experienceMode/);
  assert.match(
    experience,
    /preview=\{experienceMode\s*===\s*['"]preview['"]\}/,
  );
  assert.equal(
    experience.match(
      /experienceMode\s*===\s*['"]preview['"]\s*\?\s*\(\s*<ExperienceControls/g,
    )?.length,
    2,
  );
});

test('Given Korean and English copy, When preview and unavailable states render, Then both locales expose the same contract', () => {
  const ko = getArchipelagoCopy('ko');
  const en = getArchipelagoCopy('en');
  const requiredKeys = [
    'previewDisclosure',
    'unavailableLive',
    'unavailableEvidence',
    'symbolicGuides',
  ] as const;

  assert.deepEqual(Object.keys(ko).sort(), Object.keys(en).sort());
  for (const key of requiredKeys) {
    assert.equal(key in ko, true);
    assert.equal(key in en, true);
  }
});

test('Given project actions, When live or evidence destinations are absent, Then direct paths persist with explicit unavailable text', async () => {
  const detail = await componentSource('ProjectDetail.tsx');

  for (const destination of ['detailHref', 'liveHref', 'evidenceHref']) {
    assert.match(detail, new RegExp(destination));
  }
  assert.match(
    detail,
    /project\.liveHref\s*===\s*null\s*\?\s*\([\s\S]*?copy\.unavailableLive[\s\S]*?\)\s*:\s*\(\s*<a[^>]+href=\{project\.liveHref\}/,
  );
  assert.match(
    detail,
    /project\.evidenceHref\s*===\s*null\s*\?\s*\([\s\S]*?copy\.unavailableEvidence[\s\S]*?\)\s*:\s*\(\s*<a[^>]+href=\{project\.evidenceHref\}/,
  );
});

test('Given the responsive project feed, When its source is inspected, Then it owns no duplicate Map or Wayfarer tab surface', async () => {
  const mobile = await componentSource('MobileFleetFeed.tsx');

  assert.doesNotMatch(mobile, /TAB_IDS|role="tablist"|role="tabpanel"/);
  assert.doesNotMatch(mobile, /from ['"]next\/image['"]/);
  assert.doesNotMatch(mobile, /data-island|styles\.map|<svg\b/);
});

test('Given visible project facts, When component ownership is audited, Then each fact has exactly one declared owner', async () => {
  const source = await archipelagoComponentSource();

  for (const fact of ['summary', 'progress', 'outcome', 'updated']) {
    const matches = source.match(
      new RegExp(`data-fact-owner=[{]?[\"']${fact}[\"'][}]?`, 'g'),
    );
    assert.equal(matches?.length ?? 0, 1, `${fact} must have one visible owner`);
  }
});

test('Given public-facing source, When claims are audited, Then decorative clock and active-work implications are absent', async () => {
  const source = [
    await archipelagoComponentSource(),
    await componentSource('copy.ts'),
  ].join('\n');

  assert.doesNotMatch(source, /16:10|[\"'>]\s*LIVE\s*[\"'<]/);
  const claimPattern = /\breal[- ]?time\b|\brealtime\b|실시간|currently\s+working|current\s+work(?:\s+log)?|active\s+work(?:ing)?|현재\s*(?:작업|업무)\s*중/iu;
  const qualificationPattern = /\bnot\b|non-real|아닙|아니|비실시간|모의|simulat|snapshot|published/iu;
  for (const line of source.split('\n').filter((candidate) => claimPattern.test(candidate))) {
    assert.match(line, qualificationPattern);
  }
});
