'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','game-content/story/chapters',id+'.json'),'utf8'));
const byId=(ch,id)=>{const c=ch.choices.find(x=>x.id===id);assert.ok(c,ch.id+'/'+id);return c;};

test('relay hut decisions exactly match Astra effects, minutes and privacy',()=>{
 const ch=load('p2-relay-hut');
 assert.deepEqual(ch.choices.map(c=>c.id),['returned','message','untouched']);
 assert.deepEqual(ch.choices.map(c=>c.costMinutes),[1,1,0]);
 assert.deepEqual(byId(ch,'returned').proposedState,{relayHutAction:'returned',relayMessagePrivacy:'anonymous'});
 assert.deepEqual(byId(ch,'message').proposedState,{relayHutAction:'message',relayMessagePrivacy:'sealed'});
 assert.deepEqual(byId(ch,'untouched').proposedState,{relayHutAction:'untouched'});
 assert.equal(ch.continuity.inventoryPolicy,'do-not-add-pot-to-legacy-inventory');
 assert.equal(ch.continuity.unknownLegacyState,'neutral-no-prior-visit');
 assert.equal(ch.runtimeIntegrated,false);
});

test('names consent is not publication permission for other people',()=>{
 const ch=load('p2-names-consent');
 assert.deepEqual(ch.choices.map(c=>c.id),['redactNames','aminOwnTestimony','holdInEscrow']);
 assert.deepEqual(byId(ch,'redactNames').proposedState,{namesConsent:'redacted',aminTestimony:'eventsOnly'});
 assert.deepEqual(byId(ch,'aminOwnTestimony').proposedState,{namesConsent:'aminOnly',aminTestimony:'approvedPersonal'});
 assert.deepEqual(byId(ch,'holdInEscrow').proposedState,{namesConsent:'escrow',aminTestimony:'withheld'});
 assert.equal(ch.continuity.aminAbsent,'no-consent-attributed');
 assert.equal(ch.continuity.endingPolicy,'no-light-shadow-unlock');
 assert.equal(ch.continuity.inventoryPolicy,'do-not-duplicate-legacy-notebook');
 assert.equal(ch.runtimeIntegrated,false);
});
