const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'prepare-web.cjs'), 'utf8');

// Both recovery seeding and the Continue action must reject structurally incomplete records.
assert.ok(source.includes('Array.isArray(s.flags)&&Array.isArray(s.visited)&&Array.isArray(s.usedHotspots)&&Array.isArray(s.choicesHistory)&&Array.isArray(s.state.clues)&&Array.isArray(s.state.inventory)'), 'recovery seed must validate every required restoration collection');
assert.ok(source.includes('Array.isArray(v.flags)&&Array.isArray(v.visited)&&Array.isArray(v.usedHotspots)&&Array.isArray(v.choicesHistory)&&Array.isArray(v.state.clues)&&Array.isArray(v.state.inventory)'), 'Continue must reject incomplete saves before selecting the newest record');
const declarationStart = source.indexOf('const recoverySeed = ');
assert.notEqual(declarationStart, -1, 'recovery seed declaration must exist');
const valueStart = source.indexOf('"', declarationStart);
assert.notEqual(valueStart, -1, 'recovery seed must be a quoted string');
let valueEnd = valueStart + 1;
for (; valueEnd < source.length; valueEnd++) {
  if (source[valueEnd] === '\\') { valueEnd++; continue; }
  if (source[valueEnd] === '"') break;
}
assert.ok(valueEnd < source.length, 'recovery seed string must terminate');
const seedHtml = vm.runInNewContext(source.slice(valueStart, valueEnd + 1));
const seedScript = seedHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
assert.ok(seedScript, 'recovery seed must contain an executable script');

function boot(initial = {}) {
  const data = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]));
  const localStorage = {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); }
  };
  vm.runInNewContext(seedScript[1], { localStorage, console, Date });
  return {
    get(key) { const value = data.get(key); return value === undefined ? null : JSON.parse(value); }
  };
}

const fresh = boot();
const freshSlots = fresh.get('shiganshina-slots-v1');
assert.ok(Array.isArray(freshSlots), 'fresh install must receive save slots');
assert.equal(freshSlots[0].chapter, 5, 'fresh install must restore the backed-up chapter 5');
assert.equal(freshSlots[0].sceneIdx, 4, 'fresh install must restore the backed-up scene');
assert.equal(freshSlots[0].state.health, 100, 'recovery seed must preserve health');
assert.equal(freshSlots[0].state.courage, 112, 'recovery seed must preserve courage');
assert.equal(fresh.get('shiganshina-autosave-v1').chapter, 5, 'continue flow must receive the recovery autosave');

const newer = {
  slot: 2,
  chapter: 7,
  sceneIdx: 12,
  savedAtMs: 1900000000000,
  flags: [],
  visited: [],
  usedHotspots: [],
  choicesHistory: [],
  state: { time: 31, health: 77, courage: 140, clues: [], inventory: [] }
};
const existingSlots = [null, newer, null];
const existingAuto = { ...newer, slot: 2 };
const preserved = boot({
  'shiganshina-slots-v1': existingSlots,
  'shiganshina-autosave-v1': existingAuto
});
assert.deepEqual(preserved.get('shiganshina-slots-v1'), existingSlots, 'valid existing slots must never be overwritten');
assert.deepEqual(preserved.get('shiganshina-autosave-v1'), existingAuto, 'valid existing autosave must never be overwritten');

const invalid = boot({
  'shiganshina-slots-v1': [{ chapter: 99, sceneIdx: -1, state: {} }],
  'shiganshina-autosave-v1': { chapter: 99, sceneIdx: -1, state: {} }
});
assert.equal(invalid.get('shiganshina-slots-v1')[0].chapter, 5, 'invalid save data must fall back to the confirmed recovery seed');

const incomplete = boot({
  'shiganshina-slots-v1': [{ chapter: 8, sceneIdx: 9, state: { time: 40, health: 90, courage: 80 } }],
  'shiganshina-autosave-v1': null
});
assert.equal(incomplete.get('shiganshina-slots-v1')[0].chapter, 5, 'structurally incomplete saves must not block the confirmed recovery seed');


// Import slot selection must never silently replace a valid save when a backup has no slot number.
const transferStart = source.indexOf('const saveTransfer = `');
const transferEnd = source.indexOf('`;\nif (!html.includes', transferStart);
assert.ok(transferStart >= 0 && transferEnd > transferStart, 'save-transfer runtime boundaries must remain testable');
const transfer = source.slice(transferStart, transferEnd);
const validStart = transfer.indexOf('function valid(s){');
const validEnd = transfer.indexOf('function chooseImportSlot(', validStart);
const chooseStart = validEnd;
const chooseEnd = transfer.indexOf(' async function exportSave()', chooseStart);
assert.ok(validStart >= 0 && validEnd > validStart && chooseEnd > chooseStart, 'save import must validate saves and select a safe target slot');
const chooseImportSlot = vm.runInNewContext(transfer.slice(validStart, validEnd) + transfer.slice(chooseStart, chooseEnd) + ';chooseImportSlot');
const validSave = {sceneIdx:4,flags:[],visited:[],usedHotspots:[],choicesHistory:[],state:{time:52,health:100,courage:112,clues:[],inventory:[]}};
assert.equal(chooseImportSlot({}, [validSave, null, null]), 2, 'an unassigned backup must use the first empty slot');
assert.equal(chooseImportSlot({}, [validSave, validSave, validSave]), 0, 'an unassigned backup must be rejected when all slots are occupied');
assert.equal(chooseImportSlot({slot:3}, [validSave, validSave, null]), 3, 'an explicitly assigned backup must retain its selected slot when empty');
assert.equal(chooseImportSlot({slot:2}, [validSave, validSave, null]), 3, 'an occupied source slot must fall back to another empty slot instead of overwriting');
assert.equal(chooseImportSlot({slot:3}, [validSave, validSave, validSave]), 0, 'an explicitly assigned backup must also be rejected when all slots are occupied');
assert.ok(transfer.includes('if(!slot)throw new Error("خانات الحفظ الثلاث ممتلئة.'), 'a full set of saves must produce a clear import error instead of overwriting slot one');
assert.ok(transfer.includes('slotCheck=JSON.parse(localStorage.getItem("shiganshina-slots-v1")||"[]")') && transfer.includes('!valid(slotCheck[slot-1])'), 'import must verify both the selected slot and the autosave after writing');

// Save UI state must only be updated after the persisted slot has been read back successfully.
const saveHandlerStart = source.indexOf('const saveHandler = `');
const saveHandlerEnd = source.indexOf('`;\nconst autosaveHook', saveHandlerStart);
assert.ok(saveHandlerStart >= 0 && saveHandlerEnd > saveHandlerStart, 'save handler must remain isolated for verification');
const saveHandler = source.slice(saveHandlerStart, saveHandlerEnd);
assert.ok(saveHandler.indexOf('verify=JSON.parse') >= 0 && saveHandler.indexOf('$8((b)=>') > saveHandler.indexOf('verify=JSON.parse'), 'React save-slot state must update only after storage verification');

console.log('PASS: recovery seed restores chapter 5 on clean installs and preserves every valid existing save.');
