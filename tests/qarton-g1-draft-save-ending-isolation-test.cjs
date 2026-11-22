'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registry=require('../docs/qarton-unified-id-registry.proposal.json');
const originalEndingIds=new Set(['hero','survivor','sacrifice','traitor','secret','light','shadow','rebuild','guardian']);
const legacy=registry.scenes.filter(s=>s.scope==='legacy');
const drafts=registry.scenes.filter(s=>s.scope==='draft');

test('draft chapters cannot claim original save index or ending identifiers',()=>{
 assert.equal(legacy.length,18);assert.equal(drafts.length,18);
 const indexes=new Set(legacy.map(s=>s.sceneIdx));
 assert.deepEqual([...indexes].sort((a,b)=>a-b),Array.from({length:18},(_,i)=>i));
 for(const scene of drafts){
  const ch=require('../game-content/story/chapters/'+scene.id+'.json');
  assert.equal(ch.legacySaveIndex,null,scene.id);
  assert.equal(ch.runtimeIntegrated,false,scene.id);
  assert.equal(ch.status,'draft-not-runtime',scene.id);
  assert.ok(!Object.hasOwn(ch,'sceneIdx'),scene.id+': draft sceneIdx would collide with legacy save');
  for(const choice of ch.choices){
   const state=choice.proposedState??{};
   for(const key of Object.keys(state)){
    assert.ok(!['ending','endingId','endingKey','sceneIdx','lineIdx','trust','inventory'].includes(key),scene.id+': forbidden choice output '+key);
    if(key.toLowerCase().includes('ending'))assert.ok(!originalEndingIds.has(state[key]),scene.id+': direct ending unlock '+key);
   }
  }
 }
});

test('draft scene identifiers and display indices cannot impersonate legacy save IDs',()=>{
 const ids=new Set();
 for(const scene of registry.scenes){
  assert.ok(!ids.has(scene.id),'duplicate chapter ID '+scene.id);ids.add(scene.id);
  const ch=require('../game-content/story/chapters/'+scene.id+'.json');
  if(scene.scope==='draft'){
   assert.ok(!/^legacy-/.test(ch.id),ch.id);
   assert.ok(ch.displayChapter>=1&&ch.displayChapter<=36,ch.id);
  }
 }
 assert.equal(ids.size,36);
});
