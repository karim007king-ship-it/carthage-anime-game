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

// The main tree must mount even when the legacy menu's class names differ or it is absent.
const mountStart = home.indexOf('function mount(){');
const mountEnd = home.indexOf('function schedule(){', mountStart);
assert.ok(mountStart >= 0 && mountEnd > mountStart, 'mount function boundaries must remain testable');
const mountSource = home.slice(mountStart, mountEnd);
assert.ok(mountSource.includes('root=document.getElementById("root")') && mountSource.includes('if(!root)return'), 'mount must still wait for the application root');
assert.ok(!/if\\s*\\(\\s*!shell\\s*\\)\\s*return/.test(mountSource), 'QARTON home must not disappear when the legacy menu selector is missing');
assert.ok(mountSource.includes('addStyle();goTree();'), 'mount must render the QARTON tree once the app root exists');
assert.ok(mountSource.includes('if(view!=="game"||overlay)cleanupForGame()'), 'game mutations must not repeatedly run cleanup after gameplay has already started');
assert.ok(home.includes('observer.observe(root,{subtree:true,childList:true})'), 'main-tree observer must avoid expensive attribute and text mutation tracking during gameplay');
assert.ok(home.includes('observer.disconnect();observer=null;'), 'main-tree observer must stop completely after gameplay starts');
assert.ok(!home.includes('observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true'), 'main-tree observer must not watch every animated style/class mutation');


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
assert.ok(home.includes('function handoffStoryAction(live)'), 'story actions must hand off to the original screen so confirmation dialogs remain visible');
assert.ok(home.includes('if(overlay)overlay.style.display="none";restoreLegacy();clearReturn();'), 'story handoff must reveal the native app layer before invoking its original action');
assert.ok(home.includes('if(live&&!live.disabled)handoffStoryAction(live);'), 'new game and chapter actions must use the safe story handoff');
assert.ok(home.includes('view="handoff";if(overlay)overlay.style.display="none";restoreLegacy();'), "story handoff must enter a persistent handoff state before clicking the native control");
assert.ok(mountSource.includes('if(view==="handoff"){restoreLegacy();if(overlay)overlay.style.display="none";return;}'), "mutation-driven remounts must not hide the native confirmation dialog during story handoff");
assert.ok(home.includes('function findNewGameButton(container)'), 'Story subview must resolve the original new-game action');
assert.ok(home.includes('hideLegacy();clearReturn();ensureOverlay();overlay.replaceChildren()'), 'Story subview must keep the legacy home hidden');
assert.ok(!storySubview.includes('restoreLegacy()') && !storySubview.includes('overlay.style.display="none"'), 'Story subview must keep the legacy home hidden until a native story action is invoked');
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
assert.ok(home.includes("function findNewGameButton(container)") && home.includes('proxyStoryAction(panel,"@new-game"'), "New Game must resolve the real primary story action instead of assuming a fixed button position");
assert.ok(home.includes('b.dataset.qartonKind==="primary"') && home.includes("/ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/"), "New Game lookup must recognize the primary action by semantic label");
assert.ok(home.includes("if(primary)return primary;return null;"), "New Game lookup must fail closed instead of clicking an unrelated menu button when no semantic start action is found");
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
assert.ok(home.includes("function getSubviewSignature()"), "Story and Progress must expose a stable signature for their live original controls");
assert.ok(home.includes('if(view==="story"){hideLegacy();if(!overlay||getSubviewSignature()!==viewSignature)showStory();return;}'), "Story view must refresh when original new-game or chapter controls arrive after the view opens");
assert.ok(home.includes('if(view==="progress"){hideLegacy();if(!overlay||getSubviewSignature()!==viewSignature)showProgress();return;}'), "Progress view must refresh when continue or backup controls arrive after the view opens");
assert.ok(home.includes("viewSignature=getSubviewSignature();"), "subviews must remember the rendered control signature to avoid unnecessary redraws");
assert.ok(home.includes('if(view==="settings"){var audio=document.getElementById("c17-audio-control");var volume=document.getElementById("c17-audio-volume");'), "Settings must detect late-loaded original audio controls");
assert.ok(home.includes('if(view==="settings"){hideLegacy();if(!overlay||getSubviewSignature()!==viewSignature)showSettings();return;}'), "Settings view must refresh when original audio controls arrive after opening");
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

// The optional layout inspector must not retain dead state or a disconnected observer.
const inspector = fs.readFileSync(path.join(root, 'scripts/qarton-home-inspector.js'), 'utf8');
new vm.Script(inspector, {filename:'qarton-home-inspector.js'});
assert.ok(!inspector.includes('seenHome'), 'layout inspector must not retain unused seenHome state');
assert.ok(inspector.includes('observer.disconnect();observer=null;'), 'layout inspector must release its observer reference after gameplay starts');

console.log('PASS: QARTON main-tree structure, safe original-control bridges, save isolation, and Android packaging.');
