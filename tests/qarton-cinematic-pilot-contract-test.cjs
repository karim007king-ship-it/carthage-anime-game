'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PILOT_ID, SCENE_IDS, LEGACY_DISPLAY_CHAPTERS, CHOICES, legacySceneToDisplayChapter, validatePresentationSnapshot, resolvePilotChoice } = require('../scripts/qarton-cinematic-pilot-contract.cjs');

test('36 display chapters and all 18 original scenes keep original order', () => {
  assert.equal(SCENE_IDS.length, 36);
  assert.equal(new Set(SCENE_IDS).size, 36);
  assert.equal(LEGACY_DISPLAY_CHAPTERS.length, 18);
  for (let i = 0; i < 18; i++) assert.equal(SCENE_IDS[LEGACY_DISPLAY_CHAPTERS[i] - 1], 'legacy-' + String(i + 1).padStart(2, '0'));
  assert.equal(legacySceneToDisplayChapter(4), 7);
  assert.equal(legacySceneToDisplayChapter(17), 36);
  for (const bad of [-1,18,1.5,NaN,null,'4']) assert.equal(legacySceneToDisplayChapter(bad), null);
  assert.equal(SCENE_IDS[26], PILOT_ID);
});
test('presentation snapshot is a strict allowlist with no game/save state', () => {
  const valid = { version: 1, sceneId: PILOT_ID, locale: 'tn', accessibility: { reducedMotion: true } };
  assert.equal(validatePresentationSnapshot(valid), true);
  assert.equal(validatePresentationSnapshot({ ...valid, flags: [] }), false);
  assert.equal(validatePresentationSnapshot({ ...valid, state: {} }), false);
  assert.equal(validatePresentationSnapshot({ ...valid, sceneIdx: 4 }), false);
  assert.equal(validatePresentationSnapshot({ ...valid, locale: 'xx' }), false);
  assert.equal(validatePresentationSnapshot({ ...valid, accessibility: { reducedMotion: false, inventory: [] } }), false);
});
test('chapter 27 choices preserve one-load resource constraints', () => {
  assert.deepEqual(Object.keys(CHOICES).sort(), ['prioritizeBridge','prioritizeClinic','splitWithLimits'].sort());
  assert.deepEqual(resolvePilotChoice('prioritizeBridge'), { supplyAllocation: 'bridge', bridgeRepair: 'started', clinicShelter: 'improvised' });
  assert.deepEqual(resolvePilotChoice('prioritizeClinic'), { supplyAllocation: 'clinic', bridgeRepair: 'delayed', clinicShelter: 'reinforced' });
  assert.deepEqual(resolvePilotChoice('splitWithLimits'), { supplyAllocation: 'split', bridgeRepair: 'footpathOnly', clinicShelter: 'partial' });
  assert.equal(resolvePilotChoice('invalid'), null);
  const output = resolvePilotChoice('prioritizeBridge');
  output.bridgeRepair = 'completed';
  assert.equal(resolvePilotChoice('prioritizeBridge').bridgeRepair, 'started');
});
