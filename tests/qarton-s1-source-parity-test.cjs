'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const fixture=read('tests/fixtures/qarton-s1-original-scenes.snapshot.json');
const story=read('game-content/story/manifest.json');
const visuals=read('game-content/backgrounds/manifest.json');

test('pinned S1 original-scene catalogue has immutable source identity',()=>{
 assert.equal(fixture.source.blob,'db83f1d7bf8b5b457a82f6cd5c4f06fa14299b23');
 assert.equal(fixture.locale,'tn');
 assert.equal(fixture.scenes.length,18);
 assert.deepEqual(fixture.scenes.map(s=>s.sceneIdx),Array.from({length:18},(_,i)=>i));
});

test('every extracted legacy chapter exactly matches S1 dialogue and choice data',()=>{
 const folder=path.join(root,'game-content/story/chapters');
 const files=fs.readdirSync(folder).filter(x=>/^legacy-[0-9]{2}[.]json$/.test(x)).sort();
 assert.ok(files.length>0);
 for(const filename of files){
  const chapter=read('game-content/story/chapters/'+filename);
  const original=fixture.scenes.find(s=>s.id===chapter.id);
  assert.ok(original,'unknown chapter '+filename);
  const extracted=Object.fromEntries(Object.keys(original).map(k=>[k,chapter[k]]));
  assert.deepEqual(extracted,original,'source mismatch '+filename);
  const display=story.chapters.find(s=>s.id===chapter.id);
  assert.equal(chapter.displayChapter,display.displayChapter);
  const image=visuals.legacySceneVisualCrosswalk.find(x=>x.sceneIdx===original.sceneIdx);
  assert.equal(chapter.locationRef,image.locationRef);
  assert.equal(chapter.backgroundVariable,image.embeddedBackgroundVariable);
  assert.equal(chapter.status,'draft-not-runtime');
 }
});
