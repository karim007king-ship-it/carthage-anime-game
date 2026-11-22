'use strict';
// Pilot-only, read-only chapter navigator. No legacy save writes or runtime side effects.
const {inspectPilotChapters} = require('./qarton-pilot-content-gate.cjs');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
function createPilotChapterNavigator(root = ROOT) {
  inspectPilotChapters(root);
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/qarton-unified-id-registry.proposal.json'), 'utf8'));
  const entries = registry.scenes.map(entry => Object.freeze({
    id:entry.id,
    displayChapter:entry.displayChapter,
    kind:entry.scope === 'legacy' ? 'legacy' : 'draft',
    legacySceneIdx:entry.scope === 'legacy' ? entry.sceneIdx : null
  })).sort((a,b) => a.displayChapter - b.displayChapter);
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  function resolve(id) {
    if (typeof id !== 'string' || !byId.has(id)) throw new Error('Unknown chapter id');
    return byId.get(id);
  }
  function next(id) {
    const chapter = resolve(id);
    return entries[chapter.displayChapter] || null;
  }
  function previous(id) {
    const chapter = resolve(id);
    return entries[chapter.displayChapter - 2] || null;
  }
  function pilotCheckpoint(id, lineId = null) {
    const chapter = resolve(id);
    if (chapter.kind !== 'draft') throw new Error('Legacy progress must remain in original save schema');
    if (lineId !== null && (typeof lineId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(lineId))) throw new Error('Invalid pilot line id');
    return Object.freeze({namespace:'qarton-pilot-v1',chapterId:id,lineId});
  }
  return Object.freeze({entries:Object.freeze(entries),resolve,next,previous,pilotCheckpoint});
}
module.exports = {createPilotChapterNavigator};
