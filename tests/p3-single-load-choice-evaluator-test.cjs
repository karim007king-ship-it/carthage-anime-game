'use strict';
const assert = require('node:assert/strict');
const {applyPilotChoice} = require('../scripts/p3-single-load-choice-evaluator.cjs');
const contract = require('../data/p3-single-load-choice-contract.json');
for (const [choice, outcomes] of Object.entries(contract.choices)) {
  const original = {appliedEventIds:[], trust:51, timeLeft:44};
  const snapshot = structuredClone(original);
  const first = applyPilotChoice(original, choice, 'p3-single-load:decision');
  assert.equal(first.applied, true);
  assert.deepEqual(first.state.outcomes, outcomes);
  assert.deepEqual(original, snapshot, 'Never mutate original state');
  const duplicate = applyPilotChoice(first.state, choice, 'p3-single-load:decision');
  assert.equal(duplicate.applied, false);
  assert.deepEqual(duplicate.state, first.state, 'Replay cannot reapply effects');
  const conflicting = applyPilotChoice(first.state, 'prioritizeBridge', 'another-event');
  assert.equal(conflicting.applied, false, 'Choice is final after first selection');
  assert.deepEqual(conflicting.state, first.state);
  assert.equal(first.state.trust, 51);
  assert.equal(first.state.timeLeft, 44);
}
assert.throws(() => applyPilotChoice({}, 'missing', 'event'), RangeError);
assert.throws(() => applyPilotChoice({}, 'prioritizeBridge', ''), TypeError);
assert.throws(() => applyPilotChoice(null, 'prioritizeBridge', 'event'), TypeError);
console.log('Pilot choice evaluation: PASS; deterministic and idempotent');
