(function(){
'use strict';
if(window.__qartonHomeV2Installed)return;
window.__qartonHomeV2Installed=true;
const css=`
#qarton-home-v2{position:fixed;inset:0;z-index:2147482500;box-sizing:border-box;width:100%;height:100dvh;display:flex;flex-direction:column;align-items:center;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:radial-gradient(ellipse at 50% 10%,#65202e 0%,transparent 55%),linear-gradient(155deg,#07090e,#111b2a 60%,#07090e);color:#f9ebd4;font-family:system-ui,sans-serif;direction:rtl;padding:calc(env(safe-area-inset-top,0px) + 16px) 12px calc(env(safe-area-inset-bottom,0px) + 12px)}
#qarton-home-v2 .qv-wrap{box-sizing:border-box;width:100%;max-width:540px;min-height:100%;display:flex;flex-direction:column;justify-content:center;gap:8px}
#qarton-home-v2 .qv-brand{text-align:center;color:#e9c67e;font-size:15px;font-weight:900;letter-spacing:4px}
#qarton-home-v2 .qv-tag{text-align:center;color:#a99a88;font-size:9px;letter-spacing:2px;direction:ltr}
#qarton-home-v2 h1{text-align:center;font-size:clamp(29px,8vw,44px);line-height:1.1;margin:4px 0 0;color:#fff6e9}
#qarton-home-v2 .qv-sub{text-align:center;color:#e9c67e;font-size:13px;font-weight:800}
#qarton-home-v2 .qv-description{text-align:center;color:#c6bdad;font-size:12px;line-height:1.6;margin:0}
#qarton-home-v2 .qv-section{border:1px solid #c59a5666;border-radius:16px;background:#0d1421d9;padding:11px;display:grid;gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))}
#qarton-home-v2 .qv-section-title{grid-column:1/-1;color:#e9c67e;font-size:11px;font-weight:800}
#qarton-home-v2 button{min-width:0;min-height:44px;border:1px solid #9e7b4e;border-radius:11px;background:linear-gradient(135deg,#273346,#121927);color:#fff0d4;font:800 12px/1.3 system-ui;padding:9px 7px;cursor:pointer}
#qarton-home-v2 button.qv-primary{grid-column:1/-1;background:linear-gradient(110deg,#8c303d,#4c1b2c);border-color:#e9c67e;font-size:15px;min-height:52px}
#qarton-home-v2 .qv-section button[data-qarton-kind="continue"],#qarton-home-v2 .qv-section button[data-qarton-kind="restore"]{grid-column:1/-1}
#qarton-home-v2 button:disabled{opacity:.48;cursor:not-allowed}
#qarton-home-v2 button:focus-visible{outline:2px solid #fff0b5;outline-offset:2px}
#qarton-home-v2 .qv-difficulty{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
#qarton-home-v2 .qv-difficulty button{min-height:34px;font-size:11px;padding:6px 12px}
#qarton-home-v2 .qv-difficulty button[aria-pressed=true]{border-color:#f3d58b;background:#71313a}
#qarton-home-v2 .qv-bottom{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
#qarton-home-v2 .qv-bottom button{min-height:34px;font-size:10px}
#qarton-home-v2 .qv-brand-row{display:flex;align-items:center;justify-content:center;gap:12px;direction:ltr;color:#e9c67e}
#qarton-home-v2 .qv-mark{display:grid;place-items:center;width:56px;height:56px;border:2px solid #e9c67e;border-radius:15px 6px 15px 6px;background:linear-gradient(145deg,#61242d,#101827);color:#fff0d4;font:900 38px/1 Georgia,serif}
#qarton-home-v2 .qv-brand-name{font:900 clamp(25px,7vw,36px)/1 system-ui;letter-spacing:5px}
#qarton-home-v2 .qv-tag{text-align:left;font-size:11px;letter-spacing:1.5px;color:#d2c39f}
#qarton-home-v2 .qv-arabic-mark{text-align:center;color:#fff0d4;font:900 clamp(28px,8vw,40px)/1.2 system-ui;margin-top:12px}
#qarton-home-v2 .qv-title{text-align:center;color:#e9c67e;font-size:clamp(20px,6vw,28px);font-weight:900;margin:0}
#qarton-home-v2 .qv-description{font-size:clamp(12px,3.5vw,15px);line-height:1.55;margin:5px auto 2px;max-width:560px}
#qarton-home-v2 .qv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:100%;margin-top:6px}
#qarton-home-v2 .qv-card{position:relative;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:8px;min-height:clamp(180px,28vh,410px);padding:14px 15px;text-align:right;direction:rtl;border:1px solid #b89a63;border-radius:27px;background:linear-gradient(145deg,#1c2a3b,#10121e 76%);box-shadow:inset 5px 0 #b89a6377,0 8px 22px #0006;transition:transform .15s ease,border-color .15s ease}
#qarton-home-v2 .qv-card:active{transform:scale(.98);border-color:#f1d182}
#qarton-home-v2 .qv-card-num{align-self:flex-end;color:#e9c67e;font-size:17px;font-weight:900;letter-spacing:2px}
#qarton-home-v2 .qv-card-icon{display:grid;place-items:center;width:48px;height:48px;border:1px solid #927b54;border-radius:17px;color:#e9c67e;font-size:26px}
#qarton-home-v2 .qv-card-title{font-size:clamp(17px,4.5vw,22px);font-weight:900;color:#fff0d4}
#qarton-home-v2 .qv-card-sub{font-size:clamp(10px,3vw,13px);line-height:1.55;color:#c9c2b5;font-weight:500}
#qarton-home-v2 .qv-footer{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;color:#bba779;font-size:11px;font-weight:800;text-align:center}
#qarton-home-v2 .qv-panel{width:100%;border:1px solid #c59a5666;border-radius:18px;background:#0d1421ed;padding:12px;display:grid;gap:9px}
#qarton-home-v2 .qv-panel h2{margin:0;text-align:center;color:#e9c67e;font-size:20px}
#qarton-home-v2 .qv-back{min-height:40px;width:100%;background:#171d2a;border-color:#e9c67e;color:#f8e8c7}
#qarton-home-v2 .qv-panel details{border:1px solid #77694e;border-radius:12px;padding:10px;background:#0a101b}
#qarton-home-v2 .qv-panel summary{cursor:pointer;font-weight:900;color:#e9c67e}
@media(max-width:380px){#qarton-home-v2 .qv-grid{gap:7px}#qarton-home-v2 .qv-card{min-height:138px;padding:10px;border-radius:20px}#qarton-home-v2 .qv-card-icon{width:40px;height:40px;font-size:22px}#qarton-home-v2 .qv-brand-name{letter-spacing:3px}}
@media(max-height:740px){#qarton-home-v2 .qv-card{min-height:clamp(142px,19vh,175px)}}
@media(max-height:650px){#qarton-home-v2 .qv-wrap{justify-content:flex-start;gap:6px}#qarton-home-v2 h1{font-size:28px}#qarton-home-v2 .qv-section{padding:7px;gap:5px}#qarton-home-v2 button{min-height:36px}}
`;
const portraitCss="\n/* QARTON mobile portrait: one coherent compact layout, readable buttons and balanced spacing. */\n@media (orientation:portrait){\n#qarton-home-v2{padding-top:calc(env(safe-area-inset-top,0px) + 28px)!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 14px)!important}\n#qarton-home-v2 .qv-wrap{max-width:480px!important;margin:auto!important;gap:9px!important;justify-content:center!important}\n#qarton-home-v2 .qv-brand{font-size:15px!important}\n#qarton-home-v2 h1{font-size:clamp(24px,7vw,36px)!important;line-height:1.25!important}\n#qarton-home-v2 .qv-description{font-size:11px!important;line-height:1.5!important}\n#qarton-home-v2 .qv-section{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;padding:10px!important}\n#qarton-home-v2 .qv-section button{min-height:48px!important;font-size:12px!important;line-height:1.35!important;overflow-wrap:anywhere!important}\n#qarton-home-v2 .qv-section button.qv-primary{min-height:50px!important;font-size:15px!important}\n#qarton-home-v2 .qv-settings{margin-top:2px!important}\n}\n@media (orientation:portrait) and (max-width:380px){#qarton-home-v2 .qv-wrap{gap:6px!important}#qarton-home-v2 .qv-section{gap:5px!important;padding:7px!important}#qarton-home-v2 .qv-section button{font-size:11px!important;padding:6px 4px!important}}\n";
const settingsCss="#qarton-home-v2 .qv-settings{border:1px solid #c59a5666;border-radius:10px;padding:7px;background:#0d1421d9}#qarton-home-v2 .qv-settings summary{font-size:11px;font-weight:800;color:#e9c67e;cursor:pointer;text-align:center}#qarton-home-v2 .qv-settings .qv-bottom{padding-top:8px}";
const compactCss="\n/* Mobile compact layout: status-bar clearance, less wrapping, and bounded screen height. */\n#qarton-home-v2{overflow:auto!important;padding-top:calc(env(safe-area-inset-top,0px) + 44px)!important}\n#qarton-home-v2 .qv-wrap{justify-content:flex-start!important;min-height:0!important;gap:5px!important}\n#qarton-home-v2 .qv-brand{font-size:12px!important;letter-spacing:2px!important}\n#qarton-home-v2 .qv-tag{font-size:8px!important}\n#qarton-home-v2 h1{font-size:clamp(25px,6vw,34px)!important;margin:0!important}\n#qarton-home-v2 .qv-sub{font-size:11px!important}\n#qarton-home-v2 .qv-description{font-size:10px!important;line-height:1.35!important}\n#qarton-home-v2 .qv-section{padding:7px!important;gap:5px!important;border-radius:12px!important}\n#qarton-home-v2 .qv-section-title{font-size:10px!important}\n#qarton-home-v2 button{min-height:36px!important;padding:6px!important;font-size:10px!important;line-height:1.2!important}\n#qarton-home-v2 button.qv-primary{min-height:43px!important;font-size:12px!important}\n#qarton-home-v2 .qv-difficulty button{min-height:30px!important}\n#qarton-home-v2 .qv-bottom{gap:5px!important}\n#qarton-home-v2 .qv-bottom button{min-height:30px!important;font-size:9px!important}\n@media(max-height:740px){#qarton-home-v2{padding-top:calc(env(safe-area-inset-top,0px) + 34px)!important}#qarton-home-v2 .qv-wrap{gap:3px!important}#qarton-home-v2 .qv-description{font-size:9px!important}#qarton-home-v2 button{min-height:32px!important}#qarton-home-v2 button.qv-primary{min-height:38px!important}}\n";
const style=document.createElement('style');style.id='qarton-home-v2-style';style.textContent=css+compactCss+settingsCss+portraitCss;document.head.appendChild(style);
let overlay=null,queued=false,signature='',activePanel='home';
function isStory(root){return !!root.querySelector('.game-timer')}
function getMenu(root){return root.querySelector('.home-actions.grid')}
function make(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el}
function actionKey(source){
 const label=(source.textContent||'').trim().replace(/\s+/g,' ');
 if((/متابعة|استكمال/.test(label)&&/حفظ/.test(label))||source.id==='carthage-continue-last')return 'continue';
 if(/ابدأ الجزء الأول|ابدأ من البداية|لعبة جديدة/.test(label))return 'start';
 if(/الجزء الثاني|part\s*2/i.test(label))return 'part2';
 if(/الجزء الثالث|الجزء 3|part\s*3/i.test(label))return 'part3';
 if(source.tagName==='LABEL'&&source.querySelector('input[type="file"]'))return 'restore';
 return label.toLocaleLowerCase();
}
function cloneAction(source,cls,kind){
 const button=make('button',cls,(source.textContent||'').trim());
 button.type='button';button.disabled=!!source.disabled;
 if(kind)button.setAttribute('data-qarton-kind',kind);
 button.addEventListener('click',()=>{if(!source.isConnected||source.disabled)return;source.click();schedule()});
 return button;
}
function remove(){if(overlay){overlay.remove();overlay=null}signature='';activePanel='home'}
function panelButton(parent,label,source,cls){if(source){parent.append(cloneAction(source,cls||'',actionKey(source)));return}const b=make('button',cls||'',label);b.type='button';b.disabled=true;b.title='هذا الخيار غير متاح في نسخة اللعبة الحالية';parent.append(b)}
function showPanel(root,wrap,actions,difficulty,extras){
 const panel=make('section','qv-panel');
 const back=make('button','qv-back','→ الرجوع إلى القائمة');back.type='button';back.addEventListener('click',()=>{activePanel='home';schedule()});
 wrap.append(back);
 if(activePanel==='story'){
  panel.append(make('h2','','القصة والأجزاء'));
  const byKind={};actions.forEach(a=>{if(!byKind[a.kind])byKind[a.kind]=a.source});
  panelButton(panel,'ابدأ الجزء الأول',byKind.start,'qv-primary');
  panelButton(panel,'متابعة آخر حفظ',byKind.continue,'');
  panelButton(panel,'الجزء الثاني',byKind.part2,'');
  panelButton(panel,'الجزء الثالث',byKind.part3,'');
  if(byKind.restore)panelButton(panel,'استرجاع حفظ من ملف',byKind.restore,'');
  if(difficulty.length){const title=make('div','qv-section-title','مستوى الصعوبة');panel.append(title);const group=make('div','qv-difficulty');difficulty.forEach(b=>{const c=cloneAction(b);if(b.getAttribute('aria-pressed'))c.setAttribute('aria-pressed',b.getAttribute('aria-pressed'));group.append(c)});panel.append(group)}
 }else if(activePanel==='progress'){
  panel.append(make('h2','','التقدم والحفظ'));
  const byKind={};actions.forEach(a=>{if(!byKind[a.kind])byKind[a.kind]=a.source});
  panelButton(panel,'متابعة آخر حفظ',byKind.continue,'qv-primary');
  const save=extras.find(b=>/حفظ/.test(b.textContent||'')&&!/خانات/.test(b.textContent||''));
  const slots=extras.find(b=>/خانات الجلسة/.test(b.textContent||''));
  panelButton(panel,'حفظ التقدم',save,'');panelButton(panel,'خانات الحفظ',slots,'');
  if(byKind.restore)panelButton(panel,'استرجاع حفظ من ملف',byKind.restore,'');
 }else if(activePanel==='settings'){
  panel.append(make('h2','','الإعدادات والصوت'));
  const settings=root.querySelector('.home-tog label');
  panelButton(panel,'الإعدادات والصوت',settings,'');
  extras.filter(b=>!/حفظ|خانات/.test(b.textContent||'')).forEach(b=>panel.append(cloneAction(b,'')));
  if(difficulty.length){panel.append(make('div','qv-section-title','مستوى الصعوبة'));const group=make('div','qv-difficulty');difficulty.forEach(b=>{const c=cloneAction(b);if(b.getAttribute('aria-pressed'))c.setAttribute('aria-pressed',b.getAttribute('aria-pressed'));group.append(c)});panel.append(group)}
 }else if(activePanel==='world'){
  panel.append(make('h2','','عالم قرطاج'));
  const details=Array.from(root.querySelectorAll('details')).filter(d=>/كيفاش تلعب|الشخصيات|الأماكن|النهايات|قرطاج/.test((d.querySelector('summary')||d).textContent||''));
  if(details.length){details.forEach(d=>{const copy=d.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));panel.append(copy)})}
  else panel.append(make('p','qv-description','اكتشف شخصيات القصة وأماكنها وأسرارها من داخل اللعبة.'));
 }
 wrap.append(panel);
}
function render(){
 queued=false;
 const root=document.getElementById('root');
 if(!root||isStory(root)){remove();return}
 const menu=getMenu(root);
 if(!menu){remove();return}
 const original=Array.from(menu.querySelectorAll('button,label')).filter(el=>!el.closest('#qarton-home-v2')&&(el.tagName==='BUTTON'||el.querySelector('input[type="file"]')));
 if(!original.length){remove();return}
 const difficulty=Array.from(root.querySelectorAll('[aria-label="اختار الصعوبة"] button')).filter(b=>!b.closest('#qarton-home-v2'));
 const extras=Array.from(root.querySelectorAll('.home-set button')).filter(b=>!b.closest('#qarton-home-v2'));
 const uniqueOriginal=[];const seenActions=new Set();
 original.forEach(b=>{const kind=actionKey(b);if(seenActions.has(kind))return;seenActions.add(kind);uniqueOriginal.push({source:b,kind:kind})});
 const tracked=[...uniqueOriginal.map(action=>action.source),...difficulty,...extras];
 const current=activePanel+'|'+tracked.map(b=>[b.textContent,b.disabled,b.getAttribute('aria-pressed')].join(':')).join('|');
 if(overlay&&current===signature)return;
 signature=current;
 if(overlay)overlay.remove();
 overlay=make('section');overlay.id='qarton-home-v2';overlay.setAttribute('aria-label','واجهة QARTON الرئيسية');
 const wrap=make('div','qv-wrap');
 const brand=make('div','qv-brand-row');brand.append(make('span','qv-mark','Q'),make('div','', ''));
 const word=brand.lastChild;word.append(make('div','qv-brand-name','QARTON'),make('div','qv-tag','CULTURE • POWER • CINEMA'));
 wrap.append(brand,make('div','qv-arabic-mark','قَرْطَاج'),make('h1','qv-title','آخر يوم في قرطاج'),make('p','qv-description','حكاية تفاعلية من التاريخ... قراراتك ترسم الطريق ومصير قرطاج.'));
 if(activePanel==='home'){
  const grid=make('div','qv-grid');
  const cards=[['01','⚔','القصة','بداية جديدة • الأجزاء المتاحة','story'],['02','⌖','عالم قرطاج','الشخصيات • الأماكن • دليل المدينة','world'],['03','▣','التقدم والحفظ','متابعة تقدمك • النسخ الاحتياطية','progress'],['04','⚙','الإعدادات','الصوت السينمائي • مستوى الصوت','settings']];
  cards.forEach(([num,icon,title,sub,key])=>{const card=make('button','qv-card');card.type='button';card.setAttribute('aria-label',title);card.append(make('span','qv-card-num',num),make('span','qv-card-icon',icon),make('span','qv-card-title',title),make('span','qv-card-sub',sub));card.addEventListener('click',()=>{activePanel=key;schedule()});grid.append(card)});
  wrap.append(grid,make('div','qv-footer','— QARTON • رحلتك • اختياراتك • مصيرك —'));
 }else showPanel(root,wrap,uniqueOriginal,difficulty,extras);
 overlay.append(wrap);document.body.append(overlay);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(render)}
function boot(){const root=document.getElementById('root');if(!root){setTimeout(boot,100);return}const observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','class','aria-pressed']});render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
