(function(){
if(window.__qartonPremiumHomeInstalled)return;
window.__qartonPremiumHomeInstalled=true;
function style(){var sheet=document.getElementById("qarton-premium-home-style");if(sheet)sheet.media="all"}
function playing(root){return !!(root&&root.querySelector(".game-timer"))}
function decorateGameplay(root){
if(!root)return;
root.classList.add("qarton-game-ui");
Array.from(root.querySelectorAll(".dialogue-panel,.theatre-text,.search-layer")).forEach(function(node){node.classList.add("qarton-game-card")});
Array.from(root.querySelectorAll(".dialogue-panel button,.choice-stack button,.game-choices button,.game-pill-btn,.map-pill")).forEach(function(button){
button.classList.add("qarton-game-control");
});
}
function findMenu(root){
// Prefer the native action grid; tolerate a wrapper whose utility "grid" class was lost.
var menu=root.querySelector(".home-actions.grid");
if(menu&&Array.from(menu.querySelectorAll("button")).length<2)menu=null;
if(!menu){
var looseMenu=root.querySelector(".home-actions");
if(looseMenu&&Array.from(looseMenu.querySelectorAll("button")).length>=2){
menu=looseMenu;menu.classList.add("grid");
}
}
if(!menu){
var buttons=Array.from(root.querySelectorAll("button"));
var hasPartOne=buttons.some(function(b){return /ابدأ الجزء الأول/.test((b.textContent||"").trim())});
var hasPartTwo=buttons.some(function(b){return /الجزء الثاني/.test((b.textContent||"").trim())||b.id==="btn-part2"});
var difficulty=!!root.querySelector('[aria-label="اختار الصعوبة"]');
// The difficulty selector is unique to the home screen and remains stable if React changes button wording.
if(!hasPartOne||!hasPartTwo){
if(!difficulty||buttons.length<3)return null;
var first=buttons.find(function(b){return /ابدأ|جديد|الجزء|متابعة|حفظ|إعدادات/.test((b.textContent||"").trim())})||buttons[0];
var fallback=first&&first.parentElement;
while(fallback&&fallback!==root){
if(Array.from(fallback.querySelectorAll("button")).length>=3){menu=fallback;break}
fallback=fallback.parentElement;
}
}else{
var start=buttons.find(function(b){return /ابدأ الجزء الأول/.test((b.textContent||"").trim())});
if(start){
var candidate=start.parentElement;
while(candidate&&candidate!==root){
var candidateButtons=Array.from(candidate.querySelectorAll("button"));
var candidateHasPartTwo=candidateButtons.some(function(b){return /الجزء الثاني/.test((b.textContent||"").trim())||b.id==="btn-part2"});
if(candidateButtons.length>=3&&candidateHasPartTwo){menu=candidate;break}
candidate=candidate.parentElement;
}
}
}
if(menu)menu.classList.add("home-actions","grid");
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
// The isolated overlay is the only active home renderer. Keep this adapter for gameplay styling only.
if(window.__qartonHomeIsolationInstalled&&!playing(root)){
root.classList.remove("carthage-home-locked");
document.documentElement.classList.remove("carthage-home-locked");
document.body.classList.remove("carthage-home-locked");
var sheet=document.getElementById("qarton-premium-home-style");if(sheet)sheet.media="not all";
var brand=document.getElementById("qarton-home-brand"),info=document.getElementById("qarton-home-info");
if(brand)brand.remove();if(info)info.remove();
return;
}
if(playing(root)){decorateGameplay(root);var a=document.getElementById("qarton-home-brand"),f=document.getElementById("qarton-home-info");if(a)a.remove();if(f)f.remove();root.classList.remove("carthage-home-locked");document.documentElement.classList.remove("carthage-home-locked");document.body.classList.remove("carthage-home-locked");if(observer){observer.disconnect();observer=null}watchGameplayEnd(root);return}root.classList.remove("qarton-game-ui");
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
var currentRoot=document.getElementById("root");if(playing(currentRoot)){decorateGameplay(currentRoot);if(returnTimer){clearTimeout(returnTimer);returnTimer=0}return}
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
function boot(){if(observer)return;observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]});mount()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();