'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const original=read('tests/fixtures/qarton-s1-texts.snapshot.json');
const locale=read('game-content/locales/tn.json');
const scenes=read('tests/fixtures/qarton-s1-original-scenes.snapshot.json').scenes;

test('all 848 Tunisian text values equal the pinned S1 source',()=>{
 assert.equal(locale.status,'draft-not-runtime');
 assert.equal(locale.locale,'tn');
 assert.equal(locale.source.blob,original.source.blob);
 assert.equal(Object.keys(locale.texts).length,848);
 const expected=Object.fromEntries(Object.entries(original.texts).map(([key,item])=>[key,item.tn]));
 assert.deepEqual(locale.texts,expected);
 for(const value of Object.values(locale.texts)) assert.equal(typeof value,'string');
});

test('every extracted chapter text key resolves to canonical Tunisian value',()=>{
 const keys=new Set(Object.keys(locale.texts));
 const visit=(node)=>{
  if(typeof node==='string' && node.startsWith('story.')) assert.ok(keys.has(node),'unresolved '+node);
  else if(Array.isArray(node)) for(const value of node) visit(value);
  else if(node && typeof node==='object') for(const value of Object.values(node)) visit(value);
 };
 for(const scene of scenes) {
  const chapter=read('game-content/story/chapters/'+scene.id+'.json');
  for(const key of ['texts','lines','hotspots','choices']) visit(chapter[key]);
 }
});
