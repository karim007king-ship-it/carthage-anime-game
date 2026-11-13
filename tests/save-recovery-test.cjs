const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'prepare-web.cjs'), 'utf8');
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
  state: { time: 31, health: 77, courage: 140, clues: ["crack"], inventory: ["sword"] },
  flags: ["followedElias"],
  visited: [0, 1, 4],
  usedHotspots: ["photo"],
  choicesHistory: ["followed Elias"]
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

const malformed = boot({
  "shiganshina-slots-v1": [{ slot: 1, sceneIdx: 9, savedAtMs: 2000000000000, state: { time: 40, health: 80, courage: 90, clues: [], inventory: [] } }],
  "shiganshina-autosave-v1": null
});
assert.equal(malformed.get("shiganshina-slots-v1")[0].chapter, 5, "save records missing required restoration arrays must fall back to the recovery seed");


// Automatic saves must refresh only the autosave record, never overwrite a numbered manual slot.
const saveDeclaration = source.indexOf('const saveHandler = ' + String.fromCharCode(96));
assert.notEqual(saveDeclaration, -1, 'save handler declaration must exist');
const saveCodeStart = saveDeclaration + ('const saveHandler = ' + String.fromCharCode(96)).length;
const saveCodeEnd = source.indexOf(String.fromCharCode(96) + ';', saveCodeStart);
assert.notEqual(saveCodeEnd, -1, 'save handler template must terminate');
const saveCode = source.slice(saveCodeStart, saveCodeEnd);
const storedChapterFive = {
  slot: 1, chapter: 5, sceneIdx: 4, savedAtMs: 1700000000000,
  state: { time: 52, health: 100, courage: 112, clues: ['crack'], inventory: ['sword'] },
  flags: [], visited: [], usedHotspots: [], choicesHistory: []
};
const persisted = new Map([
  ['shiganshina-slots-v1', JSON.stringify([storedChapterFive, null, null])],
  ['shiganshina-autosave-v1', JSON.stringify(storedChapterFive)]
]);
const saveContext = {
  T: 9, an: Array.from({ length: 10 }, () => ({ place: 'مشهد الاختبار' })),
  L: { time: 40, health: 90, courage: 120, clues: ['alley'], inventory: ['key'] },
  K: ['new-game'], v9: [0, 1], af: ['door'], jf: 'normal', A9: 0, yu: ['new choice'],
  B: 2, e9: true, Qt: 'new choice', cu: 'part1', mu: false,
  tv: { current: [] }, Zn: [],
  localStorage: {
    getItem(key) { return persisted.has(key) ? persisted.get(key) : null; },
    setItem(key, value) { persisted.set(key, String(value)); }
  },
  $8(update) { this.slotState = update(this.slotState || [storedChapterFive, null, null]); },
  te(slot) { this.selectedSlot = slot; },
  fu() { return 'وقت الاختبار'; }, nn(value) { return String(value); },
  G(message) { this.lastToast = message; }, Date
};
vm.runInNewContext(saveCode, saveContext);
const autoResult = saveContext.ur(1, true);
assert.ok(autoResult, 'automatic save must complete');
assert.equal(JSON.parse(persisted.get('shiganshina-slots-v1'))[0].chapter, 5,
  'automatic save must preserve the existing chapter 5 manual slot');
assert.equal(JSON.parse(persisted.get('shiganshina-autosave-v1')).sceneIdx, 9,
  'automatic save must still refresh the autosave record');
assert.equal(saveContext.slotState, undefined,
  'automatic save must not replace the in-memory manual slot list');
const manualResult = saveContext.ur(2, false);
assert.ok(manualResult, 'manual save must complete');
const afterManual = JSON.parse(persisted.get('shiganshina-slots-v1'));
assert.equal(afterManual[0].chapter, 5, 'manual save to slot 2 must preserve slot 1');
assert.equal(afterManual[1].sceneIdx, 9, 'manual save must write the selected numbered slot');
assert.equal(saveContext.selectedSlot, 2, 'manual save must update the selected slot');

console.log('PASS: recovery seed, save validation, and autosave/manual-slot isolation checks.');
