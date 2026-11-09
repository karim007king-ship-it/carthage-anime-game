const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = path.join(__dirname, '..', 'index.html');
const outDir = path.join(__dirname, '..', 'www');
const target = path.join(outDir, 'index.html');
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(source, target);

let html = fs.readFileSync(target, 'utf8');
function replaceOnce(needle, replacement, label) {
  const index = html.indexOf(needle);
  if (index < 0) throw new Error('Missing expected game hook: ' + label);
  if (html.indexOf(needle, index + needle.length) >= 0) throw new Error('Ambiguous game hook: ' + label);
  html = html.slice(0, index) + replacement + html.slice(index + needle.length);
}

// Android-native JSON save export. Browser builds retain Web Share / download fallbacks.
const exportStart = 'X3=(P)=>{';
const exportEnd = ',n6=(P)=>{';
const xs = html.indexOf(exportStart);
const xe = xs < 0 ? -1 : html.indexOf(exportEnd, xs);
if (xs < 0 || xe < 0) throw new Error('Could not locate the game save-export handler.');
const exportHandler = `X3=async(P)=>{if(!P&&!$t&&!Xn.some(Boolean)){G("ما فماش تقدم باش تحفظو — ابدأ اللعب أولاً");return}let z=P?yr(P):$t?yr():yr(Xn.filter(Boolean).sort((c,b)=>(b.savedAtMs||0)-(c.savedAtMs||0))[0]||void 0);if(!z){G("ما فماش تقدم باش تحفظو");return}let json=JSON.stringify(z,null,2);try{let plugins=window.Capacitor&&window.Capacitor.Plugins;if(plugins&&plugins.Filesystem&&plugins.Share){let filename="carthage-save-"+new Date().toISOString().replace(/[:.]/g,"-")+".json";let saved=await plugins.Filesystem.writeFile({path:filename,data:json,directory:"CACHE",encoding:"utf8"});if(!saved||!saved.uri)throw new Error("لم يتم إنشاء الملف");await plugins.Share.share({title:"حفظ قرطاج",text:"ملف حفظ التقدم في لعبة قرطاج",files:[saved.uri],dialogTitle:"تصدير ملف الحفظ"});G("تم تجهيز ملف الحفظ — اختر تطبيق الملفات للاحتفاظ به");return}if(navigator.share&&typeof File!=="undefined"){let file=new File([json],"carthage-save.json",{type:"application/json"});if(!navigator.canShare||navigator.canShare({files:[file]})){await navigator.share({title:"حفظ قرطاج",files:[file]});G("تمت مشاركة ملف الحفظ");return}}let blob=new Blob([json],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download="carthage-save.json",document.body.appendChild(a),a.click(),a.remove(),window.setTimeout(()=>URL.revokeObjectURL(url),1500),G("تم تنزيل ملف الحفظ")}catch(e){let msg=String(e&&e.message||e||"");if(/cancel/i.test(msg)){G("تم إلغاء مشاركة ملف الحفظ");return}G("تعذر إنشاء ملف الحفظ: "+(msg||"خطأ غير معروف"))}}`;
html = html.slice(0, xs) + exportHandler + html.slice(xe);

