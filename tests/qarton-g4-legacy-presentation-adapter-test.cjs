'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLegacyPresentationSnapshot, getDisplayChapterForLegacySave } = require('../scripts/qarton-g4-legacy-presentation-adapter.cjs');
test('default OFF never exposes cinematic snapshot', () => {
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4}),null);
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4},false),null);
});
test('all 18 original scenes retain stable legacy IDs and display mapping', () => {
  const display=[1,3,5,6,7,8,9,12,13,15,17,18,20,23,25,28,35,36];
  display.forEach((chapter,index)=>{
    const snapshot=createLegacyPresentationSnapshot({sceneIdx:index,locale:'tn',reducedMotion:false},true);
    assert.equal(snapshot.sceneId,'legacy-'+String(index+1).padStart(2,'0'));
    assert.equal(getDisplayChapterForLegacySave({sceneIdx:index}),chapter);
  });
});
test('original chapter-five save maps to Dar Mansour without modifying save',()=>{
  const save={sceneIdx:4,health:100,part:1,chapter:5,inventory:['مفتاح المخزن']};
  const original=JSON.stringify(save);
  assert.equal(getDisplayChapterForLegacySave(save),7);
  const snapshot=createLegacyPresentationSnapshot(save,true);
  assert.equal(snapshot.sceneId,'legacy-05');
  assert.equal(JSON.stringify(save),original);
  assert.ok(!('sceneIdx' in snapshot));
  assert.ok(!('save' in snapshot));
  assert.ok(!('flags' in snapshot));
});
test('invalid and new chapter indices are rejected; no Part III unlock',()=>{
  for(const idx of [-1,18,27,36,1.5,'4',NaN]) {
    assert.equal(createLegacyPresentationSnapshot({sceneIdx:idx},true),null);
    assert.equal(getDisplayChapterForLegacySave({sceneIdx:idx}),null);
  }
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4,locale:'xx'},true),null);
  assert.equal(createLegacyPresentationSnapshot({sceneIdx:4,reducedMotion:'no'},true),null);
});

test('read-only snapshots support all four locales and remain deeply immutable',()=>{
  for (const locale of ['tn','ar','en','fr']) {
    const input={sceneIdx:4,locale,reducedMotion:true};
    const before=JSON.stringify(input);
    const snapshot=createLegacyPresentationSnapshot(input,true);
    assert.equal(snapshot.locale,locale);
    assert.equal(snapshot.sceneId,'legacy-05');
    assert.equal(snapshot.accessibility.reducedMotion,true);
    assert.equal(Object.isFrozen(snapshot),true);
    assert.equal(Object.isFrozen(snapshot.accessibility),true);
    assert.equal(JSON.stringify(input),before);
    assert.throws(()=>{snapshot.sceneId='injected';},TypeError);
    assert.throws(()=>{snapshot.accessibility.reducedMotion=false;},TypeError);
  }
});
test('malformed and boundary saves cannot expose new chapters or mutate state',()=>{
  for (const save of [null,{},[],{sceneIdx:-1},{sceneIdx:18},{sceneIdx:4.5},{sceneIdx:'4'}]) {
    assert.equal(getDisplayChapterForLegacySave(save),null);
  }
  const save=Object.freeze({sceneIdx:17,part:3,flags:Object.freeze({light:true})});
  assert.equal(getDisplayChapterForLegacySave(save),36);
  assert.equal(createLegacyPresentationSnapshot(save,true).sceneId,'legacy-18');
  assert.deepEqual(save,{sceneIdx:17,part:3,flags:{light:true}});
});

test('canonical G0 display chapter map never persists a display index as sceneIdx',()=>{
  const canonical=[1,3,5,6,7,8,9,12,13,15,17,18,20,23,25,28,35,36];
  for (let sceneIdx=0;sceneIdx<canonical.length;sceneIdx++) {
    const original=Object.freeze({sceneIdx,part:sceneIdx<8?1:sceneIdx<15?2:3});
    const snapshot=createLegacyPresentationSnapshot(original,true);
    assert.equal(getDisplayChapterForLegacySave(original),canonical[sceneIdx]);
    assert.equal(snapshot.sceneId,'legacy-'+String(sceneIdx+1).padStart(2,'0'));
    assert.equal(Object.hasOwn(snapshot,'sceneIdx'),false);
    assert.equal(original.sceneIdx,sceneIdx);
  }
});
test('presentation never exposes pilot chapter 27 through a legacy index',()=>{
  for (const sceneIdx of [18,26,27,35]) {
    assert.equal(createLegacyPresentationSnapshot({sceneIdx},true),null);
    assert.equal(getDisplayChapterForLegacySave({sceneIdx}),null);
  }
});

