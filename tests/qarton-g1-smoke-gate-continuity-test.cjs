'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const smoke=read('p1-smoke-door');
const gate=read('p1-gate-manifest');

test('chapter 10 smoke aftercare is the declared input of chapter 11 gate',()=>{
 assert.ok(smoke.outputs.includes('smokeAftercare'));
 assert.ok(gate.inputs.includes('smokeAftercare'));
 assert.deepEqual(smoke.choices.map(c=>c.proposedState.smokeAftercare),['warnNoor','helpNearby']);
 assert.deepEqual(smoke.choices.map(c=>c.timeCostMinutes),[1,2]);
 assert.equal(smoke.choices.find(c=>c.id==='warnNoor').trust.noor,5);
});

test('chapter 11 choice groups do not overwrite the earlier rescue result',()=>{
 assert.ok(smoke.outputs.includes('smokeRescue'));
 assert.ok(!gate.outputs.includes('smokeRescue'));
 assert.ok(!gate.outputs.includes('smokeAftercare'));
 for(const choice of gate.choices){
  assert.ok(!Object.hasOwn(choice.proposedState,'smokeRescue'));
  assert.ok(!Object.hasOwn(choice.proposedState,'smokeAftercare'));
 }
 assert.equal(gate.continuity.decisionOncePerGroup,true);
});
