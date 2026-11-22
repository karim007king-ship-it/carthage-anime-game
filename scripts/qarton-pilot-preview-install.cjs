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
  // Launch the preview index first in the *pilot-only* package. The legacy game
  // stays available at index.html?game=1, without changing its save/runtime.
  const entries=JSON.parse(fs.readFileSync(path.join(root,'docs/qarton-unified-id-registry.proposal.json'),'utf8')).scenes;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const links=entries.map(e=>'<li><a href="./tn/'+encodeURIComponent(e.id)+'.html">الفصل '+e.displayChapter+' — '+escape(e.id)+'</a></li>').join('');
  const landing='<!doctype html><html lang="tn" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QARTON PILOT — معاينة الفصول</title><style>body{background:#12131a;color:#f5f1e8;font:16px system-ui;padding:20px;line-height:1.8}a{color:#e8c17a}li{padding:5px 0}nav{display:flex;gap:12px;flex-wrap:wrap}nav a{padding:7px;border:1px solid #947b55}</style></head><body><h1>QARTON PILOT — معاينة الفصول</h1><p>36 فصل للمعاينة فقط؛ موش لعبة كاملة. لا توجد كتابة في الحفظ.</p><nav><a href="../index.html?game=1">فتح اللعبة الأصلية داخل PILOT</a><a href="./ar/p1-family-promise.html">العربية</a><a href="./en/p1-family-promise.html">English</a><a href="./fr/p1-family-promise.html">Français</a></nav><ol>'+links+'</ol></body></html>';
  fs.writeFileSync(path.join(preview,'index.html'),landing,'utf8');
  const link='<a id="qarton-pilot-preview-entry" href="./pilot-preview/index.html" style="position:fixed;bottom:12px;right:12px;z-index:2147483647;background:#221b16;color:#e8c17a;padding:9px 12px;border:1px solid #e8c17a;border-radius:8px;font:13px system-ui;text-decoration:none">PILOT · معاينة الفصول</a>';
  const gate='<script id="qarton-pilot-preview-launch">if(new URLSearchParams(location.search).get("game")!=="1"){location.replace("./pilot-preview/index.html");}</script>';
  fs.writeFileSync(index,html.replace(/<\\/head\\s*>/i,gate+'</head>').replace(/<\\/body\\s*>/i,link+'</body>'),'utf8');
  return Object.freeze({pages:result.files,entry:'pilot-preview/index.html'});
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
if(require.main===module) console.log(JSON.stringify(installPilotPreview(process.argv[2]||'')));
module.exports={installPilotPreview};
