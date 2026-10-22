const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./life111.js'),report=require('./report.json'),fleet=require('./vehicles114/manifest.json');
const out=path.resolve(__dirname,'../../work/traffic114');
function overlap(a,b){
 const d=[b.p[0]-a.p[0],b.p[2]-a.p[2]],axes=v=>[[Math.sin(v.yaw),Math.cos(v.yaw)],[Math.cos(v.yaw),-Math.sin(v.yaw)]],aa=axes(a),bb=axes(b),dot=(x,y)=>x[0]*y[0]+x[1]*y[1];
 return [...aa,...bb].every(u=>Math.abs(dot(d,u))<Math.abs(dot(aa[0],u))*a.length/2+Math.abs(dot(aa[1],u))*a.width/2+Math.abs(dot(bb[0],u))*b.length/2+Math.abs(dot(bb[1],u))*b.width/2-.07);
}
const lane={id:'a',axis:0,cross:0,dir:1,start:0,end:40,length:40,signal:'ew',stops:[{s:8}]};
const car=(s,id)=>({id,lane:'a',s,length:1.5,width:.6,maxSpeed:2.4,speed:0,travel:0,wheelbase:.9});
const queue=[car(2,'a'),car(0,'b')];
for(let i=0;i<500;i++)C.trafficStep(queue,[lane],.05,{ew:'red'},null);
assert(queue.every(v=>v.s+v.length/2<=8.001&&v.braking&&v.waiting));
const stoppedTravel=queue[0].travel;
for(let i=0;i<50;i++)C.trafficStep(queue,[lane],.05,{ew:'red'},null);
assert.equal(queue[0].travel,stoppedTravel,'wheels do not creep at red');
for(let i=0;i<100;i++)C.trafficStep(queue,[lane],.05,{ew:'green'},null);
assert(queue[0].s>10&&!queue[0].braking);
for(const source of report.life.lanes)for(const turn of C.turnOptions(source,report.life.lanes)){
 const target=report.life.lanes.find(l=>l.id===turn.to),end=C.sampleTurn(turn,turn.length),q=target.dir>0?target.start+turn.exitS:target.end-turn.exitS;
 assert(Math.abs(end.p[target.axis]-q)<1e-6);
 assert(Math.abs(end.p[target.axis===0?2:0]-target.cross)<1e-6);
 let previous=C.sampleTurn(turn,0);
 for(let d=.01;d<turn.length;d+=.01){const p=C.sampleTurn(turn,d);assert(Math.hypot(p.p[0]-previous.p[0],p.p[2]-previous.p[2])<.01001);previous=p;}
 const v={wheelbase:.9,turn114:turn};assert(Math.abs(C.wheelSteer(v,[-.25,0,0],true))>Math.abs(C.wheelSteer(v,[.25,0,0],true)));
 assert.equal(C.wheelSteer(v,[.25,0,0],false),0,'rear axle stays aligned');
}
for(const offset of process.argv.includes('--browser-only')?[]:[0,5,22,40]){
 const cars=structuredClone(report.life.vehicles);
 let lastCycle;
 for(let i=0;i<5280;i++){
  if(i===4400)lastCycle=cars.map(v=>v.travel||0);
  const t=(i*.05+offset)%44;
  C.trafficStep(cars,report.life.lanes,.05,{ns:t<18?'green':t<21?'yellow':'red',ew:t>=22&&t<40?'green':t>=40&&t<43?'yellow':'red'},null);
  assert(cars.every(v=>v.p.every(Number.isFinite)&&Number.isFinite(v.yaw)));
  const bins=new Map();for(const v of cars){const k=Math.floor(v.p[0]/6)+','+Math.floor(v.p[2]/6);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(v);}
  for(const a of cars){const x=Math.floor(a.p[0]/6),z=Math.floor(a.p[2]/6);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const b of bins.get((x+dx)+','+(z+dz))||[])if(a.id<b.id)assert(!overlap(a,b),'vehicle overlap: '+a.id+' '+b.id+' at '+i+' phase '+offset);}
 }
 // Denser queues travel less overall; liveness must hold in the final cycle,
 // not merely accumulate a distance before becoming stuck.
 console.log('Traffic phase',offset,'minimum total/cycle travel',Math.min(...cars.filter(v=>!v.parked).map(v=>v.travel)),Math.min(...cars.map((v,i)=>v.parked?Infinity:v.travel-lastCycle[i])));
 assert(cars.every((v,i)=>v.parked||v.travel>30&&v.travel-lastCycle[i]>1),'no six-cycle traffic deadlock');assert(cars.some(v=>v.turnCount>1));
}
assert.equal(fleet.models.length,9);
for(const m of fleet.models){assert.equal(m.wheels.length,m.id==='bus'?6:4);assert.equal(m.wheels.filter(w=>w.front).length,2);assert(m.wheels.every(w=>w.radius>.07&&w.radius<.2));}
assert(fs.statSync(path.join(__dirname,'city.glb.gz')).size<20_000_000,'compressed city download budget including landscape and supplied props');
console.log('PASS wheel pivots, Ackermann steering, turn continuity, braking and signal queues'+(process.argv.includes('--browser-only')?'':' plus six-cycle traffic flow'));
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE',e.message)});page.on('crash',()=>errors.push('page crashed'));
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('BROWSER',m.text().slice(0,400));});
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261014-vehicles114');
  await page.waitForFunction(()=>window.City106?.snapshot().error||window.City106?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady,null,{timeout:180000}).catch(async e=>{console.log('LOAD STATUS',await page.evaluate(()=>({city:window.City106?.snapshot(),life:window.CityLife111?.snapshot()})));throw e;});
  assert.equal(await page.evaluate(()=>City106.snapshot().error),null);
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);City106.setTrafficTime(26);player.position=[20,.4,38];});
  console.log('CITY',await page.evaluate(()=>City106.snapshot()));
  const materials=await page.evaluate(()=>City106.batches.filter(b=>b.vehicle114).map(b=>({key:b.sharedKey,vehicle:b.vehicle114,paint:b.paint114,lod:!!b.lod114,color:b.color,count:b.count})));
  assert(materials.some(m=>m.paint));assert(materials.some(m=>m.lod));
  const shots=await page.evaluate(()=>{
   const vehicles=CityLife111.snapshot().vehicleStates,views={street:{camera:[18.3,1.2,38.9],target:[17.5,.45,44.5]}};
   for(const kind of ['taxi','classic','sedan','pickup','police','van','bus','suv','delivery']){
    const v=vehicles.find(v=>v.kind===kind&&v.parked)||vehicles.find(v=>v.kind===kind),yaw=v.parked?(v.p[2]<43?-Math.PI/2:Math.PI/2):Math.PI/2;
    const c=Math.cos(yaw),s=Math.sin(yaw),distance=kind==='bus'?4.7:1.9;
    views[kind]={camera:[v.p[0]+(c+s)*distance,v.p[1]+(kind==='bus'?2:1.1),v.p[2]+(c-s)*distance],target:[v.p[0],v.p[1]+.25,v.p[2]]};
   }return views;
  });
  for(const [name,view] of Object.entries(shots)){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},view);
   const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));
   await page.screenshot({path:path.join(out,'city-'+name+'.png')});
  }
  const animation=await page.evaluate(()=>{
   const wheels=()=>City106.batches.filter(b=>b.vehicle114?.role==='wheel').map(b=>({id:b.vehicle114.id,front:b.vehicle114.front,spin:b.vehicle114.spin,steer:b.vehicle114.steer,matrix:Array.from(b.modelMatrix)}));
   const before=wheels();let turn=null,brakeGroups=false;
   for(let i=0;i<1100;i++){
    City106.setTrafficTime(22+(i*.05)%18);CityLife111.update(.05);
    if(!turn)turn=wheels().find(b=>Math.abs(b.steer)>.1);
    const brakes=City106.batches.filter(b=>b.vehicle114?.role==='brake');
    brakeGroups||=brakes.some(b=>b.vehicle114.braking)&&brakes.some(b=>!b.vehicle114.braking);
   }
   const after=wheels(),states=CityLife111.snapshot().vehicleStates;
   return {turn,brakeGroups,moving:after.some((w,i)=>w.spin-before[i].spin>1),parkedStill:after.filter(w=>states.find(v=>v.id===w.id)?.parked).every(w=>w.spin===0),finite:after.every(w=>w.matrix.every(Number.isFinite)),rearStraight:after.filter(w=>!w.front).every(w=>w.steer===0),brakes:City106.batches.filter(b=>b.vehicle114?.role==='brake').map(b=>({key:b.sharedKey,emission:b.emission}))};
  });
  assert(animation.turn&&animation.moving&&animation.parkedStill&&animation.finite&&animation.rearStraight&&animation.brakeGroups);
  for(const a of animation.brakes)for(const b of animation.brakes)if(a.key===b.key)assert.deepEqual(a.emission,b.emission,'instanced brake groups have identical states');
  await page.setViewportSize({width:390,height:844});await page.evaluate(v=>{state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},shots.taxi);
  const mobile=await page.locator('#canvas').screenshot();assert((await sharp(mobile).stats()).channels.some(c=>c.stdev>20));
  await page.screenshot({path:path.join(out,'city-mobile.png')});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.evaluate(()=>gl.getError()),0);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({animation,materials:materials.length,errors},null,2));
  console.log('PASS all nine models, desktop/mobile nonblank canvas, rotating/stationary wheels, front steering, independent brake states, LOD and no WebGL errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
