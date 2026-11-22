'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const registry = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/qarton-unified-id-registry.proposal.json'), 'utf8'));

test('cross-team registry has unique typed identities', () => {
  assert.equal(registry.kind, 'proposal-only');
  for (const [type, prefix] of [['characters','char.'],['locations','loc.'],['roles','role.']]) {
    const entries = registry[type];
    assert.equal(new Set(entries.map(e => e.id)).size, entries.length);
    for (const entry of entries) {
      assert.match(entry.id, /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
      assert.equal(entry.ref, prefix + entry.id);
    }
  }
});

test('original 18 scenes retain immutable save indices', () => {
  const original = registry.scenes.filter(s => s.scope === 'legacy');
  assert.equal(original.length, 18);
  assert.deepEqual(original.map(s => s.sceneIdx), Array.from({length:18}, (_,i) => i));
  assert.deepEqual(original.map(s => s.id), Array.from({length:18}, (_,i) => 'legacy-' + String(i+1).padStart(2,'0')));
});

test('36 display chapters are complete and proposed scenes have no save index', () => {
  assert.equal(registry.scenes.length, 36);
  assert.deepEqual(registry.scenes.map(s => s.displayChapter), Array.from({length:36},(_,i)=>i+1));
  assert.equal(new Set(registry.scenes.map(s => s.id)).size,36);
  for (const scene of registry.scenes.filter(s => s.scope === 'draft')) assert.equal(Object.hasOwn(scene,'sceneIdx'),false);
});

test('trust aliases and missing draft art stay explicit', () => {
  assert.equal(registry.characters.find(c=>c.id==='noor').trustKey,'nour');
  assert.equal(registry.characters.find(c=>c.id==='youssef').trustKey,'father');
  assert.equal(registry.proposedCharacters.find(c=>c.id==='hala').assetStatus,'missing');
});
