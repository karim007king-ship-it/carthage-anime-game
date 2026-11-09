const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'prepare-web.cjs'), 'utf8');
const declaration = source.match(/const recoverySeed = ("(?:\\\\.|[^"\\\\])*");/s);
assert.ok(declaration, 'recovery seed declaration must exist');

const seedHtml = vm.runInNewContext(declaration[1]);
const seedScript = seedHtml.match(/<script[^>]*>([\\s\\S]*?)<\\/script>/i);
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
  state: { time: 31, health: 77, courage: 140 }
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

console.log('PASS: recovery seed restores chapter 5 on clean installs and preserves every valid existing save.');
