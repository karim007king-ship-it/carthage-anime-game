'use strict';
const assert = require('node:assert/strict');
const inject = require('../scripts/qarton-character-performance.cjs');

const html = inject('<html><head></head><body><main id="root"></main></body></html>');
assert.equal((html.match(/carthage-character-performance-style/g) || []).length, 1, 'character styles must be injected once');
for (const animation of ['carthageStageIdle', 'carthageStageGrief', 'carthageStageTension', 'carthageStageMemory']) {
  assert.ok(html.includes(animation), animation + ' animation must be present');
}
assert.ok(html.includes('.stage-slide .stage-breath{animation:carthageStageIdle'), 'idle motion must be limited to the existing stage breathing layer');
assert.ok(html.includes('.stage-slide:has(.tear-drop) .stage-breath'), 'grief motion must require the existing tear overlay');
assert.ok(html.includes('.stage-slide.expression-shake .stage-breath'), 'tension motion must require the existing expression state');
assert.ok(html.includes('.stage-slide:has(.candle-flame) .stage-breath'), 'memory motion must require the candle overlay');
assert.ok(html.includes('@media(prefers-reduced-motion:reduce){.stage-slide .stage-breath{animation:none!important;transform:none!important;will-change:auto}}'), 'reduced-motion must disable all character animation');
assert.ok(!html.includes('localStorage') && !html.includes('shiganshina-'), 'character presentation must not access save data');
assert.throws(() => inject(html), /already installed/, 'injection must reject duplicate installation');
assert.throws(() => inject('<html><body></body>'), /Missing body/, 'injection must fail clearly when the body hook is absent');
console.log('PASS: isolated character performance styles, scene scoping, reduced-motion, and duplicate-install guards.');
