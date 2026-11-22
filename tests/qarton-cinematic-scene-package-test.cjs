'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const scene = JSON.parse(fs.readFileSync(path.join(__dirname, '../examples/qarton-single-load-scene.json'), 'utf8'));
const { PILOT_ID, CHOICES } = require('../scripts/qarton-cinematic-pilot-contract.cjs');

test('chapter 27 scene package is presentation-only and matches choice contract', () => {
  assert.equal(scene.schemaVersion, 1);
  assert.equal(scene.sceneId, PILOT_ID);
  assert.equal(scene.chapter, 27);
  assert.equal(scene.presentationOnly, true);
  assert.deepEqual(scene.timeline.find(e => e.type === 'choice-prompt').choiceIds.sort(), Object.keys(CHOICES).sort());
  assert.equal(scene.audio.music, null);
  assert.equal(scene.audio.voice, null);
  assert.ok(scene.reducedMotion && scene.reducedMotion.parallax === false);
  assert.ok(!('flags' in scene) && !('save' in scene) && !('sceneIdx' in scene));
});
test('timeline events have valid, ordered timestamps and supported presentation types', () => {
  const supported = new Set(['camera', 'dialogue', 'choice-prompt']);
  let last = -1;
  for (const event of scene.timeline) {
    assert.ok(supported.has(event.type), event.type);
    assert.ok(Number.isInteger(event.atMs) && event.atMs >= last);
    assert.ok(event.atMs <= scene.durationMs);
    if ('durationMs' in event) assert.ok(event.durationMs > 0 && event.atMs + event.durationMs <= scene.durationMs + 1000);
    last = event.atMs;
  }
  assert.equal(scene.timeline.at(-1).type, 'choice-prompt');
});
test('all layer identifiers are unique and parallax values bounded', () => {
  assert.equal(new Set(scene.layers.map(x => x.id)).size, scene.layers.length);
  for (const layer of scene.layers) assert.ok(layer.parallax >= 0 && layer.parallax <= 1);
});
