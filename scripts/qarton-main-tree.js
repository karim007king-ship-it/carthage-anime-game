(function(){
  if (window.__qartonMainTreeInstalled) return;
  window.__qartonMainTreeInstalled = true;
  var root=null,shell=null,overlay=null,backButton=null,observer=null,rootWaiter=null,queued=false,started=false,view="tree",brand=null,footer=null,measure=null;
  var css = `
  #qarton-main-tree{position:fixed;inset:0;z-index:2147482000;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:clamp(7px,1.8vh,14px);padding:calc(env(safe-area-inset-top,0px) + 13px) 16px calc(env(safe-area-inset-bottom,0px) + 12px);overflow:hidden;direction:rtl;color:#fff0d2;background:radial-gradient(ellipse at 50% 5%,#7c293a55,transparent 38%),radial-gradient(ellipse at 8% 80%,#d2a65a20,transparent 34%),linear-gradient(155deg,#080b13 0%,#131d2c 55%,#090c14 100%);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
  #qarton-main-tree *{box-sizing:border-box}
  #qarton-main-tree .qt-brand{display:flex;align-items:center;justify-content:center;gap:9px;direction:ltr;flex:0 0 auto}
  #qarton-main-tree .qt-mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid #e8c477;border-radius:11px 4px 11px 4px;background:linear-gradient(145deg,#842e3b,#111b2a);color:#fff0d2;font:900 20px Georgia,serif;box-shadow:0 0 20px #e8c47725}
  #qarton-main-tree .qt-word{display:flex;flex-direction:column;gap:2px;text-align:left}
  #qarton-main-tree .qt-word strong{color:#e8c477;font-size:17px;line-height:1;letter-spacing:3px}
  #qarton-main-tree .qt-word small{color:#c9b994;font-size:7px;font-weight:700;letter-spacing:1.1px}
  #qarton-main-tree .qt-title{flex:0 0 auto;text-align:center;margin:0}
  #qarton-main-tree .qt-title strong{display:block;color:#fff0d2;font-size:clamp(24px,7vw,34px);font-weight:950;letter-spacing:2px;line-height:1.15;text-shadow:0 3px 18px #a7374b66}
  #qarton-main-tree .qt-title span{display:block;margin-top:3px;color:#e8c477;font-size:clamp(12px,3.5vw,15px);font-weight:800;letter-spacing:.4px}
  #qarton-main-tree .qt-summary{max-width:390px;margin:0;text-align:center;color:#c9c2b4;font-size:clamp(10px,2.8vw,12px);line-height:1.55}
  #qarton-main-tree .qt-grid{width:100%;max-width:520px;flex:1 1 auto;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:clamp(8px,2vw,12px);align-content:stretch}
  #qarton-main-tree .qt-card{position:relative;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:7px;padding:clamp(11px,3vw,17px);border:1px solid #e8c47788;border-radius:19px;background:linear-gradient(145deg,#202b3def,#101722f5 68%,#16101a);box-shadow:0 12px 25px #0007,inset 0 1px #ffffff12;text-align:right;color:#fff0d2;overflow:hidden}
  #qarton-main-tree button.qt-card{font:inherit;cursor:pointer}
  #qarton-main-tree .qt-card:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:linear-gradient(180deg,#e8c477,#9e3544);opacity:.85}
  #qarton-main-tree .qt-card:active:not(:disabled){transform:scale(.985);filter:brightness(1.12)}
  #qarton-main-tree .qt-card:disabled{opacity:.72;cursor:default;border-color:#7b8290;background:linear-gradient(145deg,#1a202b,#10141c)}
  #qarton-main-tree .qt-card .qt-num{color:#e8c477;font-size:10px;font-weight:900;letter-spacing:1.5px}
  #qarton-main-tree .qt-card .qt-icon{width:35px;height:35px;display:grid;place-items:center;border:1px solid #e8c47766;border-radius:11px;background:#0a111dcc;color:#e8c477;font-size:20px}
  #qarton-main-tree .qt-card strong{font-size:clamp(14px,3.7vw,18px);line-height:1.25;font-weight:900}
  #qarton-main-tree .qt-card small{color:#c9c1b2;font-size:clamp(9px,2.5vw,11px);line-height:1.45}
  #qarton-main-tree .qt-card .qt-status{margin-top:2px;padding:3px 8px;border:1px solid #8a8e98;border-radius:999px;color:#d5d0c4;font-size:9px;font-weight:800}
  #qarton-main-tree .qt-footer{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:9px;color:#bca77f;font-size:9px;font-weight:800;letter-spacing:.7px}
  #qarton-main-tree .qt-line{width:25px;height:1px;background:linear-gradient(90deg,transparent,#e8c477,transparent)}
  #qarton-main-tree .qt-subview{width:100%;max-width:520px;flex:1;min-height:0;display:flex;flex-direction:column;gap:12px}
  #qarton-main-tree .qt-scroll{width:100%;max-width:520px;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:10px;padding-bottom:8px}
  #qarton-main-tree .qt-entry{padding:10px 11px;border:1px solid #e8c47744;border-radius:12px;background:#080f1bb8}
  #qarton-main-tree .qt-entry summary{cursor:pointer;color:#ffe6ad;font-size:12px;font-weight:850;line-height:1.6}
  #qarton-main-tree .qt-entry p{margin:7px 0 0;color:#c9c1b2;font-size:11px;line-height:1.65}
  #qarton-main-tree .qt-subhead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex:0 0 auto}
  #qarton-main-tree .qt-subhead h2{margin:0;color:#fff0d2;font-size:21px;font-weight:900}
  #qarton-main-tree .qt-back{border:1px solid #e8c477;border-radius:999px;background:#111b2a;color:#ffe6ad;padding:9px 13px;font:800 12px system-ui}
  #qarton-main-tree .qt-panel{display:flex;flex-direction:column;gap:9px;padding:14px;border:1px solid #e8c47777;border-radius:17px;background:linear-gradient(145deg,#1b2638f5,#0c121df5);box-shadow:0 10px 24px #0006}
  #qarton-main-tree .qt-panel p{margin:0;color:#d0c8b8;font-size:12px;line-height:1.55}
  #qarton-main-tree .qt-action{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border:1px solid #e8c47777;border-radius:13px;background:linear-gradient(100deg,#263447,#141d2a);color:#fff0d2;text-align:right;font:800 13px system-ui}
  #qarton-main-tree .qt-action:active{filter:brightness(1.2)}
  #qarton-main-tree .qt-empty{padding:14px;border:1px dashed #8a8290;border-radius:13px;color:#c9c1b2;text-align:center;font-size:12px;line-height:1.6}
  #qarton-tree-return{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;z-index:2147483002;border:1px solid #e8c477;border-radius:999px;background:#101827ed;color:#ffe6ad;padding:9px 13px;font:800 12px system-ui;box-shadow:0 4px 16px #0008}
  @media(max-height:650px){#qarton-main-tree{gap:6px;padding-top:calc(env(safe-area-inset-top,0px) + 7px);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 7px)}#qarton-main-tree .qt-mark{width:28px;height:28px;font-size:16px}#qarton-main-tree .qt-word strong{font-size:14px}#qarton-main-tree .qt-title strong{font-size:23px}#qarton-main-tree .qt-summary{font-size:9px}#qarton-main-tree .qt-card{padding:9px;gap:5px;border-radius:14px}#qarton-main-tree .qt-card .qt-icon{width:29px;height:29px;font-size:17px}#qarton-main-tree .qt-card strong{font-size:13px}#qarton-main-tree .qt-card small{font-size:9px}}
  @media(prefers-reduced-motion:reduce){#qarton-main-tree .qt-card{transition:none!important}#qarton-main-tree .qt-card:active{transform:none!important}}
  `;
  function addStyle(){if(document.getElementById("qarton-main-tree-style"))return;var s=document.createElement("style");s.id="qarton-main-tree-style";s.textContent=css;document.head.appendChild(s);}
  function findShell(){if(!root)return null;var menu=root.querySelector(".home-actions.grid");if(!menu)return root.querySelector(".qarton-home-shell");var shell=menu.closest(".home-actions.flex")||menu.parentElement;return shell===root?menu:shell;}
  function isPlaying(){return !!(root&&root.querySelector(".game-timer"));}
  function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
  function hideLegacy(){shell=findShell();if(shell){if(shell.style.visibility!=="hidden")shell.style.visibility="hidden";if(shell.style.pointerEvents!=="none")shell.style.pointerEvents="none";}brand=document.getElementById("qarton-home-brand");footer=document.getElementById("qarton-home-info");if(brand&&brand.style.display!=="none")brand.style.display="none";if(footer&&footer.style.display!=="none")footer.style.display="none";measure=document.getElementById("qarton-home-measure");if(measure&&measure.style.display!=="none")measure.style.display="none";}
  function restoreLegacy(){if(shell){if(shell.style.visibility==="hidden")shell.style.visibility="";if(shell.style.pointerEvents==="none")shell.style.pointerEvents="";}if(brand&&brand.style.display==="none")brand.style.display="";if(footer&&footer.style.display==="none")footer.style.display="";if(measure&&measure.style.display==="none")measure.style.display="";}
  function clearReturn(){if(backButton){backButton.remove();backButton=null;}}
  function ensureOverlay(){if(!overlay){overlay=el("main");overlay.id="qarton-main-tree";overlay.setAttribute("aria-label","القائمة الرئيسية للعبة آخر يوم في قرطاج");document.body.appendChild(overlay);}}
  function goTree(){view="tree";hideLegacy();ensureOverlay();renderTree();clearReturn();overlay.style.display="flex";}
  function proxyStoryAction(parent,selector,label,detail,disabled){var b=el("button","qt-action");b.type="button";b.append(el("span","",label),el("span","","‹"));if(detail)b.setAttribute("aria-label",detail);b.disabled=!!disabled;b.addEventListener("click",function(){var live=root&&root.querySelector(selector);if(live&&!live.disabled)live.click();});parent.appendChild(b);return b;}
  function showStory(){view="story";hideLegacy();clearReturn();ensureOverlay();overlay.replaceChildren();var head=el("div","qt-subhead");head.append(el("h2","","القصة — اختر بداية رحلتك"));var back=el("button","qt-back","⌂ الرئيسية");back.type="button";back.addEventListener("click",goTree);head.appendChild(back);var panel=el("section","qt-panel");panel.appendChild(el("p","","اختر بداية رحلتك أو افتح فصلاً متاحاً. لاستكمال تقدمك السابق، انتقل إلى قسم التقدم والحفظ."));var menu=root&&root.querySelector(".home-actions.grid");var start=menu&&menu.querySelector("button:first-child");if(start)proxyStoryAction(panel,".home-actions.grid button:first-child","▶ بداية جديدة — الجزء الأول","بدء القصة من الفصل الأول",false);var part2=root&&root.querySelector("#btn-part2");if(part2)proxyStoryAction(panel,"#btn-part2",part2.textContent.trim()||"الجزء الثاني","فتح الجزء الثاني حسب شروط اللعبة",!!part2.disabled);var part3=root&&root.querySelector("#carthage-part3-start");if(part3)proxyStoryAction(panel,"#carthage-part3-start",part3.textContent.trim()||"الجزء الثالث","الجزء الثالث يفتح بعد إتمام الجزء الثاني",!!part3.disabled);if(!start&&!part2&&!part3)panel.appendChild(el("div","qt-empty","لم تُعثر على خيارات القصة الأصلية. أعد المحاولة بعد اكتمال تحميل اللعبة."));overlay.append(head,panel);overlay.style.display="flex";}
  function showWorld(){
    view="world";hideLegacy();clearReturn();ensureOverlay();overlay.replaceChildren();
    var head=el("div","qt-subhead");head.append(el("h2","","عالم قرطاج"));var back=el("button","qt-back","رجوع");back.type="button";back.addEventListener("click",goTree);head.appendChild(back);
    var scroll=el("div","qt-scroll");
    var intro=el("section","qt-panel");intro.appendChild(el("p","","دليل تعريفي بعالم اللعبة، مستخرج من الشخصيات والأماكن الموجودة في القصة. هذا القسم للقراءة فقط ولا يغيّر وقت اللعب أو تقدمك."));
    var chars=el("section","qt-panel");chars.appendChild(el("strong","","الشخصيات"));
    var characters=[
      ["ريان","البطل • 16 سنة","ولد قرطاج الذي وعد أخته ألا يتركها وحدها. قراراته ترسم نهاية المدينة."],
      ["سارة","الأم","قلب الدار؛ تحاول حماية أبنائها بهدوء رغم إحساسها المبكر بالخطر."],
      ["لينا","الأخت • 8 سنوات","أخت ريان الصغيرة؛ خائفة، لكن ثقتها في أخيها لا تهتز."],
      ["سليم","الصاحب الذكي","صاحب ريان في السوق؛ ذكي ويلاحظ التفاصيل، لكنه يريد العودة إلى الدار بسرعة."],
      ["عم منصور","الجندي القديم","جندي قديم يحمل سيفه وخريطته ذاكرة ثلاثين سنة من الحرب."],
      ["القائدة نور","قائدة البوابة • 29 سنة","تقف بثبات وسط الفوضى، وتقرر من يركب في القوارب الأخيرة."],
      ["الأب يوسف","الأب • طبيب المستشفى • 42 سنة","طبيب هادئ وحازم؛ يرفض ترك جرحاه وحدهم حتى وهو مصاب."],
      ["إيلاس","الغامض المقنّع","يظهر وقت الخطر، ويهمس بالحقيقة قبل وقوعها؛ ماضيه مجهول."],
      ["أمين","الناجي من وراء السور • 23 سنة","عاش سبع سنوات وراء السور، ويعرف الكثير عن العمالقة لكنه لا يثق بسهولة."],
      ["مريم","المهندسة • 17 سنة","من القرية المخفية في غابة زغوان؛ تصلح البوابات والآلات."],
      ["عم الهادي","حارس الأرشيف • 62 سنة","عمل مع الأب يوسف في البيمارستان، ويعرف أسرار سور قرطاج."],
      ["ياسمين","اليتيمة • 10 سنوات","عثرت عليها مريم في الغابة؛ تذكّر ريان بوعده لأخته."],
      ["القائد كريم","قائد المجموعة الثانية • 35 سنة","يقود مجموعة ناجين من وراء السور، ويميل إلى فرض النظام بالقوة."]
    ];
    characters.forEach(function(item,index){var d=el("details","qt-entry");var summary=el("summary","",""+(index+1)+". "+item[0]+" — "+item[1]);var p=el("p","",""+item[2]);d.append(summary,p);chars.appendChild(d);});
    var places=el("section","qt-panel");places.appendChild(el("strong","","أماكن قرطاج"));
    var locations=[
      ["الدار","لينا والأم؛ نقطة مرتبطة بالعائلة وبداية الرحلة."],
      ["السوق","مكان لقاء سليم وإيلاس."],
      ["السور","موضع مرتبط بأدلة الحقيقة وأسرار المدينة."],
      ["دار عم منصور","مكان السيف والخريطة وذاكرة الجندي القديم."],
      ["المستشفى","مكان الأب يوسف والجرحى."],
      ["الجسر","منطقة خطر تتطلب قرارات سريعة."],
      ["البوابة","نقطة القرار الأخير ونهايات القصة."]
    ];
    locations.forEach(function(item,index){var d=el("details","qt-entry");d.append(el("summary","",""+(index+1)+". "+item[0]));d.append(el("p","",item[1]));places.appendChild(d);});
    scroll.append(intro,chars,places);overlay.append(head,scroll);overlay.style.display="flex";
  }
  function showSettings(){
    view="settings";hideLegacy();clearReturn();ensureOverlay();overlay.replaceChildren();
    var head=el("div","qt-subhead");head.append(el("h2","","الإعدادات"));var back=el("button","qt-back","رجوع");back.type="button";back.addEventListener("click",goTree);head.appendChild(back);
    var panel=el("section","qt-panel");panel.appendChild(el("p","","إعدادات الصوت المتاحة فعلياً في اللعبة. نربط عناصر التحكم الأصلية مباشرة ولا نعرض خيارات غير موجودة."));
    var audio=document.getElementById("c17-audio-control");
    var volume=document.getElementById("c17-audio-volume");
    var found=0;
    if(audio){
      var toggle=el("button","qt-action");toggle.type="button";toggle.append(el("span","","الصوت السينمائي — تشغيل / كتم"),el("span","","♪"));
      toggle.addEventListener("click",function(){var live=document.getElementById("c17-audio-control");if(live&&!live.disabled)live.click();});
      panel.appendChild(toggle);found++;
    }
    if(volume&&("value" in volume)){
      var wrap=el("label","qt-entry");wrap.style.display="flex";wrap.style.flexDirection="column";wrap.style.gap="8px";
      var title=el("span","","مستوى الصوت");title.style.color="#ffe6ad";title.style.fontWeight="800";
      var range=el("input","");range.type="range";range.min=volume.min||"0";range.max=volume.max||"100";range.step=volume.step||"1";range.value=volume.value||"0";range.setAttribute("aria-label","مستوى الصوت");
      var value=el("span","",String(range.value));value.style.color="#c9c1b2";value.style.fontSize="11px";
      range.addEventListener("input",function(){var live=document.getElementById("c17-audio-volume");if(!live)return;live.value=range.value;value.textContent=String(range.value);live.dispatchEvent(new Event("input",{bubbles:true}));});
      range.addEventListener("change",function(){var live=document.getElementById("c17-audio-volume");if(live){live.value=range.value;live.dispatchEvent(new Event("change",{bubbles:true}));}});
      wrap.append(title,range,value);panel.appendChild(wrap);found++;
    }
    if(!found)panel.appendChild(el("div","qt-empty","لم يتم العثور على عناصر الصوت الأصلية. لم يتم إنشاء أزرار وهمية أو تغيير إعدادات اللعبة."));
    panel.appendChild(el("p","","تُحترم إعدادات تقليل الحركة في الجهاز. إعدادات العرض الأخرى غير متاحة كعناصر مستقلة في النسخة الحالية."));
    overlay.append(head,panel);overlay.style.display="flex";
  }
  function actionButton(parent,id,label,detail){var original=document.getElementById(id);if(!original)return false;var b=el("button","qt-action");b.type="button";b.append(el("span","",label),el("span","","‹"));if(detail)b.setAttribute("aria-label",detail);b.addEventListener("click",function(){var live=document.getElementById(id);if(live&&!live.disabled)live.click();});parent.appendChild(b);return true;}
  function showProgress(){view="progress";hideLegacy();clearReturn();ensureOverlay();overlay.replaceChildren();var head=el("div","qt-subhead");head.append(el("h2","","التقدم والحفظ"));var back=el("button","qt-back","رجوع");back.type="button";back.addEventListener("click",goTree);head.appendChild(back);var panel=el("section","qt-panel");panel.appendChild(el("p","","إدارة تقدمك ونسخك الاحتياطية. تُستخدم وظائف اللعبة الأصلية دون إنشاء نظام حفظ جديد."));var found=0;found+=actionButton(panel,"carthage-continue-last","متابعة آخر حفظ","متابعة آخر حفظ صالح");found+=actionButton(panel,"carthage-export-backup","تصدير نسخة احتياطية","تصدير ملف الحفظ");found+=actionButton(panel,"carthage-import-backup","استيراد نسخة احتياطية","استيراد ملف الحفظ");if(!found)panel.appendChild(el("div","qt-empty","لا توجد حالياً أدوات حفظ متاحة في هذه الشاشة."));else if(!document.getElementById("carthage-continue-last"))panel.appendChild(el("div","qt-empty","لا يوجد حفظ سابق للمتابعة بعد. يمكنك إنشاء لعبة جديدة من قسم القصة."));overlay.append(head,panel);overlay.style.display="flex";}
  function card(num,icon,title,desc,enabled,handler){var b=el("button","qt-card");b.type="button";b.disabled=!enabled;b.append(el("span","qt-num",num),el("span","qt-icon",icon),el("strong","",title),el("small","",desc));if(!enabled)b.append(el("span","qt-status","قيد التطوير"));if(enabled)b.addEventListener("click",handler);return b;}
  function renderTree(){if(!overlay)return;overlay.replaceChildren();var brandRow=el("div","qt-brand");brandRow.append(el("span","qt-mark","Q"));var word=el("span","qt-word");word.append(el("strong","","QARTON"),el("small","","CULTURE • POWER • CINEMA"));brandRow.appendChild(word);var title=el("h1","qt-title");title.append(el("strong","","قَرْطَاج"),el("span","","آخر يوم في قرطاج"));var summary=el("p","qt-summary","حكاية تفاعلية من التاريخ… قراراتك ترسم الطريق ومصير قرطاج.");var grid=el("div","qt-grid");grid.append(card("01","⚔","القصة","بداية جديدة • الأجزاء المتاحة",true,showStory),card("02","⌖","عالم قرطاج","الشخصيات • الأماكن • دليل المدينة",true,showWorld),card("03","▣","التقدم والحفظ","متابعة تقدمك • النسخ الاحتياطية",true,showProgress),card("04","⚙","الإعدادات","الصوت السينمائي • مستوى الصوت",true,showSettings));var foot=el("div","qt-footer");foot.append(el("span","qt-line"),el("span","","QARTON — رحلتك • اختياراتك • مصيرك"),el("span","qt-line"));overlay.append(brandRow,title,summary,grid,foot);}
  function cleanupForGame(){if(overlay){overlay.remove();overlay=null;}clearReturn();restoreLegacy();view="game";}
  function mount(){root=document.getElementById("root");if(!root)return;if(isPlaying()){if(view!=="game"||overlay)cleanupForGame();return;}shell=findShell();/* The tree is the home screen: do not make its rendering depend on legacy menu class names. */if(view==="story")return;if(view==="progress"){hideLegacy();if(overlay)return;showProgress();return;}if(view==="world"){hideLegacy();if(overlay)return;showWorld();return;}if(view==="settings"){hideLegacy();if(overlay)return;showSettings();return;}if(view==="tree"&&overlay){hideLegacy();return;}addStyle();goTree();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mount();});}
  function attachToApp(){
    if(started)return;
    root=document.getElementById("root");
    if(!root)return;
    started=true;
    if(rootWaiter){rootWaiter.disconnect();rootWaiter=null;}
    addStyle();
    observer=new MutationObserver(schedule);
    observer.observe(root,{subtree:true,childList:true});
    mount();
  }
  function boot(){
    attachToApp();
    if(started||rootWaiter||!document.documentElement)return;
    rootWaiter=new MutationObserver(function(){
      if(document.getElementById("root"))attachToApp();
    });
    rootWaiter.observe(document.documentElement,{subtree:true,childList:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();