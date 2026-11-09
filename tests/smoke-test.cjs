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
