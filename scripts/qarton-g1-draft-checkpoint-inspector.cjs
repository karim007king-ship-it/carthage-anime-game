'use strict';
// Pure, draft-only checkpoint inspector. No production runtime or storage integration.
const hasOwn=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
function inspectDraftCheckpoint(chapter,checkpoint){
 if(!chapter||typeof chapter.id!=='string'||!chapter.id||!Array.isArray(chapter.choiceGroups)||!chapter.choiceGroups.length||!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint))return {valid:false,reason:'shape'};
 if(Object.getPrototypeOf(checkpoint)!==Object.prototype)return {valid:false,reason:'shape'};
 const fields=Reflect.ownKeys(checkpoint);
 if(fields.length!==3||fields.some(k=>!['schemaVersion','chapterId','groups'].includes(k)))return {valid:false,reason:'fields'};
 const ownValue=key=>{const d=Object.getOwnPropertyDescriptor(checkpoint,key);return d&&hasOwn(d,'value')?d.value:undefined;};
 if(ownValue('schemaVersion')!==1||ownValue('chapterId')!==chapter.id)return {valid:false,reason:'identity'};
 const groupValues=ownValue('groups');
 if(!groupValues||typeof groupValues!=='object'||Array.isArray(groupValues)||Object.getPrototypeOf(groupValues)!==Object.prototype)return {valid:false,reason:'groups'};
 const names=Reflect.ownKeys(groupValues);
 if(names.some(name=>typeof name!=='string'))return {valid:false,reason:'groups'};
 if(chapter.choiceGroups.some(group=>!group||typeof group.id!=='string'))return {valid:false,reason:'chapter-groups'};
 const knownGroupIds=new Set(chapter.choiceGroups.map(group=>group.id));
 if(knownGroupIds.size!==chapter.choiceGroups.length)return {valid:false,reason:'chapter-groups'};
 const allowedChoices=new Map();
 const globallyOwnedChoices=new Set();
 for(const group of chapter.choiceGroups){
  if(!group||typeof group.id!=='string'||!group.id||!Array.isArray(group.choiceIds)||!group.choiceIds.length||group.choiceIds.some(id=>typeof id!=='string'||!id)||new Set(group.choiceIds).size!==group.choiceIds.length)return {valid:false,reason:'chapter-groups'};
  for(const choiceId of group.choiceIds){
   if(globallyOwnedChoices.has(choiceId))return {valid:false,reason:'chapter-groups'};
   globallyOwnedChoices.add(choiceId);
  }
  allowedChoices.set(group.id,new Set(group.choiceIds));
 }
 for(const name of names){
  if(!allowedChoices.has(name))return {valid:false,reason:'unknown-group'};
  const desc=Object.getOwnPropertyDescriptor(groupValues,name);
  if(!desc||!hasOwn(desc,'value')||typeof desc.value!=='string'||!allowedChoices.get(name).has(desc.value))return {valid:false,reason:'choice'};
 }
 return {valid:true,completeGroups:names};
}
module.exports={inspectDraftCheckpoint};
