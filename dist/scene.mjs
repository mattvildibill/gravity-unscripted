import * as THREE from './three.module.min.js';
import {OrbitControls} from './OrbitControls.js';
export const COLORS=['#70d8ff','#ffa369','#c1a0ff','#85e9b3','#ffc6e1','#f3e09a','#92a3ff','#f08f96'];
class Path extends THREE.Curve{constructor(points){super();this.points=points;}getPointAt(t,target){return this.getPoint(t,target);}getTangentAt(t,target){return this.getTangent(t,target);}getPoint(t,target=new THREE.Vector3()){const k=Math.min(this.points.length-1,Math.max(0,t)*(this.points.length-1)),i=Math.floor(k);return target.copy(this.points[i]).lerp(this.points[Math.min(i+1,this.points.length-1)],k-i);}}
export class GravityScene{
 constructor(container,onSelect){
  this.container=container;this.onSelect=onSelect;this.mode='orbit';this.progress=0;this.auto=false;this.showCompare=false;this.showForces=false;this.extent=1;this.labels=[];this.tubes=[];this.bodies=[];this.ghosts=[];this.arrows=[];
  this.scene=new THREE.Scene();this.scene.fog=new THREE.FogExp2(0x080b12,.015);
  this.camera=new THREE.PerspectiveCamera(38,1,.01,2000);this.camera.position.set(0,3.1,5);
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setClearColor(0x080b12,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;
  container.appendChild(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Interactive 3D gravitational trajectories. Drag to orbit, scroll or pinch to zoom.');this.renderer.domElement.setAttribute('role','img');this.renderer.domElement.tabIndex=0;this.renderer.domElement.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){this.resetCamera();return;}const offset=this.camera.position.clone().sub(this.controls.target),s=new THREE.Spherical().setFromVector3(offset);if(e.key==='ArrowLeft')s.theta-=.12;if(e.key==='ArrowRight')s.theta+=.12;if(e.key==='ArrowUp')s.phi-=.12;if(e.key==='ArrowDown')s.phi+=.12;if(e.key==='+'||e.key==='=')s.radius*=.9;if(e.key==='-')s.radius*=1.1;s.makeSafe();s.radius=THREE.MathUtils.clamp(s.radius,this.controls.minDistance,this.controls.maxDistance);this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(s));this.controls.update();});
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.dirty=true;this.controls.addEventListener('change',()=>this.dirty=true);this.controls.enableDamping=true;this.controls.dampingFactor=.065;this.controls.enablePan=true;this.controls.minDistance=.5;this.controls.maxDistance=100;this.controls.autoRotateSpeed=.28;
  this.scene.add(new THREE.HemisphereLight(0xbfdcff,0x101627,2.3));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,5,4);this.scene.add(light);
  this.content=new THREE.Group();this.scene.add(this.content);
  const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,'rgba(255,255,255,0.4)');g.addColorStop(.24,'rgba(255,255,255,0.18)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,96,96);this.glowTexture=new THREE.CanvasTexture(c);
  new ResizeObserver(()=>this.resize()).observe(container);this.resize();
 }
 resize(){const {width,height}=this.container.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();if(this.data)this.resetCamera();}
 world(p,f=0){return new THREE.Vector3(p[0]-this.center[0],(p[2]||0)-this.center[2]+(this.mode==='time'?(f-.5)*this.extent*2.3:0),p[1]-this.center[1]);}
 clear(){while(this.content.children.length){const o=this.content.children[0];this.content.remove(o);o.traverse(x=>{x.geometry?.dispose();if(x.material){const ms=Array.isArray(x.material)?x.material:[x.material];ms.forEach(m=>m.dispose());}});}this.labels.forEach(x=>x.remove());this.labels=[];this.tubes=[];this.bodies=[];this.ghosts=[];this.arrows=[];}
 setData(data,comparison=null,ensemble=null,reset=true){
  this.data=data;this.comparison=comparison;this.ensemble=ensemble;this.clear();
  let lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(const arr of [data.positions,comparison||data.positions,...(ensemble?ensemble.members.map(m=>m.positions):[])])for(const row of arr)for(const p of row)for(let j=0;j<3;j++){const x=p[j]||0;lo[j]=Math.min(lo[j],x);hi[j]=Math.max(hi[j],x);}
  this.center=lo.map((v,i)=>(v+hi[i])/2);this.extent=Math.max(...hi.map((v,i)=>v-lo[i]),1)*.5;
  this.scene.fog.density=.012/this.extent;const radius=this.extent*.028;
  for(let body=0;body<data.masses.length;body++){
   const pts=data.positions.map((row,i)=>this.world(row[body],i/(data.positions.length-1)));
   const geo=new THREE.TubeGeometry(new Path(pts),Math.min(pts.length-1,1200),this.extent*.0035,5,false);
   const ghost=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:COLORS[body%8],transparent:true,opacity:.09,depthWrite:false}));this.content.add(ghost);
   const mat=new THREE.ShaderMaterial({uniforms:{color:{value:new THREE.Color(COLORS[body%8])},progress:{value:0},tail:{value:this.mode==='time'?1:.28}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 color;uniform float progress;uniform float tail;varying vec2 vUv;void main(){if(vUv.x>progress||vUv.x<progress-tail)discard;float a=smoothstep(progress-tail,progress,vUv.x);gl_FragColor=vec4(color,.2+.8*a);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
   const mesh=new THREE.Mesh(geo,mat);this.content.add(mesh);this.tubes.push(mat);
   const ball=new THREE.Mesh(new THREE.SphereGeometry(radius*Math.cbrt(data.masses[body]/Math.max(...data.masses)),24,16),new THREE.MeshStandardMaterial({color:COLORS[body%8],emissive:COLORS[body%8],emissiveIntensity:.45,roughness:.36,metalness:.12}));this.content.add(ball);this.bodies.push(ball);
   const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:this.glowTexture,color:COLORS[body%8],blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.setScalar(radius*10);ball.add(glow);
   const label=document.createElement('button');label.className='body-label';label.textContent=String(body+1);label.setAttribute('aria-label','Inspect body '+(body+1));label.style.setProperty('--body-color',COLORS[body%8]);label.addEventListener('click',()=>this.onSelect(body));this.container.appendChild(label);this.labels.push(label);
   const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),this.extent*.22,0xc4d1e6,this.extent*.045,this.extent*.018);this.content.add(arrow);this.arrows.push(arrow);
   const outline=new THREE.Mesh(new THREE.SphereGeometry(radius*1.45,14,10),new THREE.MeshBasicMaterial({color:COLORS[body%8],wireframe:true,transparent:true,opacity:.48,depthWrite:false}));this.content.add(outline);this.ghosts.push(outline);
   if(comparison){const positions=comparison.map((row,i)=>this.world(row[body],i/(comparison.length-1)));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(positions),new THREE.LineDashedMaterial({color:COLORS[body%8],transparent:true,opacity:.45,dashSize:this.extent*.02,gapSize:this.extent*.015,depthWrite:false}));line.computeLineDistances();line.userData.comparison=true;this.content.add(line);}
  }
  if(ensemble)for(const member of ensemble.members)for(let body=0;body<data.masses.length;body++){const pts=member.positions.map((row,i)=>this.world(row[body],i/(member.positions.length-1)));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:COLORS[body],transparent:true,opacity:.105,depthWrite:false}));line.userData.ensemble=true;this.content.add(line);}
  const grid=new THREE.GridHelper(this.extent*5,20,0x24354a,0x172333);grid.position.y=this.mode==='time'?-this.extent*1.2:-this.extent*.24;grid.material.transparent=true;grid.material.opacity=.33;this.content.add(grid);
  if(reset)this.resetCamera();this.update(this.progress);
 }
 resetCamera(top=false){const e=this.extent,aspect=Math.max(.35,this.camera.aspect),halfFov=this.camera.fov*Math.PI/360,fit=Math.max(1,1/aspect),distance=e*(this.mode==='time'?5.5:4.4)*fit;this.camera.position.copy(new THREE.Vector3(top?0:.22,top?1:2.1,top?.0001:3.8).normalize().multiplyScalar(distance));this.controls.target.set(0,0,0);this.controls.minDistance=e*.7;this.controls.maxDistance=Math.max(e*20,distance*3);this.camera.near=e*.001;this.camera.far=Math.max(e*100,distance*10);this.camera.updateProjectionMatrix();this.controls.update();}
 setMode(mode){this.mode=mode;if(this.data)this.setData(this.data,this.comparison,this.ensemble);}
 sample(arr,f){const k=Math.max(0,Math.min(arr.length-1,f*(arr.length-1))),a=Math.floor(k),b=Math.min(a+1,arr.length-1);return arr[a].map((p,i)=>[0,1,2].map(j=>(p[j]||0)+((arr[b][i][j]||0)-(p[j]||0))*(k-a)));}
 update(f){if(!this.data)return;this.dirty=true;this.progress=Math.max(0,Math.min(1,f));const positions=this.sample(this.data.positions,this.progress),other=this.comparison?this.sample(this.comparison,this.progress):positions;
  this.tubes.forEach(m=>m.uniforms.progress.value=this.progress);
  positions.forEach((p,i)=>{
   this.bodies[i].position.copy(this.world(p,this.progress));this.ghosts[i].position.copy(this.world(other[i],this.progress));this.ghosts[i].visible=this.showCompare&&!!this.comparison;
   const a=new THREE.Vector3();positions.forEach((q,j)=>{if(i===j)return;const d=new THREE.Vector3(q[0]-p[0],q[2]-p[2],q[1]-p[1]);a.addScaledVector(d,this.data.masses[j]/Math.max(d.length()**3,1e-18));});this.arrows[i].position.copy(this.bodies[i].position);this.arrows[i].visible=this.showForces&&a.length()>1e-15;if(a.length()>1e-15)this.arrows[i].setDirection(a.normalize());
  });
  this.content.children.forEach(o=>{if(o.userData.comparison){o.visible=this.showCompare;o.geometry.setDrawRange(0,Math.max(2,Math.floor(this.progress*o.geometry.attributes.position.count)));}if(o.userData.ensemble){o.visible=this.showEnsemble;o.geometry.setDrawRange(0,Math.max(2,Math.floor(this.progress*o.geometry.attributes.position.count)));}});
 }
 render(dt=.016){this.controls.autoRotate=this.auto;this.controls.update(dt);if(!this.dirty&&!this.auto)return;this.dirty=false;this.renderer.render(this.scene,this.camera);const w=this.container.clientWidth,h=this.container.clientHeight;
  this.bodies.forEach((b,i)=>{const p=b.position.clone().project(this.camera),label=this.labels[i],visible=p.z<1&&p.z>-1&&Math.abs(p.x)<.94&&Math.abs(p.y)<.94;label.style.display=visible?'grid':'none';label.style.transform=`translate(${(p.x+1)*w/2-label.offsetWidth/2}px,${(1-p.y)*h/2-label.offsetHeight-8}px)`;});
 }
}
