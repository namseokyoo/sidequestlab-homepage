import assert from 'node:assert/strict';
import test from 'node:test';

import { sanitizePublicHttpsUrl } from '../../src/lib/archipelago/public-links.ts';

test('Given public project actions, When URLs are sanitized, Then only credential-free HTTPS destinations survive', () => {
  const githubOnly = new Set(['github.com']);

  assert.equal(
    sanitizePublicHttpsUrl('https://github.com/namseokyoo/displaylab', githubOnly),
    'https://github.com/namseokyoo/displaylab',
  );
  assert.equal(sanitizePublicHttpsUrl('javascript:alert(1)'), null);
  assert.equal(sanitizePublicHttpsUrl('http://displaylab.vercel.app'), null);
  assert.equal(sanitizePublicHttpsUrl('https://user:secret@github.com/repo', githubOnly), null);
  assert.equal(sanitizePublicHttpsUrl('https://example.com/repo', githubOnly), null);
  assert.equal(sanitizePublicHttpsUrl('/ko/projects/displaylab'), null);
});
