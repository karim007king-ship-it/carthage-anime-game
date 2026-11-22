'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const handover=load('p3-key-handover');
const penultimate=load('legacy-17');
const finale=load('legacy-18');

test('draft chapter 34 hands control back to the two unchanged original closing chapters',()=>{
 assert.equal(handover.entryAfter,'p3-hadi-hearing');
 assert.equal(handover.exitBefore,'legacy-17');
 assert.equal(handover.legacySaveIndex,null);
 assert.equal(handover.runtimeIntegrated,false);
 assert.equal(handover.continuity.endingPolicy,'legacy-17-then-legacy-18-original-nine-endings-unchanged');
 assert.equal(handover.continuity.unknownLegacyState,'neutral-inventory-no-fabricated-handover-history');
});

test('handover governance choices cannot directly trigger an original ending',()=>{
 assert.deepEqual(handover.choices.map(c=>c.id),['civicCouncil','temporaryTrustees','separatedCustody']);
 for(const choice of handover.choices){
  assert.ok(!Object.hasOwn(choice,'proposedEnding'));
  assert.ok(!Object.hasOwn(choice.proposedState,'final'));
  assert.ok(!Object.hasOwn(choice.proposedState,'ending'));
 }
 assert.equal(handover.continuity.privateRecords,'no-witness-names-patient-names-or-yasmin-address');
 assert.equal(handover.continuity.emergencyAccess,'always-available-through-documented-route');
});

test('original chapters 17 and 18 keep rebuild and guardian final effects',()=>{
 assert.deepEqual(penultimate.choices.map(c=>[c.legacyId,c.effect.flag]),[['chooseRebuild','rebuiltCarthage'],['chooseGuardian','guardedCarthage']]);
 assert.deepEqual(finale.choices.map(c=>[c.legacyId,c.effect.final]),[['finalRebuild2','rebuild'],['finalGuardian2','guardian']]);
 assert.ok(finale.choices.every(c=>!Object.hasOwn(c,'proposedState')));
});
