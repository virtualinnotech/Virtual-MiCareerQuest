const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),sharp=require('sharp');
const C=require('./life111.js'),report=require('./report.json'),out=path.resolve(__dirname,'../../work/city106');
assert.equal(report.version,114);assert(report.bytes<29_000_000,'decoded city asset budget');assert(report.uniqueTriangles<460_000,'shared city and two-level vehicle mesh budget');
assert(fs.statSync(path.join(__dirname,'city.glb.gz')).size<17_000_000,'compressed city download budget');
assert.equal(report.life.vehicles.length,113);assert.equal(report.life.dogs.length,6);
const lane={id:'test',length:60,start:0,end:60,axis:0,cross:0,dir:1,signal:'ew',stops:[{s:12}]};
const car=(s,id)=>({id,lane:'test',s,length:1.5,width:.6,maxSpeed:2.4,speed:0,travel:0});
const queue=[car(3,'a'),car(0,'b')];
for(let i=0;i<500;i++)C.trafficStep(queue,[lane],.05,{ew:'red'},null);
assert(queue.every(v=>v.s+v.length/2<=12.001),'red light stop line');assert(queue.every(v=>v.waiting&&v.braking),'brake lights while stopped');
assert(queue[0].s-queue[1].s>=1.89,'queue keeps following distance');
for(let i=0;i<100;i++)C.trafficStep(queue,[lane],.05,{ew:'green'},null);
assert(queue[0].s>14,'green starts traffic');
const yielding=[car(1,'pedestrian-test')];for(let i=0;i<250;i++)C.trafficStep(yielding,[lane],.05,{ew:'green'},[8,0]);
assert(yielding[0].s<6.61&&yielding[0].reason==='pedestrian','traffic yields to player');
for(const w of report.life.walks){
 const total=2*(w.end-w.start+Math.PI*w.offset),first=C.sampleWalk(w,0),last=C.sampleWalk(w,total-1e-5);
 assert(Math.hypot(first.x-last.x,first.z-last.z)<.0001,'continuous sidewalk loop');
 for(let s=0;s<total;s+=.11){const p=C.sampleWalk(w,s);assert([p.x,p.z,p.yaw].every(Number.isFinite));const q=C.sampleWalk(w,s+.01);assert(Math.hypot(p.x-q.x,p.z-q.z)<.01001,'no path teleport');}
}
console.log('PASS traffic red/green, queues, brakes, player yielding and smooth pedestrian routes');

const farm=require('../farming36/harvest-core.js'),laneMap=new Map(report.life.lanes.map(l=>[l.id,l]));
for(const w of report.life.walks)for(let s=0;s<2*(w.end-w.start+Math.PI*w.offset);s+=.1){
 const p=C.sampleWalk(w,s);assert(!farm.inField(p.x,p.z),'pedestrians stay outside the farm challenge');
}
for(const offset of[0,5,22,40]){
 const cars=structuredClone(report.life.vehicles).filter(v=>!v.parked);
 for(let n=0;n<5280;n++){
  const t=(n*.05+offset)%44;C.trafficStep(cars,report.life.lanes,.05,{ns:t<18?'green':t<21?'yellow':'red',ew:t>=22&&t<40?'green':t>=40&&t<43?'yellow':'red'},null);
  for(let i=0;i<cars.length;i++){
   const a=cars[i],la=laneMap.get(a.lane);assert(!farm.inField(a.p[0],a.p[2]),'traffic stays outside the farm challenge');
   for(let j=i+1;j<cars.length;j++){
    const b=cars[j],lb=laneMap.get(b.lane);if(la.axis===lb.axis)continue;
    const axes=v=>[[Math.sin(v.yaw),Math.cos(v.yaw)],[Math.cos(v.yaw),-Math.sin(v.yaw)]],aa=axes(a),bb=axes(b),d=[b.p[0]-a.p[0],b.p[2]-a.p[2]],dot=(x,y)=>x[0]*y[0]+x[1]*y[1];
    const separated=[...aa,...bb].some(u=>Math.abs(dot(d,u))>=Math.abs(dot(aa[0],u))*a.length/2+Math.abs(dot(aa[1],u))*a.width/2+Math.abs(dot(bb[0],u))*b.length/2+Math.abs(dot(bb[1],u))*b.width/2-.07);
    assert(separated,'cross traffic bodies remain separated, including turning vehicles');
   }
  }
 }
 assert(cars.every(v=>v.travel>100),'no intersection deadlocks over six full cycles');
}
console.log('PASS six-cycle traffic simulation at four starting phases, junction clearance and farm exclusions');

