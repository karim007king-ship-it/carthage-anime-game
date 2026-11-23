'use strict';
const assert = require('node:assert/strict');
const {ENDING_IDS,normalizeStorySaveFields}=require('../scripts/story-save-compat-normalizer.cjs');
assert.equal(ENDING_IDS.length,9);
for(const idx of [0,4,7,8,13,14,17,18,35]){
  const original={app:'shiganshina',version:1,sceneIdx:idx,part:idx===35?'part3':'part1',endingsSeen:['hero','guardian','rebuild','guardian','invalid'],state:{trust:{lina:42}}};
  const snapshot=structuredClone(original);
  const normalized=normalizeStorySaveFields(original);
  assert.deepEqual(original,snapshot);
  assert.equal(normalized.sceneIdx,idx);
  assert.equal(normalized.part,original.part);
  assert.deepEqual(normalized.endingsSeen,['hero','guardian','rebuild']);
  assert.deepEqual(normalizeStorySaveFields(normalized),normalized);
}
assert.throws(()=>normalizeStorySaveFields({part:'part4'}),RangeError);
assert.throws(()=>normalizeStorySaveFields({sceneIdx:36}),RangeError);
assert.throws(()=>normalizeStorySaveFields({endingsSeen:'hero'}),TypeError);
console.log('Story save compatibility normalizer: PASS; nine endings and part3 retained');
