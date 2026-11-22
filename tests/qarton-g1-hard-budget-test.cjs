'use strict';

// Read-only arithmetic fixtures for the G1 manuscript. No browser or save state.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const balance = fs.readFileSync(path.join(root, 'docs/qarton-g1-choice-balance.md'), 'utf8');
const literal = source.match(/,an=(\[\{id:1,title:.*?\]),Lz=/s)[1];
const scenes = vm.runInNewContext(literal.replace(/\bimage:[\w$]+/g, 'image:null'), {}, { timeout: 1000 });
const costs = new Map(Array.from(balance.matchAll(/^\| \[\d+\]\([^)]+\) \| `(\w+)` \| (\d+) \|/gm),
  ([, id, cost]) => [id, Number(cost)]));
const startTime = Number(source.match(/hard:\{label:"صعبة",icon:"[^"]+",time:(\d+)/)[1]);
const startCourage = Number(source.match(/\$7=\{time:\d+,health:\d+,courage:(\d+)/)[1]);
const mapCost = Number(source.match(/let z=L\.time-(\d+);if\(M8/)[1]);
const destinations = new Set(Array.from(source.match(/if\(f==="map"\)\{let P=(\[.*?\]);return/s)[1]
  .matchAll(/idx:(\d+)/g), match => Number(match[1]) + 1));

function budget(stops, draftChoices, gateChoice) {
  let time = startTime;
  let courage = startCourage;
  let moves = 0;
  const flags = new Set();
  const clues = new Set();
  const route = [...stops, [8, gateChoice]];
  for (const [index, [chapter, choiceId, searches = []]] of route.entries()) {
    if (index > 0) {
      const previous = scenes[route[index - 1][0] - 1];
      if (previous.after === 'linear') {
        assert.equal(chapter, previous.id + 1);
      } else {
        assert.equal(previous.after, 'map');
        assert.ok(destinations.has(chapter) && previous.id !== chapter);
        moves++;
        time -= mapCost;
      }
    }
    const scene = scenes[chapter - 1];
    const choice = scene.choices.find(entry => entry.id === choiceId);
    assert.ok(choice, choiceId);
    if (chapter === 8) {
      for (const id of draftChoices) {
        assert.ok(costs.has(id), id);
        time -= costs.get(id);
      }
      return { time, afterGate: time - choice.time, courage, moves, flags, clues };
    }
    for (const id of searches) {
      const item = scene.hotspots.find(entry => entry.id === id);
      assert.ok(item && !item.needsTrust);
      if (item.clue) clues.add(item.clue);
      courage = Math.min(120, courage + (item.courage || 0));
    }
    time -= choice.time;
    courage = Math.min(120, courage + (choice.courage || 0));
    if (choice.flag) flags.add(choice.flag);
  }
}
const start = [[1, 'stay'], [2, 'believeElias']];
const rescue = [[5, 'helpMansour'], [6, 'stayHelp']];
const basic = ['knocks', 'keepGroup', 'keepWithNoor'];

test('hard hero candidate using hospital rescue and a direct gate arrival', () => {
  const r = budget([...start, ...rescue], basic, 'gateOpenAlone');
  assert.deepEqual([...r.flags].filter(id => ['protectedLina', 'savedFather', 'helpedMansour'].includes(id)).sort(),
    ['helpedMansour', 'protectedLina', 'savedFather']);
  assert.deepEqual([r.moves, r.time, r.afterGate, r.courage], [3, 23, 21, 78]);
});

test('escorting the families and helping at the bridge consumes the longer route budget', () => {
  const r = budget([...start, ...rescue, [7, 'helpWoman']],
    ['knocks', 'escortFamilies', 'helpNearby', 'appealManifest', 'keepWithNoor'], 'gateOpenAlone');
  assert.deepEqual([r.moves, r.time, r.afterGate], [4, 10, 8]);
  assert.ok(r.courage > 70); // Already sufficient without the proposed smoke rescue bonus.
});

test('hard secret candidate collects all five original clues before the gate', () => {
  const r = budget([[1, 'stay', ['window']], [2, 'believeElias', ['cart']], [3, 'toFather', ['stone']],
    [5, 'helpMansour', ['oldmap']], [6, 'takeRun', ['file']]], basic, 'gateListenElias');
  assert.deepEqual([...r.clues].sort(), ['alley', 'crack', 'file', 'oldmap', 'stone']);
  assert.deepEqual([r.moves, r.time, r.afterGate], [4, 17, 15]);
});

test('source eligibility at the exact courage, time and clue boundaries', () => {
  const hero = source.match(/,Uu=(.*?),_u=/)[1];
  const secret = source.match(/,_u=(.*?),\$u=/)[1];
  const K = ['protectedLina', 'savedFather', 'helpedMansour'];
  const JH = Array.from(source.match(/JH=\[([^\]]+)\]/)[1].matchAll(/"(\w+)"/g), m => m[1]);
  for (const [courage, time, expected] of [[70, 6, false], [71, 5, false], [71, 6, true]]) {
    assert.equal(vm.runInNewContext(hero, { K, L: { courage, time } }), expected);
  }
  assert.equal(JH.length, 5);
  for (const count of [4, 5]) {
    assert.equal(vm.runInNewContext(secret, { JH, L: { clues: JH.slice(0, count) } }), count === 5);
  }
});
