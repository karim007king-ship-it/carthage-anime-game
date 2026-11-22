'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));

test('chapter 33 separates negligence from unproven gate closure order',()=>{
 const c=load('p3-hadi-hearing');
 assert.deepEqual(c.choices.map(x=>x.id),['publicFindings','independentInquiry','reparationFirst']);
 assert.ok(c.choices.every(x=>x.proposedState.gateOrderStatus==='unproven'));
 assert.equal(c.continuity.missingHadi,'signed-prior-evidence-only-no-direct-admission');
 assert.equal(c.continuity.missingYoussef,'signed-report-only-no-direct-testimony');
 assert.equal(c.continuity.reparation,'not-waiver-of-claims');
 assert.equal(c.continuity.endingPolicy,'no-part3-completion-or-legacy-ending-here');
 assert.equal(c.runtimeIntegrated,false);
});

test('chapter 34 handover preserves legacy ending route and private records',()=>{
 const c=load('p3-key-handover');
 assert.deepEqual(c.choices.map(x=>x.id),['civicCouncil','temporaryTrustees','separatedCustody']);
 assert.deepEqual(c.choices.map(x=>x.proposedState),[{handoverModel:'civicCouncil',handoverAudit:'publicAppealPrivateRecords',handoverStatus:'acceptedWithReview'},{handoverModel:'temporaryTrustees',handoverAudit:'datedMandate',handoverStatus:'pendingElection'},{handoverModel:'separatedCustody',handoverAudit:'crossOfficeRequests',handoverStatus:'distributedWithChecks'}]);
 assert.equal(c.continuity.privateRecords,'no-witness-names-patient-names-or-yasmin-address');
 assert.equal(c.continuity.emergencyAccess,'always-available-through-documented-route');
 assert.equal(c.continuity.endingPolicy,'legacy-17-then-legacy-18-original-nine-endings-unchanged');
 assert.equal(c.runtimeIntegrated,false);
});
