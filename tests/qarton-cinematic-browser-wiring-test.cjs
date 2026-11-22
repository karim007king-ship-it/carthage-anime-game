'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../examples/qarton-single-load-lab.html'), 'utf8');
test('visual lab consumes shared JSON scene and shared timeline player', () => {
  assert.match(html, /src="\.\.\/scripts\/qarton-timeline-player\.js"/);
  assert.match(html, /fetch\('\.\/qarton-single-load-scene\.json'\)/);
  assert.match(html, /QartonTimelinePlayer\.createTimelinePlayer\(scene,render\)/);
  assert.match(html, /requestAnimationFrame\(frame\)/);
  assert.match(html, /player\.destroy\(\)/);
});
test('lab never accesses original game save or story globals', () => {
  assert.doesNotMatch(html, /localStorage|sessionStorage|__carthageSaveNow|__carthageContinue|window\.cz|sceneIdx/);
});
