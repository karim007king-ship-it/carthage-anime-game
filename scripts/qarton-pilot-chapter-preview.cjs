'use strict';
// Read-only pilot chapter preview. It does not execute choices or change saves.
const fs=require('node:fs');
const path=require('node:path');
const {createPilotChapterNavigator}=require('./qarton-pilot-chapter-navigator.cjs');
function buildPilotPreview(chapterId,root=path.resolve(__dirname,'..')){
  const navigator=createPilotChapterNavigator(root);
  const entry=navigator.resolve(chapterId);
  const file=path.join(root,'game-content/story/chapters',entry.id+'.json');
  const chapter=JSON.parse(fs.readFileSync(file,'utf8'));
  if(chapter.status!=='draft-not-runtime') throw new Error('Only non-runtime content may be previewed');
  if(entry.kind==='legacy'){
    return Object.freeze({id:entry.id,displayChapter:entry.displayChapter,kind:'legacy',legacySceneIdx:entry.legacySceneIdx,previewOnly:true,textKeys:Object.freeze([]),choices:Object.freeze([])});
  }
  if(!Array.isArray(chapter.textKeys)||!chapter.textKeys.every(k=>typeof k==='string'&&k.startsWith('story.'+entry.id+'.'))) throw new Error('Invalid draft text keys');
  const keys=Object.freeze([...chapter.textKeys]);
  const choices=Object.freeze((chapter.choices||[]).map(choice=>{
    if(!choice||typeof choice.id!=='string'||typeof choice.textKey!=='string'||!keys.includes(choice.textKey)) throw new Error('Invalid preview choice');
    return Object.freeze({id:choice.id,textKey:choice.textKey,group:choice.group||null,interactive:false});
  }));
  return Object.freeze({id:entry.id,displayChapter:entry.displayChapter,kind:'draft',legacySceneIdx:null,previewOnly:true,textKeys:keys,choices});
}
module.exports={buildPilotPreview};
