(function(){
  if(window.__qartonPremiumHomeInstalled)return;
  window.__qartonPremiumHomeInstalled=true;
  var css=`
  :root{--qarton-gold:#e8bd68;--qarton-gold2:#fff0bd;--qarton-red:#7b1f2a;--qarton-ink:#090b12;--qarton-blue:#111b2d}
  html.carthage-home-locked,body.carthage-home-locked{background:#080a10!important}
  body.carthage-home-locked:before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at 50% 12%,rgba(123,31,42,.42),transparent 48%),radial-gradient(ellipse at 10% 85%,rgba(190,139,58,.13),transparent 42%),linear-gradient(155deg,#080a10 0%,#111827 52%,#090b12 100%)}
  #root.carthage-home-locked{box-sizing:border-box!important;padding:clamp(84px,13vh,118px) 14px clamp(66px,10vh,88px)!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
  #root.carthage-home-locked #qarton-home-brand{position:fixed;z-index:1000;top:calc(env(safe-area-inset-top,0px) + 12px);left:0;right:0;text-align:center;pointer-events:none}
  #qarton-home-brand .qarton-mark{display:inline-flex;align-items:center;justify-content:center;width:43px;height:43px;border:1px solid rgba(232,189,104,.85);border-radius:13px;transform:rotate(45deg);background:linear-gradient(145deg,rgba(123,31,42,.9),rgba(12,17,29,.96));box-shadow:0 0 24px rgba(232,189,104,.2),inset 0 0 14px rgba(232,189,104,.12);vertical-align:middle;margin-inline-end:12px}
  #qarton-home-brand .qarton-mark span{transform:rotate(-45deg);font:900 20px Georgia,serif;color:var(--qarton-gold2)}
  #qarton-home-brand .qarton-word{display:inline-block;vertical-align:middle;text-align:left}
  #qarton-home-brand strong{display:block;color:var(--qarton-gold2);font:900 21px/1.05 Georgia,serif;letter-spacing:3px;text-shadow:0 2px 16px #d7a64b55}
  #qarton-home-brand small{display:block;margin-top:5px;color:#c8b58e;font:700 8px/1.2 system-ui;letter-spacing:2px}
  #qarton-home-brand .qarton-game-title{display:block;margin-top:9px;color:#fff2d0;font:900 19px/1.25 system-ui;letter-spacing:.2px;text-shadow:0 3px 18px #000}
  #qarton-home-brand .qarton-game-sub{display:block;margin-top:3px;color:#b9bdc9;font:500 10px system-ui;letter-spacing:1px}
  #root.carthage-home-locked .home-actions.grid{width:min(100%,460px)!important;max-width:460px!important;margin:0 auto!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;align-content:center!important}
  #root.carthage-home-locked .home-actions.grid:before{content:"اختر رحلتك";grid-column:1/-1;display:block;text-align:center;color:#e7d5b2;font:800 12px system-ui;letter-spacing:2px;margin:0 0 5px}
  #root.carthage-home-locked .home-actions.grid button{min-height:54px!important;border:1px solid rgba(232,189,104,.58)!important;border-radius:15px!important;background:linear-gradient(145deg,rgba(34,43,59,.96),rgba(13,17,28,.98))!important;color:#fff0d0!important;font:800 13px/1.45 system-ui!important;box-shadow:0 8px 22px #0006,inset 0 1px 0 #ffffff12!important;transition:transform .18s ease,border-color .18s ease,filter .18s ease!important}
  #root.carthage-home-locked .home-actions.grid button:active{transform:scale(.975)!important;filter:brightness(1.18)!important}
  #root.carthage-home-locked .home-actions.grid button:first-of-type{grid-column:1/-1!important;min-height:62px!important;background:linear-gradient(110deg,#8a2630,#54202c 55%,#17243a)!important;border:1px solid #f0ca7c!important;color:#fff4d8!important;font-size:15px!important;box-shadow:0 10px 30px #0008,0 0 22px #c08b4230!important}
  #root.carthage-home-locked #carthage-continue-last{grid-column:1/-1!important;width:100%!important;min-height:58px!important;margin:0!important;background:linear-gradient(110deg,#243e45,#172b3c)!important;border-color:#e8bd68!important}
  #root.carthage-home-locked #carthage-part3-start{grid-column:1/-1!important;width:100%!important;margin:0!important}
  #root.carthage-home-locked #qarton-home-info{position:fixed;z-index:900;left:14px;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 13px);display:flex;justify-content:center;align-items:center;gap:9px;color:#c8c3b9;font:600 9px system-ui;letter-spacing:.6px;pointer-events:none}
  #qarton-home-info .qarton-line{height:1px;flex:1;max-width:48px;background:linear-gradient(90deg,transparent,#c39b5b)}
  #qarton-home-info .qarton-line:last-child{transform:scaleX(-1)}
  @media(max-height:690px){#root.carthage-home-locked{padding-top:78px!important;padding-bottom:58px!important}#qarton-home-brand .qarton-mark{width:34px;height:34px}#qarton-home-brand .qarton-game-title{font-size:16px;margin-top:5px}#root.carthage-home-locked .home-actions.grid{gap:7px!important}#root.carthage-home-locked .home-actions.grid button{min-height:46px!important;padding:8px!important}}
  @media(prefers-reduced-motion:reduce){#root.carthage-home-locked .home-actions.grid button{transition:none!important}}
  `;
  function installStyle(){if(!document.getElementById("qarton-premium-home-style")){var st=document.createElement("style");st.id="qarton-premium-home-style";st.textContent=css;document.head.appendChild(st)}}
  function mount(){
    var root=document.getElementById("root");
    if(!root||root.querySelector(".game-timer")){var old=document.getElementById("qarton-home-brand");if(old)old.remove();var foot=document.getElementById("qarton-home-info");if(foot)foot.remove();return}
    var menu=root.querySelector(".home-actions.grid");
    var start=Array.from(root.querySelectorAll("button")).find(function(b){return /ابدأ الجزء الأول/.test(b.textContent||"")});
    if(!menu&&!start)return;
    installStyle();
    if(!document.getElementById("qarton-home-brand")){
      var brand=document.createElement("div");brand.id="qarton-home-brand";brand.dir="rtl";
      brand.innerHTML='<span class="qarton-mark"><span>Q</span></span><span class="qarton-word"><strong>QARTON</strong><small>CULTURE • POWER • CINEMA</small></span><span class="qarton-game-title">قــــرطــــاج</span><span class="qarton-game-sub">حكاية من التاريخ… تُروى بأسلوب سينمائي</span>';
      root.appendChild(brand);
    }
    if(!document.getElementById("qarton-home-info")){
      var foot=document.createElement("div");foot.id="qarton-home-info";foot.dir="rtl";
      foot.innerHTML='<span class="qarton-line"></span><span>رحلتك • اختياراتك • مصيرك</span><span class="qarton-line"></span>';
      root.appendChild(foot);
    }
  }
  var queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mount()})}
  var observer=new MutationObserver(schedule);
  function start(){var root=document.getElementById("root");if(root)observer.observe(root,{subtree:true,childList:true,characterData:true});mount()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();