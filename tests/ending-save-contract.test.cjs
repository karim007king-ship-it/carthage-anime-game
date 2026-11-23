'use strict';

// Independent ending/save audit and proposed-registry contract; no game code is changed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const prepare = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'prepare-web.cjs'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const v8Start = source.indexOf('var V8=[');
const wzStart = source.indexOf('],wz={', v8Start);
assert.ok(v8Start >= 0 && wzStart > v8Start, 'ending gallery registry exists');
const galleryKeys = [...source.slice(v8Start, wzStart).matchAll(/\{key:"([^"]+)"/g)].map(([, key]) => key);
assert.deepEqual(galleryKeys, ['hero', 'survivor', 'sacrifice', 'traitor', 'secret', 'light', 'shadow', 'rebuild', 'guardian']);
const wzEnd = source.indexOf('},oz=', wzStart);
assert.ok(wzEnd > wzStart, 'legacy ending scene map boundary exists');
const legacySceneKeys = [...source.slice(wzStart, wzEnd).matchAll(/([a-z]+):\{key:"\1"/g)].map(([, key]) => key);
assert.deepEqual(legacySceneKeys, ['hero', 'survivor', 'sacrifice', 'traitor', 'secret']);

const trackedStart = source.indexOf(',_7=[');
const trackedEnd = source.indexOf(']', trackedStart);
assert.ok(trackedStart >= 0 && trackedEnd > trackedStart, 'legacy ending whitelist exists');
const trackedKeys = [...source.slice(trackedStart, trackedEnd).matchAll(/"([^"]+)"/g)].map(([, key]) => key);
assert.deepEqual(trackedKeys, ['hero', 'survivor', 'sacrifice', 'traitor', 'secret', 'light', 'shadow']);
assert.deepEqual(galleryKeys.filter(key => !trackedKeys.includes(key)), ['rebuild', 'guardian']);

const choiceFinals = [...source.matchAll(/final:"([^"]+)"/g)].map(([, key]) => key);
assert.deepEqual([...new Set(choiceFinals)], ['hero', 'survivor', 'secret', 'rebuild', 'guardian']);
for (const key of galleryKeys.slice(5)) assert.ok(source.includes(`k==="${key}"`), `${key} has a dedicated ending renderer branch`);
assert.ok(source.includes('if(!Zn.includes(k))ru(P)'), 'entering an ending adds its selected key to the runtime seen set');
assert.ok(source.includes('endingsSeen:(Array.isArray(P.endingsSeen)?P.endingsSeen:[]).filter((i)=>_7.includes(i))'), 'JSON import currently filters seen endings through the seven-key whitelist');
assert.ok(source.includes('(P.endingsSeen||[]).filter((b)=>_7.includes(b))'), 'slot restore currently filters seen endings through the seven-key whitelist');
assert.ok(source.includes('part:P.part==="part2"?"part2":"part1"'), 'JSON import currently normalizes every non-part2 save to part1');
assert.ok(prepare.includes('if(f!=="game")return;let timer=window.setTimeout'), 'Android autosave only runs while the current page is gameplay');
assert.ok(prepare.includes('},[f,T,B,L,K,cu]);let P3=(P)=>{'), 'Android autosave watches game state but not the ending state');

// Proposed bridge rule: whitelist the full ending registry and preserve all current part values.
function restoreEndingKeys(keys) {
  const known = new Set(galleryKeys);
  return [...new Set(keys.filter(key => known.has(key)))];
}
for (const key of galleryKeys) assert.deepEqual(restoreEndingKeys([key]), [key]);
assert.deepEqual(restoreEndingKeys([...galleryKeys, 'unknown-ending', 'hero']), galleryKeys);
assert.deepEqual(restoreEndingKeys(trackedKeys), trackedKeys, 'all seven old ending IDs remain valid');

// Save index remains the stored locator; display chapter and stable ending keys are separate.
const legacySave = {app: 'shiganshina', version: 1, sceneIdx: 17, chapter: 18, part: 'part1', endingsSeen: ['hero', 'secret']};
const partThreeSave = {app: 'shiganshina', version: 1, sceneIdx: 35, chapter: 36, part: 'part3', endingsSeen: ['rebuild', 'guardian']};
assert.equal(legacySave.sceneIdx, 17);
assert.deepEqual(restoreEndingKeys(legacySave.endingsSeen), legacySave.endingsSeen);
assert.equal(partThreeSave.sceneIdx, 35);
assert.equal(partThreeSave.part, 'part3');
assert.deepEqual(restoreEndingKeys(partThreeSave.endingsSeen), ['rebuild', 'guardian']);
assert.match(packageJson.scripts['test:story-compat'], /story-registry-contract\.test\.cjs/);
assert.match(packageJson.scripts['test:story-compat'], /ending-save-contract\.test\.cjs/);
console.log('Ending/save contract: PASS (9 gallery IDs; 7 legacy tracked IDs; restore whitelist omits two; Android autosave does not observe endingsSeen)');
