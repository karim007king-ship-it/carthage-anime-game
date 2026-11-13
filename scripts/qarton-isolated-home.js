(function(){
"use strict";
if(window.__qartonHomeIsolationInstalled)return;
window.__qartonHomeIsolationInstalled=true;
var STATE={HOME:"HOME",GAME:"GAME",TRANSITION:"TRANSITION"};
var state=STATE.HOME,root=null,overlay=null,observer=null,bodyObserver=null,queued=false,menu=null;
var css=[
"#qarton-home-screen{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;overflow:hidden;padding:calc(env(safe-area-inset-top,0px) + 10px) 16px calc(env(safe-area-inset-bottom,0px) + 10px);color:var(--qarton-cream,#f7ecd7);background:radial-gradient(ellipse at 50% 0%,#8b30394d,transparent 48%),radial-gradient(ellipse at 12% 85%,#e8c47722,transparent 40%),linear-gradient(155deg,#07090f,#101827 58%,#080a11);font-family:system-ui,sans-serif;direction:rtl}",
"#qarton-home-screen *{box-sizing:border-box}#qarton-home-screen .qh-scroll{width:100%;max-width:560px;min-height:0;display:flex;flex:1;flex-direction:column;justify-content:center;overflow:hidden;overscroll-behavior:none}",
"#qarton-home-screen .qh-brand{display:flex;align-items:center;justify-content:center;gap:9px;direction:ltr;margin:2px auto 10px}#qarton-home-screen .qh-mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid #e8c477;border-radius:10px 3px;color:#fff0d2;background:linear-gradient(145deg,#8b3039,#111827);font:900 20px Georgia}#qarton-home-screen .qh-brand strong{display:block;color:#e8c477;font-size:18px;letter-spacing:3px}#qarton-home-screen .qh-brand small{display:block;color:#c9bda8;font-size:7px;letter-spacing:1.1px}",
"#qarton-home-screen .qh-title{margin:2px 0 0;text-align:center;font-size:clamp(25px,7vw,38px);font-weight:950;line-height:1.15;color:#fff0d2;text-shadow:0 3px 18px #b13d3d66}#qarton-home-screen .qh-kicker{margin:6px 0 0;text-align:center;color:#d9c9ac;font-size:12px;line-height:1.5}#qarton-home-screen .qh-badge{align-self:center;margin:9px 0 0;padding:4px 12px;border:1px solid #e8c47766;border-radius:30px;color:#e8c477;background:#171b25;font-size:10px;font-weight:800}",
"#qarton-home-screen .qh-section{margin:12px 0 6px;color:#e8c477;font-size:11px;font-weight:900}#qarton-home-screen .qh-difficulties{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}#qarton-home-screen .qh-difficulty{min-height:44px;padding:8px 5px;border:1px solid #8b795c88;border-radius:12px;background:linear-gradient(145deg,#20293a,#0d121d);color:#e8dcc6;font-size:11px;font-weight:800}#qarton-home-screen .qh-difficulty[aria-pressed=true]{border-color:#e8c477;background:linear-gradient(145deg,#6b3038,#1b202d);color:#fff0d2}",
"#qarton-home-screen .qh-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#qarton-home-screen .qh-action{min-height:46px;padding:9px 8px;border:1px solid #e8c47766;border-radius:13px;background:linear-gradient(145deg,#222c3e,#0c111b);color:#fff0d2;font-size:12px;font-weight:850;line-height:1.35;box-shadow:0 6px 16px #0005}#qarton-home-screen .qh-action:active,#qarton-home-screen .qh-difficulty:active{transform:scale(.98)}#qarton-home-screen .qh-action[data-kind=primary],#qarton-home-screen .qh-action[data-kind=continue]{grid-column:1/-1;min-height:50px;border-color:#f0d18a;background:linear-gradient(105deg,#8b3039,#57232e 55%,#18263a);font-size:14px}#qarton-home-screen .qh-action[data-kind=locked]{opacity:.65;border-style:dashed}#qarton-home-screen .qh-action:disabled{opacity:.45}",
"#qarton-home-screen .qh-footer{flex:0 0 auto;margin-top:8px;color:#bca77f;text-align:center;font-size:9px;letter-spacing:1px}#qarton-home-screen button{font-family:inherit;cursor:pointer}#qarton-home-screen .qh-status{margin:18px auto 0;text-align:center;color:#d9c9ac;font-size:12px;line-height:1.8}@media(max-height:680px){#qarton-home-screen{padding-top:6px;padding-bottom:6px}#qarton-home-screen .qh-brand{margin-bottom:5px}#qarton-home-screen .qh-mark{width:27px;height:27px;font-size:16px}#qarton-home-screen .qh-brand strong{font-size:15px}#qarton-home-screen .qh-title{font-size:25px}#qarton-home-screen .qh-kicker{font-size:10px;margin-top:3px}#qarton-home-screen .qh-section{margin-top:8px}#qarton-home-screen .qh-action{min-height:38px;padding:6px}}@media(prefers-reduced-motion:reduce){#qarton-home-screen *{transition:none!important;animation:none!important}}"
].join("");
function addStyle(){if(document.getElementById("qarton-isolated-home-style"))return;var s=document.createElement("style");s.id="qarton-isolated-home-style";s.textContent=css;document.head.appendChild(s)}
function setState(next,reason){if(!STATE[next]||state===next)return;state=next;window.__QARTON_APP_STATE__=state;window.dispatchEvent(new CustomEvent("qarton:statechange",{detail:{state:state,reason:reason||"app"}}));render()}
window.__qartonSetAppState=function(next,reason){setState(String(next||"").toUpperCase(),reason)};
window.__qartonGetAppState=function(){return state};
function findNativeMenu(){
 if(!root)return null;
 var difficulty=root.querySelector('[aria-label="اختار الصعوبة"]');
 var menu=root.querySelector(".home-actions");
 if(menu&&Array.from(menu.querySelectorAll("button")).filter(function(b){return !difficulty||!difficulty.contains(b)}).length>=2)return menu;
 var buttons=Array.from(root.querySelectorAll("button"));
 var start=buttons.find(function(b){return /ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test((b.textContent||"").trim())});
 var part2=buttons.find(function(b){return /الجزء الثاني/.test((b.textContent||"").trim())||b.id==="btn-part2"});
 if(start&&part2){var node=start.parentElement;while(node&&node!==root){if(node.contains(part2)&&node.querySelectorAll("button").length>=2)return node;node=node.parentElement}}
 return null;
}
function clean(s){return(s||"").replace(/\s+/g," ").trim()}
function kind(t,b){if(b.id==="carthage-continue-last"||/متابعة|استكمال|آخر حفظ/.test(t))return"continue";if(/ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test(t))return"primary";if(/الجزء الثالث|الجزء 3/.test(t))return"locked";return"secondary"}
function ensureOverlay(){if(overlay)return;overlay=document.createElement("main");overlay.id="qarton-home-screen";overlay.setAttribute("aria-label","QARTON Carthage home");document.body.appendChild(overlay)}
function hideLegacy(){if(!root)return;root.style.visibility="hidden";root.setAttribute("data-qarton-legacy-home-hidden","true")}
function restoreNativeMenu(){if(menu&&menu.getAttribute("data-qarton-transition-hidden")==="true"){menu.style.visibility="";menu.removeAttribute("data-qarton-transition-hidden")}}
function removeTransitionControl(){var back=document.getElementById("qarton-transition-return");if(back)back.remove()}function showTransition(){if(root&&root.getAttribute("data-qarton-legacy-home-hidden")==="true"){root.style.visibility="";root.removeAttribute("data-qarton-legacy-home-hidden")}if(!menu||!root.contains(menu))menu=findNativeMenu();if(menu){menu.style.visibility="hidden";menu.setAttribute("data-qarton-transition-hidden","true")}if(overlay){overlay.remove();overlay=null}if(!document.getElementById("qarton-transition-return")){var back=document.createElement("button");back.id="qarton-transition-return";back.type="button";back.textContent="↩ رجوع إلى QARTON";back.style.cssText="position:fixed;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:2147483000;border:1px solid #e8c477;border-radius:999px;background:#171b25;color:#fff0d2;padding:10px 14px;font:800 12px system-ui;box-shadow:0 5px 18px #0008";back.addEventListener("click",function(){setState("HOME","transition-return")});document.body.appendChild(back)}window.__QARTON_HOME_READY__=false}
function showGame(){removeTransitionControl();restoreNativeMenu();if(root&&root.getAttribute("data-qarton-legacy-home-hidden")==="true"){root.style.visibility="";root.removeAttribute("data-qarton-legacy-home-hidden")}if(overlay){overlay.remove();overlay=null}window.__QARTON_HOME_READY__=false}
function render(){
 root=document.getElementById("root");
 if(state==="GAME"){showGame();return}
 if(state==="TRANSITION"){showTransition();return}
 restoreNativeMenu();hideLegacy();ensureOverlay();addStyle();overlay.replaceChildren();
 var sc=document.createElement("div");sc.className="qh-scroll";overlay.appendChild(sc);
 var brand=document.createElement("div");brand.className="qh-brand";brand.innerHTML='<span class="qh-mark">Q</span><span><strong>QARTON</strong><small>CULTURE • POWER • CINEMA</small></span>';sc.appendChild(brand);
 var title=document.createElement("h1");title.className="qh-title";title.textContent="آخر يوم في قرطاج";sc.appendChild(title);
 var desc=document.createElement("p");desc.className="qh-kicker";desc.textContent="60 دقيقة... ومدينة كاملة باش تطيح. خريطة، ثقة، 5 أدلة، و9 نهايات.";sc.appendChild(desc);
 var badge=document.createElement("div");badge.className="qh-badge";badge.textContent="✦ تجربة أنمي سينمائية";sc.appendChild(badge);
 if(state==="TRANSITION"){var wait=document.createElement("div");wait.className="qh-status";wait.textContent="تُحضّر قرطاج رحلتك...";sc.appendChild(wait);window.__QARTON_HOME_READY__=false;return}
 var currentMenu=findNativeMenu();
 if(currentMenu)menu=currentMenu;
 if(!menu||!root||!root.contains(menu)){var pending=document.createElement("div");pending.className="qh-status";pending.textContent="جاري تجهيز خيارات اللعبة...";sc.appendChild(pending);window.__QARTON_HOME_READY__=false;return}
 var difficulty=root.querySelector('[aria-label="اختار الصعوبة"]');
 if(difficulty){var dh=document.createElement("div");dh.className="qh-section";dh.textContent="اختار مستوى التحدّي";sc.appendChild(dh);var ds=document.createElement("div");ds.className="qh-difficulties";Array.from(difficulty.querySelectorAll("button")).forEach(function(n){var b=document.createElement("button");b.type="button";b.className="qh-difficulty";b.textContent=clean(n.textContent);b.setAttribute("aria-pressed",String(n.getAttribute("aria-pressed")==="true"||n.classList.contains("selected")||n.classList.contains("active")));b.disabled=!!n.disabled;b.addEventListener("click",function(){n.click();Array.from(ds.children).forEach(function(x){x.setAttribute("aria-pressed",String(x===b))})});ds.appendChild(b)});if(ds.children.length)sc.appendChild(ds)}
 var heading=document.createElement("div");heading.className="qh-section";heading.textContent="رحلتك تبدأ من هنا";sc.appendChild(heading);
 var actions=document.createElement("div");actions.className="qh-actions";sc.appendChild(actions);
 Array.from(menu.querySelectorAll("button")).filter(function(n){return !difficulty||!difficulty.contains(n)}).forEach(function(n,index){var t=clean(n.textContent);if(!t)return;var b=document.createElement("button");b.type="button";b.className="qh-action";b.dataset.kind=kind(t,n);b.dataset.actionIndex=String(index);b.textContent=t;b.disabled=!!n.disabled;b.addEventListener("click",function(){setState("TRANSITION","home-action");try{n.click()}catch(e){setState("HOME","action-error");throw e}});actions.appendChild(b)});
 if(!actions.children.length){var empty=document.createElement("div");empty.className="qh-status";empty.textContent="لم تظهر خيارات القائمة بعد. الواجهة القديمة تبقى مخفية.";actions.appendChild(empty)}
 var foot=document.createElement("div");foot.className="qh-footer";foot.textContent="رحلتك • اختياراتك • مصيرك";overlay.appendChild(foot);
 window.__QARTON_HOME_READY__=true;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;root=document.getElementById("root");if(state==="HOME"){menu=findNativeMenu()||menu;if(menu&&root&&!root.contains(menu))menu=null}render()})}
function start(){
 root=document.getElementById("root");window.__QARTON_APP_STATE__=state;window.dispatchEvent(new CustomEvent("qarton:statechange",{detail:{state:state,reason:"init"}}));
 if(root){observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","aria-label","disabled"]});root.addEventListener("click",function(e){var b=e.target&&e.target.closest?e.target.closest("button"):null;if(!b||state!=="TRANSITION")return;var label=clean(b.textContent);if(/^(رجوع للقائمة|إلغاء|لا)$/.test(label))window.setTimeout(function(){if(state==="TRANSITION")setState("HOME","transition-cancel")},0)},true)}
 bodyObserver=new MutationObserver(function(){var next=document.getElementById("root");if(next!==root){if(observer)observer.disconnect();root=next;if(root){observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true})}schedule()}});
 bodyObserver.observe(document.body,{childList:true});render();
}
start();
})();