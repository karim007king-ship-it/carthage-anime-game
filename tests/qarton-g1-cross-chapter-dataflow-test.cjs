'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const scenes=read('docs/qarton-unified-id-registry.proposal.json').scenes.filter(s=>s.scope==='draft');
const drafts=scenes.map(s=>read('game-content/story/chapters/'+s.id+'.json'));
const external=new Set(['presentCharacters','legacyInventory','routeSafety','signalDevice','noorManifest']);

test('all declared inputs have an earlier draft producer or explicit external source',()=>{
 const produced=new Map();
 for(const chapter of drafts){
  assert.equal(chapter.displayChapter,scenes.find(s=>s.id===chapter.id).displayChapter,chapter.id+': display order mismatch');
  for(const input of chapter.inputs||[]){
   assert.ok(produced.has(input)||external.has(input),chapter.id+': ungrounded input '+input);
   if(produced.has(input))assert.ok(produced.get(input)<chapter.displayChapter,chapter.id+': forward dependency '+input);
  }
  const effects=new Set((chapter.choices||[]).flatMap(choice=>Object.keys(choice.proposedState||{})));
  for(const output of new Set([...(chapter.outputs||[]),...effects])){
   assert.ok(!produced.has(output),chapter.id+': duplicate writer for '+output);
   produced.set(output,chapter.displayChapter);
  }
 }
});

test('original 18 scenes retain original sceneIdx and proposed chapters never get a legacy save index',()=>{
 const registry=read('docs/qarton-unified-id-registry.proposal.json');
 const original=registry.scenes.filter(s=>s.scope==='legacy');
 assert.equal(original.length,18);
 assert.deepEqual(original.map(s=>s.sceneIdx),Array.from({length:18},(_,i)=>i));
 assert.equal(drafts.length,18);
 assert.ok(drafts.every(c=>c.legacySaveIndex===null&&c.runtimeIntegrated===false&&(c.editorialReview==='pending'||(c.editorialReview===undefined&&c.source?.editorialState==='draft'))));
 assert.deepEqual(registry.scenes.map(s=>s.displayChapter),Array.from({length:36},(_,i)=>i+1));
});

test('chapter 22 independent decision groups and chapter 34 return to the original ending sequence',()=>{
 const protection=drafts.find(x=>x.id==='p2-protection-cost');
 assert.deepEqual(protection.choiceGroups.map(g=>g.id),['boat','eliasPage']);
 for(const group of protection.choiceGroups)assert.deepEqual(group.choiceIds,protection.choices.filter(c=>c.group===group.id).map(c=>c.id));
 const handover=drafts.find(x=>x.id==='p3-key-handover');
 assert.equal(handover.exitBefore,'legacy-17');
 const registry=read('docs/qarton-unified-id-registry.proposal.json');
 assert.deepEqual(registry.scenes.slice(-3).map(x=>x.id),['p3-key-handover','legacy-17','legacy-18']);
});
