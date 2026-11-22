'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const registry=read('docs/qarton-unified-id-registry.proposal.json');
const locale=read('game-content/locales/tn.json');
const backgrounds=read('game-content/backgrounds/manifest.json');
const drafts=registry.scenes.filter(s=>s.scope==='draft');

test('draft chapters cannot be represented as translated or visual-ready in the current manifests',()=>{
 assert.equal(locale.status,'draft-not-runtime');
 assert.equal(backgrounds.provenance,'unverified');
 const original=new Set(Object.keys(locale.texts));
 let untranslated=0;
 for(const scene of drafts){
  const chapter=read('game-content/story/chapters/'+scene.id+'.json');
  assert.equal(chapter.runtimeIntegrated,false,scene.id);
  assert.equal(chapter.legacySaveIndex,null,scene.id);
  for(const key of chapter.textKeys){
   assert.ok(!original.has(key),scene.id+': draft key unexpectedly overwrites legacy locale '+key);
   untranslated++;
  }
 }
 assert.equal(untranslated,583,'draft translation coverage baseline changed; review editorial handoff');
});

test('original background inventory is not evidence of draft chapter art clearance',()=>{
 const known=new Set(backgrounds.locations.map(l=>l.ref));
 assert.equal(known.size,17);
 for(const scene of drafts){
  const chapter=read('game-content/story/chapters/'+scene.id+'.json');
  const loc=chapter.location;
  if(!loc)continue;
  if(loc.locationRef!=null)assert.ok(known.has(loc.locationRef),scene.id+': unknown visual reference');
  assert.notEqual(loc.artStatus,'approved',scene.id+': unreviewed art marked approved');
 }
});
