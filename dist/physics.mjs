// Newtonian point masses; dimensionless G=1; no force softening.
export function derivative(y,m) {
 const n=m.length,d=3*n,out=new Float64Array(2*d);out.set(y.subarray(d),0);
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
  const a=i*3,b=j*3,dx=y[b]-y[a],dy=y[b+1]-y[a+1],dz=y[b+2]-y[a+2],r2=dx*dx+dy*dy+dz*dz;
  if(r2<1e-12)throw new Error('Bodies approached a point-mass collision. Try less inward velocity or wider spacing.');
  const f=1/(r2*Math.sqrt(r2));
  for(let k=0;k<3;k++){const diff=y[b+k]-y[a+k];out[d+a+k]+=m[j]*diff*f;out[d+b+k]-=m[i]*diff*f;}
 }return out;
}
export function energy(y,m){const n=m.length,d=3*n;let e=0;for(let i=0;i<n;i++){for(let k=0;k<3;k++)e+=.5*m[i]*y[d+3*i+k]**2;for(let j=0;j<i;j++)e-=m[i]*m[j]/Math.hypot(y[3*i]-y[3*j],y[3*i+1]-y[3*j+1],y[3*i+2]-y[3*j+2]);}return e;}
export function center(q,v,m){const total=m.reduce((a,b)=>a+b,0);for(let d=0;d<3;d++){const c=q.reduce((s,p,i)=>s+p[d]*m[i],0)/total,u=v.reduce((s,p,i)=>s+p[d]*m[i],0)/total;q.forEach(p=>p[d]-=c);v.forEach(p=>p[d]-=u);}return {q,v,m};}
const A=[[],[1/5],[3/40,9/40],[44/45,-56/15,32/9],[19372/6561,-25360/2187,64448/6561,-212/729],[9017/3168,-355/33,46732/5247,49/176,-5103/18656],[35/384,0,500/1113,125/192,-2187/6784,11/84]];
const B4=[5179/57600,0,7571/16695,393/640,-92097/339200,187/2100,1/40];
export function simulate(config,progress=()=>{}) {
 const {q,v,m,T=10,tol=1e-9,samples=801,maxStep=Infinity}=config;
 if(!Array.isArray(m)||!Array.isArray(q)||!Array.isArray(v)||!q.every(p=>Array.isArray(p)&&p.length===3)||!v.every(p=>Array.isArray(p)&&p.length===3)||!Number.isInteger(samples)||samples<2||samples>10001||!(maxStep>0)||!m.length||m.length>12||q.length!==m.length||v.length!==m.length||!m.every(x=>Number.isFinite(x)&&x>0)||!q.flat().concat(v.flat()).every(Number.isFinite)||!(T>0&&T<=80)||!(tol>=1e-13&&tol<=1e-4))throw new Error('Enter finite positions and velocities, positive masses, and a duration between 0 and 80.');
 let y=new Float64Array(q.flat().concat(v.flat())),t=0,h=.001,accepted=0,rejected=0,steps=0,minStep=Infinity;
 const n=m.length,d=n*3,e0=energy(y,m),energyScale=Math.max(Math.abs(e0),1e-12),times=[],positions=[],energies=[];let maxEnergy=0;
 for(let si=0;si<samples;si++){
  const target=T*si/(samples-1);
  while(t<target-1e-14){
   if(++steps>180000)throw new Error('This close encounter exceeded the calculation budget. Shorten the duration or spread the bodies farther apart.');
   h=Math.min(h,target-t,maxStep);if(h<1e-14)throw new Error('The step size collapsed near a singular encounter. Change the starting conditions.');
   const K=[derivative(y,m)];let next;
   for(let stage=1;stage<7;stage++){next=new Float64Array(y.length);for(let k=0;k<y.length;k++){let s=0;for(let j=0;j<stage;j++)s+=A[stage][j]*K[j][k];next[k]=y[k]+h*s;}K.push(derivative(next,m));}
   let err=0;for(let k=0;k<y.length;k++){let fourth=y[k];for(let j=0;j<7;j++)fourth+=h*B4[j]*K[j][k];const scale=tol*.01+tol*Math.max(Math.abs(y[k]),Math.abs(next[k]));err+=((next[k]-fourth)/scale)**2;}err=Math.sqrt(err/y.length);
   if(!Number.isFinite(err))throw new Error('Non-finite result near a close encounter. Try different initial conditions.');
   if(err<=1){y=next;t+=h;accepted++;minStep=Math.min(minStep,h);}else rejected++;
   h*=Math.min(4,Math.max(.15,err===0?4:.9*err**(-.2)));
  }
  times.push(target);positions.push(Array.from({length:n},(_,i)=>Array.from(y.slice(i*3,i*3+3))));const de=Math.abs(energy(y,m)-e0)/energyScale;energies.push(de);maxEnergy=Math.max(maxEnergy,de);if(si%60===0)progress(si/(samples-1));
 }
 progress(1);return {t:times,positions,masses:m,initial:{positions:q,velocities:v},diagnostics:{energyDrift:energies,maxEnergyDrift:maxEnergy,initialEnergy:e0},summary:{accepted,rejected,minStep,tol,T},finalState:Array.from(y)};
}
export function compare(a,b){return a.positions.map((row,k)=>Math.sqrt(row.reduce((sum,p,i)=>sum+p.reduce((s,x,d)=>s+(x-b.positions[k][i][d])**2,0),0)/row.length));}
