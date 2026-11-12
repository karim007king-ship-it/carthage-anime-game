(function(){
"use strict";
if(window.__qartonPremiumHomeInstalled)return;
window.__qartonPremiumHomeInstalled=true;
var root=null,observer=null,queued=false;
function decorateGameplay(node){
 if(!node)return;
 node.classList.add("qarton-game-ui");
 Array.from(node.querySelectorAll(".dialogue-panel,.theatre-text,.search-layer")).forEach(function(el){el.classList.add("qarton-game-card")});
 Array.from(node.querySelectorAll(".dialogue-panel button,.choice-stack button,.game-choices button,.game-pill-btn,.map-pill")).forEach(function(button){button.classList.add("qarton-game-control")});
}
function apply(){
 root=document.getElementById("root");
 if(!root)return;
 if(window.__QARTON_APP_STATE__!=="GAME"){
  if(observer){observer.disconnect();observer=null}
  root.classList.remove("qarton-game-ui");
  return;
 }
 decorateGameplay(root);
 if(!observer){observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true})}
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
window.addEventListener("qarton:statechange",schedule);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();