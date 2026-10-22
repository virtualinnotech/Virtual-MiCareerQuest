const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const report=require('./report.json'),dog=require('./dogs112/report.json'),out=path.resolve(__dirname,'../../work/city106');
assert.equal(report.architecture.length,8);assert.equal(new Set(report.architecture.map(a=>a.wall)).size,8);
assert(dog.bytes<600000&&dog.triangles<8000&&dog.bones>30);assert.deepEqual(dog.clips,['walk','idle']);
for(const s of report.life.placements.filter(p=>p.type==='busShelters'))assert(s.p[2]>38.9&&s.p[2]<39.2,'shelter near curb');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261014-city112');
  await page.waitForFunction(()=>CityLife111.snapshot().dogStatus==='ready'&&CityLife111.snapshot().lodStatus==='ready'&&Scooter100.snapshot().ready,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);player.position=[45,.4,38];state.overview={camera:[45,1,39],target:[40,.5,37]};updateCamera(0,true);CityLife111.update(.01);});
  const motion=await page.evaluate(()=>{
   const start=CityLife111.snapshot(),paused=new Set(),paths=new Map(),contacts=[];
   for(let i=0;i<800;i++){
    CityLife111.update(.05);
    if(i%20)continue;
    for(const p of CityLife111.snapshot().people){
     if(!p.moving)paused.add(p.id);
     if(p.id.startsWith('front-')){const zs=paths.get(p.id)||[];zs.push(p.z);paths.set(p.id,zs);}
     for(const c of colliders)if(c.kind==='cityFurniture'&&p.x>c.lo[0]-.10&&p.x<c.hi[0]+.10&&p.z>c.lo[2]-.10&&p.z<c.hi[2]+.10)contacts.push({person:p.id,prop:c.name,x:p.x,z:p.z,lo:c.lo,hi:c.hi});
    }
   }
   return {start,end:CityLife111.snapshot(),paused:paused.size,contacts,meanders:[...paths.values()].filter(zs=>Math.max(...zs)-Math.min(...zs)>.20).length};
  });
  console.log('WALK VARIETY',JSON.stringify({pausing:motion.paused,meanders:motion.meanders,contacts:motion.contacts.slice(0,10)}));
  assert(motion.paused>100,'independent pauses');assert(motion.meanders>20,'varied sideways paths');assert.deepEqual(motion.contacts,[],'meanders avoid props over 40 seconds');
  const views={
   bus:{camera:[25.2,.9,40.45],target:[24.6,.65,39.02]},
   skyline:{camera:[22,1.2,43],target:[38,10,65]},
   crowd:{camera:[42,1.1,39],target:[24,.6,37.8]}
  };
  const person=motion.end.people.find(p=>p.id==='front-18');
  views.dog={camera:[person.x-.80,.53,person.z+1.05],target:[person.x,.28,person.z]};
  for(const [name,v]of Object.entries(views)){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},v);
   const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,'112-'+name+'.png')});
  }
  const dogBefore=await page.locator('#canvas').screenshot();
  await page.evaluate(()=>{for(let i=0;i<8;i++)CityLife111.update(.05);render();});
  assert(!dogBefore.equals(await page.locator('#canvas').screenshot()));await page.screenshot({path:path.join(out,'112-dog-motion.png')});
  const rider=await page.evaluate(()=>{
   state.paused=false;state.overview=null;StudentProgress99.completeForTesting();StudentRewards100.close();
   const parked=Scooter100.snapshot().rides.segway.parked;player.position=[parked.x-.2,floorHeightAt(parked.x,parked.z)+PHYSICS.radii[1]+.002,parked.z];
   if(!Scooter100.mount('segway'))throw Error('Could not mount Segway');
   const original=characterState.player,results=[];
   for(const id of ['brad_character','roger_character','sara_character','liz','zoe','jason_character']){
    const model=characterState.models.get(id),a=createActor(model,{player:true,position:[...player.position],yaw:0});characterState.player=a;
    for(const input of [{forward:true,left:true},{forward:true,right:true},{backward:true,left:true},{backward:true,right:true}]){
     player.position=[29,.602,5];player.yaw=0;for(let i=0;i<65;i++)advancePlayer(1/90,input);poseActor(a,0,true);
     results.push({id,lean:Scooter100.snapshot().lean,contacts:Scooter100.snapshot().poseError});
    }
   }
   characterState.player=original;player.position=[29,.602,5];player.yaw=0;poseActor(original,0,true);state.paused=true;
   return results;
  });
  for(const s of rider)for(const e of s.contacts){
   assert(e.error<.022,'contact preserved '+s.id);
   if(e.limb==='leg'){const sign=e.side==='Left'?1:-1;assert(e.foot[0]*sign>.14,s.id+' foot side');assert(e.knee[0]*sign>.015,s.id+' separated knees');assert(e.knee[2]>Math.min(e.hip[2],e.foot[2])+.06,s.id+' forward knee');}
  }
  for(const [name,yaw]of Object.entries({riderRear:0,riderSide:1.45})){
   await page.evaluate(yaw=>{state.overview=null;state.firstPerson=false;state.orbitYaw=yaw;state.radius=1.05;state.pitch=.08;updateCamera(0,true);render();},yaw);await page.screenshot({path:path.join(out,'112-'+name+'.png')});
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(v=>{Scooter100.dismount(true);state.paused=true;state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},views.bus);
  await page.screenshot({path:path.join(out,'112-mobile.png')});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.evaluate(()=>gl.getError()),0);assert.deepEqual(errors,[]);
  console.log('PASS 8 architectural styles, curbside BUS signs, skinned dogs, varied walkers, 24 rider lean poses across 6 characters, desktop/mobile');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