(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261013-citylife111');
  await page.waitForFunction(()=>City106.snapshot().ready&&CityLife111.snapshot().peopleReady&&CityLife111.snapshot().lodStatus==='ready'&&CityLife111.snapshot().dogStatus==='ready',null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);City106.setTrafficTime(26);player.position=[65.6,.4,15];for(let i=0;i<100;i++)CityLife111.update(.05);});
  const snapshot=await page.evaluate(()=>CityLife111.snapshot());
  assert.equal(snapshot.vehicles,113);assert.equal(snapshot.pedestrians,149);assert.equal(snapshot.dogWalkers,6);assert(snapshot.moving>10);
  assert.equal(snapshot.lodError,null);assert.equal(snapshot.lodStats.length,6);assert(snapshot.lodStats.every(m=>m.far<16000),'index-only distant actor budget');
  assert(snapshot.people.filter(a=>a.walked>0).length>140,'street pedestrians walk with independent pauses');
  assert.equal(snapshot.dogError,null);assert(snapshot.dogTriangles<8000,'shared skinned dog mesh budget');
  const checks=await page.evaluate(()=>{
   const parts=City106.batches.filter(b=>b.life111);
   return {dynamic:parts.filter(b=>b.animated).length,finite:parts.every(b=>Array.from(b.modelMatrix).every(Number.isFinite)),city:City106.snapshot(),crowd:CrowdGraphics.stats().trianglesByModel.filter(m=>['brad_character','sara_character','roger_character','zoe','liz','jason_character'].includes(m.model))};
  });console.log('CITY',JSON.stringify(checks));assert(checks.finite);assert(checks.dynamic>=486);
  const views={east:{camera:[65.65,1.12,24],target:[69,.6,7]},front:{camera:[26,1.05,38.9],target:[13,.7,44]},shops:{camera:[19,1.0,45.3],target:[22,.65,48]},avenue:{camera:[58,1.20,59],target:[30,1,63]}};
  for(const [name,v]of Object.entries(views)){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},v);
   const image=await page.locator('#canvas').screenshot();assert((await sharp(image).stats()).channels.some(c=>c.stdev>20));
   await page.screenshot({path:path.join(out,'life111-'+name+'.png')});
  }
  const dogView=await page.evaluate(()=>{
   const a=CityLife111.snapshot().people.find(a=>a.id==='front-18');return {camera:[a.x-.9,.64,a.z+1.1],target:[a.x,.25,a.z]};
  });
  await page.evaluate(v=>{state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},dogView);
  await page.screenshot({path:path.join(out,'life111-dog.png')});
  const first=await page.locator('#canvas').screenshot(),before=await page.evaluate(()=>CityLife111.snapshot());
  await page.evaluate(()=>{for(let i=0;i<50;i++){CityLife111.update(.04);characterState.time+=.04;}render();});
  const after=await page.evaluate(()=>CityLife111.snapshot());
  assert(after.people.some((p,i)=>Math.hypot(p.x-before.people[i].x,p.z-before.people[i].z)>.4));
  assert(after.vehicleStates.some((v,i)=>v.travel-before.vehicleStates[i].travel>1));
  const last=await page.locator('#canvas').screenshot();assert(!first.equals(last),'animated image changes');await page.screenshot({path:path.join(out,'life111-dog-moving.png')});
  const collisions=await page.evaluate(()=>{
   const hits=[];
   for(const w of CityLife111.snapshot().people){const x=w.x,z=w.z;for(const c of colliders){if(c.kind!=='cityFurniture')continue;if(x>c.lo[0]-.12&&x<c.hi[0]+.12&&z>c.lo[2]-.12&&z<c.hi[2]+.12)hits.push({person:w.id,prop:c.name});}}
   return hits;
  });console.log('PEDESTRIAN PROP CONTACTS',JSON.stringify(collisions));assert.deepEqual(collisions,[],'walkers avoid street furnishings');
  await page.setViewportSize({width:390,height:844});await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},views.east);
  assert((await sharp(await page.locator('#canvas').screenshot()).stats()).channels.some(c=>c.stdev>20));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'life111-mobile.png')});
  assert.equal(await page.evaluate(()=>gl.getError()),0);assert.deepEqual(errors,[]);
  console.log('PASS live vehicle and pedestrian motion, six dog walkers, finite transforms, desktop/mobile pixels and no WebGL/browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
