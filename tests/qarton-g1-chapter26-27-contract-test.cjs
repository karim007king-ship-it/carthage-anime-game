'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));

test('chapter 26 registry never turns missing persons into deaths or ownership proof',()=>{
 const c=load('p3-survivor-register');
 assert.deepEqual(c.choices.map(x=>x.id),['manifestAppeal','oralWitness','dualDesk']);
 assert.deepEqual(c.choices.map(x=>x.proposedState),[{registryMethod:'manifestAppeal',missingHousehold:'appealFiled'},{registryMethod:'oralWitness',missingHousehold:'oralPending'},{registryMethod:'dualDesk',missingHousehold:'searchOpen'}]);
 assert.equal(c.continuity.missingPerson,'not-equivalent-to-death');
 assert.equal(c.continuity.missingSara,'do-not-render-sara-use-present-alternative');
 assert.equal(c.continuity.unknownPart2,'neutral-introduction-no-inferred-ending');
 assert.equal(c.runtimeIntegrated,false);
});

test('chapter 27 consumes one load and split grants only partial works',()=>{
 const c=load('p3-single-load');
 assert.deepEqual(c.choices.map(x=>x.id),['prioritizeBridge','prioritizeClinic','splitWithLimits']);
 assert.deepEqual(c.choices.map(x=>x.proposedState),[{supplyAllocation:'bridge',bridgeRepair:'started',clinicShelter:'improvised'},{supplyAllocation:'clinic',bridgeRepair:'delayed',clinicShelter:'reinforced'},{supplyAllocation:'split',bridgeRepair:'footpathOnly',clinicShelter:'partial'}]);
 assert.equal(c.continuity.split,'footpath-only-not-two-full-repairs');
 assert.equal(c.continuity.unknownAllocation,'no-retroactive-repair-or-shelter');
 assert.equal(c.continuity.outcome,'rescue-and-treatment-require-later-confirmation');
 assert.equal(c.runtimeIntegrated,false);
});
