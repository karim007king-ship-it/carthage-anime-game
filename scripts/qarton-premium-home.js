(function(){
if(window.__qartonPremiumHomeInstalled)return;
window.__qartonPremiumHomeInstalled=true;
var css=":root{--q-gold:var(--qarton-gold,#e8c477);--q-cream:var(--qarton-cream,#fff0d2);--q-ink:var(--qarton-ink,#080b12)}\nhtml.carthage-home-locked,body.carthage-home-locked{height:100%!important;min-height:0!important;overflow:hidden!important;overscroll-behavior:none!important}\nbody.carthage-home-locked{position:fixed!important;inset:0!important;width:100%!important;background:#07090f!important}\nbody.carthage-home-locked:before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at 50% 8%,#842d3544,transparent 43%),radial-gradient(ellipse at 12% 82%,#c7994b20,transparent 38%),linear-gradient(155deg,#07090f,#101827 58%,#080a11)}\n#root.carthage-home-locked{position:relative!important;z-index:1!important;display:block!important;box-sizing:border-box!important;width:100%!important;height:100dvh!important;max-height:100dvh!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;overscroll-behavior:none!important}\n#root.carthage-home-locked .qarton-home-shell{position:relative!important;box-sizing:border-box!important;width:100%!important;max-width:560px!important;height:100dvh!important;min-height:0!important;max-height:100dvh!important;margin:0 auto!important;padding:calc(env(safe-area-inset-top,0px) + 12px) 16px calc(env(safe-area-inset-bottom,0px) + 10px)!important;justify-content:flex-start!important;gap:5px!important;overflow:hidden!important}\n#root.carthage-home-locked .qarton-home-shell>img{opacity:.22!important}\n#root.carthage-home-locked .qarton-home-shell>p.font-display{flex:0 0 auto!important;margin:0!important;color:var(--q-gold)!important;font-size:13px!important;line-height:1.2!important;letter-spacing:4px!important}\n#root.carthage-home-locked .qarton-home-shell>h1{flex:0 0 auto!important;margin:2px 0 0!important;font-size:clamp(27px,7vw,38px)!important;line-height:1.02!important}\n#root.carthage-home-locked .qarton-home-shell>p.mt-3{flex:0 0 auto!important;margin:5px auto 0!important;font-size:clamp(11px,3vw,13px)!important;line-height:1.45!important}\n#root.carthage-home-locked .qarton-home-shell>div[aria-label='اختار الصعوبة']{flex:0 0 auto!important;margin-top:8px!important;gap:6px!important}\n#root.carthage-home-locked .qarton-home-shell>div[aria-label='اختار الصعوبة'] button{padding:6px 11px!important;font-size:11px!important}\n#root.carthage-home-locked .qarton-home-shell>p.mt-2{flex:0 0 auto!important;margin:2px 0 0!important;font-size:9px!important;line-height:1.25!important}\n#root.carthage-home-locked .qarton-home-shell>div.rounded-2xl{flex:0 0 auto!important;margin-top:7px!important;padding:8px 10px!important;border-radius:13px!important}\n#root.carthage-home-locked .home-actions.grid{box-sizing:border-box!important;flex:0 0 auto!important;width:100%!important;max-width:100%!important;max-height:none!important;min-height:0!important;margin:8px 0 0!important;padding:9px!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;align-content:start!important;align-items:stretch!important;border:1px solid #e8c47766!important;border-radius:16px!important;background:linear-gradient(150deg,#161e2cee,#080c14f2)!important;box-shadow:0 10px 28px #0008!important}\n#root.carthage-home-locked .home-actions.grid button,#root.carthage-home-locked #carthage-part3-start{box-sizing:border-box!important;min-width:0!important;min-height:43px!important;width:100%!important;margin:0!important;padding:7px 6px!important;border:1px solid #e8c47777!important;border-radius:11px!important;background:linear-gradient(145deg,#273141,#0d121d)!important;color:#fff0d2!important;font:800 clamp(10px,2.9vw,12px)/1.25 system-ui!important;text-align:center!important;white-space:normal!important;overflow-wrap:anywhere!important;box-shadow:0 4px 12px #0005!important}\n#root.carthage-home-locked .home-actions.grid button:first-child{grid-column:1/-1!important;min-height:48px!important;border-color:#ffe29d!important;background:linear-gradient(105deg,#8b3039,#57232e 53%,#18263a)!important;font-size:13px!important}\n#root.carthage-home-locked .home-actions.grid button#btn-part2{grid-column:1/-1!important;min-height:44px!important;background:linear-gradient(105deg,#273044,#172b3d)!important}\n#root.carthage-home-locked #carthage-continue-last,#root.carthage-home-locked #carthage-part3-start{grid-column:1/-1!important;min-height:42px!important}\n#root.carthage-home-locked .home-tog{flex:0 0 auto!important;margin:5px 0 0!important}\n#root.carthage-home-locked .home-tog label{display:block!important;padding:7px 10px!important;border:1px solid #e8c47755!important;border-radius:10px!important;background:#111827!important;color:#e8d8b8!important;font-size:11px!important}\n#root.carthage-home-locked .home-set{flex:0 0 auto!important;margin:5px 0 0!important;gap:5px!important}\n#root.carthage-home-locked .home-set button{padding:5px 8px!important;font-size:9px!important}\n#root.carthage-home-locked #qarton-home-brand,#root.carthage-home-locked #qarton-home-info{display:none!important}\n#root.carthage-home-locked .qarton-achievements{max-height:86px!important;overflow:hidden!important}\n@media(max-height:740px){#root.carthage-home-locked .qarton-home-shell{gap:3px!important;padding-top:calc(env(safe-area-inset-top,0px) + 7px)!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 6px)!important}#root.carthage-home-locked .qarton-home-shell>h1{font-size:27px!important}#root.carthage-home-locked .qarton-home-shell>p.mt-3{font-size:10px!important;line-height:1.25!important}#root.carthage-home-locked .qarton-home-shell>div.rounded-2xl{margin-top:4px!important;padding:6px 8px!important}#root.carthage-home-locked .home-actions.grid{margin-top:5px!important;padding:7px!important;gap:5px!important}#root.carthage-home-locked .home-actions.grid button{min-height:38px!important;padding:5px!important}#root.carthage-home-locked .home-actions.grid button:first-child{min-height:42px!important}}\n@media(prefers-reduced-motion:reduce){#root.carthage-home-locked .home-actions.grid button{transition:none!important}}";


css += "\n#root.carthage-home-locked #qarton-home-brand{position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 5px)!important;left:12px!important;right:12px!important;z-index:20!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:2px!important;margin:0!important;padding:0!important;color:var(--q-cream)!important;pointer-events:none!important;text-align:center!important}\n#root.carthage-home-locked .qarton-brand-row{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;direction:ltr!important}\n#root.carthage-home-locked .qarton-mark{display:grid!important;place-items:center!important;width:29px!important;height:29px!important;border:1px solid var(--q-gold)!important;border-radius:9px 3px 9px 3px!important;background:linear-gradient(145deg,#8d3038,#111827)!important;color:var(--q-cream)!important;font:900 18px/1 Georgia,serif!important;box-shadow:0 0 16px #e8c47733!important}\n#root.carthage-home-locked .qarton-word{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:1px!important}\n#root.carthage-home-locked .qarton-word strong{color:var(--q-gold)!important;font:900 15px/1 system-ui!important;letter-spacing:3px!important}\n#root.carthage-home-locked .qarton-word small{color:#d8c7a6!important;font:700 7px/1.2 system-ui!important;letter-spacing:1.2px!important}\n#root.carthage-home-locked .qarton-game-title{color:#fff0d2!important;font:900 20px/1.15 system-ui!important;letter-spacing:3px!important;text-shadow:0 2px 14px #b13d3d77!important}\n#root.carthage-home-locked .qarton-game-sub{color:#c9bda8!important;font:500 10px/1.25 system-ui!important}\n#root.carthage-home-locked #qarton-home-info{position:fixed!important;left:12px!important;right:12px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 5px)!important;z-index:20!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;color:#bca77f!important;font:700 9px/1.2 system-ui!important;letter-spacing:1px!important;pointer-events:none!important}\n#root.carthage-home-locked .qarton-line{display:block!important;width:28px!important;height:1px!important;background:linear-gradient(90deg,transparent,var(--q-gold),transparent)!important}\n#root.carthage-home-locked .qarton-home-shell{padding-top:calc(env(safe-area-inset-top,0px) + 91px)!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 31px)!important}\n@media(max-height:740px){#root.carthage-home-locked #qarton-home-brand{top:calc(env(safe-area-inset-top,0px) + 3px)!important;gap:1px!important}#root.carthage-home-locked .qarton-mark{width:24px!important;height:24px!important;font-size:15px!important}#root.carthage-home-locked .qarton-word strong{font-size:13px!important}#root.carthage-home-locked .qarton-game-title{font-size:17px!important}#root.carthage-home-locked .qarton-game-sub{font-size:9px!important}#root.carthage-home-locked .qarton-home-shell{padding-top:calc(env(safe-area-inset-top,0px) + 77px)!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 27px)!important}}\n@media(max-height:650px){#root.carthage-home-locked .qarton-game-sub{display:none!important}#root.carthage-home-locked .qarton-home-shell{padding-top:calc(env(safe-area-inset-top,0px) + 62px)!important}}\n";


css += "\n#root.carthage-home-locked .qarton-home-shell{background:linear-gradient(155deg,rgba(24,31,46,.97),rgba(7,10,17,.98))!important;border:1px solid #e8c47788!important;border-radius:26px!important;box-shadow:0 18px 48px #000b,inset 0 1px #fff2!important}\n#root.carthage-home-locked .qarton-home-shell>div.absolute{opacity:.2!important}\n#root.carthage-home-locked .home-actions.grid button{border-radius:14px!important;min-height:48px!important;letter-spacing:.1px!important;transition:transform .18s ease,border-color .18s ease,filter .18s ease!important}\n#root.carthage-home-locked .home-actions.grid button:active{transform:scale(.975)!important;filter:brightness(1.18)!important}\n#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=continue]{border-color:#e8c477!important;background:linear-gradient(110deg,#253d3c,#111d26)!important}\n#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=part2],#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=part3]{border-color:#9d83c7!important;background:linear-gradient(110deg,#29243b,#111827)!important}\n#root.carthage-home-locked .home-tog label{border-radius:13px!important}\n#root.carthage-home-locked .home-set button{border-radius:10px!important}\n@media(max-height:740px){#root.carthage-home-locked .qarton-home-shell{border-radius:19px!important;padding-left:12px!important;padding-right:12px!important}#root.carthage-home-locked .home-actions.grid button{min-height:40px!important}}";

function style(){if(document.getElementById("qarton-premium-home-style"))return;var s=document.createElement("style");s.id="qarton-premium-home-style";s.textContent=css;document.head.appendChild(s)}
function playing(root){return !!(root&&root.querySelector(".game-timer"))}
function findMenu(root){
var buttons=Array.from(root.querySelectorAll("button"));
var hasPartOne=buttons.some(function(b){return /ابدأ الجزء الأول/.test((b.textContent||"").trim())});
var hasPartTwo=buttons.some(function(b){return /الجزء الثاني/.test((b.textContent||"").trim())||b.id==="btn-part2"});
// A story/action screen can also contain buttons named "ابدأ" or "متابعة".
// Treat the screen as the home menu only when both real part selectors exist.
if(!hasPartOne||!hasPartTwo)return null;
var menu=root.querySelector(".home-actions.grid");
if(!menu){
var start=buttons.find(function(b){return /ابدأ الجزء الأول/.test((b.textContent||"").trim())});
if(start){
var candidate=start.parentElement;
while(candidate&&candidate!==root){
var candidateButtons=Array.from(candidate.querySelectorAll("button"));
var candidateHasPartTwo=candidateButtons.some(function(b){return /الجزء الثاني/.test((b.textContent||"").trim())||b.id==="btn-part2"});
if(candidateButtons.length>=3&&candidateHasPartTwo){menu=candidate;break}
candidate=candidate.parentElement;
}
if(menu)menu.classList.add("home-actions","grid");
}
}
if(!menu)return null;
var shell=menu.closest(".home-actions.flex");
if(!shell&&menu.parentElement&&menu.parentElement!==root)shell=menu.parentElement;
if(shell)shell.classList.add("qarton-home-shell","qarton-card","qarton-ui");
return menu;
}
function decorate(root){
var menu=findMenu(root);if(!menu)return;
Array.from(menu.querySelectorAll("button")).forEach(function(b,i){
var t=(b.textContent||"").trim(),kind="secondary",icon="✦";
if(/متابعة|استكمال|آخر حفظ/.test(t)||b.id==="carthage-continue-last"){kind="continue";icon="▶"}
else if(/ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test(t)){kind="primary";icon="⚔"}
else if(/الجزء الثالث|الجزء 3/.test(t)){kind="part3";icon="◆"}
else if(/الجزء الثاني/.test(t)){kind="part2";icon="◈"}
else if(/حفظ|استيراد|تصدير/.test(t)){icon="▣"}
else if(/إعدادات|الخيارات/.test(t)){icon="⚙"}
b.dataset.qartonKind=kind;b.dataset.qartonIcon=icon;b.classList.add("qarton-button");b.classList.toggle("qarton-button--primary",kind==="primary");b.classList.toggle("qarton-button--secondary",kind==="secondary"||kind==="continue");b.classList.toggle("qarton-button--locked",kind==="part2"||kind==="part3");b.setAttribute("data-qarton-home-action",String(i+1));
});
}
function markAchievements(root){
if(root.querySelector(".qarton-achievements"))return;
var candidates=Array.from(root.querySelectorAll("*")).filter(function(el){
if(el.children.length>8)return false;
var t=(el.innerText||"").trim();
return t.length>15&&t.length<500&&/إنجازاتي/.test(t);
});
candidates.sort(function(a,b){return (a.innerText||"").length-(b.innerText||"").length});
if(candidates[0])candidates[0].classList.add("qarton-achievements");
}
function mount(){
var root=document.getElementById("root");if(!root)return;
if(playing(root)){var a=document.getElementById("qarton-home-brand"),f=document.getElementById("qarton-home-info");if(a)a.remove();if(f)f.remove();root.classList.remove("carthage-home-locked");document.documentElement.classList.remove("carthage-home-locked");document.body.classList.remove("carthage-home-locked");if(observer){observer.disconnect();observer=null}watchGameplayEnd(root);return}
var menu=findMenu(root);
if(!menu)return;
root.classList.add("carthage-home-locked");document.documentElement.classList.add("carthage-home-locked");document.body.classList.add("carthage-home-locked");
style();markAchievements(root);
if(!document.getElementById("qarton-home-brand")){
var brand=document.createElement("div");brand.id="qarton-home-brand";brand.dir="rtl";
brand.innerHTML='<div class="qarton-brand-row"><span class="qarton-mark"><span>Q</span></span><span class="qarton-word"><strong>QARTON</strong><small>CULTURE • POWER • CINEMA</small></span></div><span class="qarton-game-title">قــــرطــــاج</span><span class="qarton-game-sub">حكاية من التاريخ… تُروى بأسلوب سينمائي</span>';
root.appendChild(brand);
}
if(!document.getElementById("qarton-home-info")){
var foot=document.createElement("div");foot.id="qarton-home-info";foot.dir="rtl";
foot.innerHTML='<span class="qarton-line"></span><span>رحلتك • اختياراتك • مصيرك</span><span class="qarton-line"></span>';root.appendChild(foot);
}
decorate(root);
}
var queued=false,observer=null,gameplayObserver=null,returnTimer=0;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mount()})}
function watchGameplayEnd(root){
if(gameplayObserver||!root)return;
gameplayObserver=new MutationObserver(function(){
if(playing(document.getElementById("root"))){if(returnTimer){clearTimeout(returnTimer);returnTimer=0}return}
if(returnTimer)return;
returnTimer=window.setTimeout(function(){
returnTimer=0;
var current=document.getElementById("root");
if(!current||playing(current))return;
gameplayObserver.disconnect();gameplayObserver=null;boot();
},120);
});
gameplayObserver.observe(root,{subtree:true,childList:true,characterData:true});
}
function boot(){style();if(observer)return;observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]});mount()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();