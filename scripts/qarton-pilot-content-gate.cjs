'use strict';
// Read-only gate for draft content: never imports production runtime or mutates saves.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
function inspectPilotChapters(root = ROOT) {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/qarton-unified-id-registry.proposal.json'), 'utf8'));
  const chapters = registry.chapters;
  if (!Array.isArray(chapters) || chapters.length !== 36) throw new Error('Expected exactly 36 display chapter entries');
  const seen = new Set(), positions = new Set();
  let draft = 0, legacy = 0;
  for (const entry of chapters) {
    if (!entry || typeof entry.id !== 'string' || !/^[a-z0-9-]+$/.test(entry.id) || seen.has(entry.id)) throw new Error('Invalid or repeated chapter id');
    seen.add(entry.id);
    const filename = path.join(root, 'game-content/story/chapters', entry.id + '.json');
    const chapter = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (chapter.id !== entry.id || chapter.status !== 'draft-not-runtime') throw new Error('Chapter identity or runtime status mismatch: ' + entry.id);
    if (entry.id.startsWith('legacy-')) {
      legacy++;
      if (!Number.isInteger(chapter.sceneIdx) || chapter.sceneIdx < 0 || chapter.sceneIdx > 17) throw new Error('Invalid legacy sceneIdx: ' + entry.id);
    } else {
      draft++;
      if (Object.hasOwn(chapter, 'sceneIdx')) throw new Error('Draft chapter must not write legacy sceneIdx: ' + entry.id);
      if (!Number.isInteger(chapter.displayChapter) || chapter.displayChapter < 1 || chapter.displayChapter > 36 || positions.has(chapter.displayChapter)) throw new Error('Invalid draft display chapter: ' + entry.id);
      positions.add(chapter.displayChapter);
    }
  }
  if (legacy !== 18 || draft !== 18) throw new Error('Expected 18 original and 18 draft chapters');
  return Object.freeze({total:36,legacy,draft,runtimeIntegrated:false,readyForProduction:false});
}
if (require.main === module) console.log(JSON.stringify(inspectPilotChapters(),null,2));
module.exports = {inspectPilotChapters};
