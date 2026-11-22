'use strict';
// Draft-only regression: inspect/resume must never mutate a legacy save object.
// This is not a production Android save/restore integration test.
const test=require('node:test');
const assert=require('node:assert/strict');
const {planDraftResume}=require('../scripts/qarton-g1-draft-resume-plan.cjs');
const gate=require('../game-content/story/chapters/p1-gate-manifest.json');
const cost=require('../game-content/story/chapters/p2-protection-cost.json');
const checkpoint=(chapter,groups)=>({schemaVersion:1,chapterId:chapter.id,groups});
const originalSave=()=>({
 app:'shiganshina',version:1,part:'part1',sceneIdx:4,lineIdx:3,
 timeLeft:52,health:100,trust:{lina:60,nour:25,father:61},
 inventory:['صورة العائلة','مفتاح المخزن'],flags:{gateVisited:true},
 choicesHistory:['الاختيار الأصلي'],lastChoice:'الاختيار الأصلي'
});
const freezeDeep=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freezeDeep);Object.freeze(o);}return o;};

test('every chapter 11 seat/custody combination preserves an original frozen save',()=>{
 const save=freezeDeep(originalSave()),before=JSON.stringify(save);
 const seat=gate.choiceGroups[0].choiceIds,custody=gate.choiceGroups[1].choiceIds;
 for(const a of seat)for(const b of custody){
  const cp=checkpoint(gate,{seat:a,manifestCustody:b});
  const encoded=JSON.stringify(cp);
  for(let repeat=0;repeat<3;repeat++){
   const plan=planDraftResume(gate,JSON.parse(encoded),{});
   assert.deepEqual(plan,{valid:true,completed:['seat','manifestCustody'],pending:[],skipped:[]});
   assert.equal(JSON.stringify(save),before);
  }
 }
 assert.equal(save.sceneIdx,4);
 assert.equal(save.lineIdx,3);
});

test('chapter 22 Elias presence permutations never modify original saves or fabricate groups',()=>{
 const save=freezeDeep(originalSave()),before=JSON.stringify(save);
 for(const boat of cost.choiceGroups[0].choiceIds){
  const partial=checkpoint(cost,{boat});
  for(const presence of [true,false]){
   const plan=planDraftResume(cost,JSON.parse(JSON.stringify(partial)),{'elias-present':presence});
   assert.equal(plan.valid,true);
   assert.deepEqual(plan.completed,['boat']);
   assert.deepEqual(plan.pending,presence?['eliasPage']:[]);
   assert.deepEqual(plan.skipped,presence?[]:['eliasPage']);
   assert.equal(JSON.stringify(save),before);
  }
  assert.equal(planDraftResume(cost,partial,{}).reason,'unknown-presence');
  assert.equal(JSON.stringify(save),before);
 }
});

test('a legacy save is never a valid draft checkpoint, including after JSON roundtrip',()=>{
 const save=originalSave(),before=JSON.stringify(save);
 for(const chapter of [gate,cost]){
  const plan=planDraftResume(chapter,JSON.parse(before),{'elias-present':true});
  assert.equal(plan.valid,false);
  assert.equal(JSON.stringify(save),before);
 }
});
