'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const read = file => readFileSync(path.join(root, file), 'utf8');
const sorted = values => [...values].sort();
const own = (object, key) => Object.hasOwn(object, key);

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

const inventory = name => parseInventoryJson(read(`docs/s1/${name}.json`));
const catalogue = inventory('catalogue');
const ui = inventory('ui-source-inventory');
const triage = inventory('ui-triage');
const fixture = inventory('locale-fixture');
const sha256 = text => createHash('sha256').update(text).digest('hex');

function gitBlob(text) {
  return createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');
}

const source = read('index.html');
const sourceLines = source.split('\n');
const at = ({ line, column }) => sourceLines[line - 1].slice(column - 1);

test('pinned game and packaging sources preserve legacy data and save behavior', () => {
  assert.equal(gitBlob(source), 'db83f1d7bf8b5b457a82f6cd5c4f06fa14299b23');
  assert.equal(gitBlob(read('scripts/prepare-web.cjs')), 'a90593eacd80389d2ef26daab14917c4b2e586f4');
  assert.equal(catalogue.source.blob, gitBlob(source));
  assert.deepEqual(ui.source, catalogue.source);
  assert.deepEqual(triage.source, ui.source);
  const sceneRecords = catalogue.scenes.map(({ lines, ...record }) => record);
  assert.equal(sha256(JSON.stringify(sceneRecords)), '1173e7975d718668ee4aae418825493f89393534578723f23e87c75079e27d76');
  const protectedTexts = Object.keys(catalogue.texts).filter(key => catalogue.texts[key].legacyUse);
  const expectedProtected = [
    ...catalogue.scenes.flatMap(scene => [
      scene.texts.place,
      ...scene.choices.map(choice => choice.texts.label),
      ...scene.hotspots.flatMap(hotspot => hotspot.texts.item ?? []),
      ...scene.lines.flatMap(line => [line.who, line.text]),
    ]),
    ...catalogue.endings.flatMap(ending => ending.cinematic?.lines.flatMap(line => [line.who, line.text]) ?? []),
    ...Object.values(catalogue.itemNames),
  ];
  assert.equal(protectedTexts.length, 402);
  assert.deepEqual(sorted(protectedTexts), sorted(expectedProtected));
  assert.deepEqual(catalogue.scenes.map(scene => scene.sceneIdx), Array.from({ length: 18 }, (_, i) => i));
  assert.equal(catalogue.scenes[4].id, 'legacy-05');
  assert.deepEqual(catalogue.endings.map(ending => ending.id), [
    'hero', 'survivor', 'sacrifice', 'traitor', 'secret', 'light', 'shadow', 'rebuild', 'guardian',
  ]);
});

test('all original catalogue and UI occurrences match their source positions', () => {
  const literals = /^"(?:\\.|[^"\\])*"/s;
  const records = [...Object.entries(catalogue.texts), ...Object.entries(ui.texts)];
  assert.equal(Object.keys(catalogue.texts).length, 848);
  assert.equal(Object.keys(ui.texts).length, 562);
  const positions = new Set();
  for (const [id, record] of records) {
    const position = `${record.source.line}:${record.source.column}`;
    assert(!positions.has(position), `Duplicate source position for ${id}`);
    positions.add(position);
    if (record.templateSource !== undefined) {
      assert(at(record.source).startsWith(record.templateSource), id);
    } else {
      const literal = at(record.source).match(literals);
      assert(literal, `Missing source literal for ${id}`);
      assert.equal(JSON.parse(literal[0]), record.tn, id);
    }
  }
});

