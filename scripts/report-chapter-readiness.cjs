'use strict';
// Read-only chapter integration readiness report. A display map is not a story runtime.
const map = require('../data/qarton-36-chapter-display-map.json');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const productionHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const prep = fs.readFileSync(path.join(root, 'scripts/prepare-web.cjs'), 'utf8');
const report = {
  schemaVersion: 1,
  source: 'data/qarton-36-chapter-display-map.json',
  runtimeIntegrationVerified: false,
  productionSourcePresent: productionHtml.length > 1_000_000,
  buildPreparationPresent: prep.includes('replaceOnce('),
  counts: {
    mapped: map.chapters.length,
    original: map.chapters.filter(c => c.kind === 'legacy').length,
    draft: map.chapters.filter(c => c.kind === 'draft').length,
    newChaptersPlayableVerified: 0
  },
  missingRuntimeEvidence: [
    'Game-owned lifecycle bridge from original scene and choice callbacks',
    '18 new scene scripts with dialogue, eligibility, and stable choice IDs',
    'Once-only state effects and explicit successor routes',
    'Legacy save compatibility and all nine ending reachability',
    'Device validation for Android upgrade and navigation'
  ],
  draftChapterIds: map.chapters.filter(c => c.kind === 'draft').map(c => c.id)
};
console.log(JSON.stringify(report, null, 2));
if (!report.productionSourcePresent || !report.buildPreparationPresent) {
  process.exitCode = 1;
}
