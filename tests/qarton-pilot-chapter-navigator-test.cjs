'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createPilotChapterNavigator} = require('../scripts/qarton-pilot-chapter-navigator.cjs');
test('36 chapter navigator preserves canonical order and original indices', () => {
  const n = createPilotChapterNavigator();
  assert.equal(n.entries.length,36);
  assert.deepEqual(n.entries.map(x=>x.displayChapter),Array.from({length:36},(_,i)=>i+1));
  assert.equal(n.entries.filter(x=>x.kind==='legacy').length,18);
  assert.equal(n.entries.filter(x=>x.kind==='draft').length,18);
  assert.equal(n.entries[0].id,'legacy-01');
  assert.equal(n.entries.at(-1).id,'legacy-18');
  assert.equal(n.resolve('legacy-01').legacySceneIdx,0);
  assert.equal(n.resolve('legacy-18').legacySceneIdx,17);
  assert.equal(n.next('legacy-18'),null);
  assert.equal(n.previous('legacy-01'),null);
  for(let i=0;i<35;i++){
    assert.equal(n.next(n.entries[i].id).id,n.entries[i+1].id);
    assert.equal(n.previous(n.entries[i+1].id).id,n.entries[i].id);
  }
});
test('pilot checkpoint is distinct and refuses legacy save mutations', () => {
  const n=createPilotChapterNavigator();
  const draft=n.entries.find(x=>x.kind==='draft');
  assert.deepEqual(n.pilotCheckpoint(draft.id,'line-001'),{namespace:'qarton-pilot-v1',chapterId:draft.id,lineId:'line-001'});
  assert.throws(()=>n.pilotCheckpoint('legacy-01'),/Legacy progress/);
  assert.throws(()=>n.pilotCheckpoint(draft.id,'../../bad'),/Invalid pilot line/);
  assert.throws(()=>n.resolve('__proto__'),/Unknown chapter/);
  assert.throws(()=>n.resolve('missing'),/Unknown chapter/);
  assert.ok(Object.isFrozen(n.entries));
});
