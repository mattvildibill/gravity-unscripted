import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {center,simulate,compare} from '../dist/physics.mjs';
const root=new URL('../dist/',import.meta.url).pathname;const html=fs.readFileSync(root+'index.html','utf8');const els=new Map();
class El{constructor(id=''){this.id=id;this.value='';this.attributes={};this.events={};this.style={};this.classList={toggle(){},add(){},remove(){}};this.options=[];this.tagName='DIV';this.hidden=false;this.disabled=false;this.checked=false;this.children=[];}setAttribute(k,v){this.attributes[k]=String(v)}removeAttribute(k){delete this.attributes[k]}getAttribute(k){return this.attributes[k]}addEventListener(k,f){(this.events[k]??=[]).push(f)}async fire(k,extra={}){for(const f of this.events[k]||[])await f({target:this,preventDefault(){},...extra})}appendChild(x){this.children.push(x)}remove(){}focus(){document.activeElement=this}contains(x){return this===x}reportValidity(){return true}getBoundingClientRect(){return {left:0,top:0,width:700,height:220,right:700,bottom:220}}scrollIntoView(){}select(){this.selected=true}showModal(){this.open=true}close(){this.open=false}get selectedOptions(){return this.options.filter(o=>o.value===this.value)}requestFullscreen(){document.fullscreenElement=this}}
for(const m of html.matchAll(/<([a-z0-9-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){const e=new El(m[3]);e.tagName=m[1].toUpperCase();for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)){e[a[1]]=a[2];e.attributes[a[1]]=a[2]}e.hidden=m[2].includes(' hidden');els.set(e.id,e)}
for(const m of html.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){const e=els.get(m[1]);e.options=[...m[2].matchAll(/<option value="([^"]+)"([^>]*)>([^<]*)/g)].map(x=>({value:x[1],selected:x[2].includes('selected'),textContent:x[3]}));e.value=(e.options.find(o=>o.selected)||e.options[0]).value}
const buttons=['figure8','chaos','symmetry','custom'].map(c=>{const e=new El();e.dataset={case:c};return e});const stage=new El('stage');
const documentEvents={};const document={body:new El(),activeElement:null,hidden:false,getElementById:id=>els.get(id),querySelector:q=>stage,querySelectorAll:q=>q==='[data-case]'?buttons:q.startsWith('.experiment-nav button')?[...buttons,...[...els.values()].filter(e=>['BUTTON','INPUT','SELECT'].includes(e.tagName)&&!['method-open','evidence-method','method-close','share-close','share-url'].includes(e.id))]:[],addEventListener(k,f){(documentEvents[k]??=[]).push(f)},createElement:()=>new El()};const location={hash:'',pathname:'/',href:'https://example.test/',reload(){}};const history={replaceState(a,b,h){location.hash=h;location.href='https://example.test/'+h}};let clip='';let worker;
class Scene{constructor(){this.mode='orbit';this.renderer={domElement:new El()};this.controls={};}setData(d){this.data=d}update(){}render(){}resetCamera(){}}
class Worker{constructor(){worker=this}postMessage(c){this.c=c}terminate(){this.terminated=true}}
const context=vm.createContext({document,location,history,window:{lucide:{createIcons(){}},addEventListener(){}},navigator:{clipboard:{writeText:async s=>clip=s}},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},Worker,URL,AbortSignal,fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+url.slice(1)))}),requestAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},console,GravityScene:Scene,COLORS:['cyan','orange','purple'],center,chart:()=>({left:0,right:700,setProgress(){}}),drawClosure:()=>.1,sci:n=>String(n)});
let src=fs.readFileSync(root+'app.mjs','utf8').replace(/^import .*;\n/gm,'');await vm.runInContext('(async()=>{'+src+';return {state,choose,setSearch,tourStep,closeTour,run,restoreLink,config,startWatch,stopWatch,pauseWatch,tickWatch,watchState,watchChapters,scene:()=>scene};})()',context).then(x=>context.api=x);const a=context.api;assert.equal(a.state.case,'figure8');assert.equal(els.get('experiment-workspace').getAttribute('aria-busy'),'false');assert.equal(els.get('watch').disabled,false);
for(const c of ['figure8','chaos','symmetry','custom']){a.choose(c);assert.equal(a.state.case,c)}
for(let i=0;i<8;i++){a.choose('figure8');a.setSearch(i);assert.equal(a.state.search,i);a.choose('chaos');els.get('future').value=String(i);await els.get('future').fire('input')}
for(let i=0;i<6;i++){a.tourStep(i);assert.equal(a.state.tour,i)}a.closeTour();
a.choose('symmetry');a.state.polygon=3;await els.get('break-symmetry').fire('click');assert.equal(worker.c.m.length,3);assert.equal(worker.c.T,6.33);let c=worker.c;const result=simulate(c);const tighter=simulate({...c,tol:c.tol/10,maxStep:c.T/(c.samples-1)/2});result.diagnostics.numericalError=compare(result,tighter);result.diagnostics.maxNumericalError=Math.max(...result.diagnostics.numericalError);result.diagnostics.relativeDisagreement=0;a.choose('chaos');a.state.p=.6;worker.onmessage({data:{type:'complete',result}});assert.equal(a.state.p,.6);assert.equal(els.get('run').disabled,false);
a.choose('custom');els.get('mass').value='2.1';await els.get('share').fire('click');assert.ok(clip.includes('2.1'));location.hash=new URL(clip).hash;a.restoreLink();assert.equal(els.get('mass').value,'2.1');assert.equal(a.state.playing,false);assert.ok(location.hash.includes('2.1'));
location.hash='#'+encodeURIComponent(JSON.stringify({v:1,case:'figure8',search:2.5,future:3.7,view:'time',p:.4}));a.restoreLink();assert.equal(a.state.search,3);assert.equal(a.state.future,4);assert.equal(a.scene().mode,'time');assert.equal(a.state.p,.4);a.choose('toString');assert.equal(a.state.case,'figure8');
await els.get('fullscreen').fire('click');assert.equal(document.fullscreenElement,stage);
await els.get('search-play').fire('click');els.get('search-step').value='2';await els.get('search-step').fire('input');assert.equal(a.state.searchPlaying,false);assert.ok(els.get('search-play').innerHTML.includes('Watch search'));
console.log('PASS: four modes, 8 search candidates, 8 futures, six tour steps, triangle symmetry, worker completion isolation, reproducible sharing, malformed state, fullscreen scope, search controls.');

