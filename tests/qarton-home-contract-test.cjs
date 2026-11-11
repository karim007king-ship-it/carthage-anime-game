const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'scripts/qarton-premium-home.js'), 'utf8');
const inspector = fs.readFileSync(path.join(root, 'scripts/qarton-home-inspector.js'), 'utf8');
const prep = fs.readFileSync(path.join(root, 'scripts/prepare-web.cjs'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/android-apk.yml'), 'utf8');

// Home screen must be detected from the real React menu, with a fallback if utility classes change.
assert.ok(home.includes('function findMenu(root)'), 'live menu discovery must exist');
assert.ok(home.includes('root.querySelector(".home-actions.grid")'), 'normal menu selector must be supported');
assert.ok(home.includes('candidate.querySelectorAll("button").length>=3'), 'menu recovery must use the live button group');
assert.ok(home.includes('menu.classList.add("home-actions","grid")'), 'recovered menu must receive layout hooks');
assert.ok(home.includes('classList.add("qarton-home-shell")'), 'the live menu shell must be identified');

// The fixed viewport and compact two-column action grid are explicit layout contracts.
assert.ok(home.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'), 'home actions must use a two-column grid');
assert.ok(home.includes('grid-auto-rows:minmax(37px,auto)!important'), 'compact buttons must retain touchable row height');
assert.ok(home.includes('box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important'), 'real menu buttons must remain visible and fill their grid cells');
assert.ok(home.includes('padding-top:calc(env(safe-area-inset-top,0px) + 69px)'), 'short screens must reserve the measured QARTON header');
assert.ok(home.includes('padding-bottom:calc(env(safe-area-inset-bottom,0px) + 23px)'), 'short screens must reserve the footer and safe area');
assert.ok(home.includes('@media(max-height:740px)'), 'compact viewport rules must be present');
assert.ok(home.includes('@media(max-height:650px)'), 'very short viewport rules must be present');
assert.ok(!home.includes('#root.carthage-home-locked \n#root.carthage-home-locked'), 'stylesheet must not contain the accidental duplicated-root selector');

// Important actions must have stable layout placement and remain discoverable by accessible IDs.
for (const marker of [
  '#carthage-continue-last', '#btn-part2', '#carthage-part3-start',
  '#carthage-export-backup', '#carthage-import-backup',
  'data-qarton-kind', 'aria-label'
]) assert.ok(home.includes(marker), 'missing home action contract: ' + marker);

// Brand is home-only; entering gameplay removes the home lock and injected identity.
assert.ok(home.includes('function playing(root)'), 'gameplay state detector must exist');
assert.ok(home.includes('if(playing(root))'), 'runtime must switch when gameplay begins');
assert.ok(home.includes('root.classList.remove("carthage-home-locked")'), 'gameplay must release fixed home viewport');
assert.ok(home.includes('if(!document.getElementById("qarton-home-brand"))'), 'brand insertion must be idempotent');
assert.ok(home.includes('if(!document.getElementById("qarton-home-info"))'), 'footer insertion must be idempotent');
assert.ok(home.includes('new MutationObserver(schedule)'), 'runtime must recover after React DOM updates');
assert.ok(home.includes('if(observer)observer.disconnect()'), 'legacy home styling observer must stop after gameplay begins');
assert.ok(inspector.includes('root&&root.querySelector(".game-timer")&&observer)observer.disconnect()'), 'read-only measurement observer must stop after leaving home');

// Achievement discovery must short-circuit when the label is absent; keep the observer inexpensive.
assert.ok(home.includes('root.querySelector(".qarton-achievements")||!root.textContent.includes("إنجازاتي")'), "achievement scan must avoid traversing the whole tree when the section is absent");
assert.ok(!home.includes("seenHome"), "unused home-state flag must not remain in the runtime");

// The diagnostic report must measure actual rendered controls without reading or exposing save payloads.
for (const marker of [
  'getBoundingClientRect()', 'scrollWidth:document.documentElement.scrollWidth',
  'scrollHeight:document.documentElement.scrollHeight', 'gridTemplateColumns',
  'disabled:!!el.disabled', 'storyTimerPresent', 'saveControls'
]) assert.ok(inspector.includes(marker), 'missing live measurement field: ' + marker);
assert.ok(inspector.includes('button.addEventListener("click",show)'), 'measurement action must open the report');
assert.ok(inspector.includes('انسخ النص التالي وأرسله'), 'measurement report must explain the copy step');
assert.ok(!inspector.includes('localStorage.getItem'), 'measurement probe must not read save contents');

// Android packaging must include the same tested runtime and verify the packaged HTML.
assert.ok(prep.includes('qarton-premium-home-runtime'), 'premium home runtime must be injected');
assert.ok(prep.includes('qarton-home-inspector-runtime'), 'measurement probe must be injected');
assert.ok(workflow.includes('npm test'), 'Android workflow must run regression tests before building');
assert.ok(workflow.includes('qarton-home-inspector-runtime'), 'packaged HTML verification must include the probe');
assert.ok(workflow.includes('qarton-home-measure-output'), 'packaged HTML verification must include the report UI');
assert.ok(prep.includes('root&&root.querySelector(\\".game-timer\\")&&observer)observer.disconnect()'), 'fixed home viewport observer must stop after gameplay begins');
assert.ok(prep.includes('if(document.querySelector(\\".game-timer\\"))observer.disconnect()'), 'native navigation observer must stop after gameplay begins');
assert.ok(prep.includes('if(!document.querySelector(\\".game-timer\\"))observer.observe(document.documentElement'), 'native navigation observer must not start during gameplay');
assert.ok(prep.includes('readinessObserver.disconnect()'), 'startup readiness observer must disconnect after the real game UI mounts');
assert.ok(prep.includes('window.removeEventListener("DOMContentLoaded",removeWatchdogWhenReady)'), 'startup readiness listener must be removed after the real game UI mounts');

console.log('PASS: QARTON home layout, responsive contracts, React lifecycle, measurement probe, and Android packaging checks.');