// Make in-game slot writes verifiable, and autosave each meaningful story-state change.
const saveStart = 'ur=(P,z=!1)=>{';
const saveEnd = ',P3=(P)=>{';
const us = html.indexOf(saveStart);
const ue = us < 0 ? -1 : html.indexOf(saveEnd, us);
if (us < 0 || ue < 0) throw new Error('Could not locate the in-game save-slot handler.');
const saveHandler = `ur=(P,z=!1)=>{let c={slot:P,savedAt:fu(new Date),savedAtMs:Date.now(),sceneIdx:T,sceneName:an[T]?.place||"قرطاج",state:L,flags:K,visited:v9,usedHotspots:af,difficulty:jf,hintsUsed:A9,choicesHistory:yu,lineIdx:B,mapUnlocked:e9,lastChoice:Qt,part:cu,secretUnlocked:mu,achievements:[...tv.current],endingsSeen:[...Zn]};$8((b)=>b.map((i,R)=>R===P-1?c:i)),te(P);try{let slots=JSON.parse(localStorage.getItem("shiganshina-slots-v1")||"[null,null,null]");slots[P-1]=c;localStorage.setItem("shiganshina-slots-v1",JSON.stringify(slots));localStorage.setItem("shiganshina-autosave-v1",JSON.stringify(c));localStorage.setItem("shiganshina-autosave-time-v1",String(Date.now()));let verify=JSON.parse(localStorage.getItem("shiganshina-slots-v1")||"[]");if(!verify[P-1]||verify[P-1].sceneIdx!==c.sceneIdx)throw new Error("storage verification failed");if(!z)G("تم الحفظ في الخانة "+P+" — "+c.sceneName+" • "+nn(L.time)+" (محفوظ في جهازك)");return c}catch(e){G("تعذر حفظ التقدم في الجهاز. تأكد من مساحة التخزين ثم أعد المحاولة.");return false}}`;
const autosaveHook = `;window.__carthageSaveNow=()=>ur(cz,!1);y.useEffect(()=>{if(f!=="game")return;let timer=window.setTimeout(()=>{try{ur(cz,!0)}catch(e){}},300);return()=>window.clearTimeout(timer)},[f,T,B,L,K,cu]);let P3=(P)=>{`;
html = html.slice(0, us) + saveHandler + autosaveHook + html.slice(ue + saveEnd.length);

// Expose a genuine Part 3 start action, beginning at story chapter 15.
const part3 = `carthageStartPart3=()=>{if(!Zn.includes("light")&&!Zn.includes("shadow")){G("الجزء الثالث مازال مقفول — كمّل الجزء الثاني واختم قصته أولاً");return}let inventory=L.inventory&&L.inventory.length?[...L.inventory]:sz,clues=L.clues&&L.clues.length?[...L.clues]:["crack","alley","oldmap","file","stone"];e3("part3"),z9(!0),W((b)=>({...b,time:60,health:Math.max(85,b.health||0),courage:Math.max(60,b.courage||0),inventory:[...inventory],clues:[...new Set(clues)],trust:{...b.trust,lina:Math.max(b.trust.lina||0,60)}})),q((b)=>[...new Set([...b,"part2","part3"])]),Ct(),m(14),x(0),p("dialogue"),Q8([14]),t9(!0),ve([]),n3(0),v3(!1),f3((b)=>[...b,"الجزء الثالث — ما بعد الحقيقة"]),K8("ابدأ الجزء الثالث"),fr(!0),uv(null),Gn(null),Hn(!1),n("game"),G("الجزء الثالث — ما بعد الحقيقة");try{Of(),_.tick()}catch{}}`;
replaceOnce(',Bu=(P)=>{', ',' + part3 + ',Bu=(P)=>{', 'Part 3 start function');
replaceOnce('Bu=(P)=>{if(P===9)', 'Bu=(P)=>{if(P===15){Pe(!1);if(!Zn.includes("light")&&!Zn.includes("shadow")){G("🔒 الجزء الثالث يفتح بعد إتمام الجزء الثاني");return}carthageStartPart3()}else if(P===9)', 'Part 3 selection branch');
replaceOnce(',Zu=()=>{', ';window.__carthageStartPart3=()=>Bu(15);window.__carthageCanStartPart3=()=>Zn.includes("light")||Zn.includes("shadow");window.__carthageContinue=()=>{let slots=[],auto=null;try{slots=JSON.parse(localStorage.getItem("shiganshina-slots-v1")||"[]");auto=JSON.parse(localStorage.getItem("shiganshina-autosave-v1")||"null")}catch(e){}let candidates=[...(Array.isArray(slots)?slots:[]),auto].filter(v=>v&&Number.isInteger(v.sceneIdx)&&v.sceneIdx>=0&&v.state&&typeof v.state.time==="number"&&typeof v.state.health==="number"&&typeof v.state.courage==="number");candidates.sort((a,b)=>(b.savedAtMs||0)-(a.savedAtMs||0));let best=candidates[0];if(!best){G("ما فماش حفظ صالح — ابدأ لعبة جديدة");return}if(!best.slot)best={...best,slot:1};P3(best)};let Zu=()=>{', 'Part 3 public entry point');

