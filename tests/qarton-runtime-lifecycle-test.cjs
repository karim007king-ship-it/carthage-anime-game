const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const source=fs.readFileSync(path.join(__dirname,'..','scripts','qarton-isolated-home.js'),'utf8');

function element(tag){
  const attrs=new Map(),props=new Map(),children=[],listeners=new Map();
  const classes=new Set();
  const classList={
    add(...names){names.forEach(n=>classes.add(n))},
    remove(...names){names.forEach(n=>classes.delete(n))},
    contains(name){return classes.has(name)}
  };
  const style={
    setProperty(name,value,priority){props.set(name,{value,priority:priority||''})},
    getPropertyValue(name){return props.get(name)?.value||''},
    getPropertyPriority(name){return props.get(name)?.priority||''},
    removeProperty(name){props.delete(name)}
  };
  const node={
    tagName:tag.toUpperCase(),children,style,classList,dataset:{},textContent:'',
    id:'',className:'',innerHTML:'',disabled:false,parentElement:null,
    appendChild(child){children.push(child);child.parentElement=this;return child},
    append(...nodes){nodes.forEach(n=>this.appendChild(n))},
    replaceChildren(...nodes){children.splice(0,children.length);nodes.forEach(n=>this.appendChild(n))},
    remove(){if(this.parentElement){const a=this.parentElement.children;const i=a.indexOf(this);if(i>=0)a.splice(i,1);this.parentElement=null}},
    setAttribute(k,v){attrs.set(k,String(v));if(k==='id')this.id=String(v);if(k==='class')this.className=String(v)},
    getAttribute(k){return attrs.has(k)?attrs.get(k):null},
    removeAttribute(k){attrs.delete(k)},
    addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)},
    click(){if(this.disabled)return;(listeners.get('click')||[]).forEach(fn=>fn({target:this}))},
    matches(selector){
      if(selector==='button')return this.tagName==='BUTTON';
      if(selector[0]==='.')return (this.className||'').split(/\s+/).includes(selector.slice(1))||classes.has(selector.slice(1));
      if(selector[0]==='#')return this.id===selector.slice(1);
      const attr=selector.match(/^\[([^=]+)="([^"]*)"\]$/);
      return !!attr&&this.getAttribute(attr[1])===attr[2];
    },
    querySelectorAll(selector){const found=[];function walk(parent){for(const child of parent.children){if(child.matches&&child.matches(selector))found.push(child);walk(child)}}walk(this);return found},
    querySelector(selector){return this.querySelectorAll(selector)[0]||null},
    contains(target){return target===this||children.some(child=>child===target||child.contains?.(target))},
    focus(){}
  };
  return node;
}
const root=element('div');root.id='root';
const body=element('body');body.appendChild(root);
const head=element('head');
const document={
  body,head,documentElement:element('html'),
  readyState:'complete',
  getElementById(id){
    function find(node){if(node.id===id)return node;for(const child of node.children||[]){const match=find(child);if(match)return match}return null}
    return find(body)||find(head)||(id==='root'?root:null);
  },
  createElement:element,
  addEventListener(){},
};
const nativeMenu=element('div');nativeMenu.className='home-actions';
const nativeStart=element('button');nativeStart.textContent='لعبة جديدة';
const nativePart2=element('button');nativePart2.textContent='الجزء الثاني';
nativeMenu.append(nativeStart,nativePart2);root.appendChild(nativeMenu);
const timers=new Map();let nextTimer=1;
const window={
  dispatchEvent(){},
  setTimeout(fn,delay){const id=nextTimer++;timers.set(id,{fn,delay});return id},
  clearTimeout(id){timers.delete(id)}
};
nativeStart.addEventListener('click',()=>window.__qartonSetAppState('INTRO','native-new-game'));
class Observer{constructor(fn){this.fn=fn}observe(){}disconnect(){}}
class CustomEvent{constructor(type,options){this.type=type;this.detail=options?.detail}}
const context={window,document,MutationObserver:Observer,CustomEvent,requestAnimationFrame(fn){fn()},console};
vm.runInNewContext(source,context,{filename:'qarton-isolated-home.js'});

