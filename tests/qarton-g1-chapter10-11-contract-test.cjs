'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
for(const [id,count,choices] of [['p1-smoke-door',26,['warnNoor','helpNearby']],['p1-gate-manifest',37,['yieldSeat','keepGroup','appealManifest','keepWithNoor','entrustSalim','entrustSara']]]){
 test(id+' markers and choices match Astra source',()=>{
  const manuscript=read('tests/fixtures/qarton-g1-'+id+'.md');
  const chapter=JSON.parse(read('game-content/story/chapters/'+id+'.json'));
  const markers=[...manuscript.matchAll(/<!-- *([a-zA-Z0-9.-]+) *-->/g)].map(m=>m[1]);
  assert.equal(markers.length,count);
  assert.equal(new Set(markers).size,count);
  assert.deepEqual(chapter.textKeys,markers);
  assert.deepEqual(chapter.choices.map(c=>c.id),choices);
  assert.deepEqual(chapter.choices.map(c=>c.textKey),markers.filter(k=>k.includes('.choice.')));
  assert.equal(chapter.status,'draft-not-runtime');
  assert.equal(chapter.runtimeIntegrated,false);
  assert.equal(chapter.legacySaveIndex,null);
 });
}
test('chapter 10 preserves family-signal fallback and separate aftercare',()=>{
 const ch=JSON.parse(read('game-content/story/chapters/p1-smoke-door.json'));
 assert.equal(ch.entryAfter,'legacy-07');
 assert.equal(ch.exitBefore,'p1-gate-manifest');
 assert.equal(ch.missingLegacyStatePolicy,'improvised');
 assert.deepEqual(ch.choices.map(c=>c.timeCostMinutes),[1,2]);
 assert.equal(ch.choices[0].trust.noor,5);
});
test('chapter 11 never commits a sacrifice or creates an absent holder',()=>{
 const ch=JSON.parse(read('game-content/story/chapters/p1-gate-manifest.json'));
 assert.equal(ch.entryAfter,'p1-smoke-door');
 assert.equal(ch.exitBefore,'legacy-08');
 assert.equal(ch.missingLegacyStatePolicy,'unknown');
 assert.deepEqual(ch.choices.slice(0,3).map(c=>c.proposedState.lastSeat),['yielded','group','appeal']);
 assert.deepEqual(ch.choices.slice(3).map(c=>c.proposedState.manifestHolder),['noor','salim','sara']);
 assert.ok(!ch.outputs.includes('ending'));
});
