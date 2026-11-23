'use strict';
// Pure state transition evaluator for isolated chapter 27. Never writes to legacy saves.
const contract = require('../data/p3-single-load-choice-contract.json');
const valid = new Set(Object.keys(contract.choices));

function applyPilotChoice(previous, choiceId, eventId) {
  if (!previous || typeof previous !== 'object' || Array.isArray(previous)) {
    throw new TypeError('Pilot state must be an object');
  }
  if (!valid.has(choiceId)) throw new RangeError('Unknown pilot choice');
  if (typeof eventId !== 'string' || !eventId.trim()) {
    throw new TypeError('A stable event ID is required');
  }
  const seen = Array.isArray(previous.appliedEventIds) ? previous.appliedEventIds : [];
  if (seen.includes(eventId)) return {state: structuredClone(previous), applied: false};
  if (previous.selectedChoiceId) {
    return {state: structuredClone(previous), applied: false};
  }
  const state = structuredClone(previous);
  state.appliedEventIds = [...seen, eventId];
  state.selectedChoiceId = choiceId;
  state.outcomes = {...contract.choices[choiceId]};
  return {state, applied: true};
}
module.exports = {applyPilotChoice};
