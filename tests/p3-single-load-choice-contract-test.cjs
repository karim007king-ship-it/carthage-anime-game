'use strict';
const assert = require('node:assert/strict');
const contract = require('../data/p3-single-load-choice-contract.json');
const map = require('../data/qarton-36-chapter-display-map.json');
const chapter = map.chapters.find(ch => ch.id === contract.sceneId);
assert.ok(chapter, 'Pilot scene must exist in the canonical map');
assert.equal(chapter.displayChapter, 27);
assert.equal(chapter.kind, 'draft');
assert.equal(contract.status, 'isolated-contract-not-production');
assert.deepEqual(contract.requiredInputs,
  ['registryMethod', 'boatDecision', 'presentCharacters']);
assert.deepEqual(Object.keys(contract.choices).sort(),
  ['prioritizeBridge', 'prioritizeClinic', 'splitWithLimits'].sort());
assert.deepEqual(contract.choices.prioritizeBridge,
  {supplyAllocation:'bridge',bridgeRepair:'started',clinicShelter:'improvised'});
assert.deepEqual(contract.choices.prioritizeClinic,
  {supplyAllocation:'clinic',bridgeRepair:'delayed',clinicShelter:'reinforced'});
assert.deepEqual(contract.choices.splitWithLimits,
  {supplyAllocation:'split',bridgeRepair:'footpathOnly',clinicShelter:'partial'});
for (const value of Object.values(contract.constraints)) {
  assert.equal(typeof value, 'boolean');
}
assert.equal(contract.constraints.effectsMustApplyOnce, true);
assert.equal(contract.constraints.partThreeAutoUnlock, false);
assert.equal(contract.constraints.mayConfirmRescuedHouseholds, false);
assert.equal(contract.constraints.mayConfirmCompletedBridge, false);
assert.equal(contract.constraints.mayConfirmFullyRestoredClinic, false);
console.log('Chapter 27 canonical choice contract: PASS (no production effects)');
