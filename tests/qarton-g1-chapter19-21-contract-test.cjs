'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const choice=(chapter,id)=>{const c=chapter.choices.find(c=>c.id===id);assert.ok(c,id);return c;};

test('Yasmin drawing only allows route copy by scoped consent',()=>{
 const c=load('p2-yasmin-drawing');
 assert.equal(c.optional,true);
 assert.deepEqual(c.choices.map(x=>x.id),['copyRouteWithConsent','requestGuidedVisit','keepDrawingPrivate']);
 assert.deepEqual(choice(c,'copyRouteWithConsent').proposedState,{yasminMapConsent:'routeOnly',yasminRouteCopy:true});
 assert.deepEqual(choice(c,'requestGuidedVisit').proposedState,{yasminMapConsent:'guidedVisit',yasminRouteCopy:false});
 assert.deepEqual(choice(c,'keepDrawingPrivate').proposedState,{yasminMapConsent:'private',yasminRouteCopy:false});
 assert.equal(c.continuity.guidedVisit,'requires-yasmin-present-and-safe-route');
 assert.equal(c.continuity.houseProof,'independent-witness-or-civic-record');
 assert.equal(c.continuity.timeCost,'pending-editorial-balance');
 assert.equal(c.runtimeIntegrated,false);
});

test('signal delivery is separate from public release and device failure cannot confirm receipt',()=>{
 const c=load('p2-last-signal');
 assert.deepEqual(c.choices.map(x=>x.id),['sendAuthorizedSummary','sendSealedCourier','testOnly']);
 assert.deepEqual(c.choices.map(x=>x.costMinutes),[2,3,1]);
 assert.deepEqual(choice(c,'sendAuthorizedSummary').proposedState,{signalDelivery:'radioSummary',signalReceipt:'confirmedSingleHouse'});
 assert.deepEqual(choice(c,'sendSealedCourier').proposedState,{signalDelivery:'courier',signalReceipt:'pending'});
 assert.deepEqual(choice(c,'testOnly').proposedState,{signalDelivery:'testOnly',signalReceipt:'confirmedSingleHouse'});
 assert.equal(c.continuity.brokenDevice,'radio-choice-requires-paper-fallback-confirmation-no-false-receipt');
 assert.equal(c.continuity.unknownConsent,'independent-facts-only');
 assert.equal(c.continuity.endingPolicy,'no-light-shadow-unlock');
 assert.equal(c.runtimeIntegrated,false);
});
