'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPilotChapterNavigator}=require('../scripts/qarton-pilot-chapter-navigator.cjs');
const {resolvePilotPreviewText,SUPPORTED}=require('../scripts/qarton-pilot-preview-text.cjs');
test('all draft chapters report translation coverage without inventing content',()=>{
 const nav=createPilotChapterNavigator();
 for(const entry of nav.entries.filter(x=>x.kind==='draft')){
  for(const locale of SUPPORTED){
   const r=resolvePilotPreviewText(entry.id,locale);
   assert.equal(r.previewOnly,true);
   assert.equal(r.translatedCount+r.missingCount,r.lines.length);
   assert.ok(r.lines.length>0);
   assert.ok(r.lines.every(x=>x.missing ? x.text===null : typeof x.text==='string'));
   assert.ok(Object.isFrozen(r.lines));
  }
 }
});
test('legacy preview does not replace original runtime translation',()=>{
 const r=resolvePilotPreviewText('legacy-01','tn');
 assert.equal(r.lines.length,0);
 assert.equal(r.previewOnly,true);
});
test('unsupported locales rejected',()=>{
 assert.throws(()=>resolvePilotPreviewText('legacy-01','xx'),/Unsupported locale/);
});
