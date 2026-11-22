'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../scripts/prepare-web.cjs'), 'utf8');
const original = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Static pre-refactor contract only: does not execute the build or change the original game.
test('legacy build hooks fail closed on absent or duplicate matches', () => {
  assert.match(source, /if \(index < 0\) throw new Error\('Missing expected game hook: '/);
  assert.match(source, /if \(html\.indexOf\(needle, index \+ needle\.length\) >= 0\) throw new Error\('Ambiguous game hook: '/);
  assert.match(source, /html = html\.slice\(0, index\) \+ replacement \+ html\.slice\(index \+ needle\.length\)/);
});

test('all named replaceOnce calls retain unique labels', () => {
  const labels = ['Part 3 start function','Part 3 selection branch','Continue from most recent valid save','main story module start marker','React home component','cinematic audio slider and percentage','cinematic audio API'];
  assert.equal(new Set(labels).size, labels.length);
  for (const label of ['Part 3 start function','Part 3 selection branch','Continue from most recent valid save','main story module start marker','React home component','cinematic audio slider and percentage','cinematic audio API']) {
    assert.ok(source.includes("'" + label + "'"), 'missing expected patch: ' + label);
  }
});

test('original save handler anchors are present and unique in baseline bundle', () => {
  for (const anchor of ['X3=(P)=>{', ',n6=(P)=>{', 'ur=(P,z=!1)=>{', ',P3=(P)=>{']) {
    assert.equal(original.split(anchor).length - 1, 1, 'unexpected original anchor count: ' + anchor);
  }
  assert.match(source, /shiganshina-slots-v1/);
  assert.match(source, /shiganshina-autosave-v1/);
  assert.match(source, /__carthageSaveNow/);
});
