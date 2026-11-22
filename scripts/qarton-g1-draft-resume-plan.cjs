'use strict';
// Draft-only, pure resume planner. Does not read or write production saves.
const {inspectDraftCheckpoint}=require('./qarton-g1-draft-checkpoint-inspector.cjs');
function planDraftResume(chapter,checkpoint,eligibility){
 const inspected=inspectDraftCheckpoint(chapter,checkpoint);
 if(!inspected.valid)return {valid:false,reason:inspected.reason};
 if(!eligibility||typeof eligibility!=='object'||Array.isArray(eligibility)||Object.getPrototypeOf(eligibility)!==Object.prototype)return {valid:false,reason:'eligibility'};
 const keys=Reflect.ownKeys(eligibility);
 if(keys.some(k=>typeof k!=='string'||!['elias-present'].includes(k)))return {valid:false,reason:'eligibility'};
 const completed=new Set(inspected.completeGroups);
 const pending=[],skipped=[];
 for(const group of chapter.choiceGroups){
  if(group.requiredIf){
   if(group.requiredIf!=='elias-present')return {valid:false,reason:'unknown-condition'};
   const descriptor=Object.getOwnPropertyDescriptor(eligibility,group.requiredIf);
   if(!descriptor||!Object.hasOwn(descriptor,'value')||typeof descriptor.value!=='boolean')return {valid:false,reason:'unknown-presence'};
   if(descriptor.value===false){
    if(completed.has(group.id))return {valid:false,reason:'ineligible-completed-group'};
    skipped.push(group.id);continue;
   }
  }
  if(!completed.has(group.id))pending.push(group.id);
 }
 return {valid:true,completed:inspected.completeGroups,pending,skipped};
}
module.exports={planDraftResume};
