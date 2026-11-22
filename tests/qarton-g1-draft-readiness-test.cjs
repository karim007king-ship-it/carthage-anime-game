'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const registry=read('docs/qarton-unified-id-registry.proposal.json');
const drafts=registry.scenes.filter(s=>s.scope==='draft');

test('all 18 proposed chapters remain non-runtime with no original save index',()=>{
 assert.equal(drafts.length,18);
 for(const s of drafts){
  const ch=read('game-content/story/chapters/'+s.id+'.json');
  assert.equal(ch.status,'draft-not-runtime',s.id);
  assert.equal(ch.runtimeIntegrated,false,s.id);
  assert.equal(ch.legacySaveIndex,null,s.id);
  assert.ok(Array.isArray(ch.textKeys)&&ch.textKeys.length>0,s.id);
  assert.ok((ch.choices?.length??ch.choiceTextKeys?.length)>0,s.id);
 }
});

test('part 1 structured effects and part 2/3 ID-only contracts are explicit, not mistaken for runtime readiness',()=>{
 const structured=drafts.filter(s=>Array.isArray(read('game-content/story/chapters/'+s.id+'.json').choices));
 const idOnly=drafts.filter(s=>!Array.isArray(read('game-content/story/chapters/'+s.id+'.json').choices));
 assert.deepEqual(structured.map(s=>s.id),['p1-family-promise','p1-family-alley','p1-smoke-door','p1-gate-manifest','p2-relay-hut','p2-names-consent','p2-yasmin-drawing','p2-last-signal','p2-protection-cost','p2-truth-gate']);
 assert.equal(idOnly.length,8);
 for(const s of idOnly){
  const ch=read('game-content/story/chapters/'+s.id+'.json');
  assert.ok(!Array.isArray(ch.choices),s.id+' must not masquerade as executable choices');
  assert.equal(ch.editorialReview,'pending');
 }
});
