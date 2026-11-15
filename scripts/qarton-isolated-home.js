(function(){
"use strict";
if(window.__qartonHomeIsolationInstalled)return;
window.__qartonHomeIsolationInstalled=true;
var STATE={HOME:"HOME",INTRO:"INTRO",GAME:"GAME",TRANSITION:"TRANSITION"};
var state=STATE.HOME,root=null,overlay=null,observer=null,bodyObserver=null,queued=false,transitionTimer=0;
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
function setState(next,reason){if(!STATE[next]||state===next)return;if(transitionTimer){window.clearTimeout(transitionTimer);transitionTimer=0}state=next;if(next==="TRANSITION"){window.__QARTON_TRANSITION_ERROR__="";transitionTimer=window.setTimeout(function(){transitionTimer=0;if(state!=="TRANSITION")return;window.__QARTON_TRANSITION_ERROR__="تعذّر تشغيل المشهد في الوقت المحدد. رجعناك للقائمة حتى لا تبقى اللعبة معلّقة.";setState("HOME","transition-timeout")},15000)}window.__QARTON_APP_STATE__=state;window.dispatchEvent(new CustomEvent("qarton:statechange",{detail:{state:state,reason:reason||"app"}}));render()}
window.__qartonSetAppState=function(next,reason){setState(String(next||"").toUpperCase(),reason)};
window.__qartonGetAppState=function(){return state};
function findDifficultyControl(){return root&&root.querySelector('[aria-label="اختار الصعوبة"]')||null}
function clean(s){return(s||"").replace(/\s+/g," ").trim()}
function ensureOverlay(){if(overlay)return;overlay=document.createElement("main");overlay.id="qarton-home-screen";overlay.setAttribute("aria-label","QARTON Carthage home");document.body.appendChild(overlay)}
function hideLegacy(){document.body.classList.remove("qarton-game-active","qarton-intro-active");if(!root)return;if(root.style.getPropertyValue("display")!=="none"||root.style.getPropertyPriority("display")!=="important")root.style.setProperty("display","none","important");if(root.style.getPropertyValue("visibility")!=="hidden"||root.style.getPropertyPriority("visibility")!=="important")root.style.setProperty("visibility","hidden","important");if(root.style.getPropertyValue("pointer-events")!=="none"||root.style.getPropertyPriority("pointer-events")!=="important")root.style.setProperty("pointer-events","none","important");if(root.getAttribute("data-qarton-legacy-home-hidden")!=="true")root.setAttribute("data-qarton-legacy-home-hidden","true");if(!document.body.classList.contains("qarton-home-active"))document.body.classList.add("qarton-home-active")}

function removeTransitionControl(){var back=document.getElementById("qarton-transition-return");if(back)back.remove()}function showTransition(){hideLegacy();removeTransitionControl();ensureOverlay();addStyle();overlay.replaceChildren();var sc=document.createElement("div");sc.className="qh-scroll";overlay.appendChild(sc);var brand=document.createElement("div");brand.className="qh-brand";brand.innerHTML='<span class="qh-mark">Q</span><span><strong>QARTON</strong><small>CULTURE • POWER • CINEMA</small></span>';sc.appendChild(brand);var title=document.createElement("h1");title.className="qh-title";title.textContent="آخر يوم في قرطاج";sc.appendChild(title);var status=document.createElement("div");status.className="qh-status";status.textContent="تُحضّر قرطاج رحلتك...";sc.appendChild(status);var back=document.createElement("button");back.id="qarton-transition-return";back.type="button";back.className="qh-action";back.textContent="إلغاء والعودة إلى QARTON";back.style.margin="18px auto 0";back.addEventListener("click",function(){setState("HOME","transition-return")});sc.appendChild(back);window.__QARTON_HOME_READY__=false}
function showIntro(){removeTransitionControl();document.body.classList.add("qarton-intro-active");document.body.classList.remove("qarton-home-active","qarton-game-active");if(root&&root.getAttribute("data-qarton-legacy-home-hidden")==="true"){root.style.removeProperty("display");root.style.removeProperty("visibility");root.style.removeProperty("pointer-events");root.removeAttribute("data-qarton-legacy-home-hidden")}if(overlay){overlay.remove();overlay=null}window.__QARTON_HOME_READY__=false}
function showGame(){removeTransitionControl();document.body.classList.add("qarton-game-active");document.body.classList.remove("qarton-home-active","qarton-intro-active");if(root&&root.getAttribute("data-qarton-legacy-home-hidden")==="true"){root.style.removeProperty("display");root.style.removeProperty("visibility");root.style.removeProperty("pointer-events");root.removeAttribute("data-qarton-legacy-home-hidden")}if(overlay){overlay.remove();overlay=null}window.__QARTON_HOME_READY__=false}
function showNewGameConfirm(){
 ensureOverlay();addStyle();
 var previous=overlay.querySelector(".qh-confirm-backdrop");if(previous)return;
 var shade=document.createElement("div");shade.className="qh-confirm-backdrop";shade.setAttribute("role","presentation");
 shade.style.cssText="position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:22px;background:rgba(0,0,0,.82);backdrop-filter:blur(9px)";
 var dialog=document.createElement("section");dialog.className="qh-confirm";dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");dialog.setAttribute("aria-labelledby","qh-confirm-title");
 dialog.style.cssText="width:min(100%,420px);padding:22px 18px;border:1px solid #e8c477;border-radius:20px;background:linear-gradient(145deg,#20293a,#090d15);box-shadow:0 18px 60px #000b;text-align:center";
 var title=document.createElement("h2");title.id="qh-confirm-title";title.textContent="تبدأ لعبة جديدة؟";title.style.cssText="margin:0;color:#fff0d2;font-size:20px;font-weight:900";
 var canStart=typeof window.__carthageHasFreeSlot!=="function"||window.__carthageHasFreeSlot();
 var note=document.createElement("p");note.textContent=canStart?"سيبدأ الجزء الأول في خانة جديدة. حفظك السابق سيبقى محفوظًا ولن يتم حذفه.":"خانات الحفظ الثلاث ممتلئة. حرّر خانة حفظ أولاً حتى لا نفقد أي تقدم سابق.";note.style.cssText="margin:12px 0 18px;color:#d9c9ac;font-size:13px;line-height:1.9";
 var actions=document.createElement("div");actions.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:9px";
 var cancel=document.createElement("button");cancel.type="button";cancel.className="qh-action";cancel.textContent="إلغاء";cancel.addEventListener("click",function(){shade.remove()});
 var confirm=document.createElement("button");confirm.type="button";confirm.className="qh-action";confirm.dataset.kind="primary";confirm.textContent=canStart?"ابدأ من جديد":"لا توجد خانة فارغة";confirm.disabled=!canStart;
 confirm.addEventListener("click",function(){
  if(typeof window.__carthageStartNewGame!=="function"){shade.remove();setState("HOME","new-game-handler-missing");return}
  setState("TRANSITION","confirm-new-game");
  try{if(window.__carthageStartNewGame()===false){setState("HOME","new-game-blocked");return}}catch(e){setState("HOME","new-game-error");throw e}
 });
 actions.append(cancel,confirm);dialog.append(title,note,actions);shade.appendChild(dialog);overlay.appendChild(shade);confirm.focus();
}
function actionButton(label,kindName,handler,disabled){
 var b=document.createElement("button");b.type="button";b.className="qh-action";b.dataset.kind=kindName;b.textContent=label;b.disabled=!!disabled;if(kindName==="continue")b.id="carthage-continue-last";if(kindName==="primary")b.id="carthage-start-new-game";
 b.addEventListener("click",handler);return b;
}
function invokeAction(name,reason){
 var fn=window[name];if(typeof fn!=="function"){window.__QARTON_TRANSITION_ERROR__="وظيفة التشغيل غير جاهزة بعد. أعد المحاولة بعد لحظات.";setState("HOME","missing-"+name);return false}
 setState("TRANSITION",reason);
 try{var result=fn();if(result===false){setState("HOME",reason+"-blocked");return false}return true}
 catch(error){setState("HOME",reason+"-error");window.__QARTON_LAST_ACTION_ERROR__=String(error&&error.message||error);return false}
}
function render(){
 root=document.getElementById("root");
 if(state==="INTRO"){showIntro();return}if(state==="GAME"){showGame();return}
 if(state==="TRANSITION"){showTransition();return}
 hideLegacy();ensureOverlay();addStyle();overlay.replaceChildren();
 var sc=document.createElement("div");sc.className="qh-scroll";overlay.appendChild(sc);
 var brand=document.createElement("div");brand.className="qh-brand";brand.innerHTML='<span class="qh-mark">Q</span><span><strong>QARTON</strong><small>CULTURE • POWER • CINEMA</small></span>';sc.appendChild(brand);
 var title=document.createElement("h1");title.className="qh-title";title.textContent="آخر يوم في قرطاج";sc.appendChild(title);
 var desc=document.createElement("p");desc.className="qh-kicker";desc.textContent="60 دقيقة... ومدينة كاملة باش تطيح. خريطة، ثقة، 5 أدلة، و9 نهايات.";sc.appendChild(desc);
 if(window.__QARTON_TRANSITION_ERROR__){var recovery=document.createElement("div");recovery.className="qh-status";recovery.setAttribute("role","status");recovery.textContent=window.__QARTON_TRANSITION_ERROR__;sc.appendChild(recovery)}
 var badge=document.createElement("div");badge.className="qh-badge";badge.textContent="✦ تجربة أنمي سينمائية";sc.appendChild(badge);
 var difficulty=findDifficultyControl();
 if(difficulty){
  var dh=document.createElement("div");dh.className="qh-section";dh.textContent="اختار مستوى التحدّي";sc.appendChild(dh);
  var ds=document.createElement("div");ds.className="qh-difficulties";
  Array.from(difficulty.querySelectorAll("button")).forEach(function(nativeButton){
   var b=document.createElement("button");b.type="button";b.className="qh-difficulty";b.textContent=clean(nativeButton.textContent);
   b.setAttribute("aria-pressed",String(nativeButton.getAttribute("aria-pressed")==="true"||nativeButton.classList.contains("selected")||nativeButton.classList.contains("active")));
   b.disabled=!!nativeButton.disabled;
   b.addEventListener("click",function(){nativeButton.click();Array.from(ds.children).forEach(function(item){item.setAttribute("aria-pressed",String(item===b))})});
   ds.appendChild(b);
  });
  if(ds.children.length)sc.appendChild(ds);
 }
 var heading=document.createElement("div");heading.className="qh-section";heading.textContent="رحلتك تبدأ من هنا";sc.appendChild(heading);
 var actions=document.createElement("div");actions.className="qh-actions";sc.appendChild(actions);
 var startReady=typeof window.__carthageStartNewGame==="function";
 var hasSave=false;try{hasSave=typeof window.__carthageHasSave==="function"?!!window.__carthageHasSave():!!(localStorage.getItem("shiganshina-autosave-v1")||localStorage.getItem("shiganshina-slots-v1"))}catch(e){}
 if(!startReady){
  var pending=document.createElement("div");pending.className="qh-status";pending.textContent="جاري تجهيز محرك اللعبة...";actions.appendChild(pending);window.__QARTON_HOME_READY__=false;
 }else{
  actions.appendChild(actionButton("▶ ابدأ الجزء الأول","primary",function(){if(hasSave){showNewGameConfirm();return}invokeAction("__carthageStartNewGame","new-game")}));
  if(hasSave&&typeof window.__carthageContinue==="function")actions.appendChild(actionButton("▶ متابعة آخر حفظ","continue",function(){invokeAction("__carthageContinue","continue")}));
  if(typeof window.__carthageStartPart2==="function")actions.appendChild(actionButton("الجزء الثاني","secondary",function(){invokeAction("__carthageStartPart2","part-two")}));
  if(typeof window.__carthageStartPart3==="function"){
   var canPart3=typeof window.__carthageCanStartPart3==="function"&&window.__carthageCanStartPart3();
   actions.appendChild(actionButton(canPart3?"▶ ابدأ الجزء الثالث — ما بعد الحقيقة":"🔒 الجزء الثالث — يفتح بعد إتمام الجزء الثاني","locked",function(){if(canPart3)invokeAction("__carthageStartPart3","part-three")},!canPart3));
  }
  window.__QARTON_HOME_READY__=true;
 }
 var foot=document.createElement("div");foot.className="qh-footer";foot.textContent="رحلتك • اختياراتك • مصيرك";overlay.appendChild(foot);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;root=document.getElementById("root");render()})}
function observeRoot(){
 if(observer)observer.disconnect();
 root=document.getElementById("root");
 if(!root)return;
 observer=new MutationObserver(schedule);
 observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","aria-label","disabled","style"]});
 root.addEventListener("click",function(e){
  var b=e.target&&e.target.closest?e.target.closest("button"):null;
  if(!b||state!=="TRANSITION")return;
  var label=clean(b.textContent);
  if(/^(رجوع للقائمة|إلغاء|لا)$/.test(label))window.setTimeout(function(){if(state==="TRANSITION")setState("HOME","transition-cancel")},0);
 },true);
}
function start(){
 window.__QARTON_APP_STATE__=state;
 window.dispatchEvent(new CustomEvent("qarton:statechange",{detail:{state:state,reason:"init"}}));
 observeRoot();
 bodyObserver=new MutationObserver(function(){
  var next=document.getElementById("root");
  if(next!==root){observeRoot();schedule()}
 });
 bodyObserver.observe(document.body,{childList:true});
 render();
}
start();
})();