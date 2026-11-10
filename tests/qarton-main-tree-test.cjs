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
assert.ok(!home.includes('}\\n  #qarton-main-tree'), 'CSS rules must be separated by real newlines, not literal backslash-n text');
assert.ok(!home.includes('/\\\\s+/g'), 'settings action matching must use a whitespace regex, not a literal backslash-s pattern');

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
assert.ok(home.includes('function showStory()'), 'Story branch must open a dedicated story subview');
// Continue-last-save belongs only to Progress & Saves, never the Story subview.
const storyStart = home.indexOf('function showStory(){');
const storyEnd = home.indexOf('function actionButton(', storyStart);
assert.ok(storyStart >= 0 && storyEnd > storyStart, 'Story subview boundaries must remain testable');
const storySubview = home.slice(storyStart, storyEnd);
assert.ok(!storySubview.includes('carthage-continue-last'), 'Story must not render a duplicate Continue Last Save action');
assert.ok(!storySubview.includes('متابعة آخر حفظ'), 'Story must not label a duplicate continue action');
const progressStart = home.indexOf('function showProgress(){');
const progressEnd = home.indexOf('function card(', progressStart);
assert.ok(progressStart >= 0 && progressEnd > progressStart, 'Progress subview boundaries must remain testable');
const progressSubview = home.slice(progressStart, progressEnd);
assert.ok(progressSubview.includes('carthage-continue-last'), 'Progress & Saves must own the continue action');
assert.ok(progressSubview.includes('carthage-export-backup') && progressSubview.includes('carthage-import-backup'), 'Progress & Saves must retain backup actions');
assert.ok(home.includes('function proxyStoryAction('), 'Story actions must proxy original controls');
assert.ok(home.includes('.home-actions.grid button:first-child'), 'Story subview must expose the original new-game action');
assert.ok(home.includes('hideLegacy();clearReturn();ensureOverlay();overlay.replaceChildren()'), 'Story subview must keep the legacy home hidden');
assert.ok(!home.includes('if(overlay)overlay.style.display="none";restoreLegacy()'), 'Story subview must not reveal the legacy home');
assert.ok(home.includes('function showProgress()'), 'Progress branch must expose original backup actions');
assert.ok(home.includes('function cleanupForGame()'), 'tree must disappear during gameplay');

// World and Settings are functional subviews backed only by existing game content and controls.
assert.ok(home.includes('card("02","⌖","عالم قرطاج"') && home.includes('card("04","⚙","الإعدادات"'), 'World and Settings must remain explicit main-tree branches');
assert.ok(home.includes('true,showWorld') && home.includes('true,showSettings'), 'World and Settings cards must open real subviews');
assert.ok(home.includes('function showWorld()') && home.includes('function showSettings()'), 'both branches must render dedicated views');
for (const marker of ['ريان','لينا','عم منصور','القائدة نور','أمين','مريم','عم الهادي','ياسمين','القائد كريم','السوق','المستشفى','الجسر','البوابة']) {
  assert.ok(home.includes(marker), 'World guide is missing existing game content: ' + marker);
}
assert.ok(home.includes('function proxyTextAction('), 'settings must bridge to existing controls');
for (const marker of ['صوت:','موسيقى:','أصوات الشخصيات','خط كبير','أقل اهتزاز','سينمائية ثقيلة']) {
  assert.ok(home.includes(marker), 'Settings view is missing an original setting: ' + marker);
}
assert.ok(home.includes('if(view==="world")') && home.includes('if(view==="settings")'), 'mutation observer must preserve both subviews');
assert.ok(home.includes('لا يغيّر وقت اللعب أو تقدمك'), 'World guide must be read-only');
assert.ok(home.includes('لا ننشئ تفضيلات منفصلة'), 'Settings must use native game settings');

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
