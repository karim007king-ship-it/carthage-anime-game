'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const cost=read('p2-protection-cost');
const gate=read('p2-truth-gate');
const {inspectDraftCheckpoint}=require('../scripts/qarton-g1-draft-checkpoint-inspector.cjs');

test('chapter 22 Elias testimony is a conditional independent group, not a boat effect',()=>{
 assert.deepEqual(cost.choiceGroups.map(g=>[g.id,g.required===true,g.requiredIf||null]),[['boat',true,null],['eliasPage',false,'elias-present']]);
 assert.equal(cost.continuity.missingElias,'skip-eliasPage-group-no-fabricated-testimony');
 for(const choice of cost.choices.filter(c=>c.group==='boat')){
  assert.ok(!Object.hasOwn(choice.proposedState,'eliasPage'));
  assert.ok(!Object.hasOwn(choice.proposedState,'eliasSourceConsent'));
 }
 for(const choice of cost.choices.filter(c=>c.group==='eliasPage')){
  assert.ok(!Object.hasOwn(choice.proposedState,'boatDecision'));
  assert.ok(Object.hasOwn(choice.proposedState,'eliasSourceConsent'));
 }
});

test('checkpoint containing only boat decision is valid partial state, not evidence of Elias testimony',()=>{
 const checkpoint={schemaVersion:1,chapterId:cost.id,groups:{boat:'evacuateFamily'}};
 assert.deepEqual(inspectDraftCheckpoint(cost,checkpoint),{valid:true,completeGroups:['boat']});
 assert.equal(Object.hasOwn(checkpoint.groups,'eliasPage'),false);
 assert.ok(gate.inputs.includes('eliasPage'));
 assert.ok(gate.inputs.includes('eliasSourceConsent'));
 assert.equal(gate.continuity.unknownConsent,'independent-facts-only');
});

test('chapter 22 explicitly does not unlock light or shadow endings',()=>{
 assert.equal(cost.continuity.endingPolicy,'no-light-shadow-unlock');
 assert.ok(cost.choices.every(c=>!Object.hasOwn(c,'proposedEnding')));
});
