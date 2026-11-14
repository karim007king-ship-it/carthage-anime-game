const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'..','scripts','qarton-isolated-home.js'),'utf8');
function element(tag){
 const attrs=new Map(),props=new Map(),children=[],listeners=new Map(),classes=new Set();
 const classList={add(...a){a.forEach(x=>classes.add(x))},remove(...a){a.forEach(x=>classes.delete(x))},contains(x){return classes.has(x)},toggle(x,on){if(on)classes.add(x);else classes.delete(x)}};
 const style={setProperty(k,v,p){props.set(k,{value:v,priority:p||''})},getPropertyValue(k){return props.get(k)?.value||''},getPropertyPriority(k){return props.get(k)?.priority||''},removeProperty(k){props.delete(k)}};
 const n={tagName:tag.toUpperCase(),children,style,classList,dataset:{},textContent:'',id:'',className:'',innerHTML:'',disabled:false,parentElement:null,
 appendChild(c){children.push(c);c.parentElement=this;return c},append(...a){a.forEach(x=>this.appendChild(x))},replaceChildren(...a){children.splice(0);a.forEach(x=>this.appendChild(x))},
 remove(){if(this.parentElement){let a=this.parentElement.children,i=a.indexOf(this);if(i>=0)a.splice(i,1);this.parentElement=null}},
 setAttribute(k,v){attrs.set(k,String(v));if(k==='id')this.id=String(v);if(k==='class')this.className=String(v)},getAttribute(k){return attrs.has(k)?attrs.get(k):null},removeAttribute(k){attrs.delete(k)},
 addEventListener(t,f){if(!listeners.has(t))listeners.set(t,[]);listeners.get(t).push(f)},click(){if(!this.disabled)(listeners.get('click')||[]).forEach(f=>f({target:this}))},
 matches(s){if(s==='button')return this.tagName==='BUTTON';if(s[0]==='.')return (this.className||'').split(/\s+/).includes(s.slice(1))||classes.has(s.slice(1));if(s[0]==='#')return this.id===s.slice(1);return false},
 querySelectorAll(s){let a=[];function walk(p){for(const c of p.children){if(c.matches&&c.matches(s))a.push(c);walk(c)}}walk(this);return a},querySelector(s){return this.querySelectorAll(s)[0]||null},
 contains(x){return x===this||children.some(c=>c===x||c.contains?.(x))},focus(){}
 };return n;
}
const root=element('div');root.id='root';const body=element('body');body.appendChild(root);const head=element('head');
const document={body,head,documentElement:element('html'),readyState:'complete',getElementById(id){function f(n){if(n.id===id)return n;for(const c of n.children||[]){const x=f(c);if(x)return x}return null}return f(body)||f(head)},createElement:element};
const timers=new Map();let id=0;const window={dispatchEvent(){},addEventListener(){},setTimeout(fn,delay){timers.set(++id,{fn,delay});return id}};
const nativeActions={__carthageHasSave:()=>false,__carthageHasFreeSlot:()=>true,__carthageStartNewGame:()=>{window.__qartonSetAppState("INTRO","native-new-game-sync");return true},__carthageContinue:()=>true,__carthageSetDifficulty:()=>true,__carthageStartPart2:()=>true,__carthageStartPart3:()=>true,__carthageCanStartPart3:()=>false};
Object.assign(window,nativeActions);
class Observer{constructor(fn){this.fn=fn}observe(){}disconnect(){}}
class CustomEvent{constructor(type,options){this.type=type;this.detail=options?.detail}}
function clearTimer(n){timers.delete(n)}
const context={window,document,MutationObserver:Observer,CustomEvent,requestAnimationFrame:f=>f(),clearTimeout:clearTimer,console};
vm.runInNewContext(source,context,{filename:'qarton-isolated-home.js'});
assert.equal(window.__qartonGetAppState(),'HOME');
assert.equal(root.style.getPropertyValue('display'),'none','legacy root hidden before showing home');
assert.equal(root.style.getPropertyPriority('display'),'important');
const home=document.getElementById('qarton-home-screen');assert.ok(home,'QARTON HOME mounts without any native menu');
assert.ok(home.querySelectorAll('.qh-action').some(b=>/لعبة جديدة/.test(b.textContent)),'new game card rendered directly');
assert.ok(home.querySelectorAll('.qh-difficulty').length===3,'three difficulty cards rendered directly');
assert.ok(!home.querySelectorAll('.qh-action').some(b=>/متابعة/.test(b.textContent)),'continue hidden when there is no save');
window.__qartonSetAppState('TRANSITION','test');assert.equal(window.__qartonGetAppState(),'TRANSITION');assert.equal(root.style.getPropertyValue('display'),'none');
const timer=[...timers.entries()].find(([,v])=>v.delay===15000);assert.ok(timer,'transition recovery timer installed');
window.__qartonSetAppState('INTRO','intro');assert.equal(timers.has(timer[0]),false);assert.equal(root.style.getPropertyValue('display'),'');assert.ok(body.classList.contains('qarton-intro-active'));assert.equal(document.getElementById('qarton-home-screen'),null);
window.__qartonSetAppState('GAME','game');assert.ok(body.classList.contains('qarton-game-active'));
window.__qartonSetAppState('HOME','home');assert.equal(root.style.getPropertyValue('display'),'none');assert.ok(body.classList.contains('qarton-home-active'));
window.__qartonSetAppState('BAD','invalid');assert.equal(window.__qartonGetAppState(),'HOME');
window.__qartonSetAppState('TRANSITION','timeout');const pending=[...timers.entries()].find(([,v])=>v.delay===15000);pending[1].fn();assert.equal(window.__qartonGetAppState(),'HOME');assert.match(window.__QARTON_TRANSITION_ERROR__,/تعذّر تشغيل المشهد/);
const newGame=document.getElementById('qarton-home-screen').querySelectorAll('.qh-action').find(b=>/لعبة جديدة/.test(b.textContent));newGame.click();assert.equal(window.__qartonGetAppState(),'INTRO','a synchronous native INTRO update must not be overwritten by a late TRANSITION update');assert.equal(document.getElementById('qarton-home-screen'),null);
console.log('PASS: QARTON lifecycle and standalone home action flow.');