test('text IDs are unique, all references resolve, and context-specific repeats stay separate', () => {
  assert.throws(() => parseInventoryJson('{"texts":{"same":1,"same":2}}'), /Duplicate JSON key/);
  assert.throws(() => parseInventoryJson('{"x":{"key":1,"k\\u0065y":2}}'), /Duplicate JSON key/);
  const catalogueIds = Object.keys(catalogue.texts);
  const ids = [...catalogueIds, ...Object.keys(ui.texts)];
  assert.equal(new Set(ids).size, ids.length);
  const references = [];

  function textRef(id) {
    assert(own(catalogue.texts, id), `Unknown catalogue reference: ${id}`);
    references.push(id);
  }

  function textFields(fields) {
    Object.values(fields).forEach(textRef);
  }

  function lineRefs(prefix, lines) {
    for (const [index, line] of lines.entries()) {
      assert.equal(line.id, `line-${String(index + 1).padStart(3, '0')}`);
      assert.equal(line.text, `${prefix}.${line.id}`);
      assert.equal(line.who, `${line.text}.speaker`);
      textRef(line.who);
      textRef(line.text);
    }
  }

  for (const scene of catalogue.scenes) {
    textFields(scene.texts);
    lineRefs(`story.${scene.id}`, scene.lines);
    for (const choice of scene.choices) textFields(choice.texts);
    for (const hotspot of scene.hotspots) {
      textFields(hotspot.texts);
      if (hotspot.lock) textRef(hotspot.lock.whoLabel);
    }
  }
  for (const ending of catalogue.endings) {
    textFields(ending.gallery);
    textFields(ending.summary);
    if (ending.cinematic) {
      textFields(ending.cinematic.texts);
      lineRefs(`ending.${ending.id}.cinematic`, ending.cinematic.lines);
    }
  }
  for (const record of [...catalogue.characters, ...catalogue.clues, ...catalogue.achievements, ...catalogue.map]) {
    if (record.texts) textFields(record.texts);
  }
  for (const group of [...Object.values(catalogue.difficulty), ...Object.values(catalogue.expressions)]) textFields(group);
  for (const group of [catalogue.trustNames, catalogue.itemNames, catalogue.intro]) textFields(group);
  assert.deepEqual(sorted(references), sorted(catalogueIds));

  const matches = new Map();
  for (const [id, record] of Object.entries(catalogue.texts)) {
    if (!matches.has(record.tn)) matches.set(record.tn, []);
    matches.get(record.tn).push(id);
  }
  const duplicateGroups = [...matches].filter(([, ids]) => ids.length > 1).map(([tn, ids]) => ({ tn, ids }));
  assert.equal(duplicateGroups.length, 73);
  assert.deepEqual(catalogue.duplicates, duplicateGroups);
});

test('speaker IDs follow L1 while legacy portrait and trust keys stay distinct', () => {
  const legacyIds = [
    'ryan', 'sara', 'lina', 'salim', 'mansour', 'noor', 'youssef', 'elias',
    'amin', 'mariam', 'hadi', 'yasmin', 'karim',
  ];
  const expectedIds = [...legacyIds.map(id => `char.${id}`), 'role.narrator', 'role.elderly-woman'];
  assert.deepEqual(catalogue.characters.map(character => character.id), expectedIds);
  assert.deepEqual(catalogue.characters.flatMap(character => character.legacyId ?? []), legacyIds);
  const trust = Object.fromEntries(catalogue.characters.filter(character => character.trustKey).map(
    ({ id, trustKey }) => [id, trustKey],
  ));
  assert.equal(trust['char.noor'], 'nour');
  assert.equal(trust['char.youssef'], 'father');
  assert.deepEqual(sorted(Object.values(trust)), sorted(Object.keys(catalogue.trustNames)));
  const lines = [
    ...catalogue.scenes.flatMap(scene => scene.lines),
    ...catalogue.endings.flatMap(ending => ending.cinematic?.lines ?? []),
  ];
  assert.equal(lines.length, 166);
  const aliases = new Map();
  for (const line of lines) {
    const label = catalogue.texts[line.who].tn;
    assert(expectedIds.includes(line.speakerId), line.who);
    assert(!aliases.has(label) || aliases.get(label) === line.speakerId, label);
    aliases.set(label, line.speakerId);
  }
  assert.equal(aliases.size, 20);
  assert.equal(aliases.get('القائدة نور — 29 سنة'), 'char.noor');
  assert.equal(aliases.get('الأب يوسف'), 'char.youssef');
  assert.equal(aliases.get('الراوي'), 'role.narrator');
  assert.equal(aliases.get('امرأة عجوز'), 'role.elderly-woman');
});

