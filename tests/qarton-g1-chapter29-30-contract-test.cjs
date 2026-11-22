'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));

test('chapter 29 keeps key custody accountable and emergency care open',()=>{
 const c=load('p3-karim-key');
 assert.deepEqual(c.choices.map(x=>x.id),['karimLogged','jointCommittee','auditHold']);
 assert.deepEqual(c.choices.map(x=>x.proposedState),[{keyCustody:'karimLogged',dockOversight:'publicLogPrivateDetails'},{keyCustody:'jointCommittee',dockOversight:'dualApprovalEmergencyException'},{keyCustody:'auditHold',dockOversight:'timedAudit'}]);
 assert.equal(c.continuity.missingKarim,'present-duty-guard-replaces-karim-no-past-testimony');
 assert.equal(c.continuity.auditHold,'independent-emergency-supplies-remain-accessible');
 assert.equal(c.continuity.publicLog,'no-patient-names-or-family-addresses');
 assert.equal(c.runtimeIntegrated,false);
});

test('chapter 30 never converts route evidence into ownership or shelter into waiver',()=>{
 const c=load('p3-house-without-number');
 assert.equal(c.optional,true);
 assert.deepEqual(c.choices.map(x=>x.id),['formalReview','temporaryShelter','communityHearing']);
 assert.deepEqual(c.choices.map(x=>x.proposedState),[{houseClaim:'formalReview',houseEvidence:'partialCorroboration',houseAccess:'deferred'},{houseClaim:'temporaryShelter',houseEvidence:'unresolved',houseAccess:'temporaryOnly'},{houseClaim:'communityHearing',houseEvidence:'publicRouteCorroboration',houseAccess:'pendingHearing'}]);
 assert.equal(c.continuity.property,'route-or-oral-testimony-is-not-title');
 assert.equal(c.continuity.temporaryShelter,'not-waiver-of-property-claim');
 assert.equal(c.continuity.missingYasmin,'no-forced-presence-neighbor-and-register-alternative');
 assert.equal(c.runtimeIntegrated,false);
});
