const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./life111.js'),D=require('./district115.js');
globalThis.Matter=require('../ambulance35/vendor/matter.min.js');require('../ambulance35/vehicle-physics.js');
function crash(speed,offset=0){
 const npc={id:'npc',p:[offset,0,0],yaw:0,width:.6,length:1.5,height:.6,speed:0,health:100,parked:true},hits=[];
 const p=AmbulancePhysics35.create([],h=>hits.push(h),{traffic:()=>[npc],maxSpeed:speed,heightAt:()=>0});p.reset(0,-7,0);
 let first=null,minGap=100;
 for(let i=0;i<700;i++){const a=p.step(1/120,{throttle:first?0:1,steer:0,brake:!!first},0);if(hits.length&&!first)first={...hits[0],z:npc.p[2]};if(!first)minGap=Math.min(minGap,Math.abs(a.z-npc.p[2]));}
 return {npc,first,minGap};
}
const slow=crash(1.5),fast=crash(6.8),glance=crash(6.8,.5);
assert(slow.first&&fast.first&&fast.npc.health<slow.npc.health);assert(fast.npc.p[2]>slow.npc.p[2]+.4,'momentum scales with speed');assert(Math.abs(glance.npc.yaw)>.02,'off-center impact rotates NPC');
const obstacle={id:'solid',p:[0,0,0],yaw:0,width:.7,length:1.7,height:.7},point=[0,.4,3],contacts=[];
C.resolveVehiclePoint(point,[0,.4,-3],[.16,.4,.16],[obstacle],contacts);assert(contacts.length&&point[2]<0,'swept player cannot walk through a car');
for(const b of D.bridges){assert.equal(D.heightAt(b.x,b.start),b.base);assert(D.heightAt(b.x,(b.start+b.end)/2)>b.base+.5);assert(!D.inWater(b.x,-50));}
assert(D.inWater(0,-50));
const yieldLane={id:'yield',axis:2,cross:0,edge:1.4,dir:1,start:-50,end:50,length:100,signal:'ns',stops:[],junctions:[]};
const yielding=[5,8].map((z,i)=>({id:'yield-'+i,lane:'yield',s:z+50,p:[0,-.1275,z],yaw:0,length:1.5,width:.7,maxSpeed:2,speed:0,travel:0}));
yielding.push({id:'parked',parked:true,p:[1,-.1275,5],yaw:0,length:1.5,width:.7});
for(let i=0;i<200;i++){C.emergencyStep(yielding,[yieldLane],.05,{active:true,x:0,z:0,yaw:0});C.trafficStep(yielding,[yieldLane],.05,{ns:'green'},null);for(let a=0;a<yielding.length;a++)for(let b=a+1;b<yielding.length;b++)assert(!C.overlap(yielding[a],yielding[b]),'pull-over never enters an occupied shoulder');}
assert(yielding[1].p[0]>.8&&yielding[1].emergencyBrake,'clear shoulder receives yielding traffic');
for(let i=0;i<500;i++){C.emergencyStep(yielding,[yieldLane],.05,null);C.trafficStep(yielding,[yieldLane],.05,{ns:'green'},null);}
assert(yielding.slice(0,2).every(v=>!v.yielding&&Math.abs(v.p[0])<.01&&v.speed>0),'traffic safely merges back after the siren passes');
console.log('PASS vehicle impulse, damage, angular response, swept player collision and bridge elevations',JSON.stringify({slow:slow.npc,fast:fast.npc,glance:glance.npc}));
console.log('PASS occupied-shoulder yielding and return to traffic');
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),out=path.resolve(__dirname,'../../work/city115');
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE',e.message)});page.on('crash',()=>errors.push('crash'));
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('BROWSER',m.text().slice(0,180));});
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261014-district115');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady,null,{timeout:180000});
  console.log('STATUS',await page.evaluate(()=>({city:City106.snapshot().district.counts,vehicles:CityLife111.snapshot().vehicles,errors:City106.snapshot().error,gl:gl.getError()})));
  const surfaces=await page.evaluate(()=>{
   const bad=[];for(const b of District115.bridges)for(let z=b.end+.8;z<b.start-.8;z+=1){const expected=District115.elevation(b,z),hit=raycast([b.x,expected+.8,z],[0,-1,0],1.1,o=>!o.boundary);if(!hit||hit.normal[1]<.9||Math.abs(hit.point[1]-expected)>.008)bad.push({id:b.id,z,expected,hit:hit&&{name:hit.object?.name,y:hit.point[1],normal:hit.normal}});}
   return {bad,riverFloor:raycast([0,0,-50],[0,-1,0],1.6,o=>!o.boundary)?.point||null};
  });assert.deepEqual(surfaces.bad,[],'bridge floors match their drivable elevations');assert.equal(surfaces.riverFloor,null,'old river-level ground removed');
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  const views={park:{camera:[-31,3.4,32],target:[-27,1.2,16]},river:{camera:[-22,8,-31],target:[-6.3,0,-51]},roadbridge:{camera:[62,5,-35],target:[69.9,0,-52]},street:{camera:[26,1.4,38.8],target:[24,.5,44.5]},leaves:{camera:[-29.1,1.2,31],target:[-26.2,1.2,26]},entrance:{camera:[4,1.6,-35],target:[0,.8,-30.3]},inside:{camera:[1.8,1.2,-27.4],target:[0,.8,-30.6]}};
  views.police=await page.evaluate(()=>{const v=CityLife111.snapshot().vehicleStates.find(v=>v.kind==='police'&&v.parked);return {camera:[v.p[0]-.4,v.p[1]+.72,v.p[2]+1.5],target:[v.p[0],v.p[1]+.26,v.p[2]]};});
  for(const[name,v]of Object.entries(views)){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},v);const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,name+'.png')});}
  const skyline=await page.evaluate(v=>{state.overview=v;updateCamera(0,true);player.position=[0,.65,-29];render();const inside=state.frameStats.visibleBuildings;player.position=[12,.4,38];render();return {inside,outside:state.frameStats.visibleBuildings};},views.river);
  assert(skyline.inside>10&&skyline.inside===skyline.outside,'visible skyline does not disappear when player crosses a floor-height boundary');
  await page.evaluate(()=>{player.position=[1.1,.65,-29.2];state.overview={camera:[3.8,1.6,-34.6],target:[0,.8,-30.3]};updateCamera(0,true);});
  await page.waitForFunction(()=>{render();return City106.snapshot().doors.some(d=>Math.abs(d.angle)>1.3);});
  await page.screenshot({path:path.join(out,'doors-open.png')});
  const entrance=await page.evaluate(()=>{
   state.ghost=false;state.speed=1;player.position=[1.1,.24+PHYSICS.radii[1]+.001,-29.4];player.yaw=0;player.grounded=true;player.vy=0;
   for(let i=0;i<700;i++)advancePlayer(1/120,{forward:true});const outside=[...player.position],blocked=resolveEllipsoid(player.position,[0,0,-.04]).contacts.map(c=>({name:c.object.name,normal:c.normal,box:c.object.axisBox}));
   player.yaw=Math.PI;for(let i=0;i<700;i++)advancePlayer(1/120,{forward:true});return {outside,inside:[...player.position],blocked};
  });console.log('ENTRANCE',entrance);assert(entrance.outside[2]<-32.1&&entrance.inside[2]>-30,'swinging entrance and stairs work both directions');
  const walkBridge=await page.evaluate(()=>{const b=District115.bridges[0];player.position=[b.x,b.base+PHYSICS.radii[1]+.001,b.start+.5];player.yaw=0;player.grounded=true;player.vy=0;for(let i=0;i<7000;i++)advancePlayer(1/120,{forward:true});return {p:[...player.position],blocked:resolveEllipsoid(player.position,[0,0,-.04]).contacts.map(c=>({name:c.object.name,normal:c.normal,box:c.object.axisBox}))};});
  console.log('WALK BRIDGE',walkBridge);assert(walkBridge.p[2]<-66,'pedestrian can walk the entire blue bridge without a hidden bank wall');
  await page.setViewportSize({width:390,height:844});await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},views.park);await page.screenshot({path:path.join(out,'mobile.png')});assert((await sharp(await page.locator('#canvas').screenshot()).stats()).channels.some(c=>c.stdev>20));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.waitForFunction(()=>window.Ambulance35?.snapshot().status==='ready',null,{timeout:90000});
  const drive=await page.evaluate(()=>{
   state.overview=null;state.paused=false;const A=Ambulance35;A.visit();A.enter();const s=A.test.state,c=A.test.controls,r=A.snapshot().route;let elapsed=0,yielded=0,bridge=false,hits=[];
   for(let frame=0;frame<3800&&s.phase==='running';frame++){
    const target=r[s.next],angle=Math.atan2(target[0]-s.x,target[1]-s.z),error=Math.atan2(Math.sin(angle-s.yaw),Math.cos(angle-s.yaw)),d=Math.hypot(target[0]-s.x,target[1]-s.z);
    c.clear();c.add('w');if(Math.abs(error)>.035)c.add(error>0?'a':'d');if((Math.abs(error)>.3||d<5)&&s.speed>2.4)c.add(' ');
    elapsed+=.016;City106.setTrafficTime(elapsed);CityLife111.update(.016);A.update(.016,s.started+elapsed*1000);
    if(s.impacts>hits.length)hits.push({x:s.x,z:s.z,name:s.lastHit,health:s.health});
    yielded=Math.max(yielded,CityLife111.trafficBodies().filter(v=>v.yielding).length);bridge||=s.z<-40&&s.z>-60&&s.x>66;
   }c.clear();return {state:A.snapshot(),yielded,bridge,hits,near:CityLife111.snapshot().vehicleStates.filter(v=>Math.hypot(v.p[0]-s.x,v.p[2]-s.z)<5)};
  });console.log('DRIVE',JSON.stringify(drive));fs.writeFileSync(path.join(out,'drive.json'),JSON.stringify(drive,null,2));
  assert(drive.yielded>5&&drive.bridge,'traffic yields and ambulance uses the road bridge');assert.equal(drive.state.phase,'complete');
  fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({errors,stats:await page.evaluate(()=>({city:City106.snapshot(),traffic:CityLife111.snapshot().vehicleStates,gl:gl.getError()}))},null,2));assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
