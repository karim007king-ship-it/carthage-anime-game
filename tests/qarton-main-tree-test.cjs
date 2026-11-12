const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'scripts/qarton-main-tree.js'), 'utf8');
const premium = fs.readFileSync(path.join(root, 'scripts/qarton-premium-home.js'), 'utf8');
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
assert.ok(home.includes('observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["disabled","id"],characterData:true})'), 'main-tree observer must track only control availability, identity, and label changes while home UI is active');
assert.ok(home.includes('observer.disconnect();observer=null;'), 'main-tree observer must stop completely after gameplay starts');
assert.ok(home.includes('lifecycleObserver=new MutationObserver(function(){if(isPlaying())return;'), 'a lightweight lifecycle observer must detect return from gameplay without running home rendering work');
assert.ok(home.includes('lifecycleObserver.observe(root,{subtree:true,childList:true})'), 'return watcher must observe only child-list changes during gameplay');
assert.ok(home.includes('lifecycleObserver.disconnect();lifecycleObserver=null;started=false;attachToApp();'), 'return watcher must release itself and reattach the home observer when gameplay ends');
assert.ok(!/attributeFilter:\[[^\]]*(?:class|style)/.test(home), 'main-tree observer must not watch every animated style/class mutation');


// The approved fixed home is a real four-branch 2x2 tree, not a restyled old menu.
for (const marker of [
  'grid-template-columns:repeat(2,minmax(0,1fr))',
  'grid-template-rows:repeat(2,minmax(0,1fr))',
  'القصة', 'عالم قرطاج', 'التقدم والحفظ', 'الإعدادات',
  'آخر يوم في قرطاج', 'QARTON', 'CULTURE • POWER • CINEMA',
  'safe-area-inset-top', 'safe-area-inset-bottom',
  '@media(max-height:650px)', 'prefers-reduced-motion:reduce'
]) assert.ok(home.includes(marker), 'missing main-tree design contract: ' + marker);

// Exercise the semantic new-game resolver against button-like controls, not only source markers.
const findStart = home.indexOf('function findNewGameButton(container){');
const findEnd = home.indexOf('function handoffStoryAction(', findStart);
assert.ok(findStart >= 0 && findEnd > findStart, 'new-game resolver boundaries must remain testable');
const findNewGameButton = vm.runInNewContext(home.slice(findStart, findEnd) + ';findNewGameButton');
const makeButton = (text, disabled=false, kind='') => ({textContent:text,disabled,dataset:{qartonKind:kind}});
const unrelated = makeButton('الإعدادات');
const primaryStart = makeButton('ابدأ الجزء الأول');
assert.equal(findNewGameButton({querySelectorAll:()=>[unrelated,primaryStart]}), primaryStart, 'new-game resolver must select the real story-start control');
assert.equal(findNewGameButton({querySelectorAll:()=>[makeButton('الإعدادات'),makeButton('تصدير الحفظ')]}), null, 'new-game resolver must fail closed when no start control exists');
assert.equal(findNewGameButton({querySelectorAll:()=>[makeButton('لعبة جديدة',true)]}), null, 'new-game resolver must not activate a disabled start control');

