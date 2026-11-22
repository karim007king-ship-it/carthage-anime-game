'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));

test('chapter 31 proposed care outcomes never invent successful repairs or transfers',()=>{
 const c=load('p3-medicine-cost');
 assert.deepEqual(c.choices.map(x=>x.id),['triageWater','repairRequest','referralNetwork']);
 assert.deepEqual(c.choices.map(x=>x.proposedState),[{clinicRecovery:'triageWater',clinicWait:'tracked',clinicMaterials:'unchanged'},{clinicRecovery:'repairRequest',clinicRepair:'pendingMaterials',clinicWait:'extended'},{clinicRecovery:'referralNetwork',clinicTransfers:'pendingSafetyCheck'}]);
 assert.equal(c.continuity.repair,'request-not-completed-until-material-arrival');
 assert.equal(c.continuity.referral,'requires-safe-route-and-confirmed-arrival');
 assert.equal(c.continuity.missingYoussef,'nurse-reads-signed-records-no-absent-testimony');
 assert.equal(c.runtimeIntegrated,false);
});

test('chapter 32 protects family signal in every branch',()=>{
 const c=load('p3-mark-on-stone');
 assert.deepEqual(c.choices.map(x=>x.id),['publicWayfinding','privateMemorial','communityDesign']);
 assert.deepEqual(c.choices.map(x=>x.proposedState),[{stoneMark:'publicWayfinding',familySignalPrivacy:'protected',wayfindingReview:'scheduled'},{stoneMark:'privateMemorial',familySignalPrivacy:'protected'},{stoneMark:'communityDesign',familySignalPrivacy:'protected',wayfindingReview:'pendingTest'}]);
 assert.equal(c.continuity.unknownFamilySignal,'no-invented-knocks-or-thread');
 assert.equal(c.continuity.missingSara,'no-appearance-or-attributed-dialogue');
 assert.equal(c.continuity.communityDesign,'pending-test-not-installed');
 assert.equal(c.runtimeIntegrated,false);
});
