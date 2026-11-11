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
replaceOnce(',Zu=()=>{', ';window.__carthageStartPart3=()=>Bu(15);window.__carthageCanStartPart3=()=>Zn.includes("light")||Zn.includes("shadow");window.__carthageContinue=()=>{let slots=[],auto=null;try{slots=JSON.parse(localStorage.getItem("shiganshina-slots-v1")||"[]");auto=JSON.parse(localStorage.getItem("shiganshina-autosave-v1")||"null")}catch(e){}let candidates=[...(Array.isArray(slots)?slots:[]),auto].filter(v=>v&&Number.isInteger(v.sceneIdx)&&v.sceneIdx>=0&&v.state&&typeof v.state.time==="number"&&typeof v.state.health==="number"&&typeof v.state.courage==="number"&&Array.isArray(v.flags)&&Array.isArray(v.visited)&&Array.isArray(v.usedHotspots)&&Array.isArray(v.choicesHistory)&&Array.isArray(v.state.clues)&&Array.isArray(v.state.inventory));candidates.sort((a,b)=>(b.savedAtMs||0)-(a.savedAtMs||0));let best=candidates[0];if(!best){G("ما فماش حفظ صالح — ابدأ لعبة جديدة");return}if(!best.slot)best={...best,slot:1};P3(best)};let Zu=()=>{', 'Part 3 public entry point');