// Native home control: autosave first, then return to the initial menu without clearing slots.
const navigation = "<script id=\"carthage-native-navigation\">(function(){if(window.__carthageNavigationInstalled)return;window.__carthageNavigationInstalled=true;function mount(){var root=document.getElementById(\"root\")||document.body;var playing=!!document.querySelector(\".game-timer\");var canPart3=typeof window.__carthageCanStartPart3===\"function\"&&window.__carthageCanStartPart3();var home=document.getElementById(\"carthage-home-return\");if(playing&&!home){home=document.createElement(\"button\");home.id=\"carthage-home-return\";home.type=\"button\";home.textContent=\"⌂ الرئيسية\";home.setAttribute(\"aria-label\",\"العودة إلى الشاشة الرئيسية\");home.style.cssText=\"position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;z-index:2147483000;border:1px solid #f4c76b;border-radius:999px;background:rgba(25,12,12,.94);color:#ffe5a0;padding:9px 13px;font:700 13px system-ui;box-shadow:0 4px 18px #0009\";home.addEventListener(\"click\",function(){home.disabled=true;home.textContent=\"جارٍ حفظ التقدم...\";var ok=false;try{ok=typeof window.__carthageSaveNow===\"function\"&&window.__carthageSaveNow()!==false}catch(e){}if(!ok){home.disabled=false;home.textContent=\"⌂ الرئيسية\";return}home.textContent=\"تم الحفظ — جارٍ الرجوع\";window.setTimeout(function(){window.location.reload()},500)});document.body.appendChild(home)}else if(!playing&&home)home.remove();var saveButton=document.getElementById(\"carthage-save-now\");if(playing&&!saveButton){saveButton=document.createElement(\"button\");saveButton.id=\"carthage-save-now\";saveButton.type=\"button\";saveButton.textContent=\"💾 حفظ التقدم\";saveButton.setAttribute(\"aria-label\",\"حفظ التقدم الآن\");saveButton.style.cssText=\"position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:10px;z-index:2147483000;border:1px solid #f4c76b;border-radius:999px;background:rgba(25,12,12,.94);color:#ffe5a0;padding:9px 13px;font:700 13px system-ui;box-shadow:0 4px 18px #0009\";saveButton.addEventListener(\"click\",function(){saveButton.disabled=true;var ok=false;try{ok=typeof window.__carthageSaveNow===\"function\"&&window.__carthageSaveNow()!==false}catch(e){}saveButton.textContent=ok?\"✓ تم الحفظ\":\"تعذر الحفظ\";window.setTimeout(function(){saveButton.disabled=false;saveButton.textContent=\"💾 حفظ التقدم\"},1600)});document.body.appendChild(saveButton)}else if(!playing&&saveButton)saveButton.remove();var continueButton=document.getElementById(\"carthage-continue-last\");var hasSave=false;try{var stored=JSON.parse(localStorage.getItem(\"shiganshina-slots-v1\")||\"[]\");var auto=JSON.parse(localStorage.getItem(\"shiganshina-autosave-v1\")||\"null\");hasSave=(Array.isArray(stored)&&stored.some(function(v){return v&&Number.isInteger(v.sceneIdx)&&v.state}))||!!(auto&&Number.isInteger(auto.sceneIdx)&&auto.state)}catch(e){}if(!playing&&hasSave&&typeof window.__carthageContinue===\"function\"&&!continueButton){continueButton=document.createElement(\"button\");continueButton.id=\"carthage-continue-last\";continueButton.type=\"button\";continueButton.textContent=\"▶ متابعة آخر حفظ\";continueButton.style.cssText=\"position:relative;display:block;width:100%;margin:10px auto 0;z-index:2147483000;border:2px solid #f4c76b;border-radius:16px;background:#17243d;color:#ffe5a0;padding:14px 18px;font:800 15px system-ui;box-shadow:0 8px 24px #0009\";continueButton.addEventListener(\"click\",function(){window.__carthageContinue()});var menuActions=root.querySelector(\".home-actions.grid\");if(menuActions)menuActions.insertBefore(continueButton,menuActions.children[1]||null);else document.body.appendChild(continueButton)}else if((playing||!hasSave)&&continueButton)continueButton.remove();var startButton=Array.from(root.querySelectorAll(\"button\")).find(function(b){return /ابدأ الجزء الأول/.test(b.textContent||\"\")});if(!playing&&startButton){startButton.setAttribute(\"aria-label\",hasSave?\"لعبة جديدة — الجزء الأول. لاستكمال تقدمك اضغط متابعة آخر حفظ\":\"ابدأ الجزء الأول\");startButton.title=hasSave?\"هذا الزر يبدأ قصة جديدة ولا يستكمل الحفظ\":\"ابدأ القصة من البداية\"}var noButtons=Array.from(root.querySelectorAll(\"button\")).filter(function(b){return (b.textContent||\"\").trim()===\"لا\"});noButtons.forEach(function(b){b.textContent=\"رجوع للقائمة\"});var partButton=document.getElementById(\"carthage-part3-start\");if(playing&&partButton){partButton.remove();partButton=null}if(!playing&&typeof window.__carthageStartPart3===\"function\"){if(!partButton){partButton=document.createElement(\"button\");partButton.id=\"carthage-part3-start\";partButton.type=\"button\";partButton.style.cssText=\"position:relative;display:block;width:100%;margin:8px auto 0;z-index:2147483000;border:2px solid #f4c76b;border-radius:16px;background:#241b2c;color:#fff;padding:13px 18px;font:800 14px system-ui;box-shadow:0 8px 24px #0009\";var part2Button=root.querySelector(\"#btn-part2\");if(part2Button)part2Button.insertAdjacentElement(\"afterend\",partButton);else document.body.appendChild(partButton)}partButton.textContent=canPart3?\"▶ ابدأ الجزء 3 — ما بعد الحقيقة\":\"🔒 الجزء الثالث — يفتح بعد إتمام الجزء الثاني\";partButton.disabled=!canPart3;partButton.setAttribute(\"aria-disabled\",String(!canPart3));partButton.style.opacity=canPart3?\"1\":\"0.72\";partButton.onclick=function(){if(canPart3)window.__carthageStartPart3()}}}var observer=new MutationObserver(mount);function start(){observer.observe(document.documentElement,{childList:true,subtree:true});mount()}if(document.readyState===\"loading\")document.addEventListener(\"DOMContentLoaded\",start,{once:true});else start()})();</script>";

