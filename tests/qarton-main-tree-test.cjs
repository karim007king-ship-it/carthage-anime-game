const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'scripts/qarton-main-tree.js'), 'utf8');
const prep = fs.readFileSync(path.join(root, 'scripts/prepare-web.cjs'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const workflow = fs.readFileSync(path.join(root, '.github/workflows/android-apk.yml'), 'utf8');

// Parse the runtime before checking its behavior contracts.
new vm.Script(home, {filename:'qarton-main-tree.js'});

// The approved fixed home is a real four-branch 2x2 tree, not a restyled old menu.
for (const marker of [
  'grid-template-columns:repeat(2,minmax(0,1fr))',
  'grid-template-rows:repeat(2,minmax(0,1fr))',
  'القصة', 'عالم قرطاج', 'التقدم والحفظ', 'الإعدادات',
  'آخر يوم في قرطاج', 'QARTON', 'CULTURE • POWER • CINEMA',
  'safe-area-inset-top', 'safe-area-inset-bottom',
  '@media(max-height:650px)', 'prefers-reduced-motion:reduce'
]) assert.ok(home.includes(marker), 'missing main-tree design contract: ' + marker);

// Story and backup actions must invoke the existing app controls by ID at click time.
for (const id of [
  'carthage-continue-last', 'carthage-export-backup', 'carthage-import-backup'
]) assert.ok(home.includes(id), 'missing existing action bridge: ' + id);
assert.ok(home.includes('live.click()'), 'the tree must invoke original handlers, not recreate them');
assert.ok(home.includes('function showStory()'), 'Story branch must open the original game menu');
assert.ok(home.includes('function showProgress()'), 'Progress branch must expose original backup actions');
assert.ok(home.includes('function cleanupForGame()'), 'tree must disappear during gameplay');

// The two unfinished branches must remain visibly unavailable.
assert.ok(home.includes('card("02","⌖","عالم قرطاج"') && home.includes('card("04","⚙","الإعدادات"'), 'future branches must be explicit cards');
assert.ok(home.includes('if(!enabled)b.append(el("span","qt-status","قيد التطوير"))'), 'unfinished branches must be marked in development');

// Do not read, write, clear, migrate, clone, or move game-save data/controls.
assert.ok(!/localStorage|sessionStorage|shiganshina-(slots|autosave)/.test(home), 'home navigation must not access save storage');
assert.ok(!/cloneNode|replaceWith\(|insertBefore\(|appendChild\(original/.test(home), 'original React-owned controls must not be cloned or moved');
assert.ok(home.includes('shell.style.visibility="hidden"'), 'original story menu must be hidden behind the tree, not deleted');

// Android packaging must inject and verify the new runtime.
assert.ok(prep.includes('qarton-main-tree-runtime'), 'Android preparation must inject the main tree');
assert.ok(pkg.scripts.test.includes('qarton-main-tree-test.cjs'), 'npm test must run the main-tree contract test');
for (const marker of ['qarton-main-tree-runtime', 'التقدم والحفظ']) {
  assert.ok(workflow.includes(marker), 'Android APK verification must include ' + marker);
}
console.log('PASS: QARTON main-tree structure, safe original-control bridges, save isolation, and Android packaging.');
