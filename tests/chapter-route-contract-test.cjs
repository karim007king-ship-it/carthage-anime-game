'use strict';
const assert = require('node:assert/strict');
const map = require('../data/qarton-36-chapter-display-map.json');
const {getChapterRoute, nextPlayableLegacy} = require('../scripts/chapter-route-contract.cjs');

assert.equal(getChapterRoute('missing'), null);
assert.equal(nextPlayableLegacy('missing'), null);
for (const [i, chapter] of map.chapters.entries()) {
  const route = getChapterRoute(chapter.id);
  assert.equal(route.displayChapter, i + 1);
  assert.equal(route.previousId, map.chapters[i - 1]?.id ?? null);
  assert.equal(route.nextId, map.chapters[i + 1]?.id ?? null);
  assert.equal(route.playable, chapter.kind === 'legacy');
  assert.equal(route.requiresIntegration, chapter.kind === 'draft');
  const next = map.chapters.slice(i + 1).find(ch => ch.kind === 'legacy');
  assert.deepEqual(nextPlayableLegacy(chapter.id),
    next ? {id: next.id, legacySceneIdx: next.legacySceneIdx} : null);
}
assert.equal(getChapterRoute('p3-single-load').playable, false,
  'Pilot chapter 27 must remain non-playable until integrated');
assert.equal(getChapterRoute('legacy-18').nextId, null);
console.log('Canonical chapter route contract: PASS; drafts remain non-playable');
