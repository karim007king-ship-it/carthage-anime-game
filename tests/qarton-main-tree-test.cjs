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
assert.ok(home.includes('function attachToApp()') && home.includes('rootWaiter=new MutationObserver'), 'main tree must wait for the app root if the game mounts after DOMContentLoaded');
assert.ok(home.includes('if(started)return;') && home.includes('rootWaiter.disconnect()'), 'late app-root attachment must happen once and release its waiter');
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

// Every main card must route to its own dedicated subview.
for (const marker of [
  'card("01","⚔","القصة"',
  'card("02","⌖","عالم قرطاج"',
  'card("03","▣","التقدم والحفظ"',
  'card("04","⚙","الإعدادات"'
]) assert.ok(home.includes(marker), 'missing main card route: ' + marker);
assert.ok(home.includes('true,showStory') && home.includes('true,showProgress'), 'Story and Progress cards must open their dedicated views');
assert.ok(home.includes('بداية جديدة • الأجزاء المتاحة') && !home.includes('بداية جديدة • متابعة • فصول القصة'), 'Story card must not promise Continue Save in the wrong section');
assert.ok(home.includes('الصوت السينمائي • مستوى الصوت') && !home.includes('الصوت • العرض • إمكانية الوصول'), 'Settings card must list only implemented settings');
assert.ok(home.includes('function proxyStoryAction(') && home.includes('live.click()'), 'Story actions must invoke the live original game buttons');
assert.ok(home.includes('menu.querySelector("button:first-child")') && home.includes('".home-actions.grid button:first-child"'), 'New Game must target the original first home action');
assert.ok(home.includes('root.querySelector("#btn-part2")') || home.includes('root.querySelector("#carthage-part3-start")'), 'Story must retain the original chapter entry controls');
assert.ok(home.includes('actionButton(panel,"carthage-continue-last"') && home.includes('actionButton(panel,"carthage-export-backup"') && home.includes('actionButton(panel,"carthage-import-backup"'), 'Progress must expose all original save actions when available');

// World and Settings are functional subviews backed only by existing game content and controls.
assert.ok(home.includes('card("02","⌖","عالم قرطاج"') && home.includes('card("04","⚙","الإعدادات"'), 'World and Settings must remain explicit main-tree branches');
assert.ok(home.includes('true,showWorld') && home.includes('true,showSettings'), 'World and Settings cards must open real subviews');
assert.ok(home.includes('الشخصيات • الأماكن • دليل المدينة') && !home.includes('الشخصيات • الأماكن • خريطة المدينة'), 'World card must not promise an interactive map that is not implemented');
assert.ok(home.includes('function showWorld()') && home.includes('function showSettings()'), 'both branches must render dedicated views');
for (const marker of ['ريان','لينا','عم منصور','القائدة نور','أمين','مريم','عم الهادي','ياسمين','القائد كريم','السوق','المستشفى','الجسر','البوابة']) {
  assert.ok(home.includes(marker), 'World guide is missing existing game content: ' + marker);
}
assert.ok(home.includes('function showSettings()'), 'Settings must open a dedicated view');
assert.ok(home.includes('document.getElementById("c17-audio-control")'), 'Settings must bridge to the real cinematic audio toggle');
assert.ok(home.includes('document.getElementById("c17-audio-volume")'), 'Settings must bridge to the real audio volume control');
assert.ok(home.includes('live.dispatchEvent(new Event("input",{bubbles:true}))'), 'volume changes must reach the original input handler');
for (const invented of ['أصوات الشخصيات — تشغيل / إيقاف','حجم الخط — عادي / كبير','تقليل الاهتزاز — تشغيل / إيقاف','جودة الحركة — سينمائية ثقيلة']) {
  assert.ok(!home.includes(invented), 'Settings must not advertise a control that the game does not provide: ' + invented);
}
assert.ok(home.includes('if(view==="world")') && home.includes('if(view==="settings")'), 'mutation observer must preserve both subviews');
assert.ok(home.includes('لا يغيّر وقت اللعب أو تقدمك'), 'World guide must be read-only');
assert.ok(home.includes('إعدادات الصوت المتاحة فعلياً في اللعبة'), 'Settings must describe the real available audio controls');

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
