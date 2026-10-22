/* Street furniture keeps one assembly transform, including during a fall. */
window.StreetProps128=(()=>{
 'use strict';
 const base=new URL('./',document.currentScript.src),records=new Map(),byCollider=new Map(),trafficPrevious=new Map();
 const movable=new Set(['streetlights','lanterns','signs','addedBenches','signal','bins','bin','hydrants','bollards','cycleRacks','benches','bench','newsboxes','cafeTables','flowerKiosks','busShelters','busBenches','parkingMeters','menus','refuseBags','dock','bike','scooter','railing','postbox','utility','dumpster']);
 let engine=null,finished=false,lastTime=0,lastNavigation=-1,error=null,glassBatch=null,waterBatch=null,jetBatch=null,geometry=null,contacts=[];
 const ready=Promise.all([import(new URL('core.mjs?v=20261021-crash162',base)),import(new URL('../../pc66/vendor/three/three.core.js',base))]).then(([m,three])=>{engine=new m.PropWorld();geometry=three;}).catch(e=>{error=e.message;console.error('Street physics',e);});
 function kind(n){const e=n.extras||{};if(e.tree||e.vegetation115||e.building125||e.contactOnly115||e.life111)return null;
  const type=e.street128||e.furnishing107||e.detail109||e.detail111||e.block126||(e.trafficSignal108?'signal':null);
  if(movable.has(type))return type;
  if(/^City106 riverwalk bench/.test(n.name))return 'bench';
  const supplied=n.name?.match(/^District115 supplied (\w+)/)?.[1];
  if(supplied)return {ParkBenchLong:'bench',TrashCanCap:'bins',PostBox:'postbox',FireHydrant:'hydrants',ParkingMeter:'parkingMeters',Utility:'utility',Dumpster:'dumpster'}[supplied]||null;
  if(/^District115 River entrance stair handrail/.test(n.name))return 'railing';
  return null;
 }
 function worldBounds(b,m){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const x of[b.lo[0],b.hi[0]])for(const y of[b.lo[1],b.hi[1]])for(const z of[b.lo[2],b.hi[2]]){const p=tp(m,x,y,z);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}}return {lo,hi};}
 function attach(n,batch,local,matName=''){
  const type=kind(n);if(!type)return false;
  let r=records.get(n.name);if(!r){r={id:n.name,type,parts:[],lo:[Infinity,Infinity,Infinity],hi:[-Infinity,-Infinity,-Infinity],glass:[],original:trs(n)};records.set(r.id,r);}
  const home=Array.from(batch.modelMatrix||IDENTITY),bounds=worldBounds(local,home),glass=/glass|lens/i.test(matName);
  r.parts.push({batch,home,local,bounds,glass,count:batch.count,emission:batch.emission});
  for(let k=0;k<3;k++){r.lo[k]=Math.min(r.lo[k],bounds.lo[k]);r.hi[k]=Math.max(r.hi[k],bounds.hi[k]);}
  if(glass)r.glass.push(bounds);
  if(n.extras?.collider107){const {center,size}=n.extras.collider107;r.contact=worldBounds({lo:center.map((v,k)=>v-size[k]/2),hi:center.map((v,k)=>v+size[k]/2)},r.original);}
  batch.streetProp128=r.id;
  return true;
 }
 function colliderFor(r){
  const b=r.contact||r,positions=[];for(const z of[b.lo[2],b.hi[2]])for(const y of[b.lo[1],b.hi[1]])for(const x of[b.lo[0],b.hi[0]])positions.push(x,y,z);
  registerCollider(r.id,'cityFurniture',new Float32Array(positions),new Uint32Array([0,2,1,1,2,3,4,5,6,5,7,6,0,4,2,4,6,2,1,3,5,3,7,5,2,6,3,3,6,7,0,1,4,1,5,4]),true,{walktestBarrier:true});
  if(finished&&baselineColliders?.length)baselineColliders.push(colliders[colliders.length-1]);
 }
 function finish(){
  if(!engine)return;
  for(const r of records.values())if(!r.prop){
   const existing=colliders.filter(c=>c.name===r.id);if(!existing.length)colliderFor(r);
   for(const c of colliders)if(c.name===r.id)byCollider.set(c.name,r.id);
   r.prop=engine.register(r);
  }
  engine.setFixed(colliders.filter(c=>!byCollider.has(c.name)&&!c.boundary&&c.hi[1]-c.lo[1]>.22&&((c.axisBox&&c.barrier&&(/footprint|wall|pillar|column|concrete|stone|planter|bus/i.test(c.name)||c.kind==='cityFurniture'))||/trunk|bus.*collider/i.test(c.name))).map((c,i)=>({id:c.name+':'+i,lo:c.lo,hi:c.hi})));
  window.CityLife111?.refreshFurniture?.([]);
  finished=true;
 }
 function disabled(name){const r=records.get(byCollider.get(name)||name);return !!r?.prop&&(!!r.prop.body||!!r.prop.disabled);}
 function strike(v){if(!engine||!finished)return 0;const drag=engine.sweep(v);for(const hit of engine.lastSweepHits)v.onImpact?.(hit);return drag;}
 function poseMatrix(p){return trs({translation:p.body.position.toArray(),rotation:p.body.quaternion.toArray()});}
 // Only props that are moving, or have just been reset, need new matrices and
 // contacts. A fallen prop at rest keeps the ones from its last movement.
 const live=new Set();let moved=false,sunDirty=false,sunAt=-Infinity;
 function samePose(r,body){
  const x=body.position,q=body.quaternion,last=r.pose161;
  if(last&&last[0]===x.x&&last[1]===x.y&&last[2]===x.z&&last[3]===q.x&&last[4]===q.y&&last[5]===q.z&&last[6]===q.w&&last[7]===r.prop.broken)return true;
  r.pose161=[x.x,x.y,x.z,q.x,q.y,q.z,q.w,r.prop.broken];return false;
 }
 function sync(){
  contacts=[];
  const list=[];for(const p of engine.active){const r=records.get(p.id);if(r)list.push(r);}
  for(const r of live)if(!r.prop?.body)list.push(r);
  live.clear();
  for(const r of list){
   const p=r.prop;
   if(p.body&&samePose(r,p.body)&&r.contact161){contacts.push(r.contact161);live.add(r);continue;}
   const delta=p.body?mm(poseMatrix(p),transform(p.origin.map(v=>-v))):null;
   for(const part of r.parts){const b=part.batch;b.modelMatrix=new Float32Array(delta?mm(delta,part.home):part.home);b.center=tp(b.modelMatrix,...part.local.center);b.count=p.broken&&part.glass?0:part.count;b.animated=!!p.body;b.hidden128=p.broken&&part.glass;}
   if(p.body){r.contact161=makeContact(r.id,engine.bounds(p));contacts.push(r.contact161);live.add(r);}
   else{r.contact161=null;r.pose161=null;}
   r.wasActive=!!p.body;moved=true;
  }
  const changed=engine.drainEvents().length>0;
  // Each hit, glass break and reset used to force two full-city sun shadow
  // renders. Bursts of impacts now share one re-render every 1.5 seconds.
  if(changed)sunDirty=true;
  const now=performance.now();if(sunDirty&&now-sunAt>1500){lastSunRoof=null;sunDirty=false;sunAt=now;}
  if(changed||moved&&engine.time-lastNavigation>.3){window.CityLife111?.refreshFurniture?.(contacts);lastNavigation=engine.time;moved=false;}
 }
 function makeContact(name,b){
  const v=[];for(const z of[b.lo[2],b.hi[2]])for(const y of[b.lo[1],b.hi[1]])for(const x of[b.lo[0],b.hi[0]])v.push([x,y,z]);
  const indices=[0,2,1,1,2,3,4,5,6,5,7,6,0,4,2,4,6,2,1,3,5,3,7,5,2,6,3,3,6,7,0,1,4,1,5,4],triangles=[];
  for(let i=0;i<indices.length;i+=3){const[a,c,d]=indices.slice(i,i+3).map(k=>v[k]);triangles.push({a,b:c,c:d,normal:norm(cross(sub(c,a),sub(d,a))),lo:b.lo,hi:b.hi});}
  return {id:'fallen:'+name,name:'Fallen '+name,kind:'fallenStreetProp',axisBox:true,barrier:true,lo:b.lo,hi:b.hi,triangles};
 }
 function tick(dt){
  if(!finished||!engine||state.paused||window.FarmScene63?.active)return;
  const vehicles=[];
  for(const v of window.CityLife111?.trafficBodies()||[]){
   const from=trafficPrevious.get(v.id),p=v.p;trafficPrevious.set(v.id,[p[0],p[2]]);
   vehicles.push({id:v.id,p:v.p,yaw:v.yaw,width:v.width,length:v.length,height:v.height,vx:Math.sin(v.yaw)*(v.speed||0),vz:Math.cos(v.yaw)*(v.speed||0)});
   if(from&&dt>0){const dx=p[0]-from[0],dz=p[2]-from[1],distance=Math.hypot(dx,dz),speed=Math.abs(v.speed||0);if(distance>1e-6&&distance<3)strike({id:v.id,x:p[0],z:p[2],y:p[1],from,yaw:v.yaw,width:v.width,length:v.length,height:v.height||.9,vx:dx/distance*speed,vz:dz/distance*speed,mass:v.kind==='bus'?11000:1500});}
  }
  const ambulance=window.Ambulance35?.snapshot();if(ambulance?.mounted)vehicles.push({id:'ambulance',p:[ambulance.x,window.District115?.heightAt(ambulance.x,ambulance.z)??-.1275,ambulance.z],yaw:ambulance.yaw,width:1.02,length:2.65,height:1.02,vx:ambulance.vx,vz:ambulance.vz});
  engine.setVehicles(vehicles);engine.step(Math.min(dt,.1));sync();
 }
 function frame(){const now=(window.frameNow164?.()??performance.now())/1000,dt=lastTime?Math.min(.1,now-lastTime):0;lastTime=now;tick(dt);}
 function draw(){
  if(!engine||!finished)return;
  if(!glassBatch){
   const batch=(g,color)=>{const p=g.attributes.position.array,n=g.attributes.normal.array,v=new Float32Array(p.length*2);for(let i=0;i<p.length/3;i++)v.set([...p.slice(i*3,i*3+3),...n.slice(i*3,i*3+3)],i*6);const b=uploadBatch(v,new Uint32Array(g.index?.array||Array.from({length:p.length/3},(_,i)=>i)),{color,metal:.12,rough:.09,transparent:true});g.dispose();return b;};
   glassBatch=batch(new geometry.TetrahedronGeometry(1),[.76,.89,.94,.78]);glassBatch.sharedKey='street161-glass';
   waterBatch=batch(new geometry.SphereGeometry(1,8,6),[.69,.86,.91,.62]);waterBatch.sharedKey='street161-water';
   jetBatch=batch(new geometry.CylinderGeometry(.3,1,1,12),[.72,.88,.93,.58]);jetBatch.sharedKey='street161-jet';
  }
  const glass=[],water=[],jets=[];
  for(const s of engine.shards){glass.push({modelMatrix:mm(trs({translation:s.body.position.toArray(),rotation:s.body.quaternion.toArray()}),transform([0,0,0],[s.size*2,s.size*2,s.size*2]))});}
  for(const p of engine.active)if(p.type==='hydrants'){
   const pressure=3.45,life=pressure/1.962,baseY=p.lo[1]+.025,height=.82+.04*Math.sin(p.age*19);
   jets.push({modelMatrix:transform([p.origin[0],baseY+height/2,p.origin[2]],[.024,height,.024])});
   for(let i=0;i<110;i++){const t=(p.age+i*life/110)%life,a=i*2.399,spread=.035+(i%9)*.023;
    const x=p.origin[0]+Math.cos(a)*spread*t,z=p.origin[2]+Math.sin(a)*spread*t,y=baseY+pressure*t-1.962*t*t;
    const r=.004+(i%4)*.002;water.push({modelMatrix:transform([x,y,z],[r,r*(1+Math.abs(pressure-3.924*t)*1.6),r])});
   }
   for(let i=0;i<12;i++){const a=i*2.399,r=.08+.19*((p.age*.7+i/12)%1);water.push({modelMatrix:transform([p.origin[0]+Math.cos(a)*r,baseY,p.origin[2]+Math.sin(a)*r],[.021,.005,.021])});}
  }
  if(glass.length||water.length){
   gl.uniform1i(uniforms.uVertexColor147??=gl.getUniformLocation(program,'uVertexColor147'),0);
   gl.uniform1i(uniforms.uNormalUV147??=gl.getUniformLocation(program,'uNormalUV147'),0);
   gl.uniform1f(uniforms.uFarmHairCut??=gl.getUniformLocation(program,'uFarmHairCut'),1e20);
  }
  if(glass.length)drawBuildingInstances(glassBatch,glass);
  if(jets.length)drawBuildingInstances(jetBatch,jets);
  if(water.length)drawBuildingInstances(waterBatch,water);
 }
 function enable(id,yes){const r=records.get(id);if(r?.prop){if(r.prop.body)engine.reset(r.prop);r.prop.disabled=!yes;const anchor=engine.fixedBodies.get('@'+id);if(anchor){engine.world.removeBody(anchor.body);engine.fixedBodies.delete('@'+id);}sync();}}
 return {ready,kind,attach,finish,disabled,strike,frame,draw,enable,worldBounds,
  matrix(id,home){const p=records.get(id)?.prop;return p?.body?mm(mm(poseMatrix(p),transform(p.origin.map(v=>-v))),home):home;},
  contacts:(lo,hi)=>contacts.filter(c=>[0,1,2].every(k=>c.hi[k]>=lo[k]&&c.lo[k]<=hi[k])),
  snapshot:()=>({ready:finished,error,...engine?.snapshot(),types:[...new Set([...records.values()].map(r=>r.type))]}),
  test:{get engine(){return engine;},get records(){return records;},tick,advance(dt){engine.step(dt);sync();},hit(id,v,p){const out=engine.hit(id,v,p);sync();return out;}}
 };
})();
