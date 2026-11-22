'use strict';

// G4 pre-integration contract. Deliberately has no storage, DOM, React or game mutation.
// This adapter is NOT a game lifecycle hook. The host must provide a verified sceneIdx.
const { SCENE_IDS, LEGACY_DISPLAY_CHAPTERS, validatePresentationSnapshot } = require('./qarton-cinematic-pilot-contract.cjs');
const SUPPORTED_LOCALES = new Set(['tn', 'ar', 'en', 'fr']);
function createLegacyPresentationSnapshot(input, featureEnabled = false) {
  if (featureEnabled !== true) return null; // default-OFF; no accidental auto-unlock
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Object.prototype.hasOwnProperty.call(input, 'sceneIdx')) return null;
  const descriptor = Object.getOwnPropertyDescriptor(input, 'sceneIdx');
  if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) return null;
  const sceneIdx = descriptor.value;
  const { locale = 'tn', reducedMotion = false } = input;
  if (!Number.isInteger(sceneIdx) || sceneIdx < 0 || sceneIdx >= LEGACY_DISPLAY_CHAPTERS.length) return null;
  if (!SUPPORTED_LOCALES.has(locale) || typeof reducedMotion !== 'boolean') return null;
  const chapter = LEGACY_DISPLAY_CHAPTERS[sceneIdx];
  const sceneId = SCENE_IDS[chapter - 1];
  if (!/^legacy-\d{2}$/.test(sceneId)) return null;
  const snapshot = Object.freeze({
    version: 1, sceneId, locale, visualVariant: 'default',
    accessibility: Object.freeze({ reducedMotion })
  });
  return validatePresentationSnapshot(snapshot) ? snapshot : null;
}
function getDisplayChapterForLegacySave(save) {
  if (!save || typeof save !== 'object' || Array.isArray(save) || !Object.prototype.hasOwnProperty.call(save, 'sceneIdx') ) return null;
  const descriptor = Object.getOwnPropertyDescriptor(save, 'sceneIdx');
  if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) return null;
  if (!Number.isInteger(descriptor.value)) return null;
  return LEGACY_DISPLAY_CHAPTERS[descriptor.value] ?? null;
}
module.exports = { createLegacyPresentationSnapshot, getDisplayChapterForLegacySave };
