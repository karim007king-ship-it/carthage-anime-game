'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {installPilotPreview}=require('../scripts/qarton-pilot-preview-install.cjs');
test('pilot preview installer refuses non-pilot workspaces',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qarton-install-test-'));
 const original=process.env.QARTON_ISOLATED_PILOT;
 try{
  fs.writeFileSync(path.join(tmp,'capacitor.config.json'),JSON.stringify({appId:'com.qarton.carthage'}));
  delete process.env.QARTON_ISOLATED_PILOT;
  assert.throws(()=>installPilotPreview(tmp),/environment required/);
  process.env.QARTON_ISOLATED_PILOT='1';
  assert.throws(()=>installPilotPreview(tmp),/Refusing production/);
  assert.equal(fs.existsSync(path.join(tmp,'www')),false);
 }finally{
  if(original===undefined) delete process.env.QARTON_ISOLATED_PILOT; else process.env.QARTON_ISOLATED_PILOT=original;
  fs.rmSync(tmp,{recursive:true,force:true});
 }
});

test('isolated pilot opens a visible 36-chapter index with a legacy-game escape route',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qarton-preview-launch-'));
 const original=process.env.QARTON_ISOLATED_PILOT;
 try{
  const root=path.resolve(__dirname,'..');
  for(const name of ['docs','game-content','tests','scripts'])fs.symlinkSync(path.join(root,name),path.join(tmp,name),'dir');
  fs.mkdirSync(path.join(tmp,'www'));
  fs.writeFileSync(path.join(tmp,'www/index.html'),'<html><head></head><body><main>Legacy game</main></body></html>');
  fs.writeFileSync(path.join(tmp,'capacitor.config.json'),JSON.stringify({appId:'com.qarton.carthage.pilot'}));
  process.env.QARTON_ISOLATED_PILOT='1';
  const result=installPilotPreview(tmp);
  assert.equal(result.pages,144);
  assert.equal(result.entry,'pilot-preview/index.html');
  const html=fs.readFileSync(path.join(tmp,'www/index.html'),'utf8');
  assert.match(html,/qarton-pilot-preview-launch/);
  assert.match(html,/pilot-preview\/index.html/);
  assert.match(html,/game=1/);
  const landing=fs.readFileSync(path.join(tmp,'www/pilot-preview/index.html'),'utf8');
  assert.match(landing,/36 فصل/);
  assert.match(landing,/\.\.\/index.html\?game=1/);
  assert.equal((landing.match(/<li>/g)||[]).length,36);
  assert.equal(fs.readdirSync(path.join(tmp,'www/pilot-preview/tn')).length,36);
 }finally{
  if(original===undefined)delete process.env.QARTON_ISOLATED_PILOT;else process.env.QARTON_ISOLATED_PILOT=original;
  fs.rmSync(tmp,{recursive:true,force:true});
 }
});