// The watch demonstration must run to completion without another click.
a.choose('custom');els.get('mass').value='2.3';a.state.p=.37;const original=a.state.custom;
a.startWatch();assert.equal(a.watchState.active,true);assert.equal(els.get('watch-panel').hidden,false);
a.tickWatch(2);const pausedAt=a.watchState.elapsed;a.pauseWatch();a.tickWatch(10);assert.equal(a.watchState.elapsed,pausedAt);a.pauseWatch();
const visited=new Set();let liveRuns=0;
for(let t=0;t<300&&a.watchState.active;t++){
 visited.add(a.watchState.index);
 if(a.state.worker){const c=worker.c,r=simulate(c),r2=simulate({...c,tol:c.tol/10,maxStep:c.T/(c.samples-1)/2});r.diagnostics.numericalError=compare(r,r2);r.diagnostics.maxNumericalError=Math.max(...r.diagnostics.numericalError);let spacing=Infinity;for(let i=0;i<c.q.length;i++)for(let j=0;j<i;j++)spacing=Math.min(spacing,Math.hypot(...c.q[i].map((x,k)=>x-c.q[j][k])));r.diagnostics.relativeDisagreement=r.diagnostics.maxNumericalError/spacing;worker.onmessage({data:{type:'complete',result:r}});liveRuns++;}
 a.tickWatch(1);
}
assert.equal(visited.size,12);assert.equal(liveRuns,2);assert.equal(a.watchState.active,false);assert.equal(a.state.case,'custom');assert.equal(a.state.custom,original);assert.equal(a.state.p,.37);assert.equal(els.get('mass').value,'2.3');assert.equal(els.get('watch-panel').hidden,true);
// Leaving during a live run terminates it and restores the prior custom result.
a.startWatch();while(!a.state.worker)a.tickWatch(24);const running=worker;a.stopWatch();assert.equal(running.terminated,true);assert.equal(a.state.custom,original);assert.equal(a.state.worker,null);
// A worker failure never deadlocks the presentation.
a.startWatch();for(let t=0;t<300&&a.watchState.active;t++){if(a.state.worker)worker.onmessage({data:{type:'error',message:'Injected calculation failure'}});a.tickWatch(1);}assert.equal(a.watchState.active,false);assert.equal(a.state.custom,original);
console.log('PASS: hands-free 12-chapter completion, two real solver runs, pause/resume, exit cancellation, failure continuation and original experiment restoration.');

