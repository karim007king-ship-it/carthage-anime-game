'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPilotChapterNavigator}=require('../scripts/qarton-pilot-chapter-navigator.cjs');
const {buildPilotPreview}=require('../scripts/qarton-pilot-chapter-preview.cjs');
test('all 36 chapter previews are non-interactive and never expose legacy save mutation',()=>{
 const nav=createPilotChapterNavigator();
 for(const entry of nav.entries){
   const p=buildPilotPreview(entry.id);
   assert.equal(p.id,entry.id);
   assert.equal(p.previewOnly,true);
   assert.ok(Object.isFrozen(p));
   if(entry.kind==='draft'){
     assert.equal(p.legacySceneIdx,null);
     assert.ok(p.textKeys.length>0);
     assert.ok(p.textKeys.every(k=>k.startsWith('story.'+entry.id+'.')));
     assert.ok(p.choices.every(c=>c.interactive===false));
   }else{
     assert.equal(p.legacySceneIdx,entry.legacySceneIdx);
     assert.deepEqual(p.choices,[]);
   }
 }
});
test('reject unknown preview id',()=>assert.throws(()=>buildPilotPreview('unknown'),/Unknown chapter/));
