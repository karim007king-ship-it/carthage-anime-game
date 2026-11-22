'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLegacyPresentationSnapshot, getDisplayChapterForLegacySave } = require('../scripts/qarton-g4-legacy-presentation-adapter.cjs');
test('default OFF never exposes cinematic snapshot', () => {
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4}),null);
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4},false),null);
});
test('all 18 original scenes retain stable legacy IDs and display mapping', () => {
  const display=[1,3,5,6,7,8,9,12,13,15,17,18,20,23,25,28,35,36];
  display.forEach((chapter,index)=>{
    const snapshot=createLegacyPresentationSnapshot({sceneIdx:index,locale:'tn',reducedMotion:false},true);
    assert.equal(snapshot.sceneId,'legacy-'+String(index+1).padStart(2,'0'));
    assert.equal(getDisplayChapterForLegacySave({sceneIdx:index}),chapter);
  });
});
test('original chapter-five save maps to Dar Mansour without modifying save',()=>{
  const save={sceneIdx:4,health:100,part:1,chapter:5,inventory:['مفتاح المخزن']};
  const original=JSON.stringify(save);
  assert.equal(getDisplayChapterForLegacySave(save),7);
  const snapshot=createLegacyPresentationSnapshot(save,true);
  assert.equal(snapshot.sceneId,'legacy-05');
  assert.equal(JSON.stringify(save),original);
  assert.ok(!('sceneIdx' in snapshot));
  assert.ok(!('save' in snapshot));
  assert.ok(!('flags' in snapshot));
});
test('invalid and new chapter indices are rejected; no Part III unlock',()=>{
  for(const idx of [-1,18,27,36,1.5,'4',NaN]) {
    assert.equal(createLegacyPresentationSnapshot({sceneIdx:idx},true),null);
    assert.equal(getDisplayChapterForLegacySave({sceneIdx:idx}),null);
  }
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4,locale:'xx'},true),null);
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4,reducedMotion:'no'},true),null);
});
