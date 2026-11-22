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