assert.equal(window.__qartonGetAppState(),'HOME');
assert.equal(root.style.getPropertyValue('display'),'none','legacy root must be hidden on first paint');
assert.equal(root.style.getPropertyPriority('display'),'important');
assert.ok(document.getElementById('qarton-home-screen'),'QARTON home must mount independently');

window.__qartonSetAppState('TRANSITION','test-transition');
assert.equal(window.__qartonGetAppState(),'TRANSITION');
assert.equal(root.style.getPropertyValue('display'),'none','legacy root must stay hidden during transitions');
assert.ok(document.getElementById('qarton-transition-return'),'transition must provide a QARTON-native cancel control');
const successfulTransitionTimer=[...timers.entries()].find(([,timer])=>timer.delay===15000);
assert.ok(successfulTransitionTimer,'TRANSITION must arm a bounded recovery timer');

window.__qartonSetAppState('INTRO','test-intro');
assert.equal(timers.has(successfulTransitionTimer[0]),false,'a successful transition must cancel its recovery timer');
assert.equal(window.__qartonGetAppState(),'INTRO');
assert.equal(root.style.getPropertyValue('display'),'','legacy root must be restored for the actual intro scene');
assert.ok(body.classList.contains('qarton-intro-active'));
assert.equal(document.getElementById('qarton-home-screen'),null,'home overlay must not cover the intro');

window.__qartonSetAppState('GAME','test-game');
assert.equal(window.__qartonGetAppState(),'GAME');
assert.ok(body.classList.contains('qarton-game-active'));
assert.equal(document.getElementById('qarton-home-screen'),null);

window.__qartonSetAppState('HOME','test-return-home');
assert.equal(window.__qartonGetAppState(),'HOME');
assert.equal(root.style.getPropertyValue('display'),'none','returning home must hide the legacy React menu again');
assert.ok(body.classList.contains('qarton-home-active'));

window.__qartonSetAppState('NOT_A_STATE','invalid-state');
assert.equal(window.__qartonGetAppState(),'HOME','invalid lifecycle states must be ignored');

// A failed React transition must recover instead of leaving a permanent loading screen.
window.__qartonSetAppState('TRANSITION','test-timeout');
const pending=[...timers.entries()].find(([,timer])=>timer.delay===15000);
assert.ok(pending,'TRANSITION must arm a bounded recovery timer');
timers.delete(pending[0]);
pending[1].fn();
assert.equal(window.__qartonGetAppState(),'HOME','a stalled transition must return to QARTON HOME');
assert.match(window.__QARTON_TRANSITION_ERROR__,/تعذّر تشغيل المشهد/,'the recovery reason must be retained for the player');
function findText(node,pattern){if(pattern.test(node.textContent||''))return true;return(node.children||[]).some(child=>findText(child,pattern))}
assert.ok(findText(document.getElementById('qarton-home-screen'),/تعذّر تشغيل المشهد/),'the timeout recovery message must be visible on QARTON HOME');

// Exercise the rendered QARTON primary card and its delegation to the native React action.
const primaryCard=document.getElementById('qarton-home-screen').querySelectorAll('.qh-action').find(button=>button.textContent==='لعبة جديدة');
assert.ok(primaryCard,'QARTON must render a primary new-game card from the native menu');
primaryCard.click();
assert.equal(window.__qartonGetAppState(),'INTRO','pressing the QARTON new-game card must reach the native intro lifecycle');
assert.equal(document.getElementById('qarton-home-screen'),null,'the QARTON home overlay must disappear after the native intro starts');
assert.equal(root.style.getPropertyValue('display'),'','the native intro root must be visible after starting a new game');

console.log('PASS: QARTON runtime lifecycle integration — HOME, TRANSITION, INTRO, GAME, and return HOME.');
