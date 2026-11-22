'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));

for(const id of ['p1-gate-manifest','p2-protection-cost']){
 test(id+': independent decision groups cover each choice once',()=>{
  const c=load(id),groups=c.choiceGroups;
  assert.equal(groups.length,2);
  const all=groups.flatMap(g=>g.choiceIds);
  assert.equal(new Set(all).size,all.length);
  assert.deepEqual(new Set(all),new Set(c.choices.map(x=>x.id)));
  for(const group of groups){
   assert.ok(group.required===true||typeof group.requiredIf==='string');
   for(const choiceId of group.choiceIds){
    const choice=c.choices.find(x=>x.id===choiceId);
    assert.equal(choice.group,group.id);
    const other=groups.find(g=>g.id!==group.id);
    const otherKeys=new Set(c.choices.filter(x=>x.group===other.id).flatMap(x=>Object.keys(x.proposedState)));
    for(const key of Object.keys(choice.proposedState))assert.ok(!otherKeys.has(key),id+': group overlap '+key);
   }
  }
  assert.equal(c.continuity.decisionOncePerGroup,true);
  assert.equal(c.runtimeIntegrated,false);
  assert.equal(c.legacySaveIndex,null);
 });
}

test('missing Elias skips only testimony group, not boat decision',()=>{
 const c=load('p2-protection-cost');
 assert.equal(c.choiceGroups[0].required,true);
 assert.equal(c.choiceGroups[1].requiredIf,'elias-present');
 assert.equal(c.continuity.missingElias,'skip-eliasPage-group-no-fabricated-testimony');
});

test('legacy restore cannot auto-complete either proposed group',()=>{
 const c=load('p1-gate-manifest');
 assert.equal(c.continuity.restore,'unknown-legacy-draft-state-never-assume-choice-made');
 assert.equal(c.continuity.checkpoint,'draft-sidecar-only-never-write-legacy-save');
});