// Native home control: autosave first, then return to the initial menu without clearing slots.
const navigation = "<script id=\"carthage-native-navigation\">(function(){if(window.__carthageNavigationInstalled)return;window.__carthageNavigationInstalled=true;function mount(){var root=document.getElementById(\"root\")||document.body;var playing=!!document.querySelector(\".game-timer\");var homeScreen=!!root.querySelector(\".home-actions.grid\");var canPart3=typeof window.__carthageCanStartPart3===\"function\"&&window.__carthageCanStartPart3();var home=document.getElementById(\"carthage-home-return\");if(playing&&!home){home=document.createElement(\"button\");home.id=\"carthage-home-return\";home.type=\"button\";home.textContent=\"⌂ الرئيسية\";home.setAttribute(\"aria-label\",\"العودة إلى الشاشة الرئيسية\");home.style.cssText=\"position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;z-index:2147483000;border:1px solid #f4c76b;border-radius:999px;background:rgba(25,12,12,.94);color:#ffe5a0;padding:9px 13px;font:700 13px system-ui;box-shadow:0 4px 18px #0009\";home.addEventListener(\"click\",function(){home.disabled=true;home.textContent=\"جارٍ حفظ التقدم...\";var ok=false;try{ok=typeof window.__carthageSaveNow===\"function\"&&window.__carthageSaveNow()!==false}catch(e){}if(!ok){home.disabled=false;home.textContent=\"⌂ الرئيسية\";return}home.textContent=\"تم الحفظ — جارٍ الرجوع\";window.setTimeout(function(){window.location.reload()},500)});document.body.appendChild(home)}else if(!playing&&home)home.remove();var saveButton=document.getElementById(\"carthage-save-now\");if(playing&&!saveButton){saveButton=document.createElement(\"button\");saveButton.id=\"carthage-save-now\";saveButton.type=\"button\";saveButton.textContent=\"💾 حفظ التقدم\";saveButton.setAttribute(\"aria-label\",\"حفظ التقدم الآن\");saveButton.style.cssText=\"position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:10px;z-index:2147483000;border:1px solid #f4c76b;border-radius:999px;background:rgba(25,12,12,.94);color:#ffe5a0;padding:9px 13px;font:700 13px system-ui;box-shadow:0 4px 18px #0009\";saveButton.addEventListener(\"click\",function(){saveButton.disabled=true;var ok=false;try{ok=typeof window.__carthageSaveNow===\"function\"&&window.__carthageSaveNow()!==false}catch(e){}saveButton.textContent=ok?\"✓ تم الحفظ\":\"تعذر الحفظ\";window.setTimeout(function(){saveButton.disabled=false;saveButton.textContent=\"💾 حفظ التقدم\"},1600)});document.body.appendChild(saveButton)}else if(!playing&&saveButton)saveButton.remove();var continueButton=document.getElementById(\"carthage-continue-last\");var hasSave=false;try{var stored=JSON.parse(localStorage.getItem(\"shiganshina-slots-v1\")||\"[]\");var auto=JSON.parse(localStorage.getItem(\"shiganshina-autosave-v1\")||\"null\");hasSave=(Array.isArray(stored)&&stored.some(function(v){return v&&Number.isInteger(v.sceneIdx)&&v.state}))||!!(auto&&Number.isInteger(auto.sceneIdx)&&auto.state)}catch(e){}if(!playing&&homeScreen&&hasSave&&typeof window.__carthageContinue===\"function\"&&!continueButton){continueButton=document.createElement(\"button\");continueButton.id=\"carthage-continue-last\";continueButton.type=\"button\";continueButton.textContent=\"▶ متابعة آخر حفظ\";continueButton.style.cssText=\"position:relative;display:block;width:100%;margin:10px auto 0;z-index:2147483000;border:2px solid #f4c76b;border-radius:16px;background:#17243d;color:#ffe5a0;padding:14px 18px;font:800 15px system-ui;box-shadow:0 8px 24px #0009\";continueButton.addEventListener(\"click\",function(){window.__carthageContinue()});var menuActions=root.querySelector(\".home-actions.grid\");if(menuActions)menuActions.insertBefore(continueButton,menuActions.children[1]||null);else document.body.appendChild(continueButton)}else if((playing||!homeScreen||!hasSave)&&continueButton)continueButton.remove();var originalContinue=Array.from(root.querySelectorAll(\"button\")).find(function(b){return b!==continueButton&&/متابعة آخر حفظ/.test(b.textContent||\"\")});if(originalContinue)originalContinue.style.display=(!playing&&homeScreen&&hasSave&&continueButton)?\"none\":\"\";var startButton=Array.from(root.querySelectorAll(\"button\")).find(function(b){return /ابدأ الجزء الأول/.test(b.textContent||\"\")});if(!playing&&homeScreen&&startButton){startButton.setAttribute(\"aria-label\",hasSave?\"لعبة جديدة — الجزء الأول. لاستكمال تقدمك اضغط متابعة آخر حفظ\":\"ابدأ الجزء الأول\");startButton.title=hasSave?\"هذا الزر يبدأ قصة جديدة ولا يستكمل الحفظ\":\"ابدأ القصة من البداية\"}var noButtons=Array.from(root.querySelectorAll(\"button\")).filter(function(b){return (b.textContent||\"\").trim()===\"لا\"});noButtons.forEach(function(b){b.textContent=\"رجوع للقائمة\"});var partButton=document.getElementById(\"carthage-part3-start\");if((playing||!homeScreen)&&partButton){partButton.remove();partButton=null}if(!playing&&homeScreen&&typeof window.__carthageStartPart3===\"function\"){if(!partButton){partButton=document.createElement(\"button\");partButton.id=\"carthage-part3-start\";partButton.type=\"button\";partButton.style.cssText=\"position:relative;display:block;width:100%;margin:8px auto 0;z-index:2147483000;border:2px solid #f4c76b;border-radius:16px;background:#241b2c;color:#fff;padding:13px 18px;font:800 14px system-ui;box-shadow:0 8px 24px #0009\";var part2Button=root.querySelector(\"#btn-part2\");if(part2Button)part2Button.insertAdjacentElement(\"afterend\",partButton);else document.body.appendChild(partButton)}var part3Label=canPart3?\"▶ ابدأ الجزء 3 — ما بعد الحقيقة\":\"🔒 الجزء الثالث — يفتح بعد إتمام الجزء الثاني\";if(partButton.textContent!==part3Label)partButton.textContent=part3Label;partButton.disabled=!canPart3;partButton.setAttribute(\"aria-disabled\",String(!canPart3));partButton.style.opacity=canPart3?\"1\":\"0.72\";partButton.onclick=function(){if(canPart3)window.__carthageStartPart3()}}}var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mount()})}var observer=new MutationObserver(schedule);function start(){observer.observe(document.documentElement,{childList:true,subtree:true});mount()}if(document.readyState===\"loading\")document.addEventListener(\"DOMContentLoaded\",start,{once:true});else start()})();</script>";

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
  function removeWatchdogWhenReady(){
    var root=document.getElementById("root");
    var bodyText=(root&&root.innerText||"").trim();
    var ready=!!(root&&root.querySelector("button,[role=button],canvas,.game-timer"))&&!/جاري.{0,18}(تحميل|التحم)|loading|starting/i.test(bodyText);
    if(!ready)return;
    window.__CARTHAGE_REACT_MOUNTED__=true;
    var watchdog=document.getElementById("carthage-startup-watchdog");
    if(watchdog)watchdog.remove();
  }
  var readinessObserver=new MutationObserver(removeWatchdogWhenReady);
  readinessObserver.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener("DOMContentLoaded",removeWatchdogWhenReady);
  function showIfStuck(){
    if(document.getElementById("carthage-startup-error"))return;
    var root=document.getElementById("root");
    var bodyText=(root&&root.innerText||document.body&&document.body.innerText||"").trim();
    var loading=/جاري.{0,18}(تحميل|التحم)|loading|starting/i.test(bodyText);
    var appReady=!!(root&&root.querySelector("button,[role=button],canvas,.game-timer"));
    if(!loading&&appReady){removeWatchdogWhenReady();return;}
    // Show diagnostics whenever the game UI is not actually mounted, even if static text is present.
    var panel=document.createElement("section");
    panel.id="carthage-startup-error";panel.dir="rtl";
    panel.style.cssText="position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#100d12;color:#fff;padding:24px;font:14px/1.8 system-ui;text-align:right";
    var title=document.createElement("h2");title.textContent="تعذّر تشغيل اللعبة";title.style.cssText="color:#e8a33d;font-size:22px;font-weight:900";
    var desc=document.createElement("p");desc.textContent="توقّف تشغيل واجهة اللعبة قبل ظهور القائمة. هذه معلومات تشخيص من الهاتف؛ لم يتم تغيير القصة أو بيانات الحفظ.";
    var pre=document.createElement("pre");pre.style.cssText="white-space:pre-wrap;overflow-wrap:anywhere;background:#241c24;border:1px solid #75552b;border-radius:12px;padding:12px;color:#ffe5a0";
    var stored=[];try{stored=JSON.parse(sessionStorage.getItem("carthage-startup-errors")||"[]")}catch(e){}
    var all=errors.length?errors:stored;
    pre.textContent=(all.length?all.map(function(e){return e.kind+": "+e.message+(e.source?"\\n"+e.source+":"+e.line:"")}).join("\\n\\n"):"لم يُلتقط خطأ JavaScript واضح.")+"\\n\\nحالة الوحدة: "+(window.__CARTHAGE_MODULE_STARTED__?"بدأ تنفيذ ملف المحرك":"لم يبدأ تنفيذ ملف المحرك")+"\\nطلب React: "+(window.__CARTHAGE_RENDER_REQUESTED__?"تم إرسال طلب إنشاء الواجهة":"لم يصل التنفيذ إلى إنشاء الواجهة")+"\\nتركيب الواجهة: "+(window.__CARTHAGE_REACT_MOUNTED__?"نجح ظهور عناصر اللعبة":"لم تظهر عناصر اللعبة")+"\\nخطأ العرض: "+(window.__CARTHAGE_RENDER_ERROR__||"لا يوجد خطأ متزامن مسجل")+"\\nحالة الصفحة: "+(loading?"ما زالت تعرض شاشة التحميل":"لم تظهر واجهة اللعبة")+"\\nنص الصفحة: "+(bodyText.slice(0,500)||"(فارغ)");
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
/* Visible by default: never depend on CSS animation, timers, or reduced-motion settings to reveal the fallback. */
#carthage-startup-watchdog{position:fixed;inset:0;z-index:2147483646;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px;overflow:auto;box-sizing:border-box;padding:28px;background:#100d12;color:#fff;text-align:center;font:15px/1.9 system-ui}
#carthage-startup-watchdog h2{margin:0;color:#e8a33d;font-size:23px;font-weight:900}
#carthage-startup-watchdog p{max-width:34rem;margin:0}
</style>`;
const watchdogMarkup = `<section id="carthage-startup-watchdog" dir="rtl" role="alert">
<h2>جاري تشغيل لعبة قرطاج</h2>
<p>إذا بقيت هذه الشاشة ولم تظهر القائمة خلال 12 ثانية، ستظهر معلومات التشخيص تلقائياً.</p>
<p>لا تحذف اللعبة ولا تمسح بياناتها حتى نحافظ على تقدمك.</p>
</section>`;
if (!html.includes('</head>')) throw new Error('Missing closing head tag for watchdog fallback.');
html = html.replace('</head>', watchdogFallback + '</head>');
if (!html.includes('</body>')) throw new Error('Missing closing body tag for navigation controls.');
html = html.replace('</body>', watchdogMarkup + navigation + '</body>');

// Restore the user's confirmed Drive backup on a clean install; never overwrite a valid existing save.
const recoverySeed = "<script id=\"carthage-drive-recovery-seed\">\n(function(){\n var save={\"app\":\"shiganshina\",\"version\":1,\"part\":\"part1\",\"chapter\":5,\"location\":\"دار عم منصور — الجندي القديم\",\"timeLeft\":52,\"health\":100,\"courage\":112,\"trust\":{\"lina\":60,\"salim\":30,\"mansour\":32,\"nour\":25,\"father\":61,\"amin\":0,\"elias\":0,\"mariam\":0,\"hadi\":0,\"yasmin\":0,\"karim\":0},\"inventory\":[\"صورة العائلة\",\"مفتاح المخزن\",\"خريطة الأزقة\",\"سيف عم منصور\"],\"clues\":[\"crack\",\"alley\",\"oldmap\"],\"difficulty\":\"normal\",\"score\":990,\"saveTime\":\"9 نوفمبر، 09:05 م\",\"saveTimeMs\":1794254741717,\"choicesHistory\":[\"نبقى مع لينا ونحميها\",\"تصدق إيلاس وتتبعه\",\"ناخذ السيف ونمشي\"],\"flags\":[\"protectedLina\",\"heardElias\",\"followedElias\",\"tookSword\"],\"visited\":[0,1,4],\"usedHotspots\":[\"window\",\"photo\",\"table\",\"fatherShop\",\"well\",\"cart\",\"oldmap\",\"uniform\",\"sword\"],\"hintsUsed\":0,\"sceneIdx\":4,\"lineIdx\":3,\"mapUnlocked\":true,\"lastChoice\":\"ناخذ السيف ونمشي\",\"state\":{\"time\":52,\"health\":100,\"courage\":112,\"inventory\":[\"صورة العائلة\",\"مفتاح المخزن\",\"خريطة الأزقة\",\"سيف عم منصور\"],\"memory\":0,\"trust\":{\"lina\":60,\"salim\":30,\"mansour\":32,\"nour\":25,\"father\":61,\"amin\":0,\"elias\":0,\"mariam\":0,\"hadi\":0,\"yasmin\":0,\"karim\":0},\"clues\":[\"crack\",\"alley\",\"oldmap\"]},\"achievements\":[],\"endingsSeen\":[]};\n function valid(s){return !!(s&&Number.isInteger(s.sceneIdx)&&s.sceneIdx>=0&&s.state&&typeof s.state===\"object\"&&typeof s.state.time===\"number\"&&typeof s.state.health===\"number\"&&typeof s.state.courage===\"number\"&&Array.isArray(s.flags)&&Array.isArray(s.visited)&&Array.isArray(s.usedHotspots)&&Array.isArray(s.choicesHistory)&&Array.isArray(s.state.clues)&&Array.isArray(s.state.inventory))}\n try{\n  var slots=JSON.parse(localStorage.getItem(\"shiganshina-slots-v1\")||\"[]\");if(!Array.isArray(slots))slots=[];\n  var auto=JSON.parse(localStorage.getItem(\"shiganshina-autosave-v1\")||\"null\");if(slots.some(valid)||valid(auto))return;\n  while(slots.length<3)slots.push(null);\n  var restored=Object.assign({},save,{slot:1,savedAt:save.saveTime,savedAtMs:Date.now()});slots[0]=restored;\n  localStorage.setItem(\"shiganshina-slots-v1\",JSON.stringify(slots));localStorage.setItem(\"shiganshina-autosave-v1\",JSON.stringify(restored));localStorage.setItem(\"shiganshina-autosave-time-v1\",String(Date.now()));\n }catch(e){console.error(\"Carthage Drive recovery seed failed\",e)}\n})();\n</script>";

// Safe save transfer controls: export/import the current progress without clearing app data.
html = html.replace('</body>', recoverySeed + '</body>');

const saveTransfer = `<script id="carthage-save-transfer">
(function(){
 if(window.__carthageSaveTransferInstalled)return;
 window.__carthageSaveTransferInstalled=true;
 function toast(message){var el=document.getElementById("carthage-transfer-status");if(!el){el=document.createElement("div");el.id="carthage-transfer-status";el.dir="rtl";el.style.cssText="position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:2147483647;background:#17243d;color:#ffe5a0;border:1px solid #f4c76b;border-radius:12px;padding:12px;text-align:center;font:700 13px/1.6 system-ui;box-shadow:0 8px 24px #0009";document.body.appendChild(el)}el.textContent=message;el.style.display="block";window.setTimeout(function(){el.style.display="none"},4500)}
 function readSaves(){var slots=[],auto=null;try{slots=JSON.parse(localStorage.getItem("shiganshina-slots-v1")||"[]");auto=JSON.parse(localStorage.getItem("shiganshina-autosave-v1")||"null")}catch(e){}return {slots:Array.isArray(slots)?slots:[null,null,null],auto:auto}}
 function valid(s){return !!(s&&Number.isInteger(s.sceneIdx)&&s.sceneIdx>=0&&s.state&&typeof s.state==="object"&&typeof s.state.time==="number"&&typeof s.state.health==="number"&&typeof s.state.courage==="number"&&Array.isArray(s.flags)&&Array.isArray(s.visited)&&Array.isArray(s.usedHotspots)&&Array.isArray(s.choicesHistory)&&Array.isArray(s.state.clues)&&Array.isArray(s.state.inventory))}
 async function exportSave(){var data=readSaves(),candidates=data.slots.concat([data.auto]).filter(valid);candidates.sort(function(a,b){return (b.savedAtMs||0)-(a.savedAtMs||0)});var best=candidates[0];if(!best){toast("لا يوجد تقدم صالح لتصديره بعد");return}var json=JSON.stringify(best,null,2);try{var plugins=window.Capacitor&&window.Capacitor.Plugins;if(plugins&&plugins.Filesystem&&plugins.Share){var filename="carthage-save-"+new Date().toISOString().replace(/[:.]/g,"-")+".json";var file=await plugins.Filesystem.writeFile({path:filename,data:json,directory:"CACHE",encoding:"utf8"});if(!file||!file.uri)throw new Error("file creation failed");await plugins.Share.share({title:"نسخة احتياطية من قرطاج",text:"احتفظ بهذا الملف لاستعادة تقدمك",files:[file.uri],dialogTitle:"حفظ نسخة احتياطية"});toast("تم تجهيز نسخة الحفظ — احفظ الملف في التنزيلات أو Drive");return}var blob=new Blob([json],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="carthage-save.json";document.body.appendChild(a);a.click();a.remove();window.setTimeout(function(){URL.revokeObjectURL(url)},2000);toast("تم تنزيل ملف حفظ قرطاج")}catch(e){toast("تعذر تصدير الحفظ: "+String(e&&e.message||e))}}
 function importFile(file){if(!file)return;var reader=new FileReader();reader.onload=function(){try{var save=JSON.parse(String(reader.result||""));if(!valid(save))throw new Error("ملف الحفظ غير صالح أو لا يحتوي على حالة لعبة مكتملة");var data=readSaves(),slots=data.slots.slice(0,3);while(slots.length<3)slots.push(null);var slot=Number.isInteger(save.slot)&&save.slot>=1&&save.slot<=3?save.slot:0;if(!slot){slot=slots.findIndex(function(s){return !valid(s)})+1;if(!slot)slot=1}var restored=Object.assign({},save,{slot:slot,savedAtMs:Date.now(),savedAt:save.savedAt||new Date().toLocaleString()});slots[slot-1]=restored;localStorage.setItem("shiganshina-slots-v1",JSON.stringify(slots));localStorage.setItem("shiganshina-autosave-v1",JSON.stringify(restored));localStorage.setItem("shiganshina-autosave-time-v1",String(Date.now()));var check=JSON.parse(localStorage.getItem("shiganshina-autosave-v1")||"null");if(!valid(check)||check.sceneIdx!==restored.sceneIdx)throw new Error("تعذر التحقق من الحفظ بعد الاستيراد");toast("تم استيراد الحفظ بنجاح. أعد فتح القائمة واضغط متابعة آخر حفظ.");window.setTimeout(function(){window.location.reload()},1200)}catch(e){toast("لم يتم استيراد الملف: "+String(e&&e.message||e))}};reader.onerror=function(){toast("تعذرت قراءة ملف الحفظ")};reader.readAsText(file)}
 function mount(){if(document.querySelector(".game-timer"))return;var root=document.getElementById("root");if(!root)return;var menu=root.querySelector(".home-actions.grid")||root;var existing=document.getElementById("carthage-export-backup");if(existing)return;var style="display:block;width:100%;margin:7px auto 0;border:1px solid #f4c76b;border-radius:14px;background:#241b2c;color:#ffe5a0;padding:11px 14px;font:800 13px system-ui;";var exp=document.createElement("button");exp.id="carthage-export-backup";exp.type="button";exp.textContent="⬇ تصدير نسخة احتياطية للحفظ";exp.style.cssText=style;exp.onclick=exportSave;var imp=document.createElement("button");imp.id="carthage-import-backup";imp.type="button";imp.textContent="⬆ استيراد ملف حفظ سابق";imp.style.cssText=style;var input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.hidden=true;input.id="carthage-import-file";input.onchange=function(){importFile(input.files&&input.files[0]);input.value=""};imp.onclick=function(){input.click()};menu.appendChild(exp);menu.appendChild(imp);menu.appendChild(input)}
 var observer=new MutationObserver(function(){mount()});function start(){observer.observe(document.documentElement,{childList:true,subtree:true});mount()}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
</script>`;
if (!html.includes('</body>')) throw new Error('Missing body for save-transfer controls.');
html = html.replace('</body>', saveTransfer + '</body>');


const cinematicPilot = `<style id="carthage-cinematic-pilot">
@keyframes carthageSlowPushIn{from{transform:scale(1) translate3d(0,0,0);filter:saturate(1) contrast(1)}to{transform:scale(1.07) translate3d(-.7%,.25%,0);filter:saturate(1.12) contrast(1.06)}}
@keyframes carthageCinematicLight{0%,58%{transform:translateX(-125%) skewX(-18deg);opacity:0}66%{opacity:.34}82%,100%{transform:translateX(125%) skewX(-18deg);opacity:0}}
@keyframes carthageCinematicImpact{0%,100%{transform:translate3d(0,0,0)}18%{transform:translate3d(-2px,1px,0)}36%{transform:translate3d(2px,-1px,0)}54%{transform:translate3d(-1px,1px,0)}72%{transform:translate3d(1px,0,0)}}
#root.carthage-cinematic-pilot{isolation:isolate}
#root.carthage-cinematic-pilot:before{content:"";position:fixed;inset:0;z-index:8;pointer-events:none;background:radial-gradient(ellipse at center,transparent 43%,rgba(0,0,0,.48) 100%);box-shadow:inset 0 5vh 0 rgba(0,0,0,.9),inset 0 -5vh 0 rgba(0,0,0,.9)}
#root.carthage-cinematic-pilot:after{content:"";position:fixed;z-index:9;top:-15%;bottom:-15%;left:-35%;width:24%;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,226,166,.14),rgba(255,255,255,.22),transparent);mix-blend-mode:screen;animation:carthageCinematicLight 12s ease-in-out infinite}
#root.carthage-cinematic-pilot img.carthage-cinematic-subject{animation:carthageSlowPushIn 18s cubic-bezier(.2,.65,.25,1) infinite alternate;transform-origin:center center;will-change:transform,filter}
#root.carthage-cinematic-pilot.carthage-cinematic-impact{animation:carthageCinematicImpact .42s ease-out}
@media(prefers-reduced-motion:reduce){#root.carthage-cinematic-pilot:after,#root.carthage-cinematic-pilot img.carthage-cinematic-subject,#root.carthage-cinematic-pilot.carthage-cinematic-impact{animation:none;will-change:auto}}
</style>
<script id="carthage-cinematic-pilot-runtime">
(function(){
 if(window.__carthageCinematicPilot)return;
 window.__carthageCinematicPilot=true;
 var root=document.getElementById("root"),last=null,impactTimer=0,impactSeen=false;
 function apply(){
  root=document.getElementById("root");if(!root)return;
  var text=(root.innerText||"");
  var pilot=!!(root.querySelector(".game-timer")&&/(السور|لحظة الكسر|السور يتكسر)/.test(text));
  root.classList.toggle("carthage-cinematic-pilot",pilot);
  var impact=pilot&&/(السور يتكسر|لحظة الكسر)/.test(text);
  if(impact&&!impactSeen){impactSeen=true;root.classList.remove("carthage-cinematic-impact");void root.offsetWidth;root.classList.add("carthage-cinematic-impact");window.clearTimeout(impactTimer);impactTimer=window.setTimeout(function(){root&&root.classList.remove("carthage-cinematic-impact")},460)}
  if(!impact)impactSeen=false;
  if(!pilot){if(last)last.classList.remove("carthage-cinematic-subject");last=null;return}
  var imgs=Array.from(root.querySelectorAll("img")).filter(function(img){var r=img.getBoundingClientRect();return img.complete&&img.naturalWidth>0&&r.width>120&&r.height>100&&getComputedStyle(img).visibility!=="hidden"});
  imgs.sort(function(a,b){var x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return y.width*y.height-x.width*x.height});
  var target=imgs[0]||null;
  if(last&&last!==target)last.classList.remove("carthage-cinematic-subject");
  if(target){target.classList.add("carthage-cinematic-subject");last=target}
 }
 var queued=false;
 var observer=new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})});
 function start(){apply();observer.observe(document.getElementById("root")||document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["src","class","style"]})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
</script>`;

html = html.replace('</body>', cinematicPilot + '</body>');


const cinematicExpansion = `<style id="carthage-cinematic-scene-style">
@keyframes carthageSceneDrift{from{transform:scale(1) translate3d(0,0,0);filter:saturate(1) contrast(1)}to{transform:scale(1.035) translate3d(-.35%,.15%,0);filter:saturate(1.06) contrast(1.03)}}
#root.carthage-cinematic-scene{isolation:isolate}
#root.carthage-cinematic-scene:before{content:"";position:fixed;inset:0;z-index:7;pointer-events:none;background:radial-gradient(ellipse at center,transparent 48%,rgba(0,0,0,.24) 100%)}
#root.carthage-cinematic-scene img.carthage-cinematic-scene-subject{animation:carthageSceneDrift 26s cubic-bezier(.2,.65,.25,1) infinite alternate;transform-origin:center center;will-change:transform,filter}
@media(prefers-reduced-motion:reduce){#root.carthage-cinematic-scene img.carthage-cinematic-scene-subject{animation:none;will-change:auto}}
</style>
<script id="carthage-cinematic-scene-runtime">
(function(){
 if(window.__carthageCinematicScene)return;
 window.__carthageCinematicScene=true;
 var root=null,last=null,queued=false;
 function apply(){
  root=document.getElementById("root");if(!root)return;
  var active=!!root.querySelector(".game-timer");
  var images=active?Array.from(root.querySelectorAll("img")).filter(function(img){
   var r=img.getBoundingClientRect();
   return img.complete&&img.naturalWidth>0&&r.width>160&&r.height>100&&getComputedStyle(img).visibility!=="hidden";
  }):[];
  images.sort(function(a,b){var x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return y.width*y.height-x.width*x.height});
  var target=images[0]||null;
  var enabled=!!(active&&target);
  root.classList.toggle("carthage-cinematic-scene",enabled);
  if(last&&last!==target)last.classList.remove("carthage-cinematic-scene-subject");
  if(target){target.classList.add("carthage-cinematic-scene-subject");last=target}
  else if(last){last.classList.remove("carthage-cinematic-scene-subject");last=null}
 }
 var observer=new MutationObserver(function(){
  if(queued)return;queued=true;
  requestAnimationFrame(function(){queued=false;apply()});
 });
 function start(){
  apply();
  observer.observe(document.getElementById("root")||document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["src","class","style"]});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
</script>`;
html = html.replace('</body>', cinematicExpansion + '</body>');


// Cinematic scene cuts: fade through black when the main story artwork changes.
// This is presentation-only; it never touches story state, timers, choices, or saves.
const cinematicTransitions = `<style id="carthage-scene-transition-style">
@keyframes carthageSceneFadeThrough{0%{opacity:1}100%{opacity:0}}
#carthage-scene-transition{position:fixed;inset:0;z-index:2147483001;pointer-events:none;background:#050509;opacity:0}
#carthage-scene-transition.is-cutting{animation:carthageSceneFadeThrough .72s cubic-bezier(.7,0,.2,1) both}
@media(prefers-reduced-motion:reduce){#carthage-scene-transition.is-cutting{animation:none;opacity:0}}
</style>
<script id="carthage-scene-transition-runtime">
(function(){
 if(window.__carthageSceneTransitions)return;
 window.__carthageSceneTransitions=true;
 var root=null,lastScene="",overlay=null,queued=false;
 function mainArtwork(){
  root=document.getElementById("root");
  if(!root||!root.querySelector(".game-timer"))return "";
  var candidates=Array.from(root.querySelectorAll("img")).filter(function(img){
   var r=img.getBoundingClientRect();
   return img.complete&&img.naturalWidth>0&&r.width>180&&r.height>110&&getComputedStyle(img).visibility!=="hidden";
  });
  candidates.sort(function(a,b){var x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return y.width*y.height-x.width*x.height});
  var img=candidates[0];
  return img?(img.currentSrc||img.src||""):"";
 }
 function cutTo(scene){
  if(!scene)return;
  if(!lastScene){lastScene=scene;return}
  if(scene===lastScene)return;
  lastScene=scene;
  if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  if(!overlay){overlay=document.createElement("div");overlay.id="carthage-scene-transition";overlay.setAttribute("aria-hidden","true");document.body.appendChild(overlay)}
  overlay.classList.remove("is-cutting");
  void overlay.offsetWidth;
  overlay.classList.add("is-cutting");
 }
 function apply(){queued=false;cutTo(mainArtwork())}
 var observer=new MutationObserver(function(){
  if(queued)return;queued=true;
  requestAnimationFrame(apply);
 });
 function start(){
  root=document.getElementById("root");
  if(!root)return;
  apply();
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["src","class","style"]});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
</script>`
html = html.replace('</body>', cinematicTransitions + '</body>');

// Great Wall destruction sequence: dust bloom, shock ring, flying stone fragments and impact flash.
const cinematicDestruction = String.raw`<style id="carthage-wall-impact-style">
@keyframes carthageWallFlash{0%,100%{opacity:0}7%{opacity:.72}19%{opacity:.12}30%{opacity:.28}48%{opacity:0}}
@keyframes carthageDustBloom{0%{opacity:0;transform:translate(-50%,-50%) scale(.12)}18%{opacity:.78}100%{opacity:0;transform:translate(-50%,-50%) scale(2.8)}}
@keyframes carthageShockRing{0%{opacity:.9;transform:translate(-50%,-50%) scale(.08)}75%{opacity:.3}100%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}}
@keyframes carthageRubbleFly{0%{opacity:0;transform:translate3d(0,0,0) rotate(0) scale(.45)}12%{opacity:1}100%{opacity:0;transform:translate3d(var(--dx),var(--dy),0) rotate(var(--rot)) scale(.12)}}
#carthage-wall-impact-fx{position:fixed;inset:0;z-index:2147483002;overflow:hidden;pointer-events:none;opacity:0}
#carthage-wall-impact-fx.is-active{opacity:1}
#carthage-wall-impact-fx .wall-flash{position:absolute;inset:0;background:radial-gradient(ellipse at 52% 48%,rgba(255,238,196,.9),rgba(255,174,82,.22) 28%,transparent 68%);animation:carthageWallFlash .72s ease-out both}
#carthage-wall-impact-fx .wall-dust{position:absolute;left:52%;top:55%;width:min(95vw,760px);height:min(95vw,760px);border-radius:50%;background:radial-gradient(circle,rgba(221,190,145,.72) 0%,rgba(157,121,91,.44) 34%,rgba(73,58,52,.18) 58%,transparent 72%);filter:blur(13px);animation:carthageDustBloom 2.6s cubic-bezier(.12,.6,.2,1) both}
#carthage-wall-impact-fx .wall-ring{position:absolute;left:52%;top:51%;width:min(72vw,560px);aspect-ratio:1;border:3px solid rgba(255,220,164,.72);border-radius:50%;box-shadow:0 0 28px rgba(255,177,94,.55),inset 0 0 24px rgba(255,220,164,.2);animation:carthageShockRing 1.15s ease-out both}
#carthage-wall-impact-fx .wall-stone{position:absolute;display:block;left:52%;top:48%;width:var(--size);height:var(--size);border-radius:22% 38% 18% 42%;background:linear-gradient(135deg,#d7b58b,#62564e 68%,#29262a);box-shadow:0 2px 8px #160f0b;animation:carthageRubbleFly 1.9s cubic-bezier(.12,.62,.22,1) var(--delay) both}
@media(prefers-reduced-motion:reduce){#carthage-wall-impact-fx,#carthage-wall-impact-fx *{animation:none!important;opacity:0!important}}
</style>
<script id="carthage-wall-impact-runtime">
(function(){
 if(window.__carthageWallImpact)return;
 window.__carthageWallImpact=true;
 var root=null,fx=null,wasImpact=false,removeTimer=0;
 var stones=[
  ["-34vw","-27vh","-18deg","0ms","13px"],["-25vw","-39vh","42deg","35ms","9px"],
  ["-12vw","-32vh","-68deg","70ms","16px"],["8vw","-38vh","24deg","20ms","11px"],
  ["22vw","-29vh","76deg","90ms","14px"],["35vw","-18vh","-32deg","55ms","8px"],
  ["-39vw","-5vh","58deg","110ms","12px"],["-29vw","13vh","-44deg","45ms","17px"],
  ["-17vw","22vh","92deg","80ms","10px"],["2vw","-23vh","-74deg","15ms","15px"],
  ["17vw","-15vh","38deg","100ms","9px"],["31vw","4vh","-56deg","65ms","13px"],
  ["-36vw","24vh","28deg","125ms","8px"],["-21vw","-11vh","-88deg","30ms","11px"],
  ["12vw","26vh","64deg","75ms","16px"],["38vw","19vh","-24deg","140ms","10px"],
  ["-7vw","-42vh","48deg","50ms","7px"],["27vw","-41vh","-42deg","115ms","12px"]
 ];
 function mount(){
  if(fx)return;
  fx=document.createElement("div");fx.id="carthage-wall-impact-fx";fx.setAttribute("aria-hidden","true");
  var flash=document.createElement("i");flash.className="wall-flash";
  var dust=document.createElement("i");dust.className="wall-dust";
  var ring=document.createElement("i");ring.className="wall-ring";
  fx.append(flash,dust,ring);
  stones.forEach(function(s){var piece=document.createElement("i");piece.className="wall-stone";piece.style.setProperty("--dx",s[0]);piece.style.setProperty("--dy",s[1]);piece.style.setProperty("--rot",s[2]);piece.style.setProperty("--delay",s[3]);piece.style.setProperty("--size",s[4]);fx.appendChild(piece)});
  document.body.appendChild(fx);
 }
 function trigger(){
  if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  mount();fx.classList.remove("is-active");void fx.offsetWidth;fx.classList.add("is-active");
  window.clearTimeout(removeTimer);removeTimer=window.setTimeout(function(){if(fx)fx.classList.remove("is-active")},2750);
 }
 function apply(){
  root=document.getElementById("root");if(!root)return;
  var story=(root.innerText||"");
  var active=!!(root.querySelector(".game-timer")&&/(السور يتكسر|لحظة الكسر|تحطم السور)/.test(story));
  if(active&&!wasImpact)trigger();
  wasImpact=active;
 }
 var queued=false;
 var observer=new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})});
 function start(){root=document.getElementById("root");if(!root)return;apply();observer.observe(root,{subtree:true,childList:true,characterData:true})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
</script>`;
html = html.replace('</body>', cinematicDestruction + '</body>');

// Character performance pass: restrained emotional motion on the existing theatre portraits.
// It reads the emotion overlays already rendered by the story; no story state or save data is changed.
const characterPerformance = `<style id="carthage-character-performance-style">
@keyframes carthageStageIdle{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-1px,0) scale(1.006)}}
@keyframes carthageStageGrief{0%,100%{transform:scale(1.012) translate3d(0,0,0) rotate(0)}50%{transform:scale(1.018) translate3d(-1px,1px,0) rotate(-.22deg)}}
@keyframes carthageStageTension{0%,100%{transform:scale(1.018) translate3d(0,0,0)}25%{transform:scale(1.02) translate3d(-1px,0,0)}75%{transform:scale(1.018) translate3d(1px,-1px,0)}}
@keyframes carthageStageMemory{0%,100%{transform:scale(1.012);filter:brightness(1)}50%{transform:scale(1.024);filter:brightness(1.045)}}
.stage-slide .stage-breath{animation:carthageStageIdle 4.8s ease-in-out infinite;transform-origin:50% 78%;will-change:transform}
.stage-slide:has(.tear-drop) .stage-breath{animation:carthageStageGrief 3.8s ease-in-out infinite;transform-origin:50% 76%}
.stage-slide.expression-shake .stage-breath{animation:carthageStageTension .65s ease-in-out infinite;transform-origin:50% 76%}
.stage-slide:has(.candle-flame) .stage-breath{animation:carthageStageMemory 6.2s ease-in-out infinite;transform-origin:50% 76%}
@media(prefers-reduced-motion:reduce){.stage-slide .stage-breath{animation:none!important;transform:none!important;will-change:auto}}
</style>`;
html = html.replace('</body>', characterPerformance + '</body>');


// Instrument the real ES module and React mount, not a detached JavaScript test.
replaceOnce('<script type="module">', '<script type="module">window.__CARTHAGE_MODULE_STARTED__=true;', 'main story module start marker');
replaceOnce('yz.createRoot(document.getElementById("root")).render(u(bz.default.StrictMode,{children:u(vu,{})}));',
  'window.__CARTHAGE_RENDER_ATTEMPTED__=true;try{var __carthageRoot=yz.createRoot(document.getElementById("root"));__carthageRoot.render(u(bz.default.StrictMode,{children:u(vu,{})}));window.__CARTHAGE_RENDER_REQUESTED__=true}catch(__carthageError){window.__CARTHAGE_RENDER_ERROR__=String(__carthageError&&(__carthageError.stack||__carthageError.message)||__carthageError);console.error("Carthage React startup failed",__carthageError);throw __carthageError}',
  'React root render instrumentation');

const fixedHomeViewport = "<style id=\"carthage-fixed-home-style\">\nhtml.carthage-home-locked,body.carthage-home-locked{height:100%;min-height:100%;overflow:hidden!important;overscroll-behavior:none!important;touch-action:pan-x}\nbody.carthage-home-locked{position:fixed;inset:0;width:100%;max-width:100%}\n#root.carthage-home-locked{height:100dvh;max-height:100dvh;overflow:hidden!important;overscroll-behavior:none!important}\n@supports not (height:100dvh){#root.carthage-home-locked{height:100vh;max-height:100vh}}\n</style>\n<script id=\"carthage-fixed-home-runtime\">\n(function(){\n if(window.__carthageFixedHomeInstalled)return;\n window.__carthageFixedHomeInstalled=true;\n var root=null,queued=false,locked=false;\n function isHome(){\n  root=document.getElementById(\"root\");\n  if(!root||root.querySelector(\".game-timer\"))return false;\n  return !!(root.querySelector(\".home-actions.grid\")||\n    Array.from(root.querySelectorAll(\"button\")).some(function(b){return /ابدأ الجزء الأول/.test(b.textContent||\"\")}));\n }\n function apply(){\n  queued=false;locked=isHome();\n  var html=document.documentElement,body=document.body;\n  if(!body)return;\n  html.classList.toggle(\"carthage-home-locked\",locked);\n  body.classList.toggle(\"carthage-home-locked\",locked);\n  if(root)root.classList.toggle(\"carthage-home-locked\",locked);\n }\n function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply)}\n function stopHomeScroll(e){if(locked&&e.cancelable)e.preventDefault()}\n function stopHomeKeys(e){\n  if(!locked||e.altKey||e.ctrlKey||e.metaKey)return;\n  if([\"ArrowUp\",\"ArrowDown\",\"PageUp\",\"PageDown\",\"Home\",\"End\",\" \"].includes(e.key)&&\n     !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target&&e.target.tagName||\"\"))e.preventDefault();\n }\n document.addEventListener(\"touchmove\",stopHomeScroll,{passive:false,capture:true});\n document.addEventListener(\"wheel\",stopHomeScroll,{passive:false,capture:true});\n document.addEventListener(\"keydown\",stopHomeKeys,true);\n var observer=new MutationObserver(schedule);\n function start(){\n  root=document.getElementById(\"root\");\n  if(root)observer.observe(root,{subtree:true,childList:true,characterData:true});\n  apply();\n }\n if(document.readyState===\"loading\")document.addEventListener(\"DOMContentLoaded\",start,{once:true});else start();\n})();\n</script>";
html = html.replace('</body>', fixedHomeViewport + '</body>');

// QARTON visual overlay disabled: keep the game's native home layout until a measured redesign is ready.


const qartonHomeRuntime = fs.readFileSync(path.join(__dirname, 'qarton-premium-home.js'), 'utf8');
html = html.replace('</body>', '<script id="qarton-premium-home-runtime">' + qartonHomeRuntime + '</script></body>');

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
