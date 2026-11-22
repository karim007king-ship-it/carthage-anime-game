'use strict';
// Draft-only read-only location resolver. Registry presence is not an art licence.
const manifest=require('../game-content/backgrounds/manifest.json');
const known=new Map(manifest.locations.map(l=>[l.id,l.ref]));
function normalizeLocationRef(value){
 if(typeof value!=='string'||!value||value.trim()!==value)return null;
 const id=value.startsWith('loc.')?value.slice(4):value;
 if(!/^[a-z][a-z0-9-]*$/.test(id))return null;
 return known.get(id)==='loc.'+id?known.get(id):null;
}
function resolveDraftLocation(chapter,approvedArt){
 if(!chapter||!chapter.location||typeof chapter.location!=='object'||Array.isArray(chapter.location))return {valid:false,reason:'missing-location',locationRef:null,art:null};
 const loc=chapter.location;
 if(loc.locationRef==null)return {valid:true,reason:'missing-art',locationRef:null,art:null};
 const ref=normalizeLocationRef(loc.locationRef);
 if(!ref)return {valid:false,reason:'unknown-location',locationRef:null,art:null};
 if(loc.artStatus!=='approved')return {valid:true,reason:'not-approved',locationRef:ref,art:null};
 if(!approvedArt||typeof approvedArt!=='object'||Array.isArray(approvedArt)||Object.getPrototypeOf(approvedArt)!==Object.prototype)return {valid:true,reason:'missing-art',locationRef:ref,art:null};
 const desc=Object.getOwnPropertyDescriptor(approvedArt,ref);
 if(!desc||!Object.hasOwn(desc,'value')||typeof desc.value!=='string'||!desc.value)return {valid:true,reason:'missing-art',locationRef:ref,art:null};
 return {valid:true,reason:'approved',locationRef:ref,art:desc.value};
}
module.exports={normalizeLocationRef,resolveDraftLocation};
