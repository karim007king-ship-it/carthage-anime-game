(function(){
"use strict";
if(window.__qartonHomeIsolationInstalled)return;
window.__qartonHomeIsolationInstalled=true;
var root=null,overlay=null,observer=null,queued=false;
var css=[
"#qarton-home-screen{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;box-sizing:border-box;overflow:hidden;padding:calc(env(safe-area-inset-top,0px) + 12px) 16px calc(env(safe-area-inset-bottom,0px) + 12px);color:#f7ecd7;background:radial-gradient(ellipse at 50% 0%,#8b30394d,transparent 48%),radial-gradient(ellipse at 12% 85%,#e8c47722,transparent 40%),linear-gradient(155deg,#07090f,#101827 58%,#080a11);font-family:system-ui,sans-serif;direction:rtl}",
"#qarton-home-screen *{box-sizing:border-box}#qarton-home-screen .qh-scroll{width:100%;max-width:560px;min-height:0;display:flex;flex:1;flex-direction:column;overflow:hidden;overscroll-behavior:none;scrollbar-width:none}#qarton-home-screen .qh-scroll::-webkit-scrollbar{display:none}",
"#qarton-home-screen .qh-brand{display:flex;align-items:center;justify-content:center;gap:9px;direction:ltr;margin:2px auto 10px}#qarton-home-screen .qh-mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid #e8c477;border-radius:10px 3px;color:#fff0d2;background:linear-gradient(145deg,#8b3039,#111827);font:900 20px Georgia}#qarton-home-screen .qh-brand strong{display:block;color:#e8c477;font-size:18px;letter-spacing:3px}#qarton-home-screen .qh-brand small{display:block;color:#c9bda8;font-size:7px;letter-spacing:1.1px}",
"#qarton-home-screen .qh-title{margin:2px 0 0;text-align:center;font-size:clamp(25px,7vw,38px);font-weight:950;line-height:1.15;color:#fff0d2;text-shadow:0 3px 18px #b13d3d66}#qarton-home-screen .qh-kicker{margin:6px 0 0;text-align:center;color:#d9c9ac;font-size:12px;line-height:1.5}#qarton-home-screen .qh-badge{align-self:center;margin:9px 0 0;padding:4px 12px;border:1px solid #e8c47766;border-radius:30px;color:#e8c477;background:#171b25;font-size:10px;font-weight:800}",
"#qarton-home-screen .qh-section{margin:14px 0 6px;color:#e8c477;font-size:11px;font-weight:900}#qarton-home-screen .qh-difficulties{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}#qarton-home-screen .qh-difficulty{min-height:47px;padding:8px 5px;border:1px solid #8b795c88;border-radius:12px;background:linear-gradient(145deg,#20293a,#0d121d);color:#e8dcc6;font-size:11px;font-weight:800}#qarton-home-screen .qh-difficulty[aria-pressed=true]{border-color:#e8c477;background:linear-gradient(145deg,#6b3038,#1b202d);color:#fff0d2}",
"#qarton-home-screen .qh-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#qarton-home-screen .qh-action{min-height:48px;padding:9px 8px;border:1px solid #e8c47766;border-radius:13px;background:linear-gradient(145deg,#222c3e,#0c111b);color:#fff0d2;font-size:12px;font-weight:850;line-height:1.35;box-shadow:0 6px 16px #0005}#qarton-home-screen .qh-action:active,#qarton-home-screen .qh-difficulty:active{transform:scale(.98)}#qarton-home-screen .qh-action[data-kind=primary],#qarton-home-screen .qh-action[data-kind=continue]{grid-column:1/-1;min-height:52px;border-color:#f0d18a;background:linear-gradient(105deg,#8b3039,#57232e 55%,#18263a);font-size:14px}#qarton-home-screen .qh-action[data-kind=locked]{opacity:.65;border-style:dashed}",
"#qarton-home-screen .qh-footer{flex:0 0 auto;margin-top:8px;color:#bca77f;text-align:center;font-size:9px;letter-spacing:1px}#qarton-home-screen button{font-family:inherit;cursor:pointer}@media(max-height:680px){#qarton-home-screen{padding-top:7px;padding-bottom:7px}#qarton-home-screen .qh-brand{margin-bottom:5px}#qarton-home-screen .qh-mark{width:27px;height:27px;font-size:16px}#qarton-home-screen .qh-brand strong{font-size:15px}#qarton-home-screen .qh-title{font-size:25px}#qarton-home-screen .qh-kicker{font-size:10px;margin-top:3px}#qarton-home-screen .qh-section{margin-top:8px}#qarton-home-screen .qh-action{min-height:40px;padding:6px}}@media(prefers-reduced-motion:reduce){#qarton-home-screen *{transition:none!important;animation:none!important}}"
].join("");
function addStyle(){if(document.getElementById("qarton-isolated-home-style"))return;var s=document.createElement("style");s.id="qarton-isolated-home-style";s.textContent=css;document.head.appendChild(s)}
function isPlaying(){return !!(root&&root.querySelector(".game-timer"))}
function findNativeMenu(){
 if(!root)return null;
 var menu=root.querySelector(".home-actions");
 if(menu&&menu.querySelectorAll("button").length>=2)return menu;
 var buttons=Array.from(root.querySelectorAll("button"));
 var partOne=buttons.find(function(b){return /ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test((b.textContent||"").trim())});
 var partTwo=buttons.find(function(b){return /الجزء الثاني/.test((b.textContent||"").trim())||b.id==="btn-part2"});
 var difficulty=!!root.querySelector('[aria-label="اختار الصعوبة"]');
 if(partOne&&partTwo){
  var candidate=partOne.parentElement;
  while(candidate&&candidate!==root){
   if(candidate.contains(partTwo)&&candidate.querySelectorAll("button").length>=2)return candidate;
   candidate=candidate.parentElement;
  }
 }
 // The difficulty selector is a stable home-screen signature when labels change.
 if(difficulty&&buttons.length>=3){
  var first=buttons.find(function(b){return /ابدأ|جديد|الجزء|متابعة|حفظ|إعدادات/.test((b.textContent||"").trim())})||buttons[0];
  var fallback=first&&first.parentElement;
  while(fallback&&fallback!==root){
   if(fallback.querySelectorAll("button").length>=3)return fallback;
   fallback=fallback.parentElement;
  }
 }
 return null;
}
function cleanLabel(s){return(s||"").replace(/\s+/g," ").trim()}
function kind(t,b){if(b.id==="carthage-continue-last"||/متابعة|استكمال|آخر حفظ/.test(t))return"continue";if(/ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test(t))return"primary";if(/الجزء الثالث|الجزء 3/.test(t))return"locked";return"secondary"}
function removeOverlay(){if(overlay){overlay.remove();overlay=null}if(root&&root.getAttribute("data-qarton-legacy-home-hidden")==="true"){root.style.visibility="";root.removeAttribute("data-qarton-legacy-home-hidden")}window.__QARTON_HOME_READY__=false}
function mount(){
 queued=false;root=document.getElementById("root");if(!root)return;
 if(isPlaying()){removeOverlay();return}
 var nativeMenu=findNativeMenu();if(!nativeMenu){removeOverlay();return}
 addStyle();if(!overlay){overlay=document.createElement("main");overlay.id="qarton-home-screen";overlay.setAttribute("aria-label","QARTON Carthage home");document.body.appendChild(overlay)}
 root.style.visibility="hidden";root.setAttribute("data-qarton-legacy-home-hidden","true");overlay.replaceChildren();
 var sc=document.createElement("div");sc.className="qh-scroll";overlay.appendChild(sc);
 var brand=document.createElement("div");brand.className="qh-brand";brand.innerHTML='<span class="qh-mark">Q</span><span><strong>QARTON</strong><small>CULTURE • POWER • CINEMA</small></span>';sc.appendChild(brand);
 var title=document.createElement("h1");title.className="qh-title";title.textContent="آخر يوم في قرطاج";sc.appendChild(title);
 var desc=document.createElement("p");desc.className="qh-kicker";desc.textContent="60 دقيقة... ومدينة كاملة باش تطيح. خريطة، ثقة، 5 أدلة، و9 نهايات.";sc.appendChild(desc);
 var badge=document.createElement("div");badge.className="qh-badge";badge.textContent="✦ تجربة أنمي سينمائية";sc.appendChild(badge);
 var nativeDifficulty=root.querySelector('[aria-label="اختار الصعوبة"]');
 if(nativeDifficulty){var dh=document.createElement("div");dh.className="qh-section";dh.textContent="اختار مستوى التحدّي";sc.appendChild(dh);var ds=document.createElement("div");ds.className="qh-difficulties";Array.from(nativeDifficulty.querySelectorAll("button")).forEach(function(n){var b=document.createElement("button");b.type="button";b.className="qh-difficulty";b.textContent=cleanLabel(n.textContent);b.setAttribute("aria-pressed",String(n.getAttribute("aria-pressed")==="true"||n.classList.contains("selected")||n.classList.contains("active")));b.addEventListener("click",function(){n.click();Array.from(ds.children).forEach(function(x){x.setAttribute("aria-pressed",String(x===b))})});ds.appendChild(b)});if(ds.children.length)sc.appendChild(ds)}
 var heading=document.createElement("div");heading.className="qh-section";heading.textContent="رحلتك تبدأ من هنا";sc.appendChild(heading);
 var actions=document.createElement("div");actions.className="qh-actions";sc.appendChild(actions);var seen=new Set();
 Array.from(nativeMenu.querySelectorAll("button")).forEach(function(n){var t=cleanLabel(n.textContent);if(!t||seen.has(t))return;seen.add(t);var b=document.createElement("button");b.type="button";b.className="qh-action";b.dataset.kind=kind(t,n);b.textContent=t;b.disabled=!!n.disabled;b.addEventListener("click",function(){n.click()});actions.appendChild(b)});
 if(!actions.children.length){var e=document.createElement("div");e.className="qh-footer";e.textContent="تعذر تحميل خيارات القائمة";actions.appendChild(e)}
 var foot=document.createElement("div");foot.className="qh-footer";foot.textContent="رحلتك • اختياراتك • مصيرك";overlay.appendChild(foot);
 window.__QARTON_HOME_READY__=true;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(mount)}
function start(){
 root=document.getElementById("root");observer=new MutationObserver(schedule);
 if(root)observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","aria-label"]});
 mount();
 var bodyObserver=new MutationObserver(function(){var next=document.getElementById("root");if(next!==root){root=next;if(root)observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true});schedule()}});
 bodyObserver.observe(document.body,{childList:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();