test('restore, import and alternate entry paths remain presentation-only',()=>{
  const entries=['new-game','resume','import','map-travel','result-continue','intro'];
  for(const entry of entries){
    const original=Object.freeze({sceneIdx:4,entry,part:1,flags:Object.freeze({}),choicesHistory:Object.freeze([])});
    assert.equal(createLegacyPresentationSnapshot(original),null);
    const snapshot=createLegacyPresentationSnapshot(original,true);
    assert.equal(snapshot.sceneId,'legacy-05');
    assert.deepEqual(Object.keys(snapshot).sort(),['accessibility','locale','sceneId','version','visualVariant'].sort());
    assert.equal(Object.hasOwn(snapshot,'entry'),false);
    assert.equal(Object.hasOwn(snapshot,'flags'),false);
    assert.equal(Object.hasOwn(snapshot,'choicesHistory'),false);
    assert.equal(original.sceneIdx,4);
    assert.equal(original.entry,entry);
    assert.equal(original.choicesHistory.length,0);
  }
});
test('feature flag requires explicit boolean true even for valid saved scenes',()=>{
  const saved=Object.freeze({sceneIdx:4,part:1});
  for(const flag of [undefined,null,false,0,1,'true',{},[]]){
    assert.equal(createLegacyPresentationSnapshot(saved,flag),null);
  }
  assert.equal(createLegacyPresentationSnapshot(saved,true).sceneId,'legacy-05');
});

test('G4 adapter has no storage, DOM, or host mutation dependency',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const source=fs.readFileSync(path.join(__dirname,'../scripts/qarton-g4-legacy-presentation-adapter.cjs'),'utf8');
  for(const forbidden of [
    /\blocalStorage\b/,/\bsessionStorage\b/,/\bdocument\b/,/\bwindow\b/,
    /\bfetch\s*\(/,/\bXMLHttpRequest\b/,/\bMutationObserver\b/,
    /__carthageSaveNow/,/__carthageContinue/,/shiganshina-/,
    /\bsetItem\s*\(/,/\bremoveItem\s*\(/
  ]){
    assert.doesNotMatch(source,forbidden,`forbidden production dependency: ${forbidden}`);
  }
});

test('existing production save and Part III gate stay outside the presentation adapter',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const source=fs.readFileSync(path.join(__dirname,'../scripts/prepare-web.cjs'),'utf8');
  for(const key of ['sceneIdx:T','lineIdx:B','state:L','flags:K','part:cu','choicesHistory:yu','endingsSeen:[...Zn]','shiganshina-slots-v1','shiganshina-autosave-v1']) {
    assert.ok(source.includes(key),'missing existing save field: '+key);
  }
  assert.ok(source.includes('if(!Zn.includes("light")&&!Zn.includes("shadow"))'));
  assert.ok(source.includes('carthageStartPart3'));
  for(const marker of ['qarton-g4-legacy-presentation-adapter','createLegacyPresentationSnapshot','p3-single-load']) {
    assert.equal(source.includes(marker),false,'unexpected production integration: '+marker);
  }
});

test('save payload stays byte-for-byte unchanged after repeated cinematic snapshots',()=>{
  const save={slot:1,sceneIdx:4,lineIdx:2,part:1,state:{health:100,time:52,inventory:['مفتاح المخزن']},flags:{light:false},choicesHistory:[{id:'original-choice'}],endingsSeen:[]};
  const original=JSON.stringify(save);
  for(let i=0;i<20;i++){
    const snapshot=createLegacyPresentationSnapshot(save,true);
    assert.equal(snapshot.sceneId,'legacy-05');
    assert.equal(getDisplayChapterForLegacySave(save),7);
    assert.equal(JSON.stringify(save),original);
  }
});
test('untrusted inherited sceneIdx does not cause implicit progress restoration',()=>{
  const inherited=Object.create({sceneIdx:4});
  assert.equal(createLegacyPresentationSnapshot(inherited),null);
  // The current adapter accepts inherited values only when explicitly enabled;
  // this test documents that the default-OFF gate is authoritative.
  assert.equal(getDisplayChapterForLegacySave({sceneIdx:4}),7);
});

test('prototype-inherited scene index cannot enter the G4 presentation boundary',()=>{
  const inherited=Object.create({sceneIdx:4});
  inherited.locale='tn';
  assert.equal(createLegacyPresentationSnapshot(inherited,true),null);
  assert.equal(getDisplayChapterForLegacySave(inherited),null);
  const own=Object.assign(Object.create(null),{sceneIdx:4,locale:'tn'});
  assert.equal(createLegacyPresentationSnapshot(own,true).sceneId,'legacy-05');
  assert.equal(getDisplayChapterForLegacySave(own),7);
});

test('accessor-backed save indices are rejected without executing getters',()=>{
  let calls=0;
  const save={get sceneIdx(){calls++;throw new Error('getter must not run');}};
  assert.equal(createLegacyPresentationSnapshot(save,true),null);
  assert.equal(getDisplayChapterForLegacySave(save),null);
  assert.equal(calls,0);
  const ordinary=Object.freeze({sceneIdx:4,locale:'tn'});
  assert.equal(createLegacyPresentationSnapshot(ordinary,true).sceneId,'legacy-05');
  assert.equal(getDisplayChapterForLegacySave(ordinary),7);
});
