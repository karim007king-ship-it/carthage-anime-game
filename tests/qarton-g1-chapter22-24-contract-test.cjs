'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));

test('chapter 22 requires two separate decisions and skips absent Elias',()=>{
 const c=load('p2-protection-cost');
 assert.deepEqual(c.choiceGroups.map(g=>g.id),['boat','eliasPage']);
 assert.deepEqual(c.choiceGroups.map(g=>g.choiceIds.length),[3,3]);
 assert.equal(c.choiceGroups[1].requiredIf,'elias-present');
 assert.equal(c.choices.length,6);
 for(const group of c.choiceGroups){for(const id of group.choiceIds)assert.equal(c.choices.find(x=>x.id===id)?.group,group.id);}
 assert.deepEqual(c.choices[0].proposedState,{boatDecision:'evacuateFamily',familyEvacuation:'attempted',dockWatch:'understaffed'});
 assert.deepEqual(c.choices[3].proposedState,{eliasPage:'heldConfidential',eliasSourceConsent:'withheld'});
 assert.equal(c.continuity.timeCost,'pending-editorial-balance');
 assert.equal(c.runtimeIntegrated,false);
});

test('chapter 24 proposes only light and shadow after actual confirmation',()=>{
 const c=load('p2-truth-gate');
 assert.deepEqual(c.choices.map(x=>x.proposedEnding),['light','shadow']);
 assert.ok(c.choices.every(x=>x.confirmationRequired));
 assert.equal(c.choices[1].guard,'named-custodian-two-present-witnesses-review-date');
 assert.deepEqual(c.choices[0].proposedState,{part2Resolution:'light',publicHearingOpened:true});
 assert.deepEqual(c.choices[1].proposedState,{part2Resolution:'shadow',escrowEstablished:true,escrowReviewDue:'part3-ch33'});
 assert.equal(c.continuity.endingTrigger,'confirmed-in-playthrough-only-no-preview');
 assert.equal(c.continuity.oldSave,'do-not-infer-part2-resolution');
 assert.equal(c.runtimeIntegrated,false);
});
