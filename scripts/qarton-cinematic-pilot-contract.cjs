'use strict';

// Standalone cinematic pilot contract. Not wired into the production game.
// Game owns decisions and persistence; this module only validates presentation.
const PILOT_ID = 'p3-single-load';
const SCENE_IDS = Object.freeze([
  'legacy-01','p1-family-promise','legacy-02','p1-family-alley',
  'legacy-03','legacy-04','legacy-05','legacy-06','legacy-07',
  'p1-smoke-door','p1-gate-manifest','legacy-08','legacy-09',
  'p2-relay-hut','legacy-10','p2-names-consent','legacy-11',
  'legacy-12','p2-yasmin-drawing','legacy-13','p2-last-signal',
  'p2-protection-cost','legacy-14','p2-truth-gate','legacy-15',
  'p3-survivor-register',PILOT_ID,'legacy-16','p3-karim-key',
  'p3-house-without-number','p3-medicine-cost','p3-mark-on-stone',
  'p3-hadi-hearing','p3-key-handover','legacy-17','legacy-18'
]);
const LEGACY_DISPLAY_CHAPTERS = Object.freeze(
  SCENE_IDS.flatMap((id, i) => id.startsWith('legacy-') ? [i + 1] : [])
);
const CHOICES = Object.freeze({
  prioritizeBridge: Object.freeze({ supplyAllocation: 'bridge', bridgeRepair: 'started', clinicShelter: 'improvised' }),
  prioritizeClinic: Object.freeze({ supplyAllocation: 'clinic', bridgeRepair: 'delayed', clinicShelter: 'reinforced' }),
  splitWithLimits: Object.freeze({ supplyAllocation: 'split', bridgeRepair: 'footpathOnly', clinicShelter: 'partial' })
});
function legacySceneToDisplayChapter(sceneIdx) {
  if (!Number.isInteger(sceneIdx) || sceneIdx < 0 || sceneIdx >= LEGACY_DISPLAY_CHAPTERS.length) return null;
  return LEGACY_DISPLAY_CHAPTERS[sceneIdx];
}
function validatePresentationSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return false;
  const keys = Object.keys(snapshot);
  if (keys.some(k => !['version','sceneId','locale','visualVariant','accessibility'].includes(k))) return false;
  if (snapshot.version !== 1 || !SCENE_IDS.includes(snapshot.sceneId)) return false;
  if (!['tn','ar','en','fr'].includes(snapshot.locale)) return false;
  if (snapshot.visualVariant !== undefined && (typeof snapshot.visualVariant !== 'string' || snapshot.visualVariant.length > 64)) return false;
  if (!snapshot.accessibility || typeof snapshot.accessibility !== 'object' ||
      typeof snapshot.accessibility.reducedMotion !== 'boolean' ||
      Object.keys(snapshot.accessibility).some(k => k !== 'reducedMotion')) return false;
  return true;
}
function resolvePilotChoice(choiceId) {
  const result = Object.prototype.hasOwnProperty.call(CHOICES, choiceId) ? CHOICES[choiceId] : null;
  return result ? { ...result } : null;
}
module.exports = { PILOT_ID, SCENE_IDS, LEGACY_DISPLAY_CHAPTERS, CHOICES, legacySceneToDisplayChapter, validatePresentationSnapshot, resolvePilotChoice };
