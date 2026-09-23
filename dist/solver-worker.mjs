import {simulate,compare} from './physics.mjs';
self.onmessage=e=>{
 try{
  const c=e.data;const a=simulate(c,p=>self.postMessage({type:'progress',value:p*.5}));
  const b=simulate({...c,tol:c.tol/10,maxStep:c.T/(c.samples-1)/2},p=>self.postMessage({type:'progress',value:.5+p*.5}));
  a.diagnostics.numericalError=compare(a,b);a.diagnostics.maxNumericalError=Math.max(...a.diagnostics.numericalError);a.summary.referenceTol=c.tol/10;let spacing=Infinity;for(let i=0;i<c.q.length;i++)for(let j=0;j<i;j++)spacing=Math.min(spacing,Math.hypot(...c.q[i].map((x,k)=>x-c.q[j][k])));a.diagnostics.initialSpacing=spacing;a.diagnostics.relativeDisagreement=a.diagnostics.maxNumericalError/spacing;
  self.postMessage({type:'complete',result:a});
 }catch(err){self.postMessage({type:'error',message:err.message});}
};
