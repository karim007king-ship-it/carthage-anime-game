'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {exportPilotPreview}=require('../scripts/qarton-pilot-preview-export.cjs');
const root=path.resolve(__dirname,'..');
test('exports 144 static files outside source with no production mutation',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'qarton-preview-'));
 try{
  const out=path.join(temp,'isolated');
  const result=exportPilotPreview(out);
  assert.equal(result.files,144);
  assert.equal(result.chapters,36);
  assert.equal(result.locales,4);
  for(const locale of ['tn','ar','en','fr']){
   assert.equal(fs.readdirSync(path.join(out,locale)).length,36);
   assert.match(fs.readFileSync(path.join(out,locale,'legacy-01.html'),'utf8'),/Read-only/);
  }
  assert.throws(()=>exportPilotPreview(out),/empty/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('refuses production paths',()=>{
 for(const p of [root,path.join(root,'www'),path.join(root,'android'),path.join(root,'app'),path.join(root,'scripts','out')]){
  assert.throws(()=>exportPilotPreview(p),/Refusing/);
 }
 assert.throws(()=>exportPilotPreview(''),/required/);
});
