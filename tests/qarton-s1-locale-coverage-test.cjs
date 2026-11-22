'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { test } = require('node:test');
const {
  auditPack, canonicalTexts, chapterKeys, coverageReport, draftPack, manifest, parseInventoryJson,
} = require('../docs/s1/locales/audit.cjs');
const catalogue = require('../docs/s1/catalogue.json');
const ui = require('../docs/s1/ui-source-inventory.json');

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('the complete Tunisian catalogue and original chapters match the pinned PR #23 contracts', () => {
  const entries = Object.keys(canonicalTexts).sort().map(key => [key, canonicalTexts[key]]);
  assert.equal(entries.length, 848);
  assert.equal(entries.filter(([key]) => key.startsWith('story.legacy-')).length, 557);
  assert.equal(hash(entries), '5a35e5814a2d2b2afcc7f8278e25682e6bc4a55e4e23cf2e81ec9ad195676f8a');
  assert.equal(hash(catalogue.scenes), '602d1ef5e19c0d029d664ad5f33eb6187afaec56374196088725b1b0f0639651');
  assert.equal(chapterKeys.legacy.length, 18);
  for (const [index, chapter] of chapterKeys.legacy.entries()) {
    assert.equal(chapter.sceneIdx, index);
    assert.equal(chapter.id, catalogue.scenes[index].id);
  }
});

test('Astra manuscript keys match the pinned PR #23 order with a separate draft namespace', () => {
  assert.equal(hash(chapterKeys), '6fa4a657a1a3d29ec5ea22066e45c0eb72539266978023d25561ceacbd596701');
  const chapters = [...chapterKeys.legacy, ...chapterKeys.draft];
  assert.deepEqual(chapters.map(ch => ch.displayChapter).sort((a, b) => a - b), Array.from({ length: 36 }, (_, i) => i + 1));
  assert.equal(new Set(chapters.map(ch => ch.id)).size, 36);
  assert.equal(chapterKeys.legacy[4].displayChapter, 7);
  const draftKeys = chapterKeys.draft.flatMap(chapter => {
    assert(!Object.hasOwn(chapter, 'sceneIdx'));
    for (const key of chapter.textKeys) assert(key.startsWith(`story.${chapter.id}.`), key);
    return chapter.textKeys;
  });
  assert.equal(chapterKeys.draft.length, 18);
  assert.equal(draftKeys.length, 583);
  const allKeys = [...Object.keys(canonicalTexts), ...draftKeys, ...Object.keys(ui.texts)];
  assert.equal(new Set(allKeys).size, allKeys.length);
  assert.equal(new Set(allKeys.map(key => key.toLowerCase())).size, allKeys.length);
  for (const key of allKeys) assert.match(key, /^[a-z][A-Za-z0-9-]*(?:\.[A-Za-z0-9-]+)+$/);
});

test('four complete key maps report untranslated values separately from absent keys', () => {
  assert.equal(manifest.canonical, 'tn');
  assert.deepEqual(manifest.languages, ['tn', 'ar', 'en', 'fr']);
  assert.deepEqual(manifest.directions, { tn: 'rtl', ar: 'rtl', en: 'ltr', fr: 'ltr' });
  const report = coverageReport(true);
  for (const locale of manifest.languages) {
    const pack = draftPack(locale);
    assert.deepEqual(Object.keys(pack.texts), Object.keys(canonicalTexts));
    assert.deepEqual(report.original[locale].missingKeys, []);
    assert.deepEqual(report.original[locale].untranslated, locale === 'tn' ? [] : Object.keys(canonicalTexts));
    assert.equal(report.g1Draft.missingLocaleValues[locale].length, 583);
  }
});

test('the checker identifies removed, extraneous, blank, and source-modified keys', () => {
  const pack = draftPack('fr');
  const [removed, blank, translated] = Object.keys(canonicalTexts);
  delete pack.texts[removed];
  pack.texts[blank] = ' ';
  pack.texts[translated] = 'Texte de test';
  pack.texts['story.p1-family-promise.line-001'] = 'Texte de test';
  const report = auditPack(pack, 'fr');
  assert.deepEqual(report.missingKeys, [removed]);
  assert.deepEqual(report.invalidValues, [blank]);
  assert.deepEqual(report.unexpectedKeys, ['story.p1-family-promise.line-001']);
  assert.equal(report.untranslated.length, 845);
  const tn = draftPack('tn');
  tn.texts[removed] = 'نص تبدّل';
  assert.deepEqual(auditPack(tn, 'tn').invalidValues, [removed]);
});

test('raw JSON validation rejects duplicate keys even if one uses escaped characters', () => {
  assert.throws(() => parseInventoryJson('{"texts":{"story.x":"a","story.\\u0078":"b"}}'), /Duplicate JSON key: story.x/);
  assert.throws(() => draftPack('unknown'), /Unknown locale/);
});
