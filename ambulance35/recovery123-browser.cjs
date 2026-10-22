const {chromium}=require('playwright'),sharp=require('sharp'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../../work/recovery123');fs.mkdirSync(out,{recursive:true});
const trafficOnly=process.argv.includes('--traffic-only');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-recovery123');
  await page.waitForFunction(()=>window.CityLife111?.snapshot().peopleReady&&window.City106?.snapshot().ready&&window.Ambulance35?.snapshot().status==='ready'&&window.walkSurfacesReady118,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});console.log('Loaded scene');
  async function shot(name,camera,target){if(camera)await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>15));await page.screenshot({path:path.join(out,name+'.png')});}
  await shot('riverwalk-open-bank',[18,1,-35.1],[33,.8,-38.02]);
  await shot('riverwalk-green-trees',[8,1.2,-34.6],[19,1.2,-38.02]);
  const rail=await page.evaluate(()=>({walls:colliders.filter(c=>/^Riverfront_concrete_retaining_wall/.test(c.name)).map(c=>c.name),rail:raycast([12,.426,-35.8],[0,0,-1],2,o=>/Riverfront_black/.test(o.name))?.object?.name,above:raycast([12,.56,-35.8],[0,0,-1],2,o=>/^Riverfront_concrete/.test(o.name))?.object?.name,water:District115.safeWalk(12,-40)}));
  assert.deepEqual(rail.walls,[]);if(!trafficOnly)assert(rail.rail);assert(!rail.above&&!rail.water);
  const setup=await page.evaluate(()=>{
   const A=Ambulance35;A.reset();A.visit();state.paused=false;A.enter();state.paused=true;state.overview=null;
   const lane=CityLife111.mapLanes().find(l=>l.id==='front-east'),v=CityLife111.trafficBodies().filter(v=>v.lane===lane.id&&!v.parked&&v.kind!=='bus').sort((a,b)=>Math.abs(a.p[0]-30)-Math.abs(b.p[0]-30))[0];
   // A dense queue can overlap the ambulance's initial pose and prevent a
   // meaningful impact. Reserve its approach, retaining the real target body.
   window.recoveryFixture132=CityLife111.trafficBodies().filter(o=>o!==v&&Math.hypot(o.p[0]-v.p[0],o.p[2]-v.p[2])<14).map(o=>({vehicle:o,p:[...o.p],parked:o.parked}));
   for(const f of recoveryFixture132){f.vehicle.parked=true;f.vehicle.p=[f.p[0]+350,f.p[1],f.p[2]];}
   A.test.place(v.p[0]-v.length/2-4,v.p[2],v.yaw);return {id:v.id,p:[...v.p],yaw:v.yaw};
  });
  const crash=await page.evaluate(()=>{
   const A=Ambulance35,s=A.test.state;state.paused=false;A.test.controls.clear();A.test.controls.add('w');
   // Use real Matter collisions against a stopped queue.
   for(let i=0;i<800&&!CityLife111.trafficBodies().some(v=>v.crashed);i++)A.update(1/120,s.started+(s.elapsed+1/120)*1000);
   state.paused=true;A.test.controls.clear();const crashed=CityLife111.trafficBodies().filter(v=>v.crashed).map(v=>v.id);
   updateCamera(0,true);render();return {ids:crashed,impacts:s.impacts,status:A.snapshot(),guide:HubGuide.snapshot(),player:player.position};
  });console.log('Impact fixture',JSON.stringify({setup,crash}));assert(crash.ids.length&&crash.impacts);await shot('traffic-after-impact');
  const recovery=await page.evaluate(ids=>{
   const A=Ambulance35;A.reset();state.overview=null;updateCamera(0,true);const history=[];
   for(let i=0;i<2700;i++){
    City106.setTrafficTime(i/30);CityLife111.update(1/30);A.update(1/30,performance.now());
    if(i%300===0)history.push({seconds:i/30,cars:CityLife111.trafficBodies().filter(v=>ids.includes(v.id)).map(v=>({id:v.id,crashed:v.crashed,reason:v.reason,travel:v.travel,recoveries:v.recoveries123,resets:v.recoveryResets123}))});
   }
   return {history,cars:CityLife111.trafficBodies().filter(v=>ids.includes(v.id)).map(v=>({id:v.id,crashed:v.crashed,reason:v.reason,travel:v.travel,recoveries:v.recoveries123,resets:v.recoveryResets123,p:v.p,lane:v.lane})),allCrashed:CityLife111.trafficBodies().filter(v=>v.crashed).map(v=>({id:v.id,reason:v.reason,age:v.recovery123?.age}))};
  },crash.ids);console.log('Recovery',JSON.stringify(recovery));assert(recovery.cars.every(v=>!v.crashed&&v.recoveries>0));assert.equal(recovery.allCrashed.length,0);
  await page.evaluate(()=>{for(const f of recoveryFixture132)Object.assign(f.vehicle,{p:f.p,parked:f.parked});CityLife111.settle();});
  const cameraMap=await page.evaluate(()=>{
   const A=Ambulance35;A.reset();A.visit();state.paused=false;A.enter();state.paused=true;A.test.place(50,42.9,Math.PI/2);state.overview=null;updateCamera(0,true);A.update(.016,performance.now());render();
   const s=A.snapshot(),dx=target[0]-camera[0],dz=target[2]-camera[2],r=[-dz,dx],p=AmbulanceMap120.project(s,[s.x+r[0],s.z+r[1]]);return {screenRight:p,visible:!document.getElementById('ambulanceMap120').hidden};
  });assert(cameraMap.screenRight[0]>0&&Math.abs(cameraMap.screenRight[1])<1e-5);assert(cameraMap.visible);
  await shot('corrected-map-desktop');
  const map=await page.locator('#ambulanceMap120').screenshot();assert((await sharp(map).stats()).channels.some(c=>c.stdev>15));
  assert(await page.locator('#controlsIconBtn').isHidden());
  assert(await page.locator('#staffPrompt').isHidden(),'walking interaction must not cover the navigation map');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{Ambulance35.update(.016,performance.now());render();});await shot('corrected-map-mobile');
  const bounds=await page.locator('#ambulanceMap120').boundingBox();assert(bounds.x>=0&&bounds.y+bounds.height<=844);
  await page.evaluate(()=>Ambulance35.reset());await shot('riverwalk-mobile',[18,1,-35.1],[33,.8,-38.02]);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.equal(await page.evaluate(()=>gl.getError()),0);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({setup,crash,recovery,rail,cameraMap,bounds,errors,skippedChecks:trafficOnly?['legacy railing raycast']:[]},null,2));
  console.log('PASS live collision/recovery/traffic, map/camera handedness, '+(trafficOnly?'':'railing preservation, ')+'desktop/mobile canvas pixels and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
