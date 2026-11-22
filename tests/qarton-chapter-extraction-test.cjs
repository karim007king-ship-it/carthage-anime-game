'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const chapter=read('game-content/story/chapters/legacy-01.json');
const story=read('game-content/story/manifest.json');
const backgrounds=read('game-content/backgrounds/manifest.json');
const characters=read('game-content/characters/manifest.json');

test('first extracted chapter keeps original identity and visual source',()=>{
 assert.equal(chapter.status,'draft-not-runtime');
 assert.equal(chapter.id,'legacy-01');
 assert.equal(chapter.sceneIdx,0);
 assert.equal(chapter.displayChapter,story.chapters.find(x=>x.id===chapter.id).displayChapter);
 const source=backgrounds.legacySceneVisualCrosswalk.find(x=>x.sceneIdx===0);
 assert.equal(chapter.locationRef,source.locationRef);
 assert.equal(chapter.backgroundVariable,source.embeddedBackgroundVariable);
});
test('first chapter dialogue and hotspots retain S1 structure',()=>{
 assert.equal(chapter.lines.length,5);
 assert.equal(chapter.hotspots.length,3);
 assert.deepEqual(chapter.lines.map(x=>x.speakerId),['role.narrator','char.ryan','char.sara','char.lina','role.narrator']);
 const ids=new Set(characters.characters.map(x=>x.ref));
 for(const line of chapter.lines) if(line.speakerId.startsWith('char.')) assert.ok(ids.has(line.speakerId));
 assert.deepEqual(chapter.hotspots.map(x=>x.legacyId),['window','photo','table']);
 assert.deepEqual(chapter.hotspots.map(x=>x.effect),[{x:72,y:34,courage:8,clue:'crack'},{x:28,y:30,courage:6},{x:52,y:68}]);
});
test('first chapter choice IDs and effects are immutable',()=>{
 assert.deepEqual(chapter.choices.map(x=>x.legacyId),['stay','market','ask']);
 assert.deepEqual(chapter.choices.map(x=>x.effect),[
  {time:2,courage:6,flag:'protectedLina',trust:{lina:15}},
  {time:3,courage:10,flag:'wentMarket',trust:{father:8}},
  {time:1,courage:4,flag:'askedMother',trust:{lina:5}}
 ]);
 assert.equal(chapter.hotspots.find(x=>x.id==='photo').legacyItemValue,'صورة العائلة');
 assert.equal(chapter.hotspots.find(x=>x.id==='table').legacyItemValue,'مفتاح المخزن');
});
