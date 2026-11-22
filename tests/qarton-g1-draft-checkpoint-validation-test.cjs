'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const groups=['p1-gate-manifest','p2-protection-cost'];

const {inspectDraftCheckpoint:inspectCheckpoint}=require('../scripts/qarton-g1-draft-checkpoint-inspector.cjs');

test('draft checkpoint IDs cannot confuse chapter 11 with chapter 22 or legacy sceneIdx',()=>{
 const ch11=read(groups[0]),ch22=read(groups[1]);
 const sample={schemaVersion:1,chapterId:ch11.id,groups:{seat:'yieldSeat'}};
 assert.deepEqual(inspectCheckpoint(ch11,sample),{valid:true,completeGroups:['seat']});
 assert.equal(inspectCheckpoint(ch22,sample).valid,false);
 assert.equal(inspectCheckpoint(ch11,{...sample,chapterId:11}).valid,false);
 assert.equal(inspectCheckpoint(ch11,{...sample,schemaVersion:99}).valid,false);
});

test('partial group checkpoint remains partial and repeated inspection is read-only',()=>{
 for(const id of groups){
  const chapter=read(id),g=chapter.choiceGroups[0],sample={schemaVersion:1,chapterId:id,groups:{[g.id]:g.choiceIds[0]}};
  const before=JSON.stringify(sample);
  for(let i=0;i<5;i++){
   const r=inspectCheckpoint(chapter,sample);
   assert.deepEqual(r.completeGroups,[g.id]);
   assert.equal(JSON.stringify(sample),before);
  }
  assert.equal(inspectCheckpoint(chapter,{...sample,groups:{[g.id]:'invalid'}}).valid,false);
 }
});

test('old saves and malformed checkpoints never imply completed draft groups',()=>{
 for(const id of groups){
  const chapter=read(id);
  for(const candidate of [undefined,null,{},[],{sceneIdx:10,lineIdx:3},{chapterId:id,schemaVersion:1,groups:{unknown:'yieldSeat'}},{chapterId:id,schemaVersion:1,groups:{seat:'__proto__'}}]){
   assert.equal(inspectCheckpoint(chapter,candidate).valid,false,id);
  }
  assert.equal(chapter.runtimeIntegrated,false);
  assert.equal(chapter.legacySaveIndex,null);
 }
});

test('conditional Elias group remains optional without affecting mandatory boat group',()=>{
 const c=read('p2-protection-cost');
 assert.equal(c.choiceGroups[0].required,true);
 assert.equal(c.choiceGroups[1].requiredIf,'elias-present');
 assert.equal(c.continuity.missingElias,'skip-eliasPage-group-no-fabricated-testimony');
});


test('prototype inheritance, accessors, and arrays fail closed without executing a getter',()=>{
 const c=read('p2-protection-cost');
 let touched=0;
 const inherited=Object.create({schemaVersion:1,chapterId:c.id,groups:{boat:'evacuateFamily'}});
 assert.equal(inspectCheckpoint(c,inherited).valid,false);
 const groups={};
 Object.defineProperty(groups,'boat',{enumerable:true,get(){touched++;throw Error('untrusted getter executed');}});
 assert.equal(inspectCheckpoint(c,{schemaVersion:1,chapterId:c.id,groups}).valid,false);
 assert.equal(touched,0);
 assert.equal(inspectCheckpoint(c,{schemaVersion:1,chapterId:c.id,groups:[]}).valid,false);
});

test('missing Elias cannot be represented as a fabricated completed testimony group',()=>{
 const c=read('p2-protection-cost');
 const boatOnly={schemaVersion:1,chapterId:c.id,groups:{boat:'keepForWatch'}};
 assert.deepEqual(inspectCheckpoint(c,boatOnly),{valid:true,completeGroups:['boat']});
 assert.equal(c.choiceGroups.find(x=>x.id==='eliasPage').requiredIf,'elias-present');
});

test('top-level accessors and unexpected metadata fail closed without executing getters',()=>{
 const c=read('p1-gate-manifest');
 let reads=0;
 for(const field of ['schemaVersion','chapterId','groups']){
  const sample={schemaVersion:1,chapterId:c.id,groups:{seat:'yieldSeat'}};
  Object.defineProperty(sample,field,{enumerable:true,get(){reads++;throw Error('getter must not run');}});
  assert.equal(inspectCheckpoint(c,sample).valid,false,field);
 }
 assert.equal(reads,0);
 assert.equal(inspectCheckpoint(c,{schemaVersion:1,chapterId:c.id,groups:{seat:'yieldSeat'},sceneIdx:10}).valid,false);
});


test('non-enumerable and symbol checkpoint properties are not silently accepted',()=>{
 const c=read('p1-gate-manifest');
 const base=()=>({schemaVersion:1,chapterId:c.id,groups:{seat:'yieldSeat'}});
 const hidden=base();
 Object.defineProperty(hidden,'sceneIdx',{value:10,enumerable:false});
 assert.equal(inspectCheckpoint(c,hidden).valid,false);
 const symbol=base();
 symbol[Symbol('hidden-save-index')]=10;
 assert.equal(inspectCheckpoint(c,symbol).valid,false);
 const hiddenGroup=base();
 Object.defineProperty(hiddenGroup.groups,'manifestCustody',{value:'keepWithNoor',enumerable:false});
 assert.deepEqual(inspectCheckpoint(c,hiddenGroup),{valid:true,completeGroups:['seat','manifestCustody']});
 const symbolGroup=base();
 symbolGroup.groups[Symbol('hidden-choice')]='keepWithNoor';
 assert.equal(inspectCheckpoint(c,symbolGroup).valid,false);
});
