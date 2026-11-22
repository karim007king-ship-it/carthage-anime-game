'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const state=(id,choice)=>{const c=load(id).choices.find(c=>c.id===choice);assert.ok(c,id+'/'+choice);return c.proposedState;};

test('family promise and smoke-door have separate signals and an explicit old-save fallback',()=>{
 assert.equal(state('p1-family-promise','knocks').familySignal,'knocks');
 assert.equal(state('p1-family-promise','mother').familySignal,'mother');
 assert.equal(load('p1-smoke-door').missingLegacyStatePolicy,'improvised');
 assert.deepEqual(load('p1-smoke-door').inputs,['familySignal','presentCharacters']);
 assert.ok(!load('p1-smoke-door').choices.some(c=>'familySignal' in c.proposedState));
});

test('alley witnesses are route-limited, with no fabricated arrival on unknown',()=>{
 assert.deepEqual(state('p1-family-alley','escortFamilies'),{alleyFamilies:'escorted',salimWitness:'present'});
 assert.deepEqual(state('p1-family-alley','markAlley'),{alleyFamilies:'guided',salimWitness:'delayed'});
 assert.deepEqual(state('p1-family-alley','leaveAlley'),{alleyFamilies:'unknown'});
 assert.ok(load('p1-gate-manifest').inputs.includes('alleyFamilies'));
 assert.ok(!load('p1-gate-manifest').outputs.includes('eliasForgeryWitness'));
});

test('smoke aftercare cannot create a rescue ending or Elias testimony',()=>{
 assert.equal(state('p1-smoke-door','warnNoor').smokeAftercare,'warnNoor');
 assert.equal(state('p1-smoke-door','helpNearby').smokeAftercare,'helpNearby');
 assert.ok(load('p1-gate-manifest').inputs.includes('smokeAftercare'));
 assert.ok(!load('p1-smoke-door').outputs.includes('ending'));
});

test('seat decision and manifest custody cannot overwrite each other',()=>{
 const ch=load('p1-gate-manifest');
 for(const c of ch.choices.slice(0,3)){
  assert.ok('lastSeat' in c.proposedState);
  assert.ok(!('manifestHolder' in c.proposedState));
 }
 for(const c of ch.choices.slice(3)){
  assert.ok('manifestHolder' in c.proposedState);
  assert.ok(!('lastSeat' in c.proposedState));
 }
});

test('part III allocation, key authority and care are separate chapter decisions',()=>{
 const specs=[['p3-single-load',['prioritizeBridge','prioritizeClinic','splitWithLimits']],['p3-karim-key',['karimLogged','jointCommittee','auditHold']],['p3-medicine-cost',['triageWater','repairRequest','referralNetwork']]];
 for(const [id,required] of specs){
  const ch=load(id),keys=ch.choiceTextKeys.map(k=>k.split('.choice.')[1]);
  for(const key of required) assert.ok(keys.includes(key),id+'/'+key);
  assert.equal(ch.runtimeIntegrated,false);
  assert.equal(ch.legacySaveIndex,null);
 }
});
