'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const chapter=JSON.parse(read('game-content/story/chapters/p1-family-alley.json'));
const manuscript=read('tests/fixtures/qarton-g1-ch04-family-alley.md');

test('chapter 04 keeps its optional, unintegrated legacy boundary',()=>{
 assert.equal(chapter.status,'draft-not-runtime');
 assert.equal(chapter.runtimeIntegrated,false);
 assert.equal(chapter.optional,true);
 assert.equal(chapter.legacySaveIndex,null);
 assert.equal(chapter.missingLegacyStatePolicy,'unknown');
 assert.equal(chapter.entryAfter,'legacy-02');
 assert.equal(chapter.exitBefore,'legacy-03');
});
test('chapter 04 text keys match exactly the Astra manuscript',()=>{
 const ids=[...manuscript.matchAll(/<!-- *([A-Za-z0-9.-]+) *-->/g)].map(m=>m[1]);
 assert.equal(ids.length,20);
 assert.equal(new Set(ids).size,20);
 assert.deepEqual(chapter.textKeys,ids);
 assert.deepEqual(chapter.choices.map(c=>c.textKey),ids.filter(x=>x.includes('.choice.')));
});
test('chapter 04 routes preserve distinct witnesses and no invented rescue',()=>{
 assert.deepEqual(chapter.choices.map(c=>c.id),['escortFamilies','markAlley','leaveAlley']);
 assert.deepEqual(chapter.choices.map(c=>c.proposedState.alleyFamilies),['escorted','guided','unknown']);
 assert.deepEqual(chapter.choices.map(c=>c.proposedState.salimWitness??'unknown'),['present','delayed','unknown']);
 assert.deepEqual(chapter.choices.map(c=>c.timeCostMinutes),[3,1,0]);
 assert.deepEqual(chapter.choices.map(c=>c.trust.salim??0),[8,4,0]);
 assert.equal(chapter.location.locationRef,null);
});
