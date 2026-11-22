'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createPilotConfig,writePilotConfig,PROD_ID,PILOT_ID}=require('../scripts/qarton-pilot-capacitor-config.cjs');
const production=path.join(__dirname,'..','capacitor.config.json');
test('pilot app ID and label are distinct without changing production config',()=>{
 const original=fs.readFileSync(production,'utf8');
 const cfg=createPilotConfig(JSON.parse(original));
 assert.equal(cfg.appId,PILOT_ID);
 assert.notEqual(cfg.appId,PROD_ID);
 assert.match(cfg.appName,/PILOT/);
 assert.equal(cfg.webDir,'www');
 assert.equal(fs.readFileSync(production,'utf8'),original);
});
test('generator only writes new isolated output and never overwrites existing files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'qarton-pilot-'));
 try{
  const output=path.join(dir,'pilot','capacitor.config.json');
  const before=fs.readFileSync(production,'utf8');
  writePilotConfig(production,output);
  assert.equal(JSON.parse(fs.readFileSync(output,'utf8')).appId,PILOT_ID);
  assert.throws(()=>writePilotConfig(production,output),/overwrite/);
  assert.equal(fs.readFileSync(production,'utf8'),before);
  assert.throws(()=>writePilotConfig(production,production),/overwrite/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('unexpected source app identity is rejected',()=>{
 assert.throws(()=>createPilotConfig({appId:'com.unrelated.app',webDir:'www'}),/Unexpected/);
 assert.throws(()=>createPilotConfig({appId:PROD_ID,webDir:'../www'}),/Unexpected/);
});
