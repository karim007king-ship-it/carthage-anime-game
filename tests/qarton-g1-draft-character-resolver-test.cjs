'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizeCharacterRef,resolveChapterCharacters}=require('../scripts/qarton-g1-draft-character-resolver.cjs');
const chapter2=require('../game-content/story/chapters/p1-family-promise.json');
const chapter27=require('../game-content/story/chapters/p3-single-load.json');

test('unqualified and qualified known IDs normalize without changing originals or trust aliases',()=>{
 assert.equal(normalizeCharacterRef('ryan'),'char.ryan');
 assert.equal(normalizeCharacterRef('char.ryan'),'char.ryan');
 assert.equal(normalizeCharacterRef('noor'),'char.noor');
 assert.equal(normalizeCharacterRef('nour'),null);
 assert.equal(normalizeCharacterRef('father'),null);
 for(const bad of ['char.hala','char.unknown','char.char.ryan','RYAN',' ryan ',null,{},'__proto__'])assert.equal(normalizeCharacterRef(bad),null);
});

test('draft chapters with different reference formats resolve to canonical identities',()=>{
 const before2=JSON.stringify(chapter2),before27=JSON.stringify(chapter27);
 assert.deepEqual(resolveChapterCharacters(chapter2),{valid:true,characters:['char.ryan','char.lina','char.sara']});
 assert.deepEqual(resolveChapterCharacters(chapter27),{valid:true,characters:['char.ryan','char.lina','char.noor','char.karim','char.youssef']});
 assert.equal(JSON.stringify(chapter2),before2);assert.equal(JSON.stringify(chapter27),before27);
});

test('presence must be explicitly known; absent people cannot be fabricated',()=>{
 const input={ryan:true,lina:false,sara:true};
 assert.deepEqual(resolveChapterCharacters(chapter2,input),{valid:true,characters:['char.ryan','char.sara']});
 assert.equal(resolveChapterCharacters(chapter2,{ryan:true,sara:true}).reason,'unknown-presence');
 assert.equal(resolveChapterCharacters(chapter2,{ryan:'true',lina:true,sara:true}).reason,'unknown-presence');
 const getter={ryan:true,sara:true};Object.defineProperty(getter,'lina',{enumerable:true,get(){throw Error('must not execute');}});
 assert.equal(resolveChapterCharacters(chapter2,getter).reason,'unknown-presence');
});

test('unknown and duplicate canonical identities fail closed',()=>{
 assert.equal(resolveChapterCharacters({characters:['ryan','char.ryan']}).reason,'duplicate-character');
 assert.equal(resolveChapterCharacters({characters:['ryan','hala']}).reason,'unknown-character');
 assert.equal(resolveChapterCharacters({characters:null}).reason,'invalid-chapter');
});
