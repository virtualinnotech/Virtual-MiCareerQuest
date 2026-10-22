const assert=require('node:assert/strict');
const C=require('./life111.js');
const green={ns:'green',ew:'green'},angle=x=>Math.atan2(Math.sin(x),Math.cos(x));
const fleet=require('./report.json').life;
for(const [prefix,center]of[['front-',42.9],['east-',69.9],['river-',-69.6]])for(const l of fleet.lanes.filter(l=>l.id.startsWith(prefix))){
 const half=Math.max(...fleet.vehicles.filter(v=>v.lane===l.id).map(v=>v.width/2));
 assert(Math.abs(l.cross-center)>half+.62+.035,'stopped normal lanes leave ambulance clearance: '+l.id);
}
const lane=(axis=2,dir=1)=>({id:'test',axis,dir,cross:0,edge:axis===2?dir*1.8:-dir*1.8,start:-100,end:100,length:200,stops:[],junctions:[],signal:'ns'});
const car=(id,l,q=8)=>({id,lane:l.id,p:l.axis===2?[0,-.1275,q]:[q,-.1275,0],s:l.dir>0?q-l.start:l.end-q,yaw:l.axis===2?(l.dir>0?0:Math.PI):l.dir*Math.PI/2,width:.7,length:1.6,wheelbase:.95,speed:0,maxSpeed:2,travel:0});
for(const axis of[0,2])for(const dir of[-1,1]){
 const l=lane(axis,dir),v=car('vehicle-1',l,8*dir),amb={x:0,z:0,yaw:v.yaw,active:true,speed:0};let turns=0,steers=0;
 for(let i=0;i<450;i++){
  const p=v.p.slice(),yaw=v.yaw;C.emergencyStep([v],[l],.05,amb);C.trafficStep([v],[l],.05,green);
  const d=Math.hypot(v.p[0]-p[0],v.p[2]-p[2]);
  if(d>1e-5){const heading=Math.atan2(v.p[0]-p[0],v.p[2]-p[2]);assert(Math.abs(angle(heading-yaw-angle(v.yaw-yaw)/2))<.015,'body tracks actual curved displacement');}
  else assert.equal(v.p[axis===0?2:0],p[axis===0?2:0],'stopped cars do not skate sideways');
  if(Math.abs(angle(v.yaw-amb.yaw))>.1)turns++;if(Math.abs(C.wheelSteer(v,[0,0,0],true))>.02)steers++;
 }
 assert(turns>20&&steers>20,'front wheels and body steer');assert(v.emergencyBrake&&v.speed===0,'wait on the shoulder until ambulance passes');
 assert(Math.abs(v.offset115)>1.2);
 for(let i=0;i<500;i++){C.emergencyStep([v],[l],.05,null);C.trafficStep([v],[l],.05,green);}
 assert(!v.yielding&&Math.abs(v.offset115)<.001&&v.speed>1,'merge back on a curved path');
}
{
 const l=lane(),v=car('vehicle-2',l,8),block={id:'blocked-shoulder',parked:true,p:[1.4,-.1275,12],yaw:0,width:1,length:15};
 for(let i=0;i<200;i++){C.emergencyStep([v,block],[l],.05,{x:0,z:0,yaw:0,active:true});C.trafficStep([v,block],[l],.05,green);assert(!C.overlap(v,block));}
 assert(v.emergencyBrake&&v.speed===0&&v.p[0]===0,'occupied shoulder means stop in lane');
 const behind=car('vehicle-3',l,-10);behind.speed=2;
 for(let i=0;i<100;i++){C.emergencyStep([behind],[l],.05,{x:0,z:0,yaw:0,active:true});C.trafficStep([behind],[l],.05,green);}
 const p=behind.p.slice();assert(behind.speed===0&&behind.p[0]===0);
 for(let i=0;i<50;i++){C.emergencyStep([behind],[l],.05,{x:0,z:0,yaw:0,active:true});C.trafficStep([behind],[l],.05,green);}assert.deepEqual(behind.p,p,'cars behind hold completely');
}
{
 const l={...lane(0,1),cross:44.2,edge:46.2},bus={...car('vehicle-11',l,17),p:[17,-.1275,44.2],length:7.463232,width:1.25843,wheelbase:5,speed:1.55,maxSpeed:1.55};
 const behind={...car('vehicle-12',l,8),p:[8,-.1275,44.2],speed:1};
 const amb={x:15,z:45.55,yaw:Math.PI/2,next:0,active:true,speed:0,parked:{x:15,z:45.55,yaw:Math.PI/2},route:[[19,42.9]]};
 const taxi={id:'parked-taxi',parked:true,p:[19,-.1275,45.72],yaw:Math.PI/2,width:.7,length:1.6};
 const cars=[bus,behind,taxi,C.ambulanceObstacle(amb)];let cleared=false;
 for(let i=0;i<160;i++){
  C.emergencyStep(cars,[l],.05,amb);C.trafficStep(cars,[l],.05,green);
  assert(!C.overlap(bus,taxi)&&!C.overlap(bus,cars[3]),'clearing the bay preserves collision clearance');
  if(bus.departure121){assert.equal(bus.p[2],44.2);assert.equal(bus.yaw,Math.PI/2);}
  cleared||=bus.p[0]-bus.length/2>20.8;
 }
 assert(cleared,'full-size bus rear clears the ambulance merge aperture');
 assert.equal(behind.speed,0,'approaching traffic holds behind the ambulance');assert.equal(behind.p[2],44.2);
}
const w={axis:2,start:0,end:5,cross:0,width:.6,offset:.16,obstacles:[]};
const make=(id,s,speed,direction=1)=>({...C.sampleWalk(w,s),id,s,speed,speed120:0,path:w,direction,moving:true});
const walkers=[make('slow',1,.26),make('fast',.1,.51),make('oncoming',7,.35)];
let traveled=0,minimum=10,maxTurn=0;
for(let i=0;i<18000;i++){
 const snapshots=walkers.map(a=>({...a}));
 for(const a of walkers){const oldYaw=a.yaw,oldX=a.x,oldZ=a.z,p=C.pedestrianStep(a,snapshots,1/60,C.sampleWalk(w,a.s+a.direction*.45));
  a.s+=a.direction*p.progress;Object.assign(a,{x:p.x,z:p.z});traveled+=p.progress;
  maxTurn=Math.max(maxTurn,Math.abs(angle(a.yaw-oldYaw)));assert(maxTurn<=2.4/60+1e-9,'no snapping when turning or passing');
  if(p.progress>1e-8)assert(Math.abs(angle(Math.atan2(p.x-oldX,p.z-oldZ)-a.yaw))<.01,'walk in facing direction');
 }
 for(let a=0;a<walkers.length;a++)for(let b=a+1;b<walkers.length;b++)minimum=Math.min(minimum,Math.hypot(walkers[a].x-walkers[b].x,walkers[a].z-walkers[b].z));
}
assert(minimum>.285,'synchronous crowd remains separated');assert(traveled>140,'multiple endpoint turns and passes keep making progress');
assert(walkers.every(a=>a.s>35),'each walker continues around the loop');
console.log('PASS curved yielding in all four headings, wheel steering, blocked shoulders, stopped followers, safe merge, synchronous passing and repeated U-turns',{traveled,minimum,maxTurn,phases:walkers.map(a=>a.s)});
