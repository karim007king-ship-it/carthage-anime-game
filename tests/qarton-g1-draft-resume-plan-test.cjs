'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planDraftResume}=require('../scripts/qarton-g1-draft-resume-plan.cjs');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const c=load('p2-protection-cost');
const cp=groups=>({schemaVersion:1,chapterId:c.id,groups});

test('missing Elias skips testimony and never replays completed boat decision',()=>{
 const checkpoint=cp({boat:'evacuateFamily'}),before=JSON.stringify(checkpoint);
 for(let i=0;i<3;i++)assert.deepEqual(planDraftResume(c,checkpoint,{'elias-present':false}),{valid:true,completed:['boat'],pending:[],skipped:['eliasPage']});
 assert.equal(JSON.stringify(checkpoint),before);
});

test('present Elias leaves only unrecorded testimony group pending',()=>{
 assert.deepEqual(planDraftResume(c,cp({boat:'keepForWatch'}),{'elias-present':true}),{valid:true,completed:['boat'],pending:['eliasPage'],skipped:[]});
 assert.deepEqual(planDraftResume(c,cp({boat:'keepForWatch',eliasPage:'declineTerms'}),{'elias-present':true}),{valid:true,completed:['boat','eliasPage'],pending:[],skipped:[]});
});

test('unknown presence fails closed and never fabricates a completed group',()=>{
 assert.equal(planDraftResume(c,cp({boat:'publicReview'}),{}).valid,false);
 assert.equal(planDraftResume(c,cp({boat:'publicReview'}),{'elias-present':'unknown'}).valid,false);
 assert.equal(planDraftResume(c,cp({boat:'publicReview',eliasPage:'recordTestimony'}),{'elias-present':false}).reason,'ineligible-completed-group');
 assert.equal(planDraftResume(c,{sceneIdx:21,lineIdx:1},{'elias-present':true}).valid,false);
});

test('chapter 11 always resumes only its uncompleted mandatory groups',()=>{
 const ch=load('p1-gate-manifest');
 const checkpoint={schemaVersion:1,chapterId:ch.id,groups:{seat:'yieldSeat'}};
 assert.deepEqual(planDraftResume(ch,checkpoint,{}),{valid:true,completed:['seat'],pending:['manifestCustody'],skipped:[]});
});
