const NS='http://www.w3.org/2000/svg';
const el=(tag,attrs={},txt)=>{const x=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>x.setAttribute(k,v));if(txt!==undefined)x.textContent=txt;return x;};
export const sci=x=>{if(!Number.isFinite(x))return '—';if(x===0)return '0';if(Math.abs(x)>=.01&&Math.abs(x)<1000)return Number(x.toPrecision(3)).toString();return x.toExponential(2);};
export function chart(svg,series,{xlabel='Time (dimensionless)',active=null}={}){
 const W=Math.max(svg.getBoundingClientRect().width||500,260),H=210,L=W<360?47:57,R=14,T=15,B=40;
 svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 let lo=Infinity,hi=-Infinity,x0=Infinity,x1=-Infinity;for(const s of series)for(const p of s.points){if(p[1]>0){lo=Math.min(lo,Math.log10(p[1]));hi=Math.max(hi,Math.log10(p[1]));}x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);}
 if(!Number.isFinite(lo)){lo=-14;hi=-2;}lo=Math.floor(lo);hi=Math.ceil(hi);if(hi<=lo)hi=lo+1;lo=Math.max(lo,hi-17);
 const x=v=>L+(v-x0)/(x1-x0||1)*(W-L-R),y=v=>T+(hi-Math.log10(Math.max(v,10**lo)))/(hi-lo)*(H-T-B);
 const tickStep=Math.max(1,Math.ceil((hi-lo)/3));for(let log=hi;log>=lo;log-=tickStep){const yy=y(10**log);svg.appendChild(el('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#233249','stroke-width':.7}));svg.appendChild(el('text',{x:L-8,y:yy+4,'text-anchor':'end',fill:'#8e9fb8','font-size':12,'font-family':'monospace'},'1e'+log));}
 for(let i=0;i<4;i++){const v=x0+(x1-x0)*i/3;svg.appendChild(el('text',{x:x(v),y:H-B+20,'text-anchor':i===0?'start':i===3?'end':'middle',fill:'#8e9fb8','font-size':12},Number(v.toFixed(1)).toString()));}
 svg.appendChild(el('text',{x:L+(W-L-R)/2,y:H-3,'text-anchor':'middle',fill:'#8e9fb8','font-size':12},xlabel));
 for(const s of series){const path=s.points.map((p,i)=>(i?'L':'M')+x(p[0]).toFixed(2)+','+Math.min(H-B,Math.max(T,y(p[1]))).toFixed(2)).join(' ');svg.appendChild(el('path',{d:path,stroke:s.color,fill:'none','stroke-width':2,'stroke-linecap':'round'}));if(s.points.length<=12)s.points.forEach((p,i)=>svg.appendChild(el('circle',{cx:x(p[0]),cy:y(p[1]),r:i===active?5:3,fill:s.color,stroke:i===active?'#eaf0fa':s.color,'stroke-width':1.5})));}
 const guide=el('line',{id:'chart-guide',x1:L,x2:L,y1:T,y2:H-B,stroke:'#a7b5c9','stroke-opacity':.45,'stroke-dasharray':'3 4'});svg.appendChild(guide);
 return {left:L,right:W-R,width:W,setProgress:f=>{const px=L+f*(W-L-R);guide.setAttribute('x1',px);guide.setAttribute('x2',px);}};
}
export function drawClosure(canvas,candidate){
 const W=canvas.getBoundingClientRect().width||280,H=canvas.getBoundingClientRect().height||110,dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const miss=candidate.diagnostics.positionMiss,extent=Math.max(...miss.flat().map(Math.abs),1e-15)*1.2,scale=Math.min(W*.38,H*.36)/extent;
 c.strokeStyle='#28374c';c.lineWidth=1;c.beginPath();c.moveTo(W/2,12);c.lineTo(W/2,H-12);c.moveTo(15,H/2);c.lineTo(W-15,H/2);c.stroke();c.setLineDash([3,5]);c.beginPath();c.arc(W/2,H/2,Math.min(W*.38,H*.36),0,Math.PI*2);c.stroke();c.setLineDash([]);
 c.strokeStyle='#d6e4f4';c.beginPath();c.arc(W/2,H/2,4,0,Math.PI*2);c.stroke();
 const colors=['#70d8ff','#ffa369','#c1a0ff'];miss.forEach((p,i)=>{const x=W/2+p[0]*scale,y=H/2-p[1]*scale;c.strokeStyle=colors[i];c.globalAlpha=.65;c.beginPath();c.moveTo(W/2,H/2);c.lineTo(x,y);c.stroke();c.globalAlpha=1;c.fillStyle=colors[i];c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();c.font='12px monospace';c.fillText(String(i+1),x+7,y-5);});
 return extent;
}
