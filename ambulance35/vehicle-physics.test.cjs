const assert=require('node:assert/strict');
globalThis.Matter=require('./vendor/matter.min.js');
require('./vehicle-physics.js');
const create=globalThis.AmbulancePhysics35.create;
const wall={name:'wall',points:[[-15,-.1],[15,-.1],[15,.1],[-15,.1]],minY:0,maxY:2};
function crash(yaw,throttle=1){
  const hits=[],p=create([wall],hit=>hits.push(hit));p.reset(0,5,yaw);
  let bounced=false,minZ=Infinity;
  for(let i=0;i<2400;i++){
    const pose=p.step(1/120,{throttle,steer:0,brake:false},0);minZ=Math.min(minZ,pose.z);
    if(hits.length&&pose.vz>0)bounced=true;
    if(hits.length&&i>300)break;
  }
  return {hits,p,bounced,minZ};
}
const straight=crash(Math.PI),glancing=crash(Math.PI-.85);
assert(straight.hits.length>0&&straight.bounced,'head-on collision must bounce');
assert(straight.minZ>1,'car must not tunnel through wall');
assert(glancing.hits.length>0&&glancing.hits[0].speed<straight.hits[0].speed,'glancing impact must be less severe');
assert.equal(crash(Math.PI,.05).hits.length,0,'gentle resting contact should not cause repeated damage');
// Reset in the same neighborhood must rebuild the engine detector, not drop its colliders.
straight.p.reset(0,5,Math.PI);const before=straight.hits.length;
for(let i=0;i<240;i++)straight.p.step(1/120,{throttle:1,steer:0,brake:false},0);
assert(straight.hits.length>before,'same-location reset lost collisions');
const diamond=[[-1,-3],[1,-3],[1,3],[-1,3]].map(([x,z])=>[(x-z)/Math.sqrt(2),(x+z)/Math.sqrt(2)]);
const angled=create([{name:'angled bus',points:diamond,minY:0,maxY:2}],()=>{});
assert.deepEqual(angled.overlaps(3,3,0,0),[],'rotated bus must not use its oversized axis-aligned box');
assert(angled.overlaps(0,0,0,0).includes('angled bus'));
const tree=create([{name:'tree',x:0,z:0,radius:.1,minY:0,maxY:2}],()=>{});
assert.deepEqual(tree.overlaps(1,0,0,0),[]);assert(tree.overlaps(.55,0,0,0).includes('tree'));
assert.deepEqual(tree.overlaps(.55,0,0,3),[],'height filtering should permit passing above low scenery');
console.log('PASS: rigid-body rebound, no tunneling, glancing severity, gentle-contact suppression, reset, rotated bus and round trunk shapes.');
// Farm tire grip must suppress sideways slip in forward and reverse turns.
for(const dt of [1/120,1/60])for(const throttle of [1,-1])for(const steer of [-1,1]){
 function turningSlip(lateralGrip){
  const p=create([],()=>{},{maxSpeed:3.2,reverseSpeed:1.5,wheelbase:1.03,steerAngle:.6,lateralGrip});
  p.reset(0,0,0);let peak=0;
  for(let t=0;t<5;t+=dt){const pose=p.step(dt,{throttle,steer,brake:false},0);peak=Math.max(peak,Math.abs(pose.vx*Math.cos(pose.yaw)-pose.vz*Math.sin(pose.yaw)));}
  return peak;
 }
 const farm=turningSlip(60),original=turningSlip(4);
 assert(farm<original*.25,'Farm grip must substantially reduce sideways drift');
 assert(farm<.2,'Farm tires should track the steering direction');
}
console.log('PASS: high-grip forward/reverse steering at 60 and 120 Hz.');
let heightQueries=0;
const traffic=Array.from({length:20},(_,i)=>({id:'test'+i,p:[5+i*3,0,0],width:.8,length:1.8,yaw:0,speed:0}));
const cached=create([],()=>{},{traffic:()=>traffic,heightAt:()=>{heightQueries++;return 0;}});
cached.reset(0,0,0);cached.step(1/120,{throttle:0,steer:0,brake:true},0);
assert.equal(heightQueries,1,'road height is queried once, not once per nearby traffic vehicle');
console.log('PASS: one terrain-height lookup per traffic synchronization');