// A stale event from a cancelled worker cannot overwrite or cancel a newer run.
a.choose('custom');a.run();const cancelled=worker;await els.get('cancel-run').fire('click');
const beforeRestart=a.state.custom;a.run();const replacement=worker;
cancelled.onmessage({data:{type:'progress',value:.9}});
assert.equal(els.get('compute-progress').textContent,'Calculating gravitational interactions…');
cancelled.onmessage({data:{type:'complete',result}});
cancelled.onerror();cancelled.onmessageerror();
assert.equal(a.state.worker,replacement);assert.equal(a.state.custom,beforeRestart);assert.equal(els.get('run').disabled,true);
replacement.onmessage({data:{type:'complete',result}});assert.equal(a.state.worker,null);assert.equal(els.get('run').disabled,false);

// Shared display settings survive a round trip, including clipboard-denied fallback.
a.choose('chaos');els.get('forces').checked=true;els.get('speed').value='2';await els.get('speed').fire('change');
const originalClipboard=context.navigator.clipboard;
context.navigator.clipboard={writeText:async()=>{throw new Error('Clipboard unavailable')}};
await els.get('share').fire('click');
const sharedUrl=els.get('share-url').value;const shared=JSON.parse(decodeURIComponent(new URL(sharedUrl).hash.slice(1)));
assert.equal(shared.case,'chaos');assert.equal(shared.forces,true);assert.equal(shared.speed,2);
assert.equal(els.get('share-dialog').open,true);assert.equal(els.get('share-url').selected,true);
await els.get('share-close').fire('click');assert.equal(els.get('share-dialog').open,false);
location.hash=new URL(sharedUrl).hash;a.restoreLink();assert.equal(els.get('forces').checked,true);assert.equal(a.state.speed,2);assert.equal(els.get('speed').value,'2');
context.navigator.clipboard=originalClipboard;
location.hash='#'+encodeURIComponent(JSON.stringify({v:1,case:'chaos',speed:999}));a.restoreLink();assert.equal(a.state.speed,1);

// The height label describes the actual initial conditions, not the experiment tab.
const priorCustom=a.state.custom;
a.state.custom={...priorCustom,initial:JSON.parse(fs.readFileSync(root+'trajectories.json','utf8')).scenarios.find(s=>s.id==='figure8').initial};
a.choose('custom');assert.equal(els.get('plane-note').textContent,'Planar motion, viewed in 3D');
a.state.custom=priorCustom;a.choose('custom');assert.equal(els.get('plane-note').textContent,'Spatial motion · physical height');
a.tourStep(1);assert.equal(els.get('plane-note').textContent,'Height = elapsed time, not physical motion');
let prevented=false;for(const handler of documentEvents.keydown||[])handler({key:'Escape',target:els.get('tour-title'),preventDefault(){prevented=true}});
assert.equal(prevented,true);assert.equal(a.state.tour,-1);
console.log('PASS: cancelled-worker isolation, share fallback and display restoration, accurate spatial labels, and guided-tour Escape containment.');

// Without WebGL the source explanation remains accessible and inert controls are honest.
for(const id of ['method-open','evidence-method','method-close','method-dialog'])els.get(id).events={};
const startupErrors=[];
const failedContext=vm.createContext({...context,GravityScene:class{constructor(){throw new Error('WebGL unavailable')}},console:{error:e=>startupErrors.push(e.message)}});
await vm.runInContext('(async()=>{'+src+'})()',failedContext);
assert.deepEqual(startupErrors,['WebGL unavailable']);assert.equal(els.get('watch').disabled,true);assert.equal(els.get('run').disabled,true);assert.equal(buttons.every(b=>b.disabled),true);
assert.equal(els.get('experiment-workspace').getAttribute('aria-busy'),'false');assert.equal(els.get('evidence-chart').getAttribute('aria-disabled'),'true');
await els.get('method-open').fire('click');assert.equal(els.get('method-dialog').open,true);
await els.get('method-close').fire('click');assert.equal(els.get('method-dialog').open,false);
await els.get('evidence-method').fire('click');assert.equal(els.get('method-dialog').open,true);
assert.ok(els.get('loading').textContent.includes('read the mathematics'));
console.log('PASS: WebGL startup failure, disabled unavailable controls, and accessible mathematics fallback.');
