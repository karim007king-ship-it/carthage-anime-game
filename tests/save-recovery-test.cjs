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

console.log('PASS: recovery seed restores chapter 5, preserves complete saves, and rejects incomplete save records.');
