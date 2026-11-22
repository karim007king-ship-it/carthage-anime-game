'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const registry=read('docs/qarton-unified-id-registry.proposal.json');

test('all draft manuscript text markers have globally unique IDs owned by their chapter',()=>{
 const seen=new Map();let count=0;
 for(const scene of registry.scenes.filter(s=>s.scope==='draft')){
  const chapter=read('game-content/story/chapters/'+scene.id+'.json');
  const local=new Set();
  for(const key of chapter.textKeys){
   assert.equal(typeof key,'string',scene.id);
   assert.ok(key.startsWith('story.'+scene.id+'.'),scene.id+': foreign key '+key);
   assert.ok(!local.has(key),scene.id+': repeated '+key);
   assert.ok(!seen.has(key),scene.id+': collision with '+seen.get(key));
   local.add(key);seen.set(key,scene.id);count++;
  }
  const choices=chapter.choices.map(c=>c.textKey);
  const listed=chapter.choiceTextKeys;
  assert.equal(new Set(listed).size,listed.length,scene.id+': duplicate choice text key');
  for(const key of choices){
   assert.ok(listed.includes(key),scene.id+': primary choice missing from choiceTextKeys '+key);
   assert.ok(local.has(key),scene.id+': choice without chapter text '+key);
   assert.ok(key.startsWith('story.'+scene.id+'.choice.'),scene.id+': non-choice label '+key);
  }
  for(const key of listed){
   assert.ok(local.has(key),scene.id+': listed choice key absent from manuscript '+key);
   assert.ok(key.startsWith('story.'+scene.id+'.choice.'),scene.id+': invalid choice key '+key);
   if(!choices.includes(key))assert.ok(key.endsWith('.guard'),scene.id+': unexpected non-decision choice text '+key);
  }
 }
 assert.equal(count,583,'Current pinned 18-chapter draft key count; revise only with verified manuscript update');
});

test('new chapter keys cannot overlap original Tunisian locale namespace',()=>{
 const tn=read('game-content/locales/tn.json');
 const originalKeys=new Set(Object.keys(tn.texts??{}));
 assert.ok(originalKeys.size>0);
 for(const scene of registry.scenes.filter(s=>s.scope==='draft')){
  const chapter=read('game-content/story/chapters/'+scene.id+'.json');
  for(const key of chapter.textKeys)assert.ok(!originalKeys.has(key),scene.id+': legacy text key collision '+key);
 }
});
