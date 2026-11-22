'use strict';
// Inject a static preview entry only into an isolated prepared www directory.
const fs=require('node:fs');
const path=require('node:path');
const {exportPilotPreview}=require('./qarton-pilot-preview-export.cjs');
function installPilotPreview(workspace){
 const root=path.resolve(workspace);
 if(process.env.QARTON_ISOLATED_PILOT!=='1') throw new Error('Isolated pilot environment required');
 const config=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
 if(config.appId!=='com.qarton.carthage.pilot') throw new Error('Refusing production Android package');
 const www=path.join(root,'www');
 const index=path.join(www,'index.html');
 if(!fs.existsSync(index)) throw new Error('Prepared isolated www/index.html required');
 const sourceRoot=path.resolve(__dirname,'..');
 if(root===sourceRoot || root.startsWith(sourceRoot+path.sep)) throw new Error('Refusing checked-in source workspace');
 const html=fs.readFileSync(index,'utf8');
 if(!/<\/body\s*>/i.test(html)) throw new Error('Missing closing body');
 if(html.includes('id="qarton-pilot-preview-entry"')) throw new Error('Preview already installed');
 const preview=path.join(www,'pilot-preview');
 if(fs.existsSync(preview)) throw new Error('Pilot preview destination exists');
 const temp=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'qarton-pilot-preview-'));
 try{
  const output=path.join(temp,'pages');
  const result=exportPilotPreview(output,root);
  fs.cpSync(output,preview,{recursive:true,errorOnExist:true,force:false});
  const link='<a id="qarton-pilot-preview-entry" href="./pilot-preview/tn/p1-family-promise.html" style="position:fixed;bottom:12px;right:12px;z-index:2147483647;background:#221b16;color:#e8c17a;padding:9px 12px;border:1px solid #e8c17a;border-radius:8px;font:13px system-ui;text-decoration:none" aria-label="QARTON PILOT read-only chapter preview">PILOT · معاينة الفصول</a>';
  fs.writeFileSync(index,html.replace(/<\/body\s*>/i,link+'</body>'),'utf8');
  return Object.freeze({pages:result.files,entry:'pilot-preview/tn/p1-family-promise.html'});
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
if(require.main===module) console.log(JSON.stringify(installPilotPreview(process.argv[2]||'')));
module.exports={installPilotPreview};
