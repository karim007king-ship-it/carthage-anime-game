'use strict';
// Read-only text resolution for isolated pilot previews. Never invent translations.
const fs=require('node:fs');
const path=require('node:path');
const {buildPilotPreview}=require('./qarton-pilot-chapter-preview.cjs');
const SUPPORTED=Object.freeze(['tn','ar','en','fr']);
function resolvePilotPreviewText(chapterId,locale='tn',root=path.resolve(__dirname,'..')){
  if(!SUPPORTED.includes(locale)) throw new Error('Unsupported locale');
  const preview=buildPilotPreview(chapterId,root);
  const file=path.join(root,'game-content/locales',locale+'.json');
  let dictionary={};
  if(fs.existsSync(file)){
    const doc=JSON.parse(fs.readFileSync(file,'utf8'));
    if(doc.locale!==locale || !doc.texts || typeof doc.texts!=='object' || Array.isArray(doc.texts)) throw new Error('Invalid locale catalogue');
    dictionary=doc.texts;
  }
  const lines=preview.textKeys.map(key=>{
    const value=Object.hasOwn(dictionary,key) ? dictionary[key] : null;
    const translated=typeof value==='string' && value.trim().length>0;
    return Object.freeze({key,text:translated?value:null,missing:!translated});
  });
  return Object.freeze({id:chapterId,locale,previewOnly:true,translatedCount:lines.filter(x=>!x.missing).length,missingCount:lines.filter(x=>x.missing).length,lines:Object.freeze(lines)});
}
module.exports={SUPPORTED,resolvePilotPreviewText};
