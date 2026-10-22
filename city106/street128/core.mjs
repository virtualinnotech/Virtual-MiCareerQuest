import * as C from './vendor/cannon-es.mjs';

export const RESET_SECONDS=30;
const V=a=>new C.Vec3(...a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const masses={streetlights:85,lanterns:42,signal:110,hydrants:45,bins:18,bin:18,newsboxes:25,menus:9,refuseBags:4,signs:18,parkingMeters:23,cycleRacks:28,dock:55,bike:24,scooter:18,busShelters:160,flowerKiosks:75,railing:60,postbox:45,utility:85,dumpster:180};
const overlap=(a,b)=>[0,1,2].every(k=>a.lo[k]<=b.hi[k]&&a.hi[k]>=b.lo[k]);
const box=(lo,hi)=>({lo,hi});
const center=b=>b.lo.map((v,k)=>(v+b.hi[k])/2);
const size=b=>b.lo.map((v,k)=>Math.max(.025,b.hi[k]-v));
export class PropWorld {
 constructor(){
  this.world=new C.World({gravity:new C.Vec3(0,-3.924,0),allowSleep:true});
  this.world.broadphase=new C.SAPBroadphase(this.world);this.world.solver.iterations=10;
  this.world.defaultContactMaterial.friction=.65;this.world.defaultContactMaterial.restitution=.13;
  this.props=new Map();this.active=new Set();this.bins=new Map();this.shards=[];this.time=0;this.events=[];this.fixed=[];this.fixedBodies=new Map();this.vehicleBodies=new Map();this.groundBodies=new Map();this.serial=0;this.pending=new Map();
 }
 register(def){
  if(this.props.has(def.id))throw Error('Duplicate street prop '+def.id);
  const p={...def,origin:center(def),size:size(def),mass:masses[def.type]||42,age:0,broken:false,body:null,resets:0,hitCount:0};
  p.contact=def.contact||box(def.lo,def.hi);this.props.set(p.id,p);
  for(let x=Math.floor(p.contact.lo[0]/4);x<=Math.floor(p.contact.hi[0]/4);x++)for(let z=Math.floor(p.contact.lo[2]/4);z<=Math.floor(p.contact.hi[2]/4);z++){const key=x+','+z;if(!this.bins.has(key))this.bins.set(key,new Set());this.bins.get(key).add(p);}
  return p;
 }
 setFixed(items){this.fixed=items;}
 setVehicles(items){
  const keep=new Set(),active=[...this.active];
  for(const v of items)if(active.some(p=>Math.hypot(p.body.position.x-v.p[0],p.body.position.z-v.p[2])<7+(v.length||2)/2)){
   keep.add(v.id);let b=this.vehicleBodies.get(v.id);
   if(!b){b=new C.Body({type:C.Body.KINEMATIC,mass:0});b.addShape(new C.Box(new C.Vec3(v.width/2,(v.height||.9)/2,v.length/2)));this.world.addBody(b);this.vehicleBodies.set(v.id,b);}
   b.position.set(v.p[0],v.p[1]+(v.height||.9)/2,v.p[2]);b.quaternion.setFromAxisAngle(new C.Vec3(0,1,0),v.yaw||0);b.velocity.set(v.vx||0,0,v.vz||0);b.aabbNeedsUpdate=true;
  }
  for(const[id,b]of this.vehicleBodies)if(!keep.has(id)){this.world.removeBody(b);this.vehicleBodies.delete(id);}
 }
 addBox(body,b,origin){const c=center(b);body.addShape(new C.Box(V(size(b).map(v=>v/2))),V(c.map((v,k)=>v-origin[k])));}
 addGround(p){
  // Shared, non-overlapping tiles avoid stacking a full ground slab beneath
  // every fallen object (and multiplying every debris/ground contact).
  // Props on one sidewalk differ by millimetres in base height; sharing a
  // 2 cm level keeps their tiles from stacking into separate overlapping slabs.
  p.grounds=[];const y=Math.round(p.lo[1]*50)/50,tile=8;
  for(let x=Math.floor((p.origin[0]-7)/tile);x<=Math.floor((p.origin[0]+7)/tile);x++)for(let z=Math.floor((p.origin[2]-7)/tile);z<=Math.floor((p.origin[2]+7)/tile);z++){
   const key=[x,z,y].join(',');let ground=this.groundBodies.get(key);
   if(!ground){const body=new C.Body({mass:0,position:new C.Vec3((x+.5)*tile,y-.14,(z+.5)*tile)});body.addShape(new C.Box(new C.Vec3(tile/2,.14,tile/2)));this.world.addBody(body);ground={body,users:0};this.groundBodies.set(key,ground);}
   ground.users++;p.grounds.push(key);
  }
 }
 obstacles(p){
  // Nearby permanent geometry participates in the same rigid-body simulation.
  const region={lo:p.origin.map(v=>v-6),hi:p.origin.map(v=>v+6)};
  for(const f of this.fixed)if(overlap(region,f)&&!this.fixedBodies.has(f.id)){
   const body=new C.Body({mass:0,position:V(center(f))});this.addBox(body,f,center(f));this.world.addBody(body);this.fixedBodies.set(f.id,{body,box:f});
  }
  for(const other of this.props.values())if(other!==p&&!other.body&&!other.disabled&&overlap(region,other.contact)&&!this.fixedBodies.has('@'+other.id)){
   const b=new C.Body({mass:0,position:V(other.origin)});this.addBox(b,other.contact,other.origin);b.userData=other;this.world.addBody(b);this.fixedBodies.set('@'+other.id,{body:b,box:other.contact});
  }
 }
 hit(id,velocity,point){
  const p=this.props.get(id);if(!p||p.disabled)return false;
  const speed=Math.hypot(velocity.x,velocity.z);if(speed<.25)return false;
  if(!p.body){
   const anchor=this.fixedBodies.get('@'+id);if(anchor){this.world.removeBody(anchor.body);this.fixedBodies.delete('@'+id);}
   const b=new C.Body({mass:p.mass,position:V(p.origin),linearDamping:.22,angularDamping:.35,sleepSpeedLimit:.065,sleepTimeLimit:.8});
   // A pole's footprint is narrow; its arm and lantern are part of one compound body.
   if(/streetlights|lanterns|signal/.test(p.type)){
    this.addBox(b,p.contact,p.origin);
    for(const glass of p.glass||[])this.addBox(b,glass,p.origin);
   }else this.addBox(b,p,p.origin);
   b.userData=p;b.addEventListener('collide',e=>{
    if(p.glass?.length&&!p.broken&&p.age>.12&&Math.abs(e.contact.getImpactVelocityAlongNormal())>.5)this.breakGlass(p);
    const other=e.body.userData;if(other&&!other.body&&b.velocity.length()>.5&&!this.pending.has(other.id))this.pending.set(other.id,{id:other.id,v:{x:b.velocity.x,z:b.velocity.z,mass:p.mass},p:b.position.vadd(e.contact.bi===b?e.contact.ri:e.contact.rj).toArray()});
   });
   p.body=b;p.age=0;this.active.add(p);this.world.addBody(b);this.obstacles(p);
   this.addGround(p);
   this.events.push({type:'hit',id:p.id});
  }
  const reduced=p.mass*(velocity.mass||95)/(p.mass+(velocity.mass||95));
  const momentum=Math.min(7,speed)*reduced*.85;
  const at=point||[p.origin[0],p.lo[1]+Math.min(.48,p.size[1]*.7),p.origin[2]];
  p.body.wakeUp();p.body.applyImpulse(new C.Vec3(velocity.x/speed*momentum,Math.min(.5,speed*.06)*reduced,velocity.z/speed*momentum),V(at.map((v,k)=>v-p.body.position.toArray()[k])));
  p.hitCount++;if(speed>3.2)this.breakGlass(p);return true;
 }
 breakGlass(p){
  if(p.broken||!p.glass?.length)return;p.broken=true;this.events.push({type:'glass',id:p.id});
  for(const pane of p.glass){
   const local=V(center(pane).map((v,k)=>v-p.origin[k])),origin=p.body.pointToWorldFrame(local);
   for(let i=0;i<10&&this.shards.length<96;i++){
    const r=.015+(i%3)*.008,b=new C.Body({mass:.012,position:origin.clone(),linearDamping:.18,angularDamping:.15,collisionFilterGroup:2,collisionFilterMask:1});
    b.addShape(new C.Box(new C.Vec3(r,r*.25,r*.65)));
    const a=i*2.399+this.serial++*.07;b.velocity.set(p.body.velocity.x+Math.cos(a)*.8,.3+(i%4)*.2,p.body.velocity.z+Math.sin(a)*.8);b.angularVelocity.set(i*.8,3,-2);this.world.addBody(b);this.shards.push({body:b,age:0,size:r,owner:p.id});
   }
  }
 }
 sweep(v){
  this.lastSweepHits=[];
  if(!v||Math.hypot(v.vx||0,v.vz||0)<.25)return 0;
  const from=v.from||[v.x,v.z],end=[v.x,v.z],length=Math.hypot(end[0]-from[0],end[1]-from[1]);
  // Teleports/respawns are not impacts. The caller supplies actual velocity.
  if(length>8)return 0;
  const reach=(v.length||.7)/2+(v.width||.4)/2+.4,candidates=new Set();
  for(let x=Math.floor((Math.min(from[0],end[0])-reach)/4);x<=Math.floor((Math.max(from[0],end[0])+reach)/4);x++)for(let z=Math.floor((Math.min(from[1],end[1])-reach)/4);z<=Math.floor((Math.max(from[1],end[1])+reach)/4);z++)for(const p of this.bins.get(x+','+z)||[])candidates.add(p);
  for(const p of this.active)if(Math.hypot(p.body.position.x-v.x,p.body.position.z-v.z)<reach+4)candidates.add(p);
  let drag=0;const steps=Math.max(1,Math.ceil(length/.09)),sin=Math.sin(v.yaw||0),cos=Math.cos(v.yaw||0);
  for(const p of candidates){
   if(p.disabled||p.id===v.id)continue;
   const bounds=p.body?this.bounds(p):p.contact;
   if(bounds.hi[1]<(v.y??0)+.07||bounds.lo[1]>(v.y??0)+(v.height||.8))continue;
   const c=center(bounds),sx=(bounds.hi[0]-bounds.lo[0])/2,sz=(bounds.hi[2]-bounds.lo[2])/2;
   for(let i=0;i<=steps;i++){
    const t=i/steps,x=from[0]+(end[0]-from[0])*t,z=from[1]+(end[1]-from[1])*t,dx=c[0]-x,dz=c[2]-z;
    if(Math.abs(dx)>sx+Math.abs(sin)*(v.length||.7)/2+Math.abs(cos)*(v.width||.4)/2||Math.abs(dz)>sz+Math.abs(cos)*(v.length||.7)/2+Math.abs(sin)*(v.width||.4)/2)continue;
    if(Math.abs(dx*cos-dz*sin)>(v.width||.4)/2+sx*Math.abs(cos)+sz*Math.abs(sin)||Math.abs(dx*sin+dz*cos)>(v.length||.7)/2+sx*Math.abs(sin)+sz*Math.abs(cos))continue;
    if(p.lastHit&&this.time-p.lastHit.time<.6&&p.lastHit.id===v.id)break;
    if(this.hit(p.id,{x:v.vx,z:v.vz,mass:v.mass},[clamp(x,bounds.lo[0],bounds.hi[0]),Math.max(bounds.lo[1]+.08,(v.y??0)+.32),clamp(z,bounds.lo[2],bounds.hi[2])])){
     p.lastHit={time:this.time,id:v.id};drag=Math.max(drag,clamp(p.mass/(p.mass+(v.mass||95))*.6,.015,.45));
     this.lastSweepHits.push({name:p.id,x:c[0],z:c[2],speed:Math.hypot(v.vx,v.vz),mass:p.mass});
    }break;
   }
  }return drag;
 }
 bounds(p){if(p.body.aabbNeedsUpdate)p.body.updateAABB();return {lo:p.body.aabb.lowerBound.toArray(),hi:p.body.aabb.upperBound.toArray()};}
 reset(p){
  this.world.removeBody(p.body);
  for(const key of p.grounds){const ground=this.groundBodies.get(key);if(!--ground.users){this.world.removeBody(ground.body);this.groundBodies.delete(key);}}
  p.body=null;p.grounds=null;p.age=0;p.broken=false;p.lastHit=null;p.resets++;this.active.delete(p);
  this.shards=this.shards.filter(s=>{if(s.owner!==p.id)return true;this.world.removeBody(s.body);return false;});this.events.push({type:'reset',id:p.id});
 }
 step(dt){
  if(!Number.isFinite(dt)||dt<=0)return;
  const steps=Math.ceil(dt/(1/60)),h=dt/steps;
  for(let i=0;i<steps;i++){
   this.time+=h;if(this.active.size||this.shards.length)this.world.step(h);
   for(const hit of this.pending.values())if(!this.props.get(hit.id)?.body)this.hit(hit.id,hit.v,hit.p);
   this.pending.clear();
   for(const p of this.active){p.age+=h;if(p.age+1e-7>=RESET_SECONDS)this.reset(p);}
   this.shards=this.shards.filter(s=>{s.age+=h;if(s.age<5)return true;this.world.removeBody(s.body);return false;});
  }
  const near=(p,b)=>[0,1,2].every(k=>p.origin[k]-7<=b.hi[k]&&p.origin[k]+7>=b.lo[k]);
  for(const[id,f]of this.fixedBodies){let used=false;for(const p of this.active)if(near(p,f.box)){used=true;break;}if(!used){this.world.removeBody(f.body);this.fixedBodies.delete(id);}}
  if(!this.active.size)this.setVehicles([]);
 }
 drainEvents(){return this.events.splice(0);}
 snapshot(){return {count:this.props.size,active:[...this.active].map(p=>({id:p.id,type:p.type,age:p.age,broken:p.broken,position:p.body.position.toArray(),quaternion:p.body.quaternion.toArray()})),shards:this.shards.length,bodies:this.world.bodies.length,time:this.time};}
}
