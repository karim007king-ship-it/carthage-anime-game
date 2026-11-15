// QARTON cinematic scene adapters. Background discovery is owned by qarton-scene-backgrounds.cjs.
module.exports = function injectCinematicSceneRuntimes(html) {
const cinematicExpansion = \`<style id="carthage-cinematic-scene-style">
@keyframes carthageSceneDrift{from{transform:scale(1) translate3d(0,0,0);filter:saturate(1) contrast(1)}to{transform:scale(1.035) translate3d(-.35%,.15%,0);filter:saturate(1.06) contrast(1.03)}}
#root.carthage-cinematic-scene{isolation:isolate}
#root.carthage-cinematic-scene .carthage-cinematic-scene-subject{animation:carthageSceneDrift 26s cubic-bezier(.2,.65,.25,1) infinite alternate;transform-origin:center center;will-change:transform,filter}
@media(prefers-reduced-motion:reduce){#root.carthage-cinematic-scene .carthage-cinematic-scene-subject{animation:none;will-change:auto}}
</style>
<script id="carthage-cinematic-scene-runtime">
(function(){
 if(window.__carthageCinematicScene)return;window.__carthageCinematicScene=true;
 var root=null,last=null;
 function apply(){root=document.getElementById("root");if(!root)return;
  var state=window.__QARTON_APP_STATE__,info=window.__CARTHAGE_ACTIVE_BACKGROUND__;
  var target=(state==="GAME"||state==="INTRO")&&info&&info.state==="ready"&&info.element&&info.element.isConnected?info.element:null;
  root.classList.toggle("carthage-cinematic-scene",!!target);
  if(last&&last!==target)last.classList.remove("carthage-cinematic-scene-subject");
  if(target){target.classList.add("carthage-cinematic-scene-subject");last=target}else if(last){last.classList.remove("carthage-cinematic-scene-subject");last=null}
 }
 window.addEventListener("carthage:backgroundchange",apply);window.addEventListener("qarton:statechange",apply);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();
</script>\`;
html = html.replace("</body>", cinematicExpansion + "</body>");
const cinematicTransitions = \`<style id="carthage-scene-transition-style">
@keyframes carthageSceneFadeThrough{0%{opacity:1}100%{opacity:0}}
#carthage-scene-transition{position:fixed;inset:0;z-index:2147483001;pointer-events:none;background:#050509;opacity:0}
#carthage-scene-transition.is-cutting{animation:carthageSceneFadeThrough .72s cubic-bezier(.7,0,.2,1) both}
@media(prefers-reduced-motion:reduce){#carthage-scene-transition.is-cutting{animation:none;opacity:0}}
</style>
<script id="carthage-scene-transition-runtime">
(function(){
 if(window.__carthageSceneTransitions)return;window.__carthageSceneTransitions=true;
 var lastScene="",overlay=null;
 function cutTo(info){if(!info||info.state!=="ready"||!info.url)return;if(!lastScene){lastScene=info.url;return}if(info.url===lastScene)return;lastScene=info.url;
  if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  if(!overlay){overlay=document.createElement("div");overlay.id="carthage-scene-transition";overlay.setAttribute("aria-hidden","true");document.body.appendChild(overlay)}
  overlay.classList.remove("is-cutting");void overlay.offsetWidth;overlay.classList.add("is-cutting")
 }
 window.addEventListener("carthage:backgroundchange",function(e){cutTo(e.detail||window.__CARTHAGE_ACTIVE_BACKGROUND__)});
})();
</script>\`;
html = html.replace("</body>", cinematicTransitions + "</body>");
return html;
};