const startupDiagnostics = `<script id="carthage-startup-diagnostics">
(function(){
  var errors=[];
  function record(kind,message,source,line){
    var item={kind:kind,message:String(message||"unknown"),source:String(source||""),line:line||0,time:new Date().toISOString()};
    errors.push(item);if(errors.length>12)errors.shift();
    try{sessionStorage.setItem("carthage-startup-errors",JSON.stringify(errors))}catch(e){}
  }
  window.addEventListener("error",function(e){
    if(e.target&&e.target!==window){record("Resource load",e.target.src||e.target.href||e.target.tagName||"resource");return}
    record("JavaScript",e.message,e.filename,e.lineno);
  },true);
  window.addEventListener("unhandledrejection",function(e){var r=e.reason;record("Promise",r&&r.stack||r&&r.message||r)});
  var originalError=console.error;
  console.error=function(){try{record("console.error",Array.prototype.map.call(arguments,function(v){return v&&v.stack||v&&v.message||String(v)}).join(" "))}catch(e){}return originalError.apply(console,arguments)};
  function showIfStuck(){
    if(document.getElementById("carthage-startup-error"))return;
    var root=document.getElementById("root");
    var bodyText=(root&&root.innerText||document.body&&document.body.innerText||"").trim();
    var loading=/جاري.{0,18}(تحميل|التحم)|loading|starting/i.test(bodyText);
    var appReady=!!(root&&root.querySelector("button,[role=button],canvas,.game-timer"));
    if(!loading&&appReady)return;
    if(!loading&&bodyText.length>80)return;
    var panel=document.createElement("section");
    panel.id="carthage-startup-error";panel.dir="rtl";
    panel.style.cssText="position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#100d12;color:#fff;padding:24px;font:14px/1.8 system-ui;text-align:right";
    var title=document.createElement("h2");title.textContent="تعذّر تشغيل اللعبة";title.style.cssText="color:#e8a33d;font-size:22px;font-weight:900";
    var desc=document.createElement("p");desc.textContent="توقّف تشغيل واجهة اللعبة قبل ظهور القائمة. هذه معلومات تشخيص من الهاتف؛ لم يتم تغيير القصة أو بيانات الحفظ.";
    var pre=document.createElement("pre");pre.style.cssText="white-space:pre-wrap;overflow-wrap:anywhere;background:#241c24;border:1px solid #75552b;border-radius:12px;padding:12px;color:#ffe5a0";
    var stored=[];try{stored=JSON.parse(sessionStorage.getItem("carthage-startup-errors")||"[]")}catch(e){}
    var all=errors.length?errors:stored;
    pre.textContent=(all.length?all.map(function(e){return e.kind+": "+e.message+(e.source?"\\n"+e.source+":"+e.line:"")}).join("\\n\\n"):"لم يُلتقط خطأ JavaScript واضح.")+"\\n\\nحالة الصفحة: "+(loading?"ما زالت تعرض شاشة التحميل":"لم تظهر واجهة اللعبة")+"\\nنص الصفحة: "+(bodyText.slice(0,500)||"(فارغ)");
    var btn=document.createElement("button");btn.textContent="نسخ معلومات التشخيص";btn.style.cssText="background:#e8a33d;color:#160f08;border:0;border-radius:12px;padding:12px 18px;font-weight:900";
    btn.onclick=function(){var report="Carthage Android startup diagnostic\\n"+pre.textContent;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(report).then(function(){btn.textContent="تم النسخ"}).catch(function(){pre.textContent=report});else{var t=document.createElement("textarea");t.value=report;document.body.appendChild(t);t.select();try{document.execCommand("copy");btn.textContent="تم النسخ"}catch(e){}t.remove()}};
    panel.append(title,desc,pre,btn);document.body.appendChild(panel);
  }
  window.setTimeout(showIfStuck,12000);
})();
</script>`;
if (!html.includes('</head>')) throw new Error('Missing closing head tag for startup diagnostics.');
html = html.replace('</head>', startupDiagnostics + '</head>');
const watchdogFallback = `<style id="carthage-watchdog-style">
@keyframes carthage-watchdog-reveal{0%{opacity:0;visibility:hidden;pointer-events:none}99%{opacity:0;visibility:hidden;pointer-events:none}100%{opacity:1;visibility:visible;pointer-events:auto}}
#carthage-startup-watchdog{position:fixed;inset:0;z-index:2147483646;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px;overflow:auto;box-sizing:border-box;padding:28px;background:#100d12;color:#fff;text-align:center;font:15px/1.9 system-ui;opacity:0;visibility:hidden;animation:carthage-watchdog-reveal .01s linear 12s forwards}
#carthage-startup-watchdog h2{margin:0;color:#e8a33d;font-size:23px;font-weight:900}
#carthage-startup-watchdog p{max-width:34rem;margin:0}
</style>`;
const watchdogMarkup = `<section id="carthage-startup-watchdog" dir="rtl" role="alert">
<h2>اللعبة ما زالت عالقة في التحميل</h2>
<p>لم تظهر واجهة قرطاج بعد 12 ثانية. هذا تنبيه مستقل عن كود اللعبة. إذا ظهرت شاشة التشخيص التفصيلية بعدها، انسخ المعلومات وأرسلها.</p>
<p>لا تحذف اللعبة ولا تمسح بياناتها حتى نحافظ على تقدمك.</p>
</section>`;
if (!html.includes('</head>')) throw new Error('Missing closing head tag for watchdog fallback.');
html = html.replace('</head>', watchdogFallback + '</head>');
if (!html.includes('</body>')) throw new Error('Missing closing body tag for navigation controls.');
html = html.replace('</body>', watchdogMarkup + navigation + '</body>');

const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let executable = 0;
for (const [, attrs, body] of inlineScripts) {
  if (!body.trim() || /type\s*=\s*["']application\/(?:json|ld\+json)["']/i.test(attrs)) continue;
  new vm.Script(body, { filename: `carthage-inline-${executable}.js` });
  executable++;
}
for (const required of ['window.__carthageSaveNow', 'window.__carthageStartPart3', 'window.__carthageCanStartPart3', 'window.__carthageContinue', 'carthage-home-return', 'carthage-save-now', 'carthage-continue-last', 'plugins.Filesystem', 'plugins.Share']) {
  if (!html.includes(required)) throw new Error('Missing patched runtime feature: ' + required);
}
fs.writeFileSync(target, html);
console.log('Prepared Carthage APK: ' + executable + ' inline scripts parsed; autosave, one-tap continue, gated Part 3, and home/save controls verified.');
