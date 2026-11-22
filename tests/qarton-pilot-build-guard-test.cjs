'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createPilotConfig}=require('../scripts/qarton-pilot-capacitor-config.cjs');
const {assertPilotBuildConfig,guardFiles}=require('../scripts/qarton-pilot-build-guard.cjs');
const prod=JSON.parse(fs.readFileSync(path.join(__dirname,'..','capacitor.config.json'),'utf8'));
test('only an explicitly marked distinct pilot identity passes',()=>{
 const pilot=createPilotConfig(prod);
 assert.deepEqual(assertPilotBuildConfig(pilot,prod),{safe:true,pilotAppId:'com.qarton.carthage.pilot'});
 for(const bad of [{...pilot,appId:prod.appId},{...pilot,appId:'com.other.app'},{...pilot,appName:'قرطاج'},{...pilot,webDir:'../www'},null]){
  assert.throws(()=>assertPilotBuildConfig(bad,prod));
 }
});
test('guard rejects same config file and reads separate generated files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'qarton-guard-'));
 try{
  const prodPath=path.join(dir,'production.json'),pilotPath=path.join(dir,'pilot.json');
  fs.writeFileSync(prodPath,JSON.stringify(prod));
  fs.writeFileSync(pilotPath,JSON.stringify(createPilotConfig(prod)));
  assert.equal(guardFiles(pilotPath,prodPath).safe,true);
  assert.throws(()=>guardFiles(prodPath,prodPath),/separate/);
  fs.writeFileSync(pilotPath,JSON.stringify(prod));
  assert.throws(()=>guardFiles(pilotPath,prodPath),/Unsafe/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
