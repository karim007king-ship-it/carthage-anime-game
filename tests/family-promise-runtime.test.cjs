'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const runtime = require('../scripts/p1-family-promise-runtime.cjs');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const prepare = fs.readFileSync(path.join(root, 'scripts/prepare-web.cjs'), 'utf8');
const storyStart = html.indexOf('an=[');
const storyEnd = html.indexOf('],Lz=', storyStart);
assert.ok(storyStart >= 0 && storyEnd > storyStart, 'original scene list is detectable');
const legacy = [...html.slice(storyStart, storyEnd).matchAll(/\{id:(\d+),title:"([^"]+)",place:"([^"]+)"/g)];
assert.equal(legacy.length, 18, 'original scene list still contains exactly 18 entries');
assert.deepEqual(legacy.map(([, id]) => Number(id)), Array.from({ length: 18 }, (_, index) => index + 1));

const newScene = runtime.createScene({ src: 'existing-original-artwork' });
const scenes = [...legacy.map(([, id, title, place]) => ({ id: Number(id), title, place, lines: Array.from({ length: 5 }, (_, lineIdx) => ({ text: `legacy-${lineIdx}` })) })), newScene];
assert.equal(scenes.length, 19);
assert.deepEqual(scenes.slice(0, 18).map((scene, index) => scene.id), Array.from({ length: 18 }, (_, index) => index + 1));
assert.equal(scenes[18].storyKey, 'p1-family-promise');
assert.equal(runtime.resolveNext(0), 18, 'original chapter one leads to appended promise at index 18');
assert.equal(runtime.resolveNext(18, 'continue'), 1, 'promise continues to original chapter two at index 1');
assert.equal(runtime.resolveNext(17), null, 'old final scene does not fall through to the appended chapter');
assert.equal(runtime.displayChapter(0), 1);
assert.equal(runtime.displayChapter(18), 2);
assert.equal(runtime.displayChapter(1), 3);

const preChoice = runtime.resolveScene(newScene, []);
assert.equal(preChoice.lines.length, 5);
assert.deepEqual(preChoice.choices.map(choice => choice.id), ['knocks', 'mother']);
assert.equal(preChoice.lines[0].id, 'story.p1-family-promise.line-001');
assert.equal(preChoice.lines[4].id, 'story.p1-family-promise.line-005');

for (const choiceId of ['knocks', 'mother']) {
  const savedState = { time: 52, health: 100, courage: 50 };
  const chosen = runtime.selectChoice(choiceId, [], savedState.time);
  assert.equal(chosen.accepted, true);
  assert.equal(chosen.time, 51, `${choiceId} costs exactly one minute`);
  assert.deepEqual(chosen.flags, [`familySignal:${choiceId}`]);
  const duplicate = runtime.selectChoice(choiceId, chosen.flags, chosen.time);
  assert.equal(duplicate.accepted, false, 'a saved family signal cannot be applied a second time');
  assert.equal(duplicate.time, 51);
  const branchScene = runtime.resolveScene(newScene, chosen.flags);
  assert.equal(branchScene.lines.length, 8);
  assert.deepEqual(branchScene.choices.map(choice => choice.id), ['continue']);
  assert.equal(branchScene.lines.at(-1).id, 'story.p1-family-promise.line-017');
  const restored = runtime.restoreProgress({ sceneIdx: 18, lineIdx: 5, flags: chosen.flags, state: savedState }, scenes);
  assert.equal(restored.sceneIdx, 18, 'save index remains the append-only engine index');
  assert.equal(restored.lineIdx, 5, 'mid-branch dialogue position survives restore');
  assert.deepEqual(restored.flags, chosen.flags);
  assert.deepEqual(restored.state, savedState);
}

const oldSave = { sceneIdx: 0, lineIdx: 4, flags: [], state: { time: 48, health: 90, courage: 45 } };
assert.deepEqual(runtime.restoreProgress(oldSave, scenes), oldSave, 'old saves without the new flag remain readable');
assert.equal(runtime.signalFrom(oldSave.flags), 'unknown', 'old saves receive no invented family choice');
assert.equal(runtime.selectChoice('continue', [], 40).accepted, false, 'cannot skip the required choice');
const noSignal = runtime.resolveScene(newScene, oldSave.flags);
assert.deepEqual(noSignal.choices.map(choice => choice.id), ['knocks', 'mother']);

assert.ok(prepare.includes('p1-family-promise-runtime.cjs'));
assert.ok(prepare.includes("window.__qartonStoryRuntime.createScene(N8)"));
assert.ok(prepare.includes('if(T===0)window.setTimeout(()=>L9(18)'));
assert.ok(prepare.includes('if(T<17)L9(T+1);else n("map")'));
assert.ok(prepare.includes('resolveScene(an[P.sceneIdx],P.flags||[]'));
assert.ok(!prepare.includes('P.sceneIdx+1'), 'no save-index remapping is introduced');
for (const ending of ['hero', 'survivor', 'sacrifice', 'traitor', 'secret', 'light', 'shadow', 'rebuild', 'guardian']) {
  assert.ok(html.includes(`key:"${ending}"`), `legacy ending ${ending} remains present in source`);
}

console.log('Family promise runtime: PASS (18 original indices, append-only index 18, both routes, once-only effects, midchapter restore, legacy endings)');
