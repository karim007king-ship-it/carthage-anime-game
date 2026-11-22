'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const registry=read('docs/qarton-unified-id-registry.proposal.json');
const known=new Set(registry.characters.map(x=>x.id));
const drafts=registry.scenes.filter(x=>x.scope==='draft');

test('all draft character references resolve to the single canonical character registry',()=>{
 for(const scene of drafts){
  const chapter=read('game-content/story/chapters/'+scene.id+'.json');
  assert.ok(Array.isArray(chapter.characters)&&chapter.characters.length,scene.id);
  for(const ref of chapter.characters){
   const id=ref.startsWith('char.')?ref.slice(5):ref;
   assert.ok(known.has(id),scene.id+': unresolved '+ref);
  }
 }
});

test('all proposed choice keys exist in manuscript marker inventory and all effects have declared outputs',()=>{
 for(const scene of drafts){
  const chapter=read('game-content/story/chapters/'+scene.id+'.json');
  assert.ok(Array.isArray(chapter.choices)&&chapter.choices.length,scene.id);
  assert.ok(Array.isArray(chapter.outputs),scene.id);
  assert.ok(Array.isArray(chapter.choiceTextKeys),scene.id);
  const outputSet=new Set(chapter.outputs);
  const ids=new Set();
  for(const choice of chapter.choices){
   assert.ok(!ids.has(choice.id),scene.id+': duplicate choice '+choice.id);ids.add(choice.id);
   assert.ok(chapter.choiceTextKeys.includes(choice.textKey),scene.id+': unlisted choice '+choice.textKey);
   assert.ok(chapter.textKeys.includes(choice.textKey),scene.id+': missing manuscript marker '+choice.textKey);
   assert.ok(choice.proposedState&&Object.keys(choice.proposedState).length,scene.id+': missing effects '+choice.id);
   for(const key of Object.keys(choice.proposedState))assert.ok(outputSet.has(key),scene.id+'/'+choice.id+': undeclared output '+key);
  }
  assert.equal(chapter.runtimeIntegrated,false,scene.id);
  assert.equal(chapter.legacySaveIndex,null,scene.id);
 }
});
