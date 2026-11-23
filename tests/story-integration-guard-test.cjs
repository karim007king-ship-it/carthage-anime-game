'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const preparation = fs.readFileSync(path.join(root, 'scripts/prepare-web.cjs'), 'utf8');

// Guard the legacy production entry points before introducing new chapter content.
const requiredHooks = [
  'X3=(P)=>{', ',n6=(P)=>{',
  'ur=(P,z=!1)=>{', ',P3=(P)=>{',
  ',Bu=(P)=>{', 'Bu=(P)=>{if(P===9)', ',Zu=()=>{'
];
for (const hook of requiredHooks) {
  const first = source.indexOf(hook);
  assert.notEqual(first, -1, 'Missing legacy hook: ' + hook);
  assert.equal(source.indexOf(hook, first + hook.length), -1,
    'Ambiguous legacy hook: ' + hook);
}
assert.match(preparation, /fs\.copyFileSync\(source, target\)/,
  'Android preparation must start from the original source');
assert.match(preparation, /replaceOnce\(/,
  'Legacy replacements must reject missing or ambiguous hooks');
assert.match(preparation, /window\.__carthageCanStartPart3/,
  'Legacy part unlock gate must be preserved');
assert.match(preparation, /shiganshina-autosave-v1/,
  'Legacy save key must be preserved');
console.log('Legacy production hook integrity: PASS (not a 36-chapter playability test)');
