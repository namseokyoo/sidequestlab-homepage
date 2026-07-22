import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

const previewRoute = new URL(
  '../../src/app/[locale]/archipelago-preview/page.tsx',
  import.meta.url,
);

test('Given the approved slice, When the preview surface is inspected, Then a dedicated route exists', () => {
  assert.equal(existsSync(previewRoute), true);
});
