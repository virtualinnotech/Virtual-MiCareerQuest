const assert=require('node:assert/strict');
globalThis.Matter=require('./vendor/matter.min.js');
const R=require('./recovery123.js'),map=require('./minimap120.js'),life=require('../city106/life111.js');
require('./vehicle-physics.js');
const lane=(axis=2,dir=1)=>({id:'test',axis:axis===2?1:0,dir,start:-100,end:100,length:200,cross:0,signal:'ew',stops:[]});
const vehicle=(p,yaw=0)=>({id:'car',kind:'sedan',p,yaw,width:.85,length:2,lane:'test',s:100,maxSpeed:2,speed:0,travel:0,crashed:true});
function fixture(v,l,obstacles=[],others=[]){
 const fleet=[v,...others],p=AmbulancePhysics35.create(obstacles,()=>{},{traffic:()=>fleet,lanes:()=>[l],heightAt:()=>0});
 p.reset(50,-60,0);p.step(1/60,{throttle:0,steer:0,brake:true},0);return {p,fleet};
}
for(const axis of[0,2])for(const dir of[-1,1])for(const yawOffset of[-.45,0,.45])for(const dt of[1/60,1/120]){
 const l=lane(axis,dir),v=vehicle(axis===0?[0,0,.9]:[.9,0,0],R.laneYaw(l)+yawOffset),{p,fleet}=fixture(v,l);
 let maxStep=0,maxSlip=0,steered=false;
 for(let t=0;t<35&&v.crashed;t+=dt){
  const old={p:[...v.p],yaw:v.yaw};p.coast(dt,0);const dx=v.p[0]-old.p[0],dz=v.p[2]-old.p[2],d=Math.hypot(dx,dz),yaw=old.yaw+R.angle(v.yaw-old.yaw)/2;
  maxStep=Math.max(maxStep,d);if(d>.00001)maxSlip=Math.max(maxSlip,Math.abs(dx*Math.cos(yaw)-dz*Math.sin(yaw))/d);steered||=Math.abs(v.steer115||0)>.02;
 }
 assert(!v.crashed,'vehicle failed to recover '+JSON.stringify({axis,dir,yawOffset,p:v.p,reason:v.reason,distance:v.recovery123?.distance,length:v.recovery123?.path?.length}));
 assert.equal(v.recoveryResets123||0,0,'routine collision must drive back, not teleport');
 assert(maxStep<.025&&maxSlip<.025,'recovery must follow heading without lateral sliding');assert(steered);
 assert(Math.abs(v.p[axis===0?2:0])<1e-8);assert(Math.abs(R.angle(v.yaw-R.laneYaw(l)))<1e-8);
 const travel=v.travel;for(let i=0;i<100;i++)life.trafficStep(fleet,[l],.05,{ew:'green'},null);
 assert(v.travel>travel+3,'normal traffic never resumed');
}
// A collision must wake the same recovery controller even after dismount/reset.
for(const offset of[Math.PI/2,-Math.PI/2,Math.PI]){
 const l=lane(),v={...vehicle([2,0,0],offset),kind:'bus',width:1.26,length:7.46}, {p}=fixture(v,l);
 for(let i=0;i<6000&&v.crashed;i++)p.coast(1/60,0);
 assert(!v.crashed,'spun full-size bus must rejoin or safely reset');assert.equal(v.lane,l.id);
}
{
 const l=lane(),v=vehicle([0,0,0]);v.crashed=false;let hits=0;
 const p=AmbulancePhysics35.create([],()=>hits++,{traffic:()=>[v],lanes:()=>[l],heightAt:()=>0});p.reset(0,-8,0);
 for(let i=0;i<300&&!v.crashed;i++)p.step(1/120,{throttle:1,steer:0,brake:false},0);
 assert(v.crashed&&hits>0);p.reset(50,-60,0);
 for(let i=0;i<2400&&v.crashed;i++)p.coast(1/60,0);
 assert(!v.crashed);assert.equal(v.recoveries123,1);
 // Another impact restarts recovery rather than reviving stale yield offsets.
 v.yieldPath120={progress:2};v.offset115=.7;p.reset(v.p[0],v.p[2]-8,v.yaw);
 for(let i=0;i<300&&!v.crashed;i++)p.step(1/120,{throttle:1,steer:0,brake:false},0);
 assert(v.crashed);assert.equal(v.yieldPath120,null);p.reset(50,-60,0);
 for(let i=0;i<2400&&v.crashed;i++)p.coast(1/60,0);
 assert(!v.crashed);assert.equal(v.offset115,0);assert.equal(v.recoveries123,2);
}
// Fully trapped traffic resets only to a clear lane slot, never into a queue.
{
 const l=lane(),v=vehicle([3,0,0],Math.PI),walls=[{name:'enclosure',points:[[1,-5],[5,-5],[5,5],[1,5]],minY:-1,maxY:3}],other={...vehicle([0,0,33]),id:'other',crashed:false,parked:true};
 const {p}=fixture(v,l,walls,[other]);
 for(let i=0;i<3000&&v.crashed;i++)p.coast(1/60,0);
 assert(!v.crashed,'trapped vehicle must reset');assert.equal(v.recoveryResets123,1);assert(!life.overlap(v,other));assert.equal(v.lane,l.id);
}
for(const yaw of[0,Math.PI/2,Math.PI,-Math.PI/2,.72]){
 const s={x:12,z:-8,yaw},forward=[Math.sin(yaw),Math.cos(yaw)],right=[-Math.cos(yaw),Math.sin(yaw)];
 const p=d=>map.project(s,[s.x+d[0],s.z+d[1]]);
 assert(Math.abs(p(forward)[0])<1e-12&&p(forward)[1]<-.999);
 assert(p(right)[0]>.999&&Math.abs(p(right)[1])<1e-12);
 assert(p(right.map(x=>-x))[0]<-.999,'left turn must remain left on map');
}
console.log('PASS recovery in four headings at 60/120 Hz, wheel steering/no sliding, route handoff, repeated real impacts, dismounted recovery, trapped reset, minimap handedness.');
