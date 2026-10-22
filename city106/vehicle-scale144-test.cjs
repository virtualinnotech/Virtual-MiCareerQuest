const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
const C=require('./life111.js'),Road=require('./road-pose117.js');
const bytes=zlib.gunzipSync(fs.readFileSync(__dirname+'/city.glb.gz'));
const city=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),source=city.extras.life111;
const expected={classic:1.20,sedan:1.18,taxi:1.08,suv:1.10,pickup:1.10,van:1.08,delivery:1.08,police:1,'police-suv':1,bus:1};
const close=(a,b,e=1e-7)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
const original=JSON.stringify(source),cars=source.vehicles.map(C.scaledVehicle144),byId=new Map(cars.map(v=>[v.id,v]));
assert.equal(cars.length,407);assert.equal(new Set(cars.map(v=>v.kind)).size,10);
for(let i=0;i<cars.length;i++){
 const v=cars[i],old=source.vehicles[i],factor=expected[v.kind];
 assert.equal(v.scale144,factor);assert.deepEqual(v.p,old.p);assert.notEqual(v.p,old.p);
 for(const key of ['length','width','height','frontZ','radius','wheelbase'])close(v[key],old[key]*factor);
 close(v.width/v.length,old.width/old.length);close(v.height/v.length,old.height/old.length);
 for(const ground of [()=>-.1275,(x,z)=>-.1275+.08*z+.03*x]){
  const pose=Road.vehicle(v,ground);
  for(const axle of v.axles117){const p=Road.point(pose.front,[0,axle.y,axle.z]);close(p[1]-axle.radius,ground(p[0],p[2]),1e-5);}
 }
 const centered={...v,p:[0,0,0],yaw:0},point=[v.width/2,.36,0];
 C.resolveVehiclePoint(point,point,[.16,.36,.16],[centered]);assert(point[0]>=v.width/2+.16);
}
let parts=0;
for(const node of city.nodes){
 const part=node.extras?.life111;if(!part)continue;
 const factor=byId.get(part.id)?.scale144||1,before=JSON.stringify(node),scaled=C.scaledVehiclePart144(part,node.scale,factor);
 assert.equal(JSON.stringify(node),before);
 for(let i=0;i<3;i++){
  const f=part.role==='shadow'&&i===1?1:factor;
  close(scaled.offset[i],part.offset[i]*f);close(scaled.scale[i],(node.scale?.[i]||1)*f);
 }
 if(part.role==='wheel'){
  close(scaled.radius,part.radius*factor);
  close((1/scaled.radius)*factor,1/part.radius);
  const v=byId.get(part.id);assert(v.axles117.some(a=>Math.abs(a.z-scaled.offset[2])<.07));
 }
 parts++;
}
assert.equal(JSON.stringify(source),original,'source metadata stays unmodified on reload');
assert.equal(C.scaledVehicle144({...source.vehicles[0],kind:'unknown'}).scale144,1);
console.log('PASS all 407 vehicles / 10 models, '+parts+' part transforms, proportions, parked cars, wheels, headlights, shadows, collisions and sloped road contact');

function overlaps(fleet){
 const bins=new Map(),pairs=[];
 for(const v of fleet){const key=Math.floor(v.p[0]/6)+','+Math.floor(v.p[2]/6);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(v);}
 for(const a of fleet){const x=Math.floor(a.p[0]/6),z=Math.floor(a.p[2]/6);
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const b of bins.get((x+dx)+','+(z+dz))||[])
   if(a.id<b.id&&C.overlap(a,b))pairs.push(a.id+' '+b.id);
 }
 return pairs;
}
assert.deepEqual(overlaps(cars),[],'scaled spawn footprints do not overlap, including safety margins');
for(const offset of [0,22]){
 const fleet=source.vehicles.map(v=>({...C.scaledVehicle144(v),speed:0,travel:0}));let last;
 for(let step=0;step<5280;step++){
  if(step===4400)last=fleet.map(v=>v.travel);
  const t=(step*.05+offset)%44;
  C.trafficStep(fleet,source.lanes,.05,{ns:t<18?'green':t<21?'yellow':'red',ew:t>=22&&t<40?'green':t>=40&&t<43?'yellow':'red'},null);
  assert(fleet.every(v=>v.p.every(Number.isFinite)&&Number.isFinite(v.yaw)));
  assert.deepEqual(overlaps(fleet),[],'traffic overlap at '+step+' phase '+offset);
 }
 const minTravel=Math.min(...fleet.filter(v=>!v.parked).map(v=>v.travel)),minCycle=Math.min(...fleet.map((v,i)=>v.parked?Infinity:v.travel-last[i]));
 assert(minTravel>30&&minCycle>1,'all moving vehicles remain live across six traffic cycles');
 assert(fleet.some(v=>v.turnCount>1),'vehicles turn through multiple junctions');
 console.log('PASS six traffic cycles at phase',offset,{minTravel,minCycle});
}
