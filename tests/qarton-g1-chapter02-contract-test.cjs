'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const chapter=JSON.parse(read('game-content/story/chapters/p1-family-promise.json'));
const manuscript=read('tests/fixtures/qarton-g1-ch02-family-promise.md');
const story=JSON.parse(read('game-content/story/manifest.json'));
const chars=JSON.parse(read('game-content/characters/manifest.json'));

test('G1 chapter 02 is a draft with no legacy save index',()=>{
 assert.equal(chapter.status,'draft-not-runtime');
 assert.equal(chapter.runtimeIntegrated,false);
 assert.equal(chapter.legacySaveIndex,null);
 assert.equal(chapter.missingLegacyStatePolicy,'unknown');
 assert.equal(chapter.id,'p1-family-promise');
 assert.equal(chapter.displayChapter,2);
 assert.equal(chapter.entryAfter,'legacy-01');
 assert.equal(chapter.exitBefore,'legacy-02');
 assert.equal(story.chapters.find(s=>s.id===chapter.id).scope,'draft');
});

test('G1 chapter 02 manuscript markers match extracted IDs exactly',()=>{
 const markers=[...manuscript.matchAll(/<!--[ ]*(story[.]p1-family-promise[.][a-z0-9.-]+)[ ]*-->/g)].map(x=>x[1]);
 assert.equal(markers.length,19);
 assert.equal(new Set(markers).size,19);
 assert.deepEqual(chapter.textKeys,markers);
 assert.deepEqual(chapter.choices.map(x=>x.textKey),markers.filter(x=>x.includes('.choice.')));
});

test('G1 proposed choices do not mutate existing legacy save keys',()=>{
 assert.deepEqual(chapter.choices.map(x=>x.id),['knocks','mother']);
 assert.deepEqual(chapter.choices.map(x=>x.proposedState.familySignal),['knocks','mother']);
 const ids=new Set(chars.characters.map(x=>x.ref));
 for(const ref of chapter.characters) assert.ok(ids.has(ref),ref);
 assert.equal(chapter.location.locationRef,null);
});