// Story and backup actions must invoke the existing app controls by ID at click time.
for (const id of [
  'carthage-continue-last', 'carthage-export-backup', 'carthage-import-backup'
]) assert.ok(home.includes(id), 'missing existing action bridge: ' + id);
assert.ok(home.includes('live.click()'), 'the tree must invoke original handlers, not recreate them');
assert.ok(home.includes('function showStory()'), 'Story branch must open a dedicated story subview');
assert.ok(home.includes('root.querySelector(".home-actions.grid")||root.querySelector(".home-actions")||root'), 'Story start lookup must fall back to semantic search across the app root when legacy menu classes differ');
assert.ok(home.includes('var menu=root&&(root.querySelector(".home-actions.grid")||root.querySelector(".home-actions")||root);var live=selector==="@new-game"?findNewGameButton(menu)'), 'New Game proxy click must use the same resilient menu lookup as the visible story action');
assert.ok(home.includes('if(view==="story"){var menu=root&&(root.querySelector(".home-actions.grid")||root.querySelector(".home-actions")||root);var start=findNewGameButton(menu);'), 'Story subview signature must observe the same fallback menu so button state updates remain visible');
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
assert.ok(home.includes('if(overlay)overlay.style.display="none";restoreLegacy();clearReturn();'), 'story handoff must restore the original game container before invoking the start action');
assert.ok(home.includes('if(live&&!live.disabled)handoffStoryAction(live);'), 'new game and chapter actions must use the safe story handoff');
assert.ok(home.includes('view="handoff";if(overlay)overlay.style.display="none";restoreLegacy();'), "story handoff must restore the game container before entering the original story flow");
assert.ok(mountSource.includes('if(view==="handoff"){if(overlay)overlay.style.display="none";return;}'), "mutation-driven remounts must not re-hide the original game container during story handoff");
assert.ok(home.includes('function findNewGameButton(container)'), 'Story subview must resolve the original new-game action');
assert.ok(home.includes('hideLegacy();clearReturn();ensureOverlay();overlay.replaceChildren()'), 'Story subview must keep the legacy home hidden');
assert.ok(!storySubview.includes('restoreLegacy()') && !storySubview.includes('overlay.style.display="none"'), 'Story subview must keep the legacy home hidden until a native story action is invoked');
assert.ok(home.includes('function showProgress()'), 'Progress branch must expose original backup actions');
assert.ok(home.includes('function cleanupForGame()'), 'tree must disappear during gameplay');
const cleanupStart = home.indexOf('function cleanupForGame(){');
const cleanupEnd = home.indexOf('function mount(){', cleanupStart);
assert.ok(cleanupStart >= 0 && cleanupEnd > cleanupStart, 'game cleanup boundaries must remain testable');
assert.ok(!home.slice(cleanupStart, cleanupEnd).includes('restoreLegacy()'), 'gameplay transition must not reveal the legacy home behind the story screen');

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

// Home-only observers must stop doing broad scans during gameplay, then resume after a stable return.
assert.ok(premium.includes('if(observer){observer.disconnect();observer=null}'), 'premium home observer must disconnect while the story is active');
assert.ok(premium.includes('gameplayObserver.observe(root,{subtree:true,childList:true})'), 'premium home must use a lightweight gameplay return watcher');
assert.ok(premium.includes('returnTimer=window.setTimeout(function(){returnTimer=0;var current=document.getElementById("root");if(!current||playing(current))return;gameplayObserver.disconnect();gameplayObserver=null;boot()},120)'), 'premium home must debounce the return transition before restarting its home observer');
assert.ok(prep.includes('else if(!playing&&saveButton)saveButton.remove();if(playing)return;var continueButton='), 'native navigation must skip home-menu and save scans while gameplay is active');

// Android packaging must inject and verify the new runtime.
assert.ok(prep.includes('qarton-main-tree-runtime'), 'Android preparation must inject the main tree');
assert.ok(prep.includes('function isQartonScrollable(target)') && prep.includes('#qarton-main-tree .qt-scroll'), 'fixed home scroll lock must allow scrolling inside QARTON guide subviews');
assert.ok(prep.includes('overscroll-behavior:none!important;touch-action:auto}') && !prep.includes('touch-action:pan-x}'), 'fixed home viewport must not block vertical touch gestures inside scrollable guide panels');
assert.ok(prep.includes('if(observer){observer.disconnect();observer=null}watchGameplayEnd(root)'), 'fixed home viewport observer must pause during gameplay');
assert.ok(prep.includes('gameplayObserver.observe(activeRoot,{subtree:true,childList:true})'), 'fixed home viewport must use a lightweight return watcher during gameplay');
assert.ok(pkg.scripts.test.includes('qarton-main-tree-test.cjs'), 'npm test must run the main-tree contract test');
for (const marker of ['qarton-main-tree-runtime', 'التقدم والحفظ']) {
  assert.ok(workflow.includes(marker), 'Android APK verification must include ' + marker);
}

