'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

function parseInventoryJson(source) {
  const value = JSON.parse(source);
  const containers = [];
  // JSON.parse already validated the grammar. Scan key tokens before they can be
  // collapsed into the same property by the parser.
  const tokens = /"(?:\\.|[^"\\])*"\s*:?|[{}\[\]]/gs;
  for (const [token] of source.matchAll(tokens)) {
    if (token === '{') containers.push(new Set());
    else if (token === '[') containers.push(null);
    else if (token === '}' || token === ']') containers.pop();
    else if (token.endsWith(':')) {
      const keys = containers.at(-1);
      const key = JSON.parse(token.slice(0, -1));
      assert(!keys.has(key), `Duplicate JSON key: ${key}`);
      keys.add(key);
    }
  }
  return value;
}

const readJson = file => parseInventoryJson(readFileSync(file, 'utf8'));
const manifest = readJson(path.join(__dirname, 'manifest.json'));
const catalogue = readJson(path.join(__dirname, manifest.source));
const chapterKeys = readJson(path.join(__dirname, manifest.draftChapterKeys));
const canonicalTexts = Object.fromEntries(Object.entries(catalogue.texts).map(([key, { tn }]) => [key, tn]));
const draftKeys = chapterKeys.draft.flatMap(chapter => chapter.textKeys);

function requireLocale(locale) {
  assert(manifest.languages.includes(locale), `Unknown locale: ${locale}`);
}

function draftPack(locale) {
  requireLocale(locale);
  return {
    schemaVersion: manifest.schemaVersion,
    status: manifest.status,
    locale,
    direction: manifest.directions[locale],
    texts: Object.fromEntries(Object.entries(canonicalTexts).map(
      ([key, tn]) => [key, locale === manifest.canonical ? tn : null],
    )),
  };
}

function auditPack(pack, locale) {
  requireLocale(locale);
  assert.equal(pack.locale, locale);
  assert.equal(pack.schemaVersion, manifest.schemaVersion);
  assert.equal(pack.status, manifest.status);
  assert.equal(pack.direction, manifest.directions[locale]);
  assert(pack.texts && typeof pack.texts === 'object' && !Array.isArray(pack.texts), 'Expected texts object');

  const missingKeys = [];
  const untranslated = [];
  const invalidValues = [];
  for (const [key, source] of Object.entries(canonicalTexts)) {
    if (!Object.hasOwn(pack.texts, key)) missingKeys.push(key);
    else if (pack.texts[key] === null && locale !== manifest.canonical) untranslated.push(key);
    else if (typeof pack.texts[key] !== 'string' || !pack.texts[key].trim()
      || (locale === manifest.canonical && pack.texts[key] !== source)) invalidValues.push(key);
  }
  const unexpectedKeys = Object.keys(pack.texts).filter(key => !Object.hasOwn(canonicalTexts, key));
  return { missingKeys, untranslated, unexpectedKeys, invalidValues };
}

function coverageReport(includeKeys = false) {
  const original = Object.fromEntries(manifest.languages.map(locale => {
    const audit = auditPack(draftPack(locale), locale);
    return [locale, {
      total: Object.keys(canonicalTexts).length,
      ...Object.fromEntries(Object.entries(audit).map(([group, keys]) => [group, includeKeys ? keys : keys.length])),
    }];
  }));
  return {
    original,
    g1Draft: {
      total: draftKeys.length,
      // The manuscript is the source for these keys. The pinned PR #23 has no
      // locale values for them yet, and the legacy export must not absorb them.
      missingLocaleValues: Object.fromEntries(manifest.languages.map(locale => [
        locale, includeKeys ? draftKeys : draftKeys.length,
      ])),
    },
  };
}

if (require.main === module) {
  const [option, locale, filename, ...extra] = process.argv.slice(2);
  try {
    let output;
    if (option === undefined || (option === '--keys' && locale === undefined)) output = coverageReport(option === '--keys');
    else if (option === '--pack' && locale && !filename) output = draftPack(locale);
    else if (option === '--check' && locale && filename && !extra.length) {
      output = auditPack(readJson(path.resolve(filename)), locale);
      if (Object.values(output).some(keys => keys.length)) process.exitCode = 1;
    } else throw new Error('Usage: node docs/s1/locales/audit.cjs [--keys | --pack <locale> | --check <locale> <file>]');
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}

module.exports = { auditPack, canonicalTexts, chapterKeys, coverageReport, draftPack, manifest, parseInventoryJson };
