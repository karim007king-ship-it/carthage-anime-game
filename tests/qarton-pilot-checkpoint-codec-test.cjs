'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPilotChapterNavigator}=require('../scripts/qarton-pilot-chapter-navigator.cjs');
const {createCheckpoint,encodeCheckpoint,decodeCheckpoint,validateCheckpoint,MAX_BYTES}=require('../scripts/qarton-pilot-checkpoint-codec.cjs');
const nav=createPilotChapterNavigator();
const draft=nav.entries.find(e=>e.kind==='draft').id;
test('pilot checkpoint round-trips without touching original save data',()=>{
  const legacySave={sceneIdx:4,lineIdx:3,trust:{lina:60},inventory:['صورة العائلة']};
  const before=JSON.stringify(legacySave);
  const c=createCheckpoint(draft,'line-001',nav);
  assert.deepEqual(decodeCheckpoint(encodeCheckpoint(c,nav),nav),c);
  assert.equal(JSON.stringify(legacySave),before);
  assert.ok(Object.isFrozen(c));
});
test('rejects legacy chapters, foreign namespace, unknown and accessor fields',()=>{
  assert.throws(()=>createCheckpoint('legacy-01',null,nav),/legacy progress/);
  assert.throws(()=>decodeCheckpoint(JSON.stringify({namespace:'shiganshina',version:1,chapterId:draft,lineId:null}),nav),/namespace|version/);
  assert.throws(()=>decodeCheckpoint(JSON.stringify({namespace:'qarton-pilot-v1',version:1,chapterId:draft,lineId:null,sceneIdx:0}),nav),/Unknown checkpoint fields/);
  assert.throws(()=>decodeCheckpoint('x'.repeat(MAX_BYTES+1),nav),/payload/);
  assert.throws(()=>decodeCheckpoint('null',nav),/object/);
  assert.throws(()=>decodeCheckpoint('[]',nav),/object/);
  assert.throws(()=>decodeCheckpoint('{"__proto__":{}}',nav),/Unknown checkpoint fields/);
  const accessor={namespace:'qarton-pilot-v1',version:1,chapterId:draft};
  Object.defineProperty(accessor,'lineId',{enumerable:true,get(){throw new Error('getter executed')}});
  assert.throws(()=>validateCheckpoint(accessor,nav),/accessor field/);
});
