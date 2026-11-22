'use strict';
// Pure, draft-only checkpoint inspector. No production runtime or storage integration.
const hasOwn=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
function inspectDraftCheckpoint(chapter,checkpoint){
 if(!chapter||!Array.isArray(chapter.choiceGroups)||!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint))return {valid:false,reason:'shape'};
 if(Object.getPrototypeOf(checkpoint)!==Object.prototype)return {valid:false,reason:'shape'};
 const fields=Object.keys(checkpoint);
 if(fields.length!==3||fields.some(k=>!['schemaVersion','chapterId','groups'].includes(k)))return {valid:false,reason:'fields'};
 const ownValue=key=>{const d=Object.getOwnPropertyDescriptor(checkpoint,key);return d&&hasOwn(d,'value')?d.value:undefined;};
 if(ownValue('schemaVersion')!==1||ownValue('chapterId')!==chapter.id)return {valid:false,reason:'identity'};
 const groupValues=ownValue('groups');
 if(!groupValues||typeof groupValues!=='object'||Array.isArray(groupValues)||Object.getPrototypeOf(groupValues)!==Object.prototype)return {valid:false,reason:'groups'};
 const names=Object.keys(groupValues);
 for(const name of names){
  const group=chapter.choiceGroups.find(g=>g.id===name);
  if(!group)return {valid:false,reason:'unknown-group'};
  const desc=Object.getOwnPropertyDescriptor(groupValues,name);
  if(!desc||!hasOwn(desc,'value')||typeof desc.value!=='string'||!group.choiceIds.includes(desc.value))return {valid:false,reason:'choice'};
 }
 return {valid:true,completeGroups:names};
}
module.exports={inspectDraftCheckpoint};
