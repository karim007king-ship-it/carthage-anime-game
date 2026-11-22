'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const gate=load('p2-truth-gate');
const prior=load('p2-protection-cost');

test('chapter 24 draft ending labels are gated authorizations, never runtime unlocks',()=>{
 assert.equal(gate.status,'draft-not-runtime');
 assert.equal(gate.runtimeIntegrated,false);
 assert.equal(gate.legacySaveIndex,null);
 assert.equal(gate.continuity.endingTrigger,'confirmed-in-playthrough-only-no-preview');
 assert.equal(gate.continuity.part3Gate,'unchanged-game-owned-completion-guard');
 assert.equal(gate.continuity.oldSave,'do-not-infer-part2-resolution');
 assert.deepEqual(gate.choices.map(c=>c.proposedEnding),['light','shadow']);
 for(const choice of gate.choices)assert.equal(choice.confirmationRequired,true);
});

test('escrow requires named custodian, two present witnesses and review date',()=>{
 const escrow=gate.choices.find(c=>c.id==='establishEscrow');
 assert.equal(escrow.guard,'named-custodian-two-present-witnesses-review-date');
 assert.equal(escrow.proposedState.escrowReviewDue,'part3-ch33');
 assert.ok(gate.inputs.includes('presentCharacters'));
 assert.ok(gate.inputs.includes('manifestHolder'));
 assert.equal(gate.continuity.unknownConsent,'independent-facts-only');
});

test('conditional Elias testimony and a single-house signal receipt do not constitute public evidence',()=>{
 assert.ok(gate.inputs.includes('eliasPage'));
 assert.ok(gate.inputs.includes('eliasSourceConsent'));
 assert.ok(gate.inputs.includes('signalReceipt'));
 assert.equal(prior.continuity.missingElias,'skip-eliasPage-group-no-fabricated-testimony');
 assert.equal(gate.continuity.receipt,'single-house-not-publication');
 assert.equal(gate.continuity.brokenDevice,'local-hearing-or-escrow-still-available');
});
