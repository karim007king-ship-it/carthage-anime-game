'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const groups=['p1-gate-manifest','p2-protection-cost'];

function inspectCheckpoint(chapter,checkpoint){
 if(!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint))return {valid:false};
 if(checkpoint.chapterId!==chapter.id||checkpoint.schemaVersion!==1)return {valid:false};
 if(!checkpoint.groups||typeof checkpoint.groups!=='object'||Array.isArray(checkpoint.groups))return {valid:false};
 const names=Object.keys(checkpoint.groups);
 if(names.some(k=>!chapter.choiceGroups.some(g=>g.id===k)))return {valid:false};
 for(const group of chapter.choiceGroups){
  if(!Object.hasOwn(checkpoint.groups,group.id))continue;
  const selected=checkpoint.groups[group.id];
  if(typeof selected!=='string'||!group.choiceIds.includes(selected))return {valid:false};
 }
 return {valid:true,completeGroups:names};
}

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
