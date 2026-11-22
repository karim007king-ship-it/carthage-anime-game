'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const chapter=JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters/p1-smoke-door.json'),'utf8'));

test('smoke rescue derived outcomes match all three original manuscript branches',()=>{
 const d=chapter.derivedOutputs.smokeRescue;
 assert.equal(d.from,'familySignal');
 assert.deepEqual(d.cases,{knocks:'knocks',mother:'mother',unknown:'improvised'});
 assert.equal(d.missingInput,'unknown');
 assert.ok(chapter.outputs.includes('smokeRescue'));
 assert.equal(d.oncePerChapter,true);
 assert.equal(d.application,'draft-only-not-runtime');
});

test('mother route requires a Sara absence fallback and old saves cannot invent prior choices',()=>{
 const d=chapter.derivedOutputs.smokeRescue;
 assert.equal(d.requiresOriginalPresenceCheck,'sara');
 assert.equal(d.missingSaraPolicy,'mother-route-without-sara-dialogue');
 assert.equal(chapter.legacySaveIndex,null);
 assert.equal(chapter.runtimeIntegrated,false);
 assert.equal(chapter.missingLegacyStatePolicy,'improvised');
 assert.equal(d.cases.unknown,'improvised');
});
