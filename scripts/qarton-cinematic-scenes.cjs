// QARTON cinematic story-scene adapters. Injected into the prepared WebView HTML only.
module.exports = function injectCinematicSceneRuntimes(html) {
const cinematicExpansion = `<style id="carthage-cinematic-scene-style">
@keyframes carthageSceneDrift{from{transform:scale(1) translate3d(0,0,0);filter:saturate(1) contrast(1)}to{transform:scale(1.035) translate3d(-.35%,.15%,0);filter:saturate(1.06) contrast(1.03)}}
#root.carthage-cinematic-scene{isolation:isolate}
#root.carthage-cinematic-scene:before{content:"";position:fixed;inset:0;z-index:7;pointer-events:none;background:radial-gradient(ellipse at center,transparent 48%,rgba(0,0,0,.24) 100%)}
#root.carthage-cinematic-scene .carthage-cinematic-scene-subject{animation:carthageSceneDrift 26s cubic-bezier(.2,.65,.25,1) infinite alternate;transform-origin:center center;will-change:transform,filter}
@media(prefers-reduced-motion:reduce){#root.carthage-cinematic-scene .carthage-cinematic-scene-subject{animation:none;will-change:auto}}
</style>
<script id="carthage-cinematic-scene-runtime">
(function(){
 if(window.__carthageCinematicScene)return;
 window.__carthageCinematicScene=true;
 var root=null,last=null,queued=false;
 function apply(){
  root=document.getElementById("root");if(!root)return;
  var active=!!root.querySelector(".game-timer");
  var images=active?Array.from(root.querySelectorAll("*")).filter(function(node){
   var r=node.getBoundingClientRect(),style=getComputedStyle(node);
   var loadedImg=node.tagName==="IMG"&&node.complete&&node.naturalWidth>0;
   var cssArtwork=/url\(/i.test(style.backgroundImage||"");
   return (loadedImg||cssArtwork)&&r.width>160&&r.height>100&&style.visibility!=="hidden"&&style.display!=="none";
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
  var candidates=Array.from(root.querySelectorAll("*")).filter(function(node){
   var r=node.getBoundingClientRect(),style=getComputedStyle(node);
   var loadedImg=node.tagName==="IMG"&&node.complete&&node.naturalWidth>0;
   var cssArtwork=/url\(/i.test(style.backgroundImage||"");
   return (loadedImg||cssArtwork)&&r.width>180&&r.height>110&&style.visibility!=="hidden"&&style.display!=="none";
  });
  candidates.sort(function(a,b){var x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return y.width*y.height-x.width*x.height});
  var node=candidates[0];if(!node)return "";
  if(node.tagName==="IMG")return node.currentSrc||node.src||"";
  var match=(getComputedStyle(node).backgroundImage||"").match(/url\((['"]?)(.*?)\1\)/i);
  return match?match[2]:"";
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


return html;
};
