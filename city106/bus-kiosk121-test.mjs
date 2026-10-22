import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {createRequire} from 'node:module';
import {Document,NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {copyToDocument} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import * as T from '../pc66/vendor/three/three.core.js';
import {addCityLife} from './life111.mjs';
import {addTrafficSignals} from './signals.mjs';

// Build only the fleet into a temporary directory, then exercise street life in memory:
// node city106/vehicles114/build.mjs --output-dir /tmp/vmcq-bus121-fleet
// node city106/bus-kiosk121-test.mjs --fleet-dir /tmp/vmcq-bus121-fleet --traffic
const {values}=parseArgs({options:{'fleet-dir':{type:'string'},traffic:{type:'boolean'}}});
const dir=path.dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
const C=require('./life111.js'),RoadPose=require('./road-pose117.js');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),html=fs.readFileSync(path.join(dir,'../venue-frame.html'),'utf8');
const original=await io.readBinary(zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64')));
function bounds(node,scale=1){
 const m=node.getWorldMatrix(),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const p of node.getMesh().listPrimitives()){
  const a=p.getAttribute('POSITION');
  for(let i=0;i<a.getCount();i++){
   const v=a.getElement(i,[]);
   for(let k=0;k<3;k++){const x=(m[k]*v[0]+m[k+4]*v[1]+m[k+8]*v[2]+m[k+12])*scale;lo[k]=Math.min(lo[k],x);hi[k]=Math.max(hi[k],x);}
  }
 }
 return {lo,hi};
}
const worldBounds=n=>bounds(n,.3),size=b=>b.hi.map((x,k)=>x-b.lo[k]);
const union=bs=>({lo:[0,1,2].map(k=>Math.min(...bs.map(b=>b.lo[k]))),hi:[0,1,2].map(k=>Math.max(...bs.map(b=>b.hi[k])))});
const near=(a,b,message,epsilon=1e-5)=>assert(Math.abs(a-b)<epsilon,`${message}: ${a} vs ${b}`);
const actorHeight=Number(html.match(/const CHARACTER_HEIGHT=([.\d]+);/)[1]);
const actorMeasurements=[];
for(const id of ['brad_character','sara_character','roger_character','zoe','liz','jason_character']){
 const bytes=zlib.gunzipSync(Buffer.from(html.match(new RegExp('<script id="character-'+id+'"[^>]*>([^<]+)'))[1].trim(),'base64'));
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),body=json.extras.crowdAppearanceV11.bodyBounds;
 const height=body.max[1]-body.min[1],scale=actorHeight/height;
 actorMeasurements.push({id,sourceHeight:height,scale,height:height*scale});
 near(height*scale,.72,id+' outdoor body height');
}
const sourceBus=await io.read(path.join(dir,'../../work/traffic114/converted/bus.glb'));
const sourceBounds=union(sourceBus.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>bounds(n))),sourceSize=size(sourceBounds);
const school=original.getRoot().listNodes().find(n=>n.getName()==='School_bus_01_front'),schoolSize=size(worldBounds(school));
const fleet=await io.read(path.join(values['fleet-dir']||path.join(dir,'vehicles114'),'fleet.glb'));
const bus=fleet.getRoot().getExtras().models.find(m=>m.id==='bus'),unit=actorHeight/1.78;
for(const [key,axis] of [['width',0],['height',1],['length',2]])near(bus[key],sourceSize[axis]*unit,'bus '+key+' matches actor scale');
assert(bus.height>schoolSize[1]&&bus.height<schoolSize[1]*1.1,'bus and school bus roofs are comparable');
assert(bus.length>schoolSize[0]*1.8&&bus.length<schoolSize[0]*2,'articulated bus retains its longer proportions');
const busNodes=fleet.getRoot().listNodes().filter(n=>n.getName().startsWith('bus ')&&!n.getName().endsWith(' far'));
const rendered=union(busNodes.map(n=>bounds(n)));
for(const [key,axis] of [['width',0],['height',1],['length',2]])near(size(rendered)[axis],bus[key],'rendered bus '+key,1e-4);
near(rendered.lo[1],0,'bus ground');
assert.equal(bus.wheels.length,6);assert.equal(bus.wheels.filter(w=>w.front).length,2);
for(const wheel of bus.wheels){
 const node=busNodes.find(n=>n.getName()==='bus '+wheel.role),b=bounds(node);
 wheel.offset.forEach((x,k)=>near(x,node.getTranslation()[k],'wheel pivot'));
 near((b.hi[1]-b.lo[1])/2,wheel.radius,'wheel radius matches actual geometry',1e-4);
 assert(wheel.radius>.19&&wheel.radius<.205,'wheel uses bus scale');
 const far=fleet.getRoot().listMeshes().find(m=>m.getName()===node.getMesh().getExtras().farMesh114);
 node.getMesh().listPrimitives().forEach((p,i)=>assert.equal(p.getAttribute('POSITION'),far.listPrimitives()[i].getAttribute('POSITION'),'LOD shares scaled positions'));
}
const joint=busNodes.find(n=>n.getName()==='bus joint'),jointBounds=bounds(joint),art=bus.articulation117;
assert.deepEqual(joint.getMesh().getExtras().joint117,art);
near(jointBounds.lo[2],art.rearZ,'joint rear');near(jointBounds.hi[2],art.frontZ,'joint front');
assert(bounds(busNodes.find(n=>n.getName()==='bus rear')).hi[2]<=art.rearZ+1e-5);
assert(bounds(busNodes.find(n=>n.getName()==='bus body')).lo[2]>=art.frontZ-1e-5);
const axles=RoadPose.axles(bus.wheels);assert.equal(axles.length,3);
let contactError=0;
for(const yaw of [0,Math.PI])for(let z=-20;z<=20;z+=.25){
 const height=(x,z)=>.4+.16*Math.sin(z/7),v={...bus,p:[0,0,z],yaw,axles117:axles};
 const pose=RoadPose.vehicle(v,height),hitch=[0,art.hingeY,art.hingeZ];
 const a=RoadPose.point(pose.front,hitch),b=RoadPose.point(pose.rear,hitch);
 near(Math.hypot(...a.map((x,k)=>x-b[k])),0,'shared hitch');
 for(const axle of axles){const p=RoadPose.point(axle===axles[0]?pose.rear:pose.front,[0,axle.y,axle.z]);contactError=Math.max(contactError,Math.abs(p[1]-axle.radius-height(p[0],p[2])));}
}
assert(contactError<1e-5,'scaled axles maintain road contact');

