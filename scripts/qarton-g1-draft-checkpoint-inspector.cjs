'use strict';
// Pure, draft-only checkpoint inspector. No production runtime or storage integration.
const hasOwn=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
function inspectDraftCheckpoint(chapter,checkpoint){
 if(!chapter||!Array.isArray(chapter.choiceGroups)||!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint))return {valid:false,reason:'shape'};
 if(Object.getPrototypeOf(checkpoint)!==Object.prototype)return {valid:false,reason:'shape'};
 if(!hasOwn(checkpoint,'schemaVersion')||checkpoint.schemaVersion!==1||!hasOwn(checkpoint,'chapterId')||checkpoint.chapterId!==chapter.id)return {valid:false,reason:'identity'};
 if(!hasOwn(checkpoint,'groups')||!checkpoint.groups||typeof checkpoint.groups!=='object'||Array.isArray(checkpoint.groups)||Object.getPrototypeOf(checkpoint.groups)!==Object.prototype)return {valid:false,reason:'groups'};
 const names=Object.keys(checkpoint.groups);
 for(const name of names){
  const group=chapter.choiceGroups.find(g=>g.id===name);
  if(!group)return {valid:false,reason:'unknown-group'};
  const desc=Object.getOwnPropertyDescriptor(checkpoint.groups,name);
  if(!desc||!hasOwn(desc,'value')||typeof desc.value!=='string'||!group.choiceIds.includes(desc.value))return {valid:false,reason:'choice'};
 }
 return {valid:true,completeGroups:names};
}
module.exports={inspectDraftCheckpoint};
