'use strict';
const assert = require('node:assert/strict');
const {registry,resolveByKey,resolveByIndex} = require('../scripts/story-engine-index-registry.cjs');
assert.equal(registry.length,36);
assert.equal(new Set(registry.map(c=>c.sceneKey)).size,36);
assert.deepEqual(registry.map(c=>c.engineIndex),Array.from({length:36},(_,i)=>i));
for(let i=0;i<18;i++){
  assert.equal(registry[i].kind,'legacy');
  assert.equal(registry[i].sceneKey,'legacy-'+String(i+1).padStart(2,'0'));
  assert.equal(resolveByIndex(i),registry[i]);
}
for(let i=18;i<36;i++){
  assert.equal(registry[i].kind,'draft');
  assert.equal(resolveByKey(registry[i].sceneKey),registry[i]);
}
assert.equal(resolveByKey('legacy-05').engineIndex,4);
assert.equal(resolveByKey('p3-single-load').displayChapter,27);
assert.equal(resolveByIndex(99),null);
assert.equal(resolveByIndex('4'),null);
assert.equal(resolveByKey('unknown'),null);
assert.ok(Object.isFrozen(registry));
assert.ok(registry.every(Object.isFrozen));
console.log('Append-only engine index registry: PASS (legacy 0..17, draft 18..35)');