// Use the same glTF document and mesh I/O as the build; do not emit city assets.
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Bus and kiosk regression');
const copied=copyToDocument(doc,fleet,fleet.getRoot().listMeshes()),models={};
const find=name=>copied.get(fleet.getRoot().listMeshes().find(m=>m.getName()===name));
for(const spec of fleet.getRoot().getExtras().models)models[spec.id]={...spec,body:find(spec.body),rear:spec.rear?find(spec.rear):null,joint:spec.joint?find(spec.joint):null,brake:spec.brake?find(spec.brake):null,headlight:spec.headlight?find(spec.headlight):null,wheels:spec.wheels.map(w=>({...w,mesh:find(spec.id+' '+w.role)}))};
const geo=(g,m)=>({g,m});
const box=(c,s,m,rx=0)=>{const g=new T.BoxGeometry(...s);g.rotateX(rx);g.translate(...c);return geo(g,m);};
const rod=(a,b,r0,r1,m,sides=7)=>{
 const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av),g=new T.CylinderGeometry(r1,r0,d.length(),sides);
 g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());return geo(g,m);
};
function mesh(name,parts){
 const out=doc.createMesh(name),accessor=(type,array)=>doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
 for(const {g,m} of parts){
  const p=doc.createPrimitive().setMaterial(m);
  for(const [name,type,key] of [['POSITION','VEC3','position'],['NORMAL','VEC3','normal'],['TEXCOORD_0','VEC2','uv']])p.setAttribute(name,accessor(type,g.attributes[key].array));
  if(g.index)p.setIndices(accessor('SCALAR',g.index.array));out.addPrimitive(p);
 }
 return out;
}
const material=(name,color,tex=null,metal=0,rough=.8)=>{const m=doc.createMaterial(name).setBaseColorFactor(color).setMetallicFactor(metal).setRoughnessFactor(rough);if(tex)m.setBaseColorTexture(tex);return m;};
const texture=async(name,bytes)=>doc.createTexture(name).setImage(bytes).setMimeType('image/png');
// These pre-existing decorations are not under test; their collision sizes come from addCityLife.
for(const name of ['City109 ribbed litter bin','City106 curved cast iron teak bench','City106 branching maple 1'])doc.createMesh(name);
const context={doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture};
const signals=addTrafficSignals({...context,iron:material('iron',[.1,.1,.1,1]),bolt:material('bolt',[.5,.5,.5,1])});
const life=await addCityLife({...context,signals,fleetModels:models});
const structures=original.getRoot().listNodes().filter(n=>n.getMesh()&&/column|pillar|wall|pylon|stone_base|door|stair|ramp/i.test(n.getName()+' '+n.getExtras().kind)).map(n=>({name:n.getName(),...worldBounds(n)}));
const intersects=(a,b,margin=0)=>[0,1,2].every(k=>a.lo[k]<b.hi[k]+margin&&a.hi[k]>b.lo[k]-margin);
const boxBounds=n=>{
 const {size:s,center:c}=n.getExtras().collider107,m=new T.Matrix4().fromArray(n.getWorldMatrix()),b=new T.Box3(new T.Vector3(...c).addScaledVector(new T.Vector3(...s),-.5),new T.Vector3(...c).addScaledVector(new T.Vector3(...s),.5)).applyMatrix4(m);
 return {lo:b.min.toArray(),hi:b.max.toArray()};
};
const kiosks=scene.listChildren().filter(n=>n.getExtras().detail111==='flowerKiosks'),clearances=[];
assert.equal(kiosks.length,3);
for(const kiosk of kiosks){
 const visual=bounds(kiosk),collider=boxBounds(kiosk);
 for(let k=0;k<3;k++){assert(collider.lo[k]<=visual.lo[k]+1e-6);assert(collider.hi[k]>=visual.hi[k]-1e-6,'collider encloses canopy');}
 const adjacent=structures.filter(s=>s.lo[1]<visual.hi[1]&&s.hi[1]>visual.lo[1]);
 for(const structure of adjacent)assert(!intersects(collider,structure,.25),kiosk.getName()+' clears '+structure.name);
 for(const w of life.walks){
  const cross=w.axis===0?2:0,width=w.id==='front'?.97:w.id==='east'?.57:w.id==='river'?1.15:w.id.startsWith('park')?.60:.32;
  const corridor={lo:[-Infinity,-Infinity,-Infinity],hi:[Infinity,Infinity,Infinity]};
  corridor.lo[w.axis]=w.start-w.offset-.16;corridor.hi[w.axis]=w.end+w.offset+.16;
  corridor.lo[cross]=w.cross-width-.16;corridor.hi[cross]=w.cross+width+.16;
  assert(!intersects(collider,corridor),kiosk.getName()+' clears the full pedestrian corridor '+w.id);
 }
 for(const other of scene.listChildren().filter(n=>n!==kiosk&&n.getExtras().collider107))assert(!intersects(collider,boxBounds(other)),kiosk.getName()+' clears '+other.getName());
 const distance=b=>Math.hypot(Math.max(b.lo[0]-collider.hi[0],collider.lo[0]-b.hi[0],0),Math.max(b.lo[2]-collider.hi[2],collider.lo[2]-b.hi[2],0));
 const nearest=adjacent.sort((a,b)=>distance(a)-distance(b))[0];
 clearances.push({p:kiosk.getTranslation(),structure:nearest.name,gap:distance(nearest)});
}
const column=structures.find(n=>n.name==='Right_facade_round_column_7');
assert(intersects({lo:[39.57,-.0285,35.53],hi:[40.43,1.034,36.27]},column),'test detects the original pillar collision');
for(const a of life.vehicles)for(const b of [...life.vehicles,...life.obstacles])if(a.id!==b.id)assert(!C.overlap(a,b),'initial footprint overlap '+a.id+' / '+b.id);
for(const lane of life.lanes){
 const cars=life.vehicles.filter(v=>v.lane===lane.id).sort((a,b)=>a.s-b.s);
 for(let i=0;i<cars.length;i++){
  const a=cars[i],b=cars[(i+1)%cars.length],gap=(b.s-a.s+lane.length)%lane.length-(a.length+b.length)/2;
  assert(gap>=.4-1e-8,'initial following clearance including lane wrap');
  if(a.kind==='bus'){assert.equal(a.length,bus.length);assert.equal(a.width,bus.width);assert.equal(a.height,bus.height);assert.deepEqual(a.articulation117,art);assert.deepEqual(a.axles117,axles);assert(!a.turns114);assert(Math.abs(lane.cross-lane.roadCenter)+a.width/2<lane.roadHalf,'bus fits its road');}
  if(a.kind==='bus'){
   const junctions=[...lane.junctions].sort((a,b)=>a.q-b.q);
   for(let i=1;i<junctions.length;i++)assert(junctions[i].q-junctions[i].half-junctions[i-1].q-junctions[i-1].half>=a.length+.4,'bus can stop between adjacent junctions without blocking either');
  }
 }
}
const lane={id:'test',axis:2,cross:0,start:0,end:80,length:80,dir:1,signal:'ns',stops:[{s:25}]};
const queue=[{id:'bus',kind:'bus',lane:'test',s:12,...bus,maxSpeed:1.55},{id:'car',lane:'test',s:4,length:1.5,width:.6,maxSpeed:2.4}];
for(const v of queue)Object.assign(v,{p:[0,0,v.s],yaw:0});
for(let i=0;i<600;i++)C.trafficStep(queue,[lane],.05,{ns:'red'},null);
near(queue[0].s+bus.length/2,25,'bus nose at stop line');
assert(queue[0].s-queue[1].s>=(bus.length+queue[1].length)/2+.399,'car queues behind full bus length');
for(let i=0;i<200;i++)C.trafficStep(queue,[lane],.05,{ns:'green'},null);
assert(queue[0].s>30&&queue[1].s>25,'both depart on green');
console.log('PASS actor/source/processed dimensions, six wheels, LODs, articulation, road contact, all kiosk structure/corridor/furniture clearances, spawn/wrap spacing and signal queue');
console.log(JSON.stringify({actors:actorMeasurements,sourceBus:sourceSize,schoolBus:{length:schoolSize[0],height:schoolSize[1],width:schoolSize[2]},bus:{length:bus.length,width:bus.width,height:bus.height},contactError,kiosks:clearances,vehicles:life.vehicles.length,buses:life.vehicles.filter(v=>v.kind==='bus').length},null,2));
if(values.traffic)for(const offset of [0,5,22,40]){
 const cars=structuredClone(life.vehicles),obstacles=structuredClone(life.obstacles),traffic=[...cars,...obstacles];let lastCycle;
 for(let i=0;i<5280;i++){
  if(i===4400)lastCycle=cars.map(v=>v.travel||0);
  const t=(i*.05+offset)%44;
  C.trafficStep(traffic,life.lanes,.05,{ns:t<18?'green':t<21?'yellow':'red',ew:t>=22&&t<40?'green':t>=40&&t<43?'yellow':'red'},null);
  for(const a of cars)assert(a.p.every(Number.isFinite)&&Number.isFinite(a.yaw),'finite vehicle transform');
  // Sweep every potential pair, including long buses beyond the runtime's nearest spatial bin.
  const sorted=[...traffic].sort((a,b)=>a.p[0]-b.p[0]);
  for(let a=0;a<sorted.length;a++)for(let b=a+1;b<sorted.length&&sorted[b].p[0]-sorted[a].p[0]<10;b++)if(Math.abs(sorted[a].p[2]-sorted[b].p[2])<10)assert(!C.overlap(sorted[a],sorted[b]),`traffic overlap ${sorted[a].id} / ${sorted[b].id} at ${i}, phase ${offset}`);
 }
 const minimum=Math.min(...cars.map((v,i)=>v.parked?Infinity:(v.travel||0)-lastCycle[i]));
 if(minimum<=1)console.log('STALLED',JSON.stringify(cars.filter((v,i)=>!v.parked&&(v.travel||0)-lastCycle[i]<=1).map(v=>({id:v.id,kind:v.kind,lane:v.lane,p:v.p,reason:v.reason,travel:v.travel,turn:v.turn114,nearby:traffic.filter(o=>o!==v&&Math.hypot(o.p[0]-v.p[0],o.p[2]-v.p[2])<9).map(o=>({id:o.id,kind:o.kind,lane:o.lane,p:o.p,yaw:o.yaw,reason:o.reason,parked:o.parked}))})),null,2));
 assert(minimum>1,'no stationary vehicle in the final signal cycle: phase '+offset+', minimum '+minimum);
 console.log('PASS six-cycle traffic, phase',offset,'minimum final-cycle travel',minimum);
}
