'use strict';
// Pure pilot checkpoint codec. No localStorage, original save access, or runtime mutation.
const {createPilotChapterNavigator} = require('./qarton-pilot-chapter-navigator.cjs');
const NAMESPACE = 'qarton-pilot-v1';
const VERSION = 1;
const MAX_BYTES = 4096;
function ownData(obj,key) {
  const d=Object.getOwnPropertyDescriptor(obj,key);
  if(!d || !Object.hasOwn(d,'value')) throw new Error('Missing or accessor field: '+key);
  return d.value;
}
function validateCheckpoint(value, navigator = createPilotChapterNavigator()) {
  if(!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value)!==Object.prototype) throw new Error('Invalid checkpoint object');
  const keys=Reflect.ownKeys(value);
  if(keys.some(k=>typeof k!=='string') || keys.length!==4 || keys.some(k=>!['namespace','version','chapterId','lineId'].includes(k))) throw new Error('Unknown checkpoint fields');
  if(ownData(value,'namespace')!==NAMESPACE || ownData(value,'version')!==VERSION) throw new Error('Invalid pilot checkpoint version');
  const id=ownData(value,'chapterId');
  const chapter=navigator.resolve(id);
  if(chapter.kind!=='draft') throw new Error('Pilot checkpoint cannot reference legacy progress');
  const line=ownData(value,'lineId');
  if(line!==null && (typeof line!=='string' || !/^[a-z0-9-]{1,80}$/.test(line))) throw new Error('Invalid pilot line ID');
  return Object.freeze({namespace:NAMESPACE,version:VERSION,chapterId:id,lineId:line});
}
function createCheckpoint(chapterId,lineId=null,navigator=createPilotChapterNavigator()){
  return validateCheckpoint({namespace:NAMESPACE,version:VERSION,chapterId,lineId},navigator);
}
function encodeCheckpoint(checkpoint,navigator=createPilotChapterNavigator()){
  const safe=validateCheckpoint(checkpoint,navigator);
  return JSON.stringify(safe);
}
function decodeCheckpoint(json,navigator=createPilotChapterNavigator()){
  if(typeof json!=='string' || Buffer.byteLength(json,'utf8')>MAX_BYTES) throw new Error('Invalid pilot checkpoint payload');
  return validateCheckpoint(JSON.parse(json),navigator);
}
module.exports={NAMESPACE,VERSION,MAX_BYTES,validateCheckpoint,createCheckpoint,encodeCheckpoint,decodeCheckpoint};
