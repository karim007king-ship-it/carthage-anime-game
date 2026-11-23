'use strict';
const assert = require('node:assert/strict');
const {
  legacySceneToDisplayChapter,
  displayChapterToLegacyScene,
  chapterById,
  chapterStatus
} = require('../scripts/chapter-display-adapter.cjs');
const map = require('../data/qarton-36-chapter-display-map.json');

for (const chapter of map.chapters) {
  assert.equal(chapterStatus(chapter.id),
    chapter.kind === 'legacy' ? 'legacy' : 'not-integrated');
  assert.deepEqual(chapterById(chapter.id), chapter);
  if (chapter.kind === 'legacy') {
    assert.equal(legacySceneToDisplayChapter(chapter.legacySceneIdx), chapter.displayChapter);
    assert.equal(displayChapterToLegacyScene(chapter.displayChapter), chapter.legacySceneIdx);
  } else {
    assert.equal(displayChapterToLegacyScene(chapter.displayChapter), null,
      'Draft chapters must never resolve to a legacy scene');
  }
}
assert.equal(legacySceneToDisplayChapter(4), 7, 'Saved sceneIdx 4 remains Dar Mansour');
assert.equal(displayChapterToLegacyScene(7), 4);
for (const invalid of [-1, 18, 1.5, '4', null, undefined]) {
  assert.equal(legacySceneToDisplayChapter(invalid), null);
}
for (const invalid of [0, 37, 1.5, '7', null, undefined]) {
  assert.equal(displayChapterToLegacyScene(invalid), null);
}
assert.equal(chapterById('missing'), null);
assert.equal(chapterStatus('missing'), 'unknown');
const first = chapterById('legacy-01');
first.displayChapter = 999;
assert.equal(chapterById('legacy-01').displayChapter, 1, 'Adapter must not expose mutable registry entries');
console.log('Chapter display adapter: PASS; no draft chapter maps to legacy save indices');
