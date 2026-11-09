const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const file = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');
assert.ok(html.length > 1_000_000, 'index.html should contain the complete self-contained game');
assert.match(html, /قرطاج/);
assert.match(html, /V17\.1/);
assert.match(html, /c17-audio-control/);
assert.match(html, /c17-audio-volume/);
assert.match(html, /prefers-reduced-motion/);
assert.match(html, /السور يتكسر/);

const cinematicPilot = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'prepare-web.cjs'), 'utf8');
assert.ok(cinematicPilot.includes('carthage-cinematic-pilot-runtime'), 'cinematic pilot runtime must be injected into the Android build');
assert.ok(cinematicPilot.includes('carthage-save-transfer'), 'save export/import transfer controls must be injected');
assert.ok(cinematicPilot.includes('carthage-drive-recovery-seed'), 'the confirmed Drive save must be included as a clean-install recovery seed');
assert.ok(cinematicPilot.includes('chapter\\":5'), 'recovery seed must preserve chapter 5');
assert.ok(cinematicPilot.includes('sceneIdx\\":4'), 'recovery seed must preserve the saved scene index');
assert.ok(cinematicPilot.includes('slots.some(valid)||valid(auto))return'), 'recovery seed must never overwrite a valid existing save');
assert.ok(cinematicPilot.includes('carthage-export-backup'), 'one-tap save backup export button must exist');
assert.ok(cinematicPilot.includes('carthage-import-backup'), 'save backup import button must exist');
assert.ok(cinematicPilot.includes('shiganshina-autosave-v1'), 'save import must restore autosave for one-tap continue');
assert.ok(cinematicPilot.includes('carthageSlowPushIn'), 'cinematic pilot must include a slow camera push-in');
assert.ok(cinematicPilot.includes('carthageCinematicLight'), 'cinematic pilot must include a restrained moving light pass');
assert.ok(cinematicPilot.includes('carthageCinematicImpact'), 'Great Wall break must trigger a brief impact camera shake');
assert.ok(cinematicPilot.includes('prefers-reduced-motion:reduce'), 'cinematic animation must respect reduced-motion accessibility');
assert.ok(cinematicPilot.includes('/(السور|لحظة الكسر|السور يتكسر)/'), 'cinematic pilot must activate only for the Great Wall story scene');

const androidPrep = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'prepare-web.cjs'), 'utf8');
assert.ok(androidPrep.includes('!Zn.includes("light")&&!Zn.includes("shadow")'), 'Part 3 must require a completed Part 2 ending');
assert.ok(androidPrep.includes('carthage-save-now'), 'simple save button must exist');
assert.ok(androidPrep.includes('carthage-continue-last'), 'one-tap continue button must exist');
assert.ok(androidPrep.includes('window.__carthageCanStartPart3'), 'Part 3 lock state must be exposed');
assert.ok(androidPrep.includes('رجوع للقائمة'), 'new-game cancel action must be clearly labeled as returning to menu');
assert.ok(androidPrep.includes('shiganshina-autosave-v1'), 'continue flow must recognize autosave fallback');
assert.ok(androidPrep.includes('window.__carthageContinue=()=>{'), 'continue action must restore the newest valid local save');
assert.ok(androidPrep.includes("window.__CARTHAGE_MODULE_STARTED__=true"), "Android build must instrument the actual story ES module");
assert.ok(androidPrep.includes("window.__CARTHAGE_RENDER_REQUESTED__=true"), "Android build must verify the React render request");
assert.ok(androidPrep.includes("window.__CARTHAGE_REACT_MOUNTED__"), "Android build must detect actual React UI mounting");
assert.ok(androidPrep.includes("React root render instrumentation"), "Android build must wrap the real React root startup");
assert.ok(androidPrep.includes("removeWatchdogWhenReady"), "startup watchdog must disappear after the real game UI mounts");

assert.ok(androidPrep.includes('window.setTimeout(showIfStuck,12000)'), 'Android startup diagnostic must appear for a stuck or blank startup');
assert.ok(!androidPrep.includes('if(!loading&&bodyText.length>80)return;'), 'startup diagnostics must not be suppressed by long static loading text');
assert.ok(androidPrep.includes('Visible by default'), 'startup fallback must be visible without CSS animation or JavaScript timers');
assert.ok(androidPrep.includes('carthage-startup-watchdog'), 'static startup watchdog fallback must be included in the Android page');
assert.ok(!androidPrep.includes('carthage-watchdog-reveal'), 'startup fallback must not depend on CSS animation to become visible');
const watchdogStyle = androidPrep.match(/const watchdogFallback = `<style[^>]*>([\s\S]*?)<\/style>`;/);
assert.ok(watchdogStyle, 'startup fallback CSS must be present');
assert.ok(!/opacity\s*:\s*0|visibility\s*:\s*hidden|animation\s*:/.test(watchdogStyle[1]), 'startup fallback must not be hidden or animated before the game mounts');
assert.ok(androidPrep.includes('Resource load'), 'Android startup diagnostic must capture failed resource loads');
assert.ok(androidPrep.includes('carthage-startup-errors'), 'Android startup diagnostic must retain captured errors for display');
assert.ok(androidPrep.includes('يفتح بعد إتمام الجزء الثاني'), 'Part 3 must remain visible with a clear locked state');
assert.ok(androidPrep.includes('menuActions.insertBefore(continueButton'), 'Continue must appear directly in the home menu');
assert.ok(androidPrep.includes('part2Button.insertAdjacentElement'), 'Part 3 must appear directly after Part 2 in the home menu');
assert.ok(androidPrep.includes('if(partButton.textContent!==part3Label)'), 'navigation observer must not rewrite the Part 3 label on every mutation');
assert.ok(androidPrep.includes('رجوع للقائمة'), 'new-game cancel action must be clearly labeled as returning to menu');
assert.ok(androidPrep.includes('shiganshina-autosave-v1'), 'continue flow must recognize autosave fallback');
assert.ok(androidPrep.includes('window.__carthageContinue=()=>{'), 'continue action must restore the newest valid local save');
assert.ok(androidPrep.includes('يُفتح بعد إتمام الجزء الثاني') || androidPrep.includes('يفتح بعد إتمام الجزء الثاني'), 'Part 3 must remain visible with a clear locked state');

const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
assert.deepEqual([...new Set(duplicates)], [], 'HTML ids must be unique');

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let executable = 0;
for (const [, attrs, body] of scripts) {
  if (!body.trim()) continue;
  if (/type\s*=\s*["']application\/(?:json|ld\+json)["']/i.test(attrs)) continue;
  new vm.Script(body, { filename: `inline-script-${executable}.js` });
  executable++;
}
assert.ok(executable >= 5, `expected multiple executable scripts, found ${executable}`);
console.log(`PASS: HTML smoke checks; ${ids.length} ids; ${executable} executable scripts parsed.`);
