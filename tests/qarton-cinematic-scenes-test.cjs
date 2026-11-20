'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const inject = require('../scripts/qarton-cinematic-scenes.cjs');

const html = inject('<html><head></head><body><main id="root"></main></body></html>');
assert.ok(html.includes('carthage-cinematic-scene-runtime'), 'scene motion runtime must be injected');
assert.ok(html.includes('carthage-scene-transition-runtime'), 'scene transition runtime must be injected');
assert.ok(html.includes('root.querySelectorAll("*")'), 'scene discovery must inspect non-img artwork containers');
assert.ok(html.includes('/url\\(/i'), 'CSS background-image URLs must be detected');
assert.ok(html.includes('carthage-cinematic-scene .carthage-cinematic-scene-subject'), 'cinematic motion must apply to image and CSS-background elements');
assert.ok(html.includes('.match(/url\\('), 'scene transitions must extract CSS background-image URLs');
assert.ok(!html.includes('localStorage.setItem'), 'cinematic presentation must not mutate game saves');

const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 2, 'both isolated cinematic runtimes must be emitted');
for (const [, source] of scripts) assert.doesNotThrow(() => new vm.Script(source), 'injected cinematic script must parse');

console.log('PASS: isolated cinematic runtime supports IMG and CSS background-image scenes without touching story or saves.');

// Guard performance and accessibility contracts in the injected runtimes.
assert.ok(html.includes('if(queued)return;queued=true;'), 'mutation bursts must be coalesced before rendering');
assert.ok(html.includes('requestAnimationFrame'), 'scene updates must be scheduled on animation frames');
assert.ok(html.includes('prefers-reduced-motion:reduce'), 'scene motion must respect reduced-motion preference');
assert.ok(html.includes('prefers-reduced-motion: reduce'), 'scene cuts must respect reduced-motion preference');
assert.ok(html.includes('attributeFilter:["src","class","style"]'), 'observer must restrict watched attributes');
assert.ok(html.includes('if(window.__carthageCinematicScene)return;'), 'scene motion runtime must be idempotent');
assert.ok(html.includes('if(window.__carthageSceneTransitions)return;'), 'scene transition runtime must be idempotent');
