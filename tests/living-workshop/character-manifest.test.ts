import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(
  readFileSync(
    new URL('../../src/data/workshop-character-clip-manifest.json', import.meta.url),
    'utf8',
  ),
);

const requiredClips = [
  'idle',
  'approach',
  'assemble',
  'inspect',
  'carry',
  'observe',
  'return',
] as const;

const requiredParts = [
  'root',
  'hips',
  'torso',
  'head',
  'leftUpperArm',
  'leftForearm',
  'leftHand',
  'rightUpperArm',
  'rightForearm',
  'rightHand',
  'leftThigh',
  'leftShin',
  'leftFoot',
  'rightThigh',
  'rightShin',
  'rightFoot',
] as const;

test('segmented character manifest declares the complete articulated rig', () => {
  assert.equal(manifest.renderer, 'segmented-svg');
  for (const part of requiredParts) assert.ok(manifest.parts.includes(part), part);
  assert.deepEqual(Object.keys(manifest.sockets).sort(), ['prop', 'tool']);
  assert.deepEqual(manifest.envelopes.desktop, [0.04, 0.3, 0.46, 0.96]);
  assert.deepEqual(manifest.envelopes.compact, [0.03, 0.34, 0.52, 0.96]);
});

test('every required clip exposes normalized samples and recovery metadata', () => {
  for (const clipName of requiredClips) {
    const clip = manifest.clips[clipName];
    assert.ok(clip, clipName);
    assert.ok(clip.durationMs > 0, `${clipName} duration`);
    for (const sampleName of [
      'start',
      'anticipation',
      'actionExtreme',
      'recovery',
      'end',
    ]) {
      assert.ok(sampleName in clip.samples, `${clipName} ${sampleName}`);
    }
    for (const sample of Object.values(clip.samples) as number[]) {
      assert.ok(sample >= 0 && sample <= 1, `${clipName} sample ${sample}`);
    }
    assert.equal(clip.samples.start, 0);
    assert.equal(clip.samples.end, 1);
    assert.ok(clip.recovery.maxPositionErrorCssPx <= 4);
    assert.ok(clip.recovery.maxRotationErrorDeg <= 2);
  }
  for (const steppedClip of ['approach', 'carry', 'return']) {
    assert.ok('leftPlant' in manifest.clips[steppedClip].samples);
    assert.ok('rightPlant' in manifest.clips[steppedClip].samples);
  }
});

test('semantic commands stay inside one bounded 3.2 second action cycle', () => {
  for (const commandName of ['assemble', 'inspect', 'carry', 'observe'] as const) {
    const command = manifest.commands[commandName];
    assert.deepEqual(command.sequence, ['approach', commandName, 'return']);
    const total = command.sequence.reduce(
      (duration: number, clip: string) => duration + manifest.clips[clip].durationMs,
      0,
    );
    assert.equal(command.durationMs, total);
    assert.ok(total <= 3200);
  }
  assert.equal(manifest.commands.static.durationMs, 0);
  assert.deepEqual(manifest.commands.static.sequence, []);
});
