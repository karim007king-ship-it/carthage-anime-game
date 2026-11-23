'use strict';

// Independent design contract; this does not load or modify the production runtime.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const storyStart = source.indexOf('an=[');
const appStateStart = source.indexOf('let j=an[T]', storyStart);
assert.ok(storyStart >= 0 && appStateStart > storyStart, 'legacy story array and current-scene lookup exist');
const chapterHeaders = [...source.slice(storyStart, appStateStart).matchAll(/\{id:(\d+),title:"([^"]+)",place:"([^"]+)"/g)];
assert.equal(chapterHeaders.length, 18, 'the original story contains 18 scene records');
assert.deepEqual(chapterHeaders.map(([, id]) => Number(id)), Array.from({length: 18}, (_, i) => i + 1));

function buildRegistry(legacy, extensionKeys) {
  const entries = [
    ...legacy.map((scene, engineIndex) => ({key: `legacy-${String(engineIndex + 1).padStart(2, '0')}`, engineIndex, kind: 'legacy', scene})),
    ...extensionKeys.map((key, index) => ({key, engineIndex: legacy.length + index, kind: 'new'}))
  ];
  const byIndex = new Map(entries.map(entry => [entry.engineIndex, entry]));
  const byKey = new Map(entries.map(entry => [entry.key, entry]));
  assert.equal(byIndex.size, entries.length, 'engine indices are unique');
  assert.equal(byKey.size, entries.length, 'stable keys are unique');
  return {entries, byIndex, byKey};
}

const originalScenes = chapterHeaders.map(([, id, title, place]) => ({id: Number(id), title, place}));
const extensionKeys = Array.from({length: 18}, (_, i) => `fixture-extension-${String(i + 1).padStart(2, '0')}`);
const registry = buildRegistry(originalScenes, extensionKeys);
assert.equal(registry.entries.length, 36);
assert.deepEqual(registry.entries.slice(0, 18).map(entry => entry.engineIndex), Array.from({length: 18}, (_, i) => i));
assert.deepEqual(registry.entries.slice(0, 18).map(entry => entry.scene.id), Array.from({length: 18}, (_, i) => i + 1));
assert.deepEqual(registry.entries.slice(18).map(entry => entry.engineIndex), Array.from({length: 18}, (_, i) => i + 18));

// Existing save envelope is kept byte-for-byte in shape: only its numeric sceneIdx resolves.
for (const sceneIdx of [0, 4, 7, 8, 13, 14, 17]) {
  const oldSave = {app: 'shiganshina', version: 1, sceneIdx, part: sceneIdx < 8 ? 'part1' : sceneIdx < 14 ? 'part2' : 'part3', state: {time: 32, health: 80, courage: 61}};
  const resolved = registry.byIndex.get(oldSave.sceneIdx);
  assert.equal(resolved.key, `legacy-${String(sceneIdx + 1).padStart(2, '0')}`);
  assert.deepEqual({...oldSave, sceneIdx: resolved.engineIndex}, oldSave);
}

// New chapters can use the same numeric save field after append-only registration.
for (const engineIndex of [18, 19, 34, 35]) {
  const entry = registry.byIndex.get(engineIndex);
  const save = {app: 'shiganshina', version: 1, sceneIdx: engineIndex, part: 'part3', state: {time: 24, health: 70, courage: 55}};
  assert.equal(registry.byKey.get(entry.key).engineIndex, save.sceneIdx);
  assert.equal(registry.byIndex.get(save.sceneIdx).key, entry.key);
  assert.equal(save.part, 'part3');
}
assert.equal(registry.byIndex.get(-1), undefined);
assert.equal(registry.byIndex.get(36), undefined);
console.log('Story registry contract: PASS (18 legacy indices unchanged; 18 append-only extension indices; save envelope unchanged)');
