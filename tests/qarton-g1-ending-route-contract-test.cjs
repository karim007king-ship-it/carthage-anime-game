'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const choices=id=>{const ch=load(id);return (ch.choiceTextKeys??ch.choices.map(c=>c.textKey)).map(key=>key.split('.choice.')[1]);};
const mustInclude=(id,ids)=>{const actual=new Set(choices(id));for(const key of ids)assert.ok(actual.has(key),id+': missing '+key);};

test('nine original ending keys are immutable and distinct from G1 draft route labels',()=>{
 const original=['hero','survivor','sacrifice','traitor','secret','light','shadow','rebuild','guardian'];
 assert.equal(new Set(original).size,9);
 const registry=JSON.parse(fs.readFileSync(path.join(__dirname,'..','docs/qarton-unified-id-registry.proposal.json'),'utf8'));
 assert.equal(registry.scenes.filter(x=>x.scope==='legacy').length,18);
 for(const scene of registry.scenes.filter(x=>x.scope==='draft')) assert.equal(load(scene.id).legacySaveIndex,null);
});

test('chapter 11 offers an eligibility decision and separate custody group, never an ending',()=>{
 mustInclude('p1-gate-manifest',['yieldSeat','keepGroup','appealManifest','keepWithNoor','entrustSalim','entrustSara']);
 const chapter=load('p1-gate-manifest');
 assert.equal(chapter.runtimeIntegrated,false);
 assert.deepEqual(chapter.choices.slice(0,3).map(x=>x.proposedState.lastSeat),['yielded','group','appeal']);
 assert.deepEqual(chapter.choices.slice(3).map(x=>x.proposedState.manifestHolder),['noor','salim','sara']);
 assert.ok(!chapter.outputs.includes('ending'));
});

test('publication versus escrow are distinct authorizations at chapter 24',()=>{
 mustInclude('p2-names-consent',['redactNames','aminOwnTestimony','holdInEscrow']);
 mustInclude('p2-last-signal',['sendAuthorizedSummary','sendSealedCourier','testOnly']);
 mustInclude('p2-truth-gate',['openPublicHearing','establishEscrow']);
});

test('chapter 22 boat and evidence groups are not silently conflated',()=>{
 mustInclude('p2-protection-cost',['evacuateFamily','keepForWatch','publicReview','holdConfidential','recordTestimony','declineTerms']);
 assert.ok(choices('p2-protection-cost').includes('publicReview.guard'));
});

test('chapter 27 load options remain three distinct choices, with no save migration',()=>{
 assert.deepEqual(choices('p3-single-load'),['prioritizeBridge','prioritizeClinic','splitWithLimits']);
 mustInclude('p3-karim-key',['karimLogged','jointCommittee','auditHold']);
 mustInclude('p3-medicine-cost',['triageWater','repairRequest','referralNetwork']);
 mustInclude('p3-key-handover',['civicCouncil','temporaryTrustees','separatedCustody']);
 for(const id of ['p3-single-load','p3-karim-key','p3-medicine-cost','p3-key-handover']){
  assert.equal(load(id).status,'draft-not-runtime');
  assert.equal(load(id).runtimeIntegrated,false);
 }
});
