(function(){
'use strict';
if(window.__qartonHomeV2Installed)return;
window.__qartonHomeV2Installed=true;
const css=`
#qarton-home-v2{position:fixed;inset:0;z-index:2147482500;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;overflow:auto;overscroll-behavior:contain;background:radial-gradient(ellipse at 50% 10%,#65202e 0%,transparent 55%),linear-gradient(155deg,#07090e,#111b2a 60%,#07090e);color:#f9ebd4;font-family:system-ui,sans-serif;direction:rtl;padding:calc(env(safe-area-inset-top,0px) + 32px) 12px calc(env(safe-area-inset-bottom,0px) + 8px)}
#qarton-home-v2 .qv-wrap{width:100%;max-width:540px;min-height:100%;display:flex;flex-direction:column;justify-content:center;gap:10px}
#qarton-home-v2 .qv-brand{text-align:center;color:#e9c67e;font-size:15px;font-weight:900;letter-spacing:4px}
#qarton-home-v2 .qv-tag{text-align:center;color:#a99a88;font-size:9px;letter-spacing:2px;direction:ltr}
#qarton-home-v2 h1{text-align:center;font-size:clamp(29px,8vw,44px);line-height:1.1;margin:4px 0 0;color:#fff6e9}
#qarton-home-v2 .qv-sub{text-align:center;color:#e9c67e;font-size:13px;font-weight:800}
#qarton-home-v2 .qv-description{text-align:center;color:#c6bdad;font-size:12px;line-height:1.6;margin:0}
#qarton-home-v2 .qv-section{border:1px solid #c59a5666;border-radius:16px;background:#0d1421d9;padding:11px;display:grid;gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))}
#qarton-home-v2 .qv-section-title{grid-column:1/-1;color:#e9c67e;font-size:11px;font-weight:800}
#qarton-home-v2 button{min-width:0;min-height:44px;border:1px solid #9e7b4e;border-radius:11px;background:linear-gradient(135deg,#273346,#121927);color:#fff0d4;font:800 12px/1.3 system-ui;padding:9px 7px;cursor:pointer}
#qarton-home-v2 button.qv-primary{grid-column:1/-1;background:linear-gradient(110deg,#8c303d,#4c1b2c);border-color:#e9c67e;font-size:15px;min-height:52px}
#qarton-home-v2 button:disabled{opacity:.48;cursor:not-allowed}
#qarton-home-v2 button:focus-visible{outline:2px solid #fff0b5;outline-offset:2px}
#qarton-home-v2 .qv-difficulty{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
#qarton-home-v2 .qv-difficulty button{min-height:34px;font-size:11px;padding:6px 12px}
#qarton-home-v2 .qv-difficulty button[aria-pressed=true]{border-color:#f3d58b;background:#71313a}
#qarton-home-v2 .qv-bottom{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
#qarton-home-v2 .qv-bottom button{min-height:34px;font-size:10px}
@media(max-height:650px){#qarton-home-v2 .qv-wrap{justify-content:flex-start;gap:6px}#qarton-home-v2 h1{font-size:28px}#qarton-home-v2 .qv-section{padding:7px;gap:5px}#qarton-home-v2 button{min-height:36px}}
`;
const portraitCss="\n/* QARTON mobile portrait: one coherent compact layout, readable buttons and balanced spacing. */\n@media (orientation:portrait){\n#qarton-home-v2{padding-top:calc(env(safe-area-inset-top,0px) + 28px)!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 14px)!important}\n#qarton-home-v2 .qv-wrap{max-width:480px!important;margin:auto!important;gap:9px!important;justify-content:center!important}\n#qarton-home-v2 .qv-brand{font-size:15px!important}\n#qarton-home-v2 h1{font-size:clamp(24px,7vw,36px)!important;line-height:1.25!important}\n#qarton-home-v2 .qv-description{font-size:11px!important;line-height:1.5!important}\n#qarton-home-v2 .qv-section{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;padding:10px!important}\n#qarton-home-v2 .qv-section button{min-height:48px!important;font-size:12px!important;line-height:1.35!important;overflow-wrap:anywhere!important}\n#qarton-home-v2 .qv-section button.qv-primary{min-height:50px!important;font-size:15px!important}\n#qarton-home-v2 .qv-settings{margin-top:2px!important}\n}\n@media (orientation:portrait) and (max-width:380px){#qarton-home-v2 .qv-wrap{gap:6px!important}#qarton-home-v2 .qv-section{gap:5px!important;padding:7px!important}#qarton-home-v2 .qv-section button{font-size:11px!important;padding:6px 4px!important}}\n";
const settingsCss="#qarton-home-v2 .qv-settings{border:1px solid #c59a5666;border-radius:10px;padding:7px;background:#0d1421d9}#qarton-home-v2 .qv-settings summary{font-size:11px;font-weight:800;color:#e9c67e;cursor:pointer;text-align:center}#qarton-home-v2 .qv-settings .qv-bottom{padding-top:8px}";
const compactCss="\n/* Mobile compact layout: status-bar clearance, less wrapping, and bounded screen height. */\n#qarton-home-v2{overflow:auto!important;padding-top:calc(env(safe-area-inset-top,0px) + 44px)!important}\n#qarton-home-v2 .qv-wrap{justify-content:flex-start!important;min-height:0!important;gap:5px!important}\n#qarton-home-v2 .qv-brand{font-size:12px!important;letter-spacing:2px!important}\n#qarton-home-v2 .qv-tag{font-size:8px!important}\n#qarton-home-v2 h1{font-size:clamp(25px,6vw,34px)!important;margin:0!important}\n#qarton-home-v2 .qv-sub{font-size:11px!important}\n#qarton-home-v2 .qv-description{font-size:10px!important;line-height:1.35!important}\n#qarton-home-v2 .qv-section{padding:7px!important;gap:5px!important;border-radius:12px!important}\n#qarton-home-v2 .qv-section-title{font-size:10px!important}\n#qarton-home-v2 button{min-height:36px!important;padding:6px!important;font-size:10px!important;line-height:1.2!important}\n#qarton-home-v2 button.qv-primary{min-height:43px!important;font-size:12px!important}\n#qarton-home-v2 .qv-difficulty button{min-height:30px!important}\n#qarton-home-v2 .qv-bottom{gap:5px!important}\n#qarton-home-v2 .qv-bottom button{min-height:30px!important;font-size:9px!important}\n@media(max-height:740px){#qarton-home-v2{padding-top:calc(env(safe-area-inset-top,0px) + 34px)!important}#qarton-home-v2 .qv-wrap{gap:3px!important}#qarton-home-v2 .qv-description{font-size:9px!important}#qarton-home-v2 button{min-height:32px!important}#qarton-home-v2 button.qv-primary{min-height:38px!important}}\n";
const style=document.createElement('style');style.id='qarton-home-v2-style';style.textContent=css+compactCss+settingsCss+portraitCss;document.head.appendChild(style);
let overlay=null,queued=false,signature='';
function isStory(root){return !!root.querySelector('.game-timer')}
function getMenu(root){return root.querySelector('.home-actions.grid')}
function make(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el}
function cloneAction(source,cls){
 const button=make('button',cls,(source.textContent||'').trim());
 button.type='button';button.disabled=source.disabled;
 button.addEventListener('click',()=>{if(!source.isConnected||source.disabled)return;source.click();schedule()});
 return button;
}
function remove(){if(overlay){overlay.remove();overlay=null}signature=''}
function render(){
 queued=false;
 const root=document.getElementById('root');
 if(!root||isStory(root)){remove();return}
 const menu=getMenu(root);
 if(!menu){remove();return}
 const original=Array.from(menu.querySelectorAll('button')).filter(b=>!b.closest('#qarton-home-v2'));
 if(!original.length){remove();return}
 const difficulty=Array.from(root.querySelectorAll('[aria-label="اختار الصعوبة"] button')).filter(b=>!b.closest('#qarton-home-v2'));
 const extras=Array.from(root.querySelectorAll('.home-set button')).filter(b=>!b.closest('#qarton-home-v2'));
 const uniqueOriginal=[];const seenActions=new Set();
 original.forEach(b=>{const label=(b.textContent||'').trim().replace(/\\s+/g,' ');const kind=/متابعة|استكمال/.test(label)&&/حفظ/.test(label)?'continue':label;if(seenActions.has(kind))return;seenActions.add(kind);uniqueOriginal.push(b)});
 const current=[...uniqueOriginal,...difficulty,...extras].map(b=>[b.textContent,b.disabled,b.getAttribute('aria-pressed')].join(':')).join('|');
 if(overlay&&current===signature)return;
 signature=current;
 if(overlay)overlay.remove();
 overlay=make('section');overlay.id='qarton-home-v2';overlay.setAttribute('aria-label','واجهة QARTON الرئيسية');
 const wrap=make('div','qv-wrap');
 wrap.append(make('div','qv-brand','QARTON'),make('div','qv-tag','CULTURE • POWER • CINEMA'),make('h1','', 'آخر يوم في قرطاج'),make('div','qv-sub','بالأنمي'),make('p','qv-description','60 دقيقة… ومدينة كاملة باش طيح. خريطة، ثقة، 5 أدلة، و9 نهايات.'));
 if(difficulty.length){const group=make('div','qv-difficulty');difficulty.forEach(b=>{const c=cloneAction(b);if(b.getAttribute('aria-pressed'))c.setAttribute('aria-pressed',b.getAttribute('aria-pressed'));group.append(c)});wrap.append(group)}
 const section=make('div','qv-section');section.append(make('div','qv-section-title','اختار رحلتك'));
 uniqueOriginal.forEach((b,i)=>{const label=(b.textContent||'').trim();section.append(cloneAction(b,/ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test(label)||i===0?'qv-primary':''))});
 wrap.append(section);
 if(extras.length){const details=make('details','qv-settings');const summary=make('summary','','الإعدادات والخيارات');details.append(summary);const bottom=make('div','qv-bottom');extras.forEach(b=>bottom.append(cloneAction(b)));details.append(bottom);wrap.append(details)}
 overlay.append(wrap);document.body.append(overlay);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(render)}
function boot(){const root=document.getElementById('root');if(!root){setTimeout(boot,100);return}const observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','class','aria-pressed']});render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
