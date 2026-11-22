'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const truth=load('p2-truth-gate');
const register=load('p3-survivor-register');
const hearing=load('p3-hadi-hearing');

test('part 2 resolution is consumed by part 3 without rewriting original save indices',()=>{
 assert.ok(truth.outputs.includes('part2Resolution'));
 for(const next of [register,hearing]){
  assert.ok(next.inputs.includes('part2Resolution'));
  assert.equal(next.legacySaveIndex,null);
  assert.equal(next.runtimeIntegrated,false);
 }
 assert.equal(register.continuity.unknownPart2,'neutral-introduction-no-inferred-ending');
 assert.equal(truth.continuity.oldSave,'do-not-infer-part2-resolution');
});

test('part 3 public hearing and escrow follow consent constraints rather than force endings',()=>{
 assert.equal(hearing.continuity.shadow,'review-escrow-within-consent-boundary');
 assert.equal(hearing.continuity.light,'public-facts-not-blanket-witness-disclosure');
 assert.equal(hearing.continuity.endingPolicy,'no-part3-completion-or-legacy-ending-here');
 assert.ok(hearing.inputs.includes('namesConsent'));
 assert.ok(hearing.inputs.includes('eliasSourceConsent'));
 for(const choice of hearing.choices){
  assert.equal(choice.proposedState.gateOrderStatus,'unproven');
  assert.ok(!Object.hasOwn(choice,'proposedEnding'));
 }
});

test('part 3 starts with an unresolved missing-household record, not a presumed death',()=>{
 assert.equal(register.continuity.missingPerson,'not-equivalent-to-death');
 assert.equal(register.continuity.houseProof,'independent-proof-required-in-ch30');
 assert.ok(register.choices.every(c=>!Object.hasOwn(c,'proposedEnding')));
});
