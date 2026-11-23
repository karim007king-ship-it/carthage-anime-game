'use strict';
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const prep = fs.readFileSync(path.join(__dirname, '..', 'scripts/prepare-web.cjs'), 'utf8');
const count = (source, needle) => source.split(needle).length - 1;
const report = {
  generatedAt: new Date().toISOString(),
  source: 'index.html',
  sourceBytes: Buffer.byteLength(html),
  storyIndicators: {
    sceneIdx: count(html, 'sceneIdx'),
    chapter: count(html, 'chapter'),
    part: count(html, 'part'),
    choice: count(html, 'choice'),
    ending: count(html, 'ending')
  },
  preparationIndicators: {
    replaceOnce: count(prep, 'replaceOnce('),
    sceneIdx: count(prep, 'sceneIdx'),
    chapter: count(prep, 'chapter'),
    legacyPartThreeGate: prep.includes('__carthageCanStartPart3'),
    legacySaveKey: prep.includes('shiganshina-autosave-v1')
  },
  caveat: 'Lexical counts are diagnostic only; they do NOT establish the number of playable chapters.'
};
console.log(JSON.stringify(report, null, 2));
