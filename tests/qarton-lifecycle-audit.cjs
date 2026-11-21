const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'scripts/qarton-main-tree.js'), 'utf8');
const premium = fs.readFileSync(path.join(root, 'scripts/qarton-premium-home.js'), 'utf8');
const prep = fs.readFileSync(path.join(root, 'scripts/prepare-web.cjs'), 'utf8');

// Guard the currently validated lifecycle boundaries while refactoring is planned.
// This is a source-contract audit, not a browser performance or E2E test.
assert.ok(main.includes('observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["disabled","id"],characterData:true})'));
assert.ok(main.includes('observer.disconnect();observer=null;'), 'main-tree observer must be disconnected after gameplay begins');
assert.ok(main.includes('rootWaiter.observe(document.documentElement,{subtree:true,childList:true})'));
assert.ok(main.includes('rootWaiter.disconnect()'), 'root attachment waiter must be disconnected after attachment');
assert.ok(premium.includes('observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]})'));
assert.ok(prep.includes('window.__carthageHasValidSave=hasSave'), 'save validation signal remains in the Android preparation runtime');
assert.ok(prep.includes('homeScreen&&hasSave'), 'continue action remains gated by home and valid save');
assert.ok(prep.includes('function exportSave') && prep.includes('function importFile'), 'backup functions remain present');
assert.ok(prep.includes('carthage-fixed-home-runtime'), 'fixed-home scroll guard remains installed');

console.log('QARTON lifecycle audit: observer scopes and teardown contracts intact.');
console.log('Next refactor is intentionally deferred until browser-level lifecycle coverage is available.');
