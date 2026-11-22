'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registry=require('../docs/qarton-unified-id-registry.proposal.json');
const {resolveChapterCharacters}=require('../scripts/qarton-g1-draft-character-resolver.cjs');
const {resolveDraftLocation}=require('../scripts/qarton-g1-draft-location-resolver.cjs');
const drafts=registry.scenes.filter(x=>x.scope==='draft');

test('every draft chapter resolves character identities without mutating source',()=>{
 assert.equal(drafts.length,18);
 for(const scene of drafts){
  const chapter=require('../game-content/story/chapters/'+scene.id+'.json');
  const before=JSON.stringify(chapter);
  const result=resolveChapterCharacters(chapter);
  assert.equal(result.valid,true,scene.id+': '+result.reason);
  assert.equal(result.characters.length,chapter.characters.length,scene.id);
  assert.equal(new Set(result.characters).size,result.characters.length,scene.id);
  assert.equal(JSON.stringify(chapter),before,scene.id+' was mutated');
 }
});

test('all draft chapters fail closed on unapproved visual assets',()=>{
 for(const scene of drafts){
  const chapter=require('../game-content/story/chapters/'+scene.id+'.json');
  const before=JSON.stringify(chapter);
  const result=resolveDraftLocation(chapter);
  assert.equal(result.art,null,scene.id+': unapproved background exposed');
  assert.notEqual(result.reason,'approved',scene.id);
  assert.equal(JSON.stringify(chapter),before,scene.id+' was mutated');
 }
});

test('character and visual adapter cannot fabricate absent cast or background',()=>{
 const chapter=require('../game-content/story/chapters/p1-family-promise.json');
 const presence={ryan:true,lina:false,sara:false};
 assert.deepEqual(resolveChapterCharacters(chapter,presence).characters,['char.ryan']);
 assert.equal(resolveDraftLocation(chapter,{'loc.home':'existing.webp'}).art,null);
});
