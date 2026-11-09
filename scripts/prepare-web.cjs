const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'index.html');
const outDir = path.join(__dirname, '..', 'www');
const target = path.join(outDir, 'index.html');
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(source, target);

let html = fs.readFileSync(target, 'utf8');
const startToken = 'X3=(P)=>{';
const endToken = ',n6=(P)=>{';
const start = html.indexOf(startToken);
const end = start < 0 ? -1 : html.indexOf(endToken, start);
if (start < 0 || end < 0) {
  throw new Error('Could not locate the game save-export handler; refusing to build an APK with a broken save export.');
}

const replacement = `X3=async(P)=>{if(!P&&!$t&&!Xn.some(Boolean)){G("ما فماش تقدم باش تحفظو — ابدأ اللعب أولاً");return}let z=P?yr(P):$t?yr():yr(Xn.filter(Boolean).sort((c,b)=>(b.savedAtMs||0)-(c.savedAtMs||0))[0]||void 0);if(!z){G("ما فماش تقدم باش تحفظو");return}let json=JSON.stringify(z,null,2);try{let plugins=window.Capacitor&&window.Capacitor.Plugins;if(plugins&&plugins.Filesystem&&plugins.Share){let filename="carthage-save-"+new Date().toISOString().replace(/[:.]/g,"-")+".json";let saved=await plugins.Filesystem.writeFile({path:filename,data:json,directory:"CACHE",encoding:"utf8"});if(!saved||!saved.uri)throw new Error("لم يتم إنشاء الملف");await plugins.Share.share({title:"حفظ قرطاج",text:"ملف حفظ التقدم في لعبة قرطاج",files:[saved.uri],dialogTitle:"تصدير ملف الحفظ"});G("تم تجهيز ملف الحفظ — اختر تطبيق الملفات للاحتفاظ به");return}if(navigator.share&&typeof File!=="undefined"){let file=new File([json],"carthage-save.json",{type:"application/json"});if(!navigator.canShare||navigator.canShare({files:[file]})){await navigator.share({title:"حفظ قرطاج",files:[file]});G("تمت مشاركة ملف الحفظ");return}}let blob=new Blob([json],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download="carthage-save.json",document.body.appendChild(a),a.click(),a.remove(),window.setTimeout(()=>URL.revokeObjectURL(url),1500),G("تم تنزيل ملف الحفظ")}catch(e){let msg=String(e&&e.message||e||"");if(/cancel/i.test(msg)){G("تم إلغاء مشاركة ملف الحفظ");return}G("تعذر إنشاء ملف الحفظ: "+(msg||"خطأ غير معروف"))}}`;
html = html.slice(0, start) + replacement + html.slice(end);
fs.writeFileSync(target, html);
console.log('Prepared Android web bundle with native Filesystem + Share save export.');
