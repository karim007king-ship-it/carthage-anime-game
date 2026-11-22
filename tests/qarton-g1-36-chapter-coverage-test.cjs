'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const registry=JSON.parse(read('docs/qarton-unified-id-registry.proposal.json'));
const originals=new Set(registry.scenes.filter(s=>s.scope==='legacy').map(s=>s.id));

test('all 36 chapters have isolated content contracts and stable ordering',()=>{
 const entries=registry.scenes;
 assert.equal(entries.length,36);
 assert.equal(entries.filter(s=>s.scope==='draft').length,18);
 for(let i=0;i<entries.length;i++){
  const entry=entries[i],ch=JSON.parse(read('game-content/story/chapters/'+entry.id+'.json'));
  assert.equal(ch.id,entry.id);
  assert.equal(ch.displayChapter,entry.displayChapter);
  assert.equal(ch.status,'draft-not-runtime');
  if(originals.has(ch.id)) assert.equal(ch.sceneIdx,entry.sceneIdx);
  else {
   assert.equal(ch.legacySaveIndex,null);
   assert.equal(ch.runtimeIntegrated,false);
   assert.equal(ch.entryAfter,entries[i-1].id);
   assert.equal(ch.exitBefore,entries[i+1].id);
   assert.equal(ch.missingLegacyStatePolicy,'unknown');
  }
 }
});
test('all 18 draft manuscripts have exactly matching unique text IDs',()=>{
 for(const entry of registry.scenes.filter(s=>s.scope==='draft')){
  const ch=JSON.parse(read('game-content/story/chapters/'+entry.id+'.json'));
  const manuscript=read('tests/fixtures/qarton-g1-'+entry.id+'.md');
  const ids=[...manuscript.matchAll(/<!-- *([A-Za-z0-9.-]+) *-->/g)].map(x=>x[1]);
  assert.ok(ids.length>0,entry.id);
  assert.equal(new Set(ids).size,ids.length,entry.id+' duplicate IDs');
  assert.deepEqual(ch.textKeys,ids,entry.id+' missing IDs');
  const choices=ids.filter(x=>x.startsWith('story.'+entry.id+'.choice.'));
  const actual=ch.choiceTextKeys??ch.choices.map(x=>x.textKey);
  assert.deepEqual(actual,choices,entry.id+' choice mismatch');
 }
});
