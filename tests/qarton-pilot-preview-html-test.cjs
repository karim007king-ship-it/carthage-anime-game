'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {renderPilotChapterHtml,escapeHtml}=require('../scripts/qarton-pilot-preview-html.cjs');
const {createPilotChapterNavigator}=require('../scripts/qarton-pilot-chapter-navigator.cjs');
test('standalone preview is static, offline and free of save hooks',()=>{
 const n=createPilotChapterNavigator();
 for(const e of n.entries){
  const html=renderPilotChapterHtml(e.id,'tn');
  assert.match(html,/<!doctype html>/);
  assert.match(html,/Read-only \/ preview only/);
  assert.doesNotMatch(html,/<script|<iframe|<form|localStorage|sessionStorage|indexedDB|fetch\(/i);
  assert.doesNotMatch(html,/<button|onclick=|onload=/i);
 }
});
test('escapes HTML and respects text direction',()=>{
 assert.equal(escapeHtml('<img src="x" onerror=\'y\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;y&#39;&gt;&amp;');
 const n=createPilotChapterNavigator();
 const id=n.entries.find(e=>e.kind==='draft').id;
 assert.match(renderPilotChapterHtml(id,'ar'),/dir="rtl"/);
 assert.match(renderPilotChapterHtml(id,'en'),/dir="ltr"/);
 assert.throws(()=>renderPilotChapterHtml(id,'xx'),/Unsupported locale/);
});
