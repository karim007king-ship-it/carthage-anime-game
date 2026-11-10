(function(){
if(window.__qartonPremiumHomeInstalled)return;
window.__qartonPremiumHomeInstalled=true;
var css=`
:root{--q-gold:#e8c477;--q-cream:#fff0c5;--q-ink:#080b12}
body.carthage-home-locked{background:#07090f!important}
body.carthage-home-locked:before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(ellipse at 50% 10%,#842d3544,transparent 43%),radial-gradient(ellipse at 12% 82%,#c7994b20,transparent 38%),linear-gradient(155deg,#07090f,#101827 58%,#080a11)}
body.carthage-home-locked:after{content:"";position:fixed;inset:8px;z-index:-1;pointer-events:none;border:1px solid #e8c47725;border-radius:20px;box-shadow:inset 0 0 55px #0005}
#root.carthage-home-locked{box-sizing:border-box!important;position:relative!important;isolation:isolate;height:100dvh!important;max-height:100dvh!important;min-height:0!important;padding:clamp(105px,15vh,128px) 12px calc(env(safe-area-inset-bottom,0px) + 58px)!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:center!important;gap:8px!important;overflow:hidden!important}
#root.carthage-home-locked #qarton-home-brand{position:fixed;z-index:1000;top:calc(env(safe-area-inset-top,0px) + 9px);left:0;right:0;text-align:center;pointer-events:none;animation:qBrand .65s ease both}
#qarton-home-brand .qarton-brand-row{display:flex;align-items:center;justify-content:center;gap:11px}
#qarton-home-brand .qarton-mark{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--q-gold);border-radius:10px;transform:rotate(45deg);background:linear-gradient(145deg,#842d35,#0a0f19);box-shadow:0 0 20px #e8c4772b}
#qarton-home-brand .qarton-mark span{transform:rotate(-45deg);color:var(--q-cream);font:900 17px Georgia,serif}
#qarton-home-brand .qarton-word{text-align:left}
#qarton-home-brand strong{display:block;color:var(--q-cream);font:900 20px/1 Georgia,serif;letter-spacing:3px;text-shadow:0 2px 16px #d7a64b55}
#qarton-home-brand small{display:block;margin-top:5px;color:#c9b995;font:700 7px/1.2 system-ui;letter-spacing:1.7px}
#qarton-home-brand .qarton-game-title{display:block;margin-top:7px;color:#fff2d4;font:900 clamp(19px,4.8vw,24px)/1.1 system-ui;letter-spacing:1px;text-shadow:0 3px 18px #000}
#qarton-home-brand .qarton-game-sub{display:block;margin-top:3px;color:#b9c0cd;font:500 9px/1.3 system-ui}
#root.carthage-home-locked .qarton-achievements{box-sizing:border-box!important;flex:0 0 auto!important;width:min(100%,440px)!important;max-width:440px!important;max-height:94px!important;overflow:hidden!important;margin:0 auto 0!important;padding:9px 12px!important;border:1px solid #e8c47755!important;border-radius:15px!important;background:linear-gradient(145deg,#171923ed,#080c14f5)!important;box-shadow:0 8px 22px #0006!important;color:#e9dfc9!important;font-size:clamp(10px,2.8vw,13px)!important}
#root.carthage-home-locked .home-actions.grid{box-sizing:border-box!important;flex:0 1 auto!important;width:min(100%,440px)!important;max-width:440px!important;max-height:calc(100dvh - 245px - env(safe-area-inset-bottom,0px))!important;min-height:0!important;overflow:hidden!important;margin:0 auto!important;padding:11px!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important;align-content:center!important;align-items:stretch!important;border:1px solid #e8c47755!important;border-radius:19px!important;background:linear-gradient(150deg,#161e2cee,#080c14f2)!important;box-shadow:0 14px 38px #0008,inset 0 1px 0 #ffffff0e!important;backdrop-filter:blur(10px);animation:qMenu .65s .1s ease both}
#root.carthage-home-locked .home-actions.grid:before{content:"اختر فصل رحلتك";grid-column:1/-1;display:block;padding:0 0 6px;margin:0 0 1px;border-bottom:1px solid #e8c47733;text-align:center;color:#e8d8b8;font:800 11px/1.25 system-ui;letter-spacing:1px}
#root.carthage-home-locked .home-actions.grid button,#root.carthage-home-locked #carthage-part3-start{box-sizing:border-box!important;min-width:0!important;min-height:43px!important;width:100%!important;margin:0!important;padding:7px 6px!important;border:1px solid #e8c47777!important;border-radius:12px!important;background:linear-gradient(145deg,#273141,#0d121d)!important;color:#fff0d2!important;font:800 clamp(10px,2.9vw,12px)/1.3 system-ui!important;text-align:center!important;white-space:normal!important;overflow-wrap:anywhere!important;box-shadow:0 5px 13px #0005,inset 0 1px 0 #ffffff12!important;transition:transform .18s,filter .18s!important}
#root.carthage-home-locked .home-actions.grid button:before,#root.carthage-home-locked #carthage-part3-start:before{content:attr(data-qarton-icon);display:block;min-height:14px;margin-bottom:2px;color:var(--q-gold);font:700 14px/1 system-ui}
#root.carthage-home-locked .home-actions.grid button:active,#root.carthage-home-locked #carthage-part3-start:active{transform:scale(.975)!important;filter:brightness(1.18)!important}
#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=primary],#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=continue]{grid-column:1/-1!important;min-height:49px!important}
#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=primary]{border-color:#ffe29d!important;background:linear-gradient(105deg,#8b3039,#57232e 53%,#18263a)!important;color:#fff5df!important;font-size:13px!important}
#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=continue]{border-color:#e8c477!important;background:linear-gradient(105deg,#23464a,#172b3d)!important}
#root.carthage-home-locked .home-actions.grid button[data-qarton-kind=part3],#root.carthage-home-locked #carthage-part3-start{border-color:#8e805e!important;background:linear-gradient(145deg,#282033,#151c2b)!important}
#root.carthage-home-locked #carthage-part3-start{grid-column:1/-1!important;min-height:43px!important}
#root.carthage-home-locked #carthage-part3-start:disabled{opacity:.68!important;filter:saturate(.65)}
#root.carthage-home-locked #qarton-home-info{position:fixed;z-index:900;left:18px;right:18px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);display:flex;justify-content:center;align-items:center;gap:8px;color:#c9c2b4;font:700 8px/1.2 system-ui;letter-spacing:.6px;pointer-events:none}
#qarton-home-info .qarton-line{height:1px;flex:1;max-width:44px;background:linear-gradient(90deg,transparent,#c39b5b)}
#qarton-home-info .qarton-line:last-child{transform:scaleX(-1)}
@keyframes qBrand{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}}
@keyframes qMenu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(max-height:740px){#root.carthage-home-locked{padding-top:100px!important;padding-bottom:54px!important;gap:6px!important}#qarton-home-brand{top:calc(env(safe-area-inset-top,0px) + 6px)!important}#qarton-home-brand .qarton-mark{width:29px;height:29px}#qarton-home-brand strong{font-size:17px}#qarton-home-brand .qarton-game-title{margin-top:5px;font-size:18px}#qarton-home-brand .qarton-game-sub{font-size:8px}#root.carthage-home-locked .qarton-achievements{max-height:76px!important;padding:6px 9px!important}#root.carthage-home-locked .home-actions.grid{padding:8px!important;gap:6px!important;max-height:calc(100dvh - 205px - env(safe-area-inset-bottom,0px))!important}#root.carthage-home-locked .home-actions.grid button,#root.carthage-home-locked #carthage-part3-start{min-height:38px!important;padding:5px!important;font-size:10px!important}}
@media(max-height:620px){#root.carthage-home-locked{padding-top:84px!important;padding-bottom:46px!important;gap:4px!important}#qarton-home-brand .qarton-game-sub{display:none}#qarton-home-brand .qarton-game-title{font-size:16px}#root.carthage-home-locked .qarton-achievements{max-height:56px!important;padding:4px 7px!important}#root.carthage-home-locked .home-actions.grid{padding:6px!important;gap:4px!important;max-height:calc(100dvh - 158px - env(safe-area-inset-bottom,0px))!important}#root.carthage-home-locked .home-actions.grid button:before{display:none}#root.carthage-home-locked .home-actions.grid button,#root.carthage-home-locked #carthage-part3-start{min-height:34px!important;padding:4px!important}}
@media(prefers-reduced-motion:reduce){#root.carthage-home-locked #qarton-home-brand,#root.carthage-home-locked .home-actions.grid{animation:none!important}#root.carthage-home-locked .home-actions.grid button,#root.carthage-home-locked #carthage-part3-start{transition:none!important}}
`;
function style(){if(document.getElementById("qarton-premium-home-style"))return;var s=document.createElement("style");s.id="qarton-premium-home-style";s.textContent=css;document.head.appendChild(s)}
function playing(root){return !!(root&&root.querySelector(".game-timer"))}
function decorate(root){
var menu=root.querySelector(".home-actions.grid");if(!menu)return;
Array.from(menu.querySelectorAll("button")).forEach(function(b,i){
var t=(b.textContent||"").trim(),kind="secondary",icon="✦";
if(/متابعة|استكمال|آخر حفظ/.test(t)||b.id==="carthage-continue-last"){kind="continue";icon="▶"}
else if(/ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test(t)){kind="primary";icon="⚔"}
else if(/الجزء الثالث|الجزء 3/.test(t)){kind="part3";icon="◆"}
else if(/الجزء الثاني/.test(t)){kind="part2";icon="◈"}
else if(/حفظ|استيراد|تصدير/.test(t)){icon="▣"}
else if(/إعدادات|الخيارات/.test(t)){icon="⚙"}
b.dataset.qartonKind=kind;b.dataset.qartonIcon=icon;b.setAttribute("data-qarton-home-action",String(i+1));
});
}
function markAchievements(root){
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
if(playing(root)){var a=document.getElementById("qarton-home-brand"),f=document.getElementById("qarton-home-info");if(a)a.remove();if(f)f.remove();return}
var menu=root.querySelector(".home-actions.grid");
var start=Array.from(root.querySelectorAll("button")).find(function(b){return /ابدأ الجزء الأول/.test(b.textContent||"")});
if(!menu&&!start)return;
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
var queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mount()})}
function boot(){var root=document.getElementById("root");if(root)new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true});mount()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();