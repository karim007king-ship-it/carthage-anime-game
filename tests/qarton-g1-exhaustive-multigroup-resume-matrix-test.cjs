'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planDraftResume}=require('../scripts/qarton-g1-draft-resume-plan.cjs');
const gate=require('../game-content/story/chapters/p1-gate-manifest.json');
const cost=require('../game-content/story/chapters/p2-protection-cost.json');
const cp=(ch,groups)=>({schemaVersion:1,chapterId:ch.id,groups});

test('chapter 11 exhaustively resumes all 3x3 choices without replaying a completed group',()=>{
 const seats=gate.choiceGroups.find(g=>g.id==='seat').choiceIds;
 const custody=gate.choiceGroups.find(g=>g.id==='manifestCustody').choiceIds;
 assert.equal(seats.length,3);assert.equal(custody.length,3);
 assert.deepEqual(planDraftResume(gate,cp(gate,{}),{}),{valid:true,completed:[],pending:['seat','manifestCustody'],skipped:[]});
 for(const seat of seats){
  const partial=cp(gate,{seat});const before=JSON.stringify(partial);
  assert.deepEqual(planDraftResume(gate,partial,{}),{valid:true,completed:['seat'],pending:['manifestCustody'],skipped:[]});
  for(const choice of custody){
   const full=cp(gate,{seat,manifestCustody:choice});
   assert.deepEqual(planDraftResume(gate,full,{}),{valid:true,completed:['seat','manifestCustody'],pending:[],skipped:[]});
  }
  assert.equal(JSON.stringify(partial),before);
 }
 for(const choice of custody)assert.deepEqual(planDraftResume(gate,cp(gate,{manifestCustody:choice}),{}),{valid:true,completed:['manifestCustody'],pending:['seat'],skipped:[]});
});

test('chapter 22 checks every boat choice with Elias present, absent and unknown',()=>{
 const boat=cost.choiceGroups.find(g=>g.id==='boat').choiceIds;
 const testimony=cost.choiceGroups.find(g=>g.id==='eliasPage').choiceIds;
 assert.equal(boat.length,3);assert.equal(testimony.length,3);
 for(const choice of boat){
  const partial=cp(cost,{boat:choice});
  assert.deepEqual(planDraftResume(cost,partial,{'elias-present':false}),{valid:true,completed:['boat'],pending:[],skipped:['eliasPage']});
  assert.deepEqual(planDraftResume(cost,partial,{'elias-present':true}),{valid:true,completed:['boat'],pending:['eliasPage'],skipped:[]});
  assert.equal(planDraftResume(cost,partial,{}).reason,'unknown-presence');
  for(const witnessChoice of testimony){
   const full=cp(cost,{boat:choice,eliasPage:witnessChoice});
   assert.deepEqual(planDraftResume(cost,full,{'elias-present':true}),{valid:true,completed:['boat','eliasPage'],pending:[],skipped:[]});
   assert.equal(planDraftResume(cost,full,{'elias-present':false}).reason,'ineligible-completed-group');
  }
 }
});

test('cross-group choice substitution, foreign chapter and legacy checkpoint fail closed',()=>{
 const bad=cp(gate,{seat:'keepWithNoor'});
 assert.equal(planDraftResume(gate,bad,{}).valid,false);
 assert.equal(planDraftResume(cost,cp(gate,{seat:'yieldSeat'}),{'elias-present':true}).valid,false);
 assert.equal(planDraftResume(gate,{sceneIdx:10,lineIdx:2},{}).valid,false);
});
