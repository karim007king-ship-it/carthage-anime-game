'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const registry=read('docs/qarton-unified-id-registry.proposal.json');
const characters=read('game-content/characters/manifest.json');
const backgrounds=read('game-content/backgrounds/manifest.json');
const story=read('game-content/story/manifest.json');
const locales=read('game-content/locales/manifest.json');

test('draft manifests reproduce audited registry without loss',()=>{
  assert.deepEqual(characters.characters.map(x=>x.id),registry.characters.map(x=>x.id));
  assert.deepEqual(backgrounds.locations,registry.locations);
  assert.deepEqual(backgrounds.legacySceneVisualCrosswalk,registry.legacySceneVisualCrosswalk);
  assert.deepEqual(story.chapters,registry.scenes);
});

test('typed references are unique and resolvable',()=>{
  const refs=[...characters.characters.map(x=>x.ref),...backgrounds.locations.map(x=>x.ref)];
  assert.equal(new Set(refs).size,refs.length);
  const locations=new Set(backgrounds.locations.map(x=>x.ref));
  for(const x of backgrounds.legacySceneVisualCrosswalk) assert.ok(locations.has(x.locationRef));
});

test('no draft chapter can impersonate a legacy save index',()=>{
  assert.equal(story.chapters.length,36);
  assert.deepEqual(story.chapters.filter(x=>x.scope==='legacy').map(x=>x.sceneIdx),Array.from({length:18},(_,i)=>i));
  for(const x of story.chapters.filter(x=>x.scope==='draft')) assert.equal(Object.hasOwn(x,'sceneIdx'),false);
});

test('locale manifest remains canonical Tunisian without fake translations',()=>{
  assert.equal(locales.canonical,'tn');
  assert.deepEqual(locales.languages,['tn','ar','en','fr']);
  assert.equal(locales['translationContent'],'not included; see PR #25');
  for(const [name,m] of [['characters',characters],['backgrounds',backgrounds],['story',story],['locales',locales]]) assert.equal(m.status,'draft-not-runtime',name);
});
