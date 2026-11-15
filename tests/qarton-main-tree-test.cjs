const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const tree=fs.readFileSync(path.join(root,'scripts','qarton-main-tree.js'),'utf8');
const prep=fs.readFileSync(path.join(root,'scripts','prepare-web.cjs'),'utf8');
const runtime=fs.readFileSync(path.join(root,'scripts','qarton-isolated-home.js'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert.doesNotThrow(()=>new vm.Script(tree));
for(const [id,label] of [['story','القصة'],['world','عالم قرطاج'],['progress','التقدم والحفظ'],['settings','الإعدادات']]){
 assert.ok(tree.includes('"'+id+'"'),'tree must expose '+id+' branch');
 assert.ok(tree.includes(label),'tree must label '+id+' branch');
}
assert.ok(tree.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'main navigation must use a two-column grid');
assert.ok(tree.includes('overflow:hidden'),'main screen must remain fixed without vertical page scrolling');
assert.ok(tree.includes('storyNodes.forEach'),'native game operations must remain preserved in the Story branch');
assert.ok(tree.includes('backupNodes.forEach'),'save import/export controls must be preserved in Progress & Saves');
assert.ok(tree.includes('shiganshina-slots-v1')&&tree.includes('shiganshina-autosave-v1'),'progress summary must read existing save keys');
assert.ok(!tree.includes('localStorage.removeItem'),'navigation must never delete user saves');
assert.ok(tree.includes('qarton-settings-v1')&&tree.includes('qarton:settingschange'),'settings must persist and emit a stable settings event');
assert.ok(tree.includes('window.__QARTON_OPEN_SECTION__'),'branch navigation must expose a testable public entry point');
assert.ok(tree.includes('function isHome()')&&tree.includes('if(!isHome()||!collect())return'),'tree rendering must be restricted to HOME so it cannot cover INTRO, GAME, or TRANSITION');
assert.ok(tree.includes('e.detail.state==="HOME"'),'returning to HOME must reactivate the tree after a transition');
assert.ok(tree.includes('bodyObserver.observe(document.body,{childList:true})')&&tree.includes('attachHome(h)'),'tree must reattach when the isolated HOME overlay is recreated after gameplay');
assert.ok(prep.includes('qarton-main-tree.js')&&prep.includes('qarton-main-tree-runtime'),'Android web preparation must include the QARTON tree runtime');
assert.ok(runtime.includes('window.__carthageStartNewGame')&&runtime.includes('window.__carthageContinue'),'existing game engine actions must remain the source of Story actions');
assert.ok(runtime.includes('window.__carthageCanStartPart3'),'Part 3 gating remains owned by the story engine');
assert.ok(pkg.scripts.test.includes('qarton-main-tree-test.cjs'),'tree regression test must run in the standard test suite');
console.log('PASS: QARTON four-branch tree, fixed 2x2 home, preserved game/save actions, and Android runtime integration.');
