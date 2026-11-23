'use strict';
// Presentation-only adapter. Never persist displayChapter as legacy sceneIdx.
const map = require('../data/qarton-36-chapter-display-map.json');
const byId = new Map(map.chapters.map(chapter => [chapter.id, chapter]));
const byLegacyIndex = new Map(map.chapters.filter(chapter => chapter.kind === 'legacy')
  .map(chapter => [chapter.legacySceneIdx, chapter]));

function legacySceneToDisplayChapter(sceneIdx) {
  if (!Number.isInteger(sceneIdx)) return null;
  return byLegacyIndex.get(sceneIdx)?.displayChapter ?? null;
}
function displayChapterToLegacyScene(displayChapter) {
  if (!Number.isInteger(displayChapter)) return null;
  const chapter = map.chapters[displayChapter - 1];
  if (!chapter || chapter.kind !== 'legacy') return null;
  return chapter.legacySceneIdx;
}
function chapterById(id) {
  const chapter = byId.get(id);
  return chapter ? {...chapter} : null;
}
function chapterStatus(id) {
  const chapter = byId.get(id);
  return chapter ? (chapter.kind === 'legacy' ? 'legacy' : 'not-integrated') : 'unknown';
}
module.exports = {
  legacySceneToDisplayChapter,
  displayChapterToLegacyScene,
  chapterById,
  chapterStatus
};
