'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizeLocationRef,resolveDraftLocation}=require('../scripts/qarton-g1-draft-location-resolver.cjs');
const chapter2=require('../game-content/story/chapters/p1-family-promise.json');

test('known location IDs normalize, unknown and malformed IDs fail closed',()=>{
 assert.equal(normalizeLocationRef('home'),'loc.home');
 assert.equal(normalizeLocationRef('loc.home'),'loc.home');
 for(const x of ['loc.unknown','loc.loc.home',' HOME ',null,{},'__proto__'])assert.equal(normalizeLocationRef(x),null);
});
test('existing chapter with no approved location never invents an image',()=>{
 const before=JSON.stringify(chapter2);
 assert.deepEqual(resolveDraftLocation(chapter2,{'loc.home':'home.webp'}),{valid:true,reason:'missing-art',locationRef:null,art:null});
 assert.equal(JSON.stringify(chapter2),before);
});
test('known place does not imply permission to display embedded art',()=>{
 const ch={location:{locationRef:'loc.home',artStatus:'not-approved'}};
 assert.deepEqual(resolveDraftLocation(ch,{'loc.home':'home.webp'}),{valid:true,reason:'not-approved',locationRef:'loc.home',art:null});
 assert.deepEqual(resolveDraftLocation({location:{locationRef:'loc.home',artStatus:'approved'}}),{valid:true,reason:'missing-art',locationRef:'loc.home',art:null});
 assert.deepEqual(resolveDraftLocation({location:{locationRef:'loc.home',artStatus:'approved'}},{'loc.home':'home.webp'}),{valid:true,reason:'approved',locationRef:'loc.home',art:'home.webp'});
});
test('invalid and accessor-backed art mappings fail closed without executing getters',()=>{
 assert.equal(resolveDraftLocation({location:{locationRef:'loc.invalid',artStatus:'approved'}}).reason,'unknown-location');
 assert.equal(resolveDraftLocation({location:null}).reason,'missing-location');
 const art={};Object.defineProperty(art,'loc.home',{get(){throw Error('must not execute');}});
 assert.equal(resolveDraftLocation({location:{locationRef:'loc.home',artStatus:'approved'}},art).reason,'missing-art');
});
