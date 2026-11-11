(function(){
 if(window.__qartonHomeInspectorInstalled)return;
 window.__qartonHomeInspectorInstalled=true;
 var root=null,button=null,panel=null,observer=null,queued=false;
 function isHome(){
  root=document.getElementById("root");
  return !!(root&&!root.querySelector(".game-timer")&&(root.querySelector(".home-actions.grid")||Array.from(root.querySelectorAll("button")).some(function(b){return /ابدأ الجزء الأول/.test(b.textContent||"")})));
 }
 function rect(el){var r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}}
 function label(el){return String(el.innerText||el.getAttribute("aria-label")||el.title||"").replace(/\s+/g," ").trim().slice(0,100)}
 function report(){
  if(!isHome())return {error:"home-not-mounted"};
  var actions=root.querySelector(".home-actions.grid");
  var buttons=Array.from(root.querySelectorAll("button")).map(function(el,i){var s=getComputedStyle(el);return {index:i,id:el.id||"",text:label(el),disabled:!!el.disabled,rect:rect(el),display:s.display,position:s.position,fontSize:s.fontSize}});
  var audio=Array.from(root.querySelectorAll('[id*="audio"],[aria-label*="صوت"],[aria-label*="موسيقى"]')).map(function(el){return {tag:el.tagName,id:el.id||"",text:label(el),rect:rect(el),role:el.getAttribute("role")||"",type:el.getAttribute("type")||""}});
  var rootStyle=getComputedStyle(root),bodyStyle=getComputedStyle(document.body);
  return {app:"QARTON Carthage home layout probe",viewport:{width:innerWidth,height:innerHeight,devicePixelRatio:devicePixelRatio,screenWidth:screen.width,screenHeight:screen.height},document:{scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight},root:{rect:rect(root),className:String(root.className||""),background:rootStyle.backgroundColor,display:rootStyle.display,gridTemplateColumns:rootStyle.gridTemplateColumns},body:{background:bodyStyle.backgroundColor},menu:actions?{rect:rect(actions),className:String(actions.className||""),gridTemplateColumns:getComputedStyle(actions).gridTemplateColumns,gridTemplateRows:getComputedStyle(actions).gridTemplateRows}:null,buttons:buttons,audioControls:audio,storyTimerPresent:!!root.querySelector(".game-timer"),saveControls:["carthage-continue-last","carthage-export-backup","carthage-import-backup"].map(function(id){var el=document.getElementById(id);return {id:id,present:!!el,rect:el?rect(el):null}})};
 }
 function show(){
  var data=report(),json=JSON.stringify(data,null,2);
  if(!panel){
   panel=document.createElement("section");panel.id="qarton-home-measure-panel";panel.dir="rtl";
   panel.style.cssText="position:fixed;inset:7% 4%;z-index:2147483647;display:flex;flex-direction:column;gap:10px;padding:14px;background:#101522;color:#fff;border:2px solid #c5a15a;border-radius:16px;box-shadow:0 10px 40px #000c;font:14px system-ui";
   var heading=document.createElement("strong");heading.textContent="تقرير قياس واجهة QARTON";
   var note=document.createElement("p");note.textContent="انسخ النص التالي وأرسله في المحادثة. التقرير لا يحتوي على بيانات الحفظ.";
   var area=document.createElement("textarea");area.id="qarton-home-measure-output";area.readOnly=true;area.dir="ltr";area.style.cssText="flex:1;min-height:0;width:100%;box-sizing:border-box;background:#080c13;color:#e9d9b7;border:1px solid #675735;border-radius:10px;padding:10px;font:11px/1.45 monospace;white-space:pre;overflow:auto";
   var actions=document.createElement("div");actions.style.cssText="display:flex;gap:8px;flex-wrap:wrap";
   var copy=document.createElement("button");copy.textContent="نسخ التقرير";copy.style.cssText="flex:1;background:#c5a15a;color:#15110b;border:0;border-radius:10px;padding:12px;font-weight:800";
   copy.addEventListener("click",function(){area.focus();area.select();try{var ok=document.execCommand("copy");copy.textContent=ok?"تم النسخ":"حدّد النص وانسخه"}catch(e){copy.textContent="حدّد النص وانسخه"}});
   var close=document.createElement("button");close.textContent="إغلاق";close.style.cssText="background:#30394a;color:#fff;border:1px solid #657085;border-radius:10px;padding:12px 18px";
   close.addEventListener("click",function(){panel.remove();panel=null});
   actions.append(copy,close);panel.append(heading,note,area,actions);document.body.appendChild(panel);
  }
  panel.querySelector("textarea").value=json;panel.querySelector("textarea").focus();
 }
 function mount(){
  var home=isHome();
  if(!home&&root&&root.querySelector(".game-timer")&&observer){observer.disconnect();observer=null;}
  if(home&&!button){
   button=document.createElement("button");button.id="qarton-home-measure";button.type="button";button.textContent="قياس الواجهة";button.setAttribute("aria-label","قياس واجهة الشاشة الرئيسية");
   button.style.cssText="position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);transform:translateX(-50%);z-index:2147483001;border:1px solid #c5a15a;border-radius:999px;background:rgba(13,20,34,.94);color:#f5dfad;padding:8px 14px;font:700 12px system-ui;box-shadow:0 4px 16px #0008";
   button.addEventListener("click",show);document.body.appendChild(button);
  }else if(!home&&button){button.remove();button=null;if(panel){panel.remove();panel=null}}
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mount()})}
 function start(){root=document.getElementById("root");if(!root)return;observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","style"]});mount()}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
 window.__qartonMeasureHome=report;
})();