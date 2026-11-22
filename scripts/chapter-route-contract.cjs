'use strict';
// Deterministic read-only transition contract for the canonical display map.
// Does not start chapters, mutate save data or apply story choice effects.
const map = require('../data/qarton-36-chapter-display-map.json');
const chapters = map.chapters;
const byId = new Map(chapters.map(ch => [ch.id, ch]));

function getChapterRoute(id) {
  const chapter = byId.get(id);
  if (!chapter) return null;
  const index = chapter.displayChapter - 1;
  return {
    id: chapter.id,
    displayChapter: chapter.displayChapter,
    kind: chapter.kind,
    previousId: chapters[index - 1]?.id ?? null,
    nextId: chapters[index + 1]?.id ?? null,
    playable: chapter.kind === 'legacy',
    requiresIntegration: chapter.kind !== 'legacy'
  };
}
function nextPlayableLegacy(id) {
  const chapter = byId.get(id);
  if (!chapter) return null;
  const next = chapters.slice(chapter.displayChapter)
    .find(ch => ch.kind === 'legacy');
  return next ? {id: next.id, legacySceneIdx: next.legacySceneIdx} : null;
}
module.exports = {getChapterRoute, nextPlayableLegacy};
