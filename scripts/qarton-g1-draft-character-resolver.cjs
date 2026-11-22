'use strict';
// Draft-only read-only adapter. Never load into the original production game.
const manifest=require('../game-content/characters/manifest.json');
const originals=new Map(manifest.characters.map(c=>[c.id,c.ref]));

function normalizeCharacterRef(value){
 if(typeof value!=='string'||!value||value.trim()!==value)return null;
 const id=value.startsWith('char.')?value.slice(5):value;
 if(!/^[a-z][a-z0-9-]*$/.test(id))return null;
 return originals.get(id)===('char.'+id)?originals.get(id):null;
}

function resolveChapterCharacters(chapter,presence){
 if(!chapter||!Array.isArray(chapter.characters))return {valid:false,reason:'invalid-chapter',characters:[]};
 if(presence!==undefined&&(!presence||Array.isArray(presence)||typeof presence!=='object'||Object.getPrototypeOf(presence)!==Object.prototype))return {valid:false,reason:'invalid-presence',characters:[]};
 const seen=new Set(),result=[];
 for(const raw of chapter.characters){
  const ref=normalizeCharacterRef(raw);
  if(!ref)return {valid:false,reason:'unknown-character',characters:[]};
  if(seen.has(ref))return {valid:false,reason:'duplicate-character',characters:[]};
  seen.add(ref);
  const id=ref.slice(5);
  if(presence!==undefined){
   const descriptor=Object.getOwnPropertyDescriptor(presence,id);
   if(!descriptor||!Object.hasOwn(descriptor,'value')||typeof descriptor.value!=='boolean')return {valid:false,reason:'unknown-presence',characters:[]};
   if(!descriptor.value)continue;
  }
  result.push(ref);
 }
 return {valid:true,characters:result};
}
module.exports={normalizeCharacterRef,resolveChapterCharacters};