// If the optional layout inspector exists in this branch, validate its cleanup contract.
const inspectorPath = path.join(root, 'scripts/qarton-home-inspector.js');
if (fs.existsSync(inspectorPath)) {
  const inspector = fs.readFileSync(inspectorPath, 'utf8');
  new vm.Script(inspector, {filename:'qarton-home-inspector.js'});
  assert.ok(!inspector.includes('seenHome'), 'layout inspector must not retain dead seenHome state');
  assert.ok(inspector.includes('observer.disconnect();observer=null;'), 'layout inspector must release its observer reference after gameplay starts');
}

console.log('PASS: QARTON main-tree structure, safe original-control bridges, save isolation, and Android packaging.');


// Execute the actual Story proxy click path with a lightweight DOM double.
// This verifies that New Game reaches the original React-owned button and enters handoff.
const handoffStart = home.indexOf('function handoffStoryAction(live){');
const handoffEnd = home.indexOf('function showStory(){', handoffStart);
assert.ok(handoffStart >= 0 && handoffEnd > handoffStart, 'story handoff helpers must remain extractable');
const handoffSource = home.slice(handoffStart, handoffEnd);
const handoffContext = {
  liveClicks: 0,
  appended: [],
  hideCount: 0,
  restoreCount: 0,
  eventOrder: [],
  clearCount: 0,
  goTreeCount: 0,
  root: null,
  overlay: { style: { display: 'flex' } },
  document: { body: { appendChild(node) { handoffContext.appended.push(node); } } },
  hideLegacy() { handoffContext.hideCount++; handoffContext.eventOrder.push("hide"); },
  restoreLegacy() { handoffContext.restoreCount++; handoffContext.eventOrder.push("restore"); },
  clearReturn() { handoffContext.clearCount++; },
  goTree() { handoffContext.goTreeCount++; },
  findNewGameButton(container) {
    return Array.from(container.querySelectorAll('button')).find(b =>
      !b.disabled && /ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test(b.textContent || '')
    ) || null;
  },
  el(tag, cls, txt) {
    return {
      tagName: tag, className: cls, textContent: txt || '', children: [], listeners: {},
      append(...nodes) { this.children.push(...nodes); },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      setAttribute() {},
      click() { if (this.listeners.click) this.listeners.click(); }
    };
  }
};
handoffContext.root = {
  querySelector(selector) {
    return selector === '.home-actions.grid' ? menuForHandoff : null;
  }
};
const liveNewGame = {
  textContent: 'ابدأ الجزء الأول', disabled: false,
  click() { handoffContext.liveClicks++; handoffContext.eventOrder.push("live-click"); }
};
const menuForHandoff = {
  querySelectorAll() { return [makeButton('الإعدادات'), liveNewGame]; }
};
const handoffResult = vm.runInNewContext(
  'var view="story",backButton=null;' + handoffSource +
  ';proxyStoryAction(handoffParent,"@new-game","بداية جديدة","بدء قصة جديدة",false);handoffParent.proxy.click();({view:view,backButton:backButton})',
  {
    ...handoffContext,
    handoffParent: {
      children: [],
      appendChild(node) { this.children.push(node); this.proxy = node; }
    }
  }
);
assert.equal(handoffResult.view, 'handoff', 'New Game proxy must enter the persistent handoff state');
assert.equal(handoffResult.backButton && handoffResult.backButton.id, 'qarton-tree-return', 'handoff must retain the actual return-to-QARTON control reference');
assert.equal(handoffContext.liveClicks, 1, 'New Game proxy must click the original live story-start control exactly once');
assert.equal(handoffContext.hideCount, 0, 'story handoff must not hide the game container before the original click');
assert.equal(handoffContext.restoreCount, 1, 'story handoff must restore the original game container');
assert.ok(handoffContext.eventOrder.indexOf("restore") < handoffContext.eventOrder.indexOf("live-click"), 'the game container must be restored before the original start handler runs');
assert.equal(handoffContext.clearCount, 1, 'story handoff must clear any stale return control');
assert.equal(handoffContext.overlay.style.display, 'none', 'story handoff must hide the QARTON overlay before opening the original confirmation flow');
assert.ok(handoffContext.appended.some(node => node.id === 'qarton-tree-return'), 'story handoff must provide a return-to-QARTON control');
handoffResult.backButton.click();
assert.equal(handoffContext.goTreeCount, 1, 'return-to-QARTON control must invoke the tree navigation callback exactly once');
