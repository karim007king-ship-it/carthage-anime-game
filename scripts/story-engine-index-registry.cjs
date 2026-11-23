'use strict';
// Registry allocation contract derived from Luna's PR #28 runtime audit.
// Legacy engine indices 0..17 remain reserved; draft chapters get 18..35.
// This is not connected to the production React story runtime.
const map = require('../data/qarton-36-chapter-display-map.json');
const legacy = map.chapters.filter(c => c.kind === 'legacy');
const drafts = map.chapters.filter(c => c.kind === 'draft');
const registry = Object.freeze([
  ...legacy.map(c => Object.freeze({sceneKey:c.id,engineIndex:c.legacySceneIdx,displayChapter:c.displayChapter,kind:'legacy'})),
  ...drafts.map((c,i) => Object.freeze({sceneKey:c.id,engineIndex:18+i,displayChapter:c.displayChapter,kind:'draft'}))
]);
const byKey = new Map(registry.map(x => [x.sceneKey,x]));
const byIndex = new Map(registry.map(x => [x.engineIndex,x]));
function resolveByKey(key) { return byKey.get(key) ?? null; }
function resolveByIndex(index) { return Number.isInteger(index) ? byIndex.get(index) ?? null : null; }
module.exports = {registry,resolveByKey,resolveByIndex};