test('UI triage covers every occurrence once and isolates the logical comparisons', () => {
  const { categories } = triage;
  const ids = Object.values(categories).flat();
  assert.deepEqual(sorted(ids), sorted(Object.keys(ui.texts)));
  for (const [category, group] of Object.entries(categories)) assert.equal(group.length, triage.counts[category]);
  const previousContext = ids.filter(id => ui.texts[id].kind === 'review-context');
  assert.equal(previousContext.length, 287);
  for (const [category, count] of Object.entries(triage.contextualCounts)) {
    assert.equal(categories[category].filter(id => ui.texts[id].kind === 'review-context').length, count);
  }
  const comparisonIds = Object.keys(ui.texts).filter(id => ui.texts[id].kind === 'control-match');
  assert.equal(comparisonIds.length, 8);
  assert.deepEqual(sorted(categories.logic), sorted(comparisonIds));
  assert.deepEqual(sorted(Object.values(triage.logicGroups).flat()), sorted(categories.logic));
  assert.deepEqual(sorted(Object.values(triage.protectedGroups).flat()), sorted(categories.protected));
  for (const id of Object.values(triage.humanReview).flat()) {
    assert(own(ui.texts, id) || own(catalogue.texts, id), `Unknown review reference: ${id}`);
  }
});

const directions = { tn: 'rtl', ar: 'rtl', en: 'ltr', fr: 'ltr' };
const parameters = message => new Set([...message.matchAll(/\{([a-z][a-zA-Z0-9]*)\}/g)].map(match => match[1]));

function assertLocaleParity(packs, canonicalMessages, { draft } = {}) {
  assert.deepEqual(sorted(Object.keys(packs)), sorted(Object.keys(directions)));
  const expected = sorted(Object.keys(canonicalMessages));
  for (const [locale, { messages, direction }] of Object.entries(packs)) {
    assert.equal(direction, directions[locale], locale);
    assert.deepEqual(sorted(Object.keys(messages)), expected, `Key parity: ${locale}`);
    for (const key of expected) {
      const message = messages[key];
      if (message === null && draft && locale !== 'tn') continue;
      assert(typeof message === 'string' && message.trim(), `Empty message: ${locale} ${key}`);
      if (locale === 'tn') assert.equal(message, canonicalMessages[key], key);
      assert.deepEqual(parameters(message), parameters(canonicalMessages[key]), `Parameters: ${locale} ${key}`);
    }
  }
}

test('draft locale packs share exact keys and preserve the Tunisian baseline and placeholders', () => {
  assert.equal(fixture.canonicalLocale, 'tn');
  assert.equal(fixture.status, 'draft');
  const templateId = 'ui.gameplay.text-094';
  const templateSource = ui.texts[templateId].templateSource;
  assert(triage.categories.template.includes(templateId));
  const canonicalMessages = {
    'story.legacy-01.title': catalogue.texts['story.legacy-01.title'].tn,
    'ending.hero.gallery.title': catalogue.texts['ending.hero.gallery.title'].tn,
    [templateId]: templateSource.slice(1, -1).replace('${B+1}', '{line}').replace('${j.lines.length}', '{total}'),
    'ui.map.text-007': ui.texts['ui.map.text-007'].tn,
  };
  for (const id of Object.keys(canonicalMessages)) {
    assert(!catalogue.texts[id]?.legacyUse, id);
    assert(!triage.categories.logic.includes(id) && !triage.categories.protected.includes(id), id);
  }
  assertLocaleParity(fixture.packs, canonicalMessages, { draft: true });
  assert.throws(() => assertLocaleParity(fixture.packs, canonicalMessages), /Empty message/);
  const invalid = structuredClone(fixture.packs);
  delete invalid.ar.messages['ui.map.text-007'];
  assert.throws(() => assertLocaleParity(invalid, canonicalMessages, { draft: true }), /Key parity/);
  invalid.ar.messages['ui.map.text-007'] = null;
  invalid.fr.messages['ui.shared.text-069'] = null;
  assert.throws(() => assertLocaleParity(invalid, canonicalMessages, { draft: true }), /Key parity/);
  delete invalid.fr.messages['ui.shared.text-069'];
  invalid.en.messages[templateId] = 'Dialogue {line}';
  assert.throws(() => assertLocaleParity(invalid, canonicalMessages, { draft: true }), /Parameters/);
});
