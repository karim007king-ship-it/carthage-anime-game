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

const androidPrep = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'prepare-web.cjs'), 'utf8');
assert.ok(androidPrep.includes('!Zn.includes("light")&&!Zn.includes("shadow")'), 'Part 3 must require a completed Part 2 ending');
assert.ok(androidPrep.includes('carthage-save-now'), 'simple save button must exist');
assert.ok(androidPrep.includes('carthage-continue-last'), 'one-tap continue button must exist');
assert.ok(androidPrep.includes('window.__carthageCanStartPart3'), 'Part 3 lock state must be exposed');
assert.ok(androidPrep.includes('رجوع للقائمة'), 'new-game cancel action must be clearly labeled as returning to menu');
assert.ok(androidPrep.includes('shiganshina-autosave-v1'), 'continue flow must recognize autosave fallback');
assert.ok(androidPrep.includes('window.__carthageContinue=()=>{'), 'continue action must restore the newest valid local save');
assert.ok(androidPrep.includes('window.setTimeout(showIfStuck,12000)'), 'Android startup diagnostic must appear for a stuck or blank startup');
assert.ok(androidPrep.includes('Resource load'), 'Android startup diagnostic must capture failed resource loads');
assert.ok(androidPrep.includes('carthage-startup-errors'), 'Android startup diagnostic must retain captured errors for display');
assert.ok(androidPrep.includes('يفتح بعد إتمام الجزء الثاني'), 'Part 3 must remain visible with a clear locked state');
assert.ok(androidPrep.includes('menuActions.insertBefore(continueButton'), 'Continue must appear directly in the home menu');
assert.ok(androidPrep.includes('part2Button.insertAdjacentElement'), 'Part 3 must appear directly after Part 2 in the home menu');
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
