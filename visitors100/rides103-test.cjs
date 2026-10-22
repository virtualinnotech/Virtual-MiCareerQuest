const {chromium}=require('playwright'),assert=require('node:assert/strict'),sharp=require('sharp'),path=require('node:path');
const out=name=>path.resolve(__dirname,'../../work/rides104-'+name+'.png');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.message);});
 await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261012-rides104');
 await page.waitForFunction(()=>window.Scooter100?.snapshot().ready&&characterState.player,null,{timeout:120000});
 await page.evaluate(()=>{Crowd.pause(true);HubGuide.visit();});
 assert(!await page.evaluate(()=>Scooter100.mount()),'rides locked before completion');
 await page.evaluate(()=>{StudentProgress99.completeForTesting();state.overview={camera:[29.8,1.5,3.6],target:[31.25,.75,2.05]};updateCamera(0,true);});
 await page.waitForTimeout(300);await page.screenshot({path:out('parked')});
 for(const id of ['scooter','segway']){
  await page.evaluate(id=>{Scooter100.dismount(true);state.overview=null;const p=Scooter100.snapshot().rides[id].parked;player.position=[p.x-.25,floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.002,p.z];state.firstPerson=false;updateCamera(0,true);},id);
  await page.waitForTimeout(250);assert((await page.locator('#scooter100 button').first().getAttribute('aria-label')).toLowerCase().includes(id));
  await page.keyboard.press('t');assert.equal(await page.evaluate(()=>Scooter100.snapshot().activeId),id);assert(await page.evaluate(()=>Scooter100.mounted));
  await page.waitForTimeout(400);
  console.log('POSE',id,JSON.stringify(await page.evaluate(()=>Scooter100.snapshot().poseError)));
  await page.evaluate(()=>{state.overview=null;state.orbitYaw=1.45;state.radius=1.05;state.pitch=.08;updateCamera(0,true);});await page.waitForTimeout(200);await page.screenshot({path:out(id+'-rider')});
  const samples=await page.evaluate(()=>{
   state.overview=null;const results=[];
   // Exercise lean at a clear location, with fixed-step inputs independent of wall-clock load.
   player.position=[29,.602,Scooter100.snapshot().activeId==='segway'?-5:5];player.yaw=0;
   for(const input of [{forward:true,left:true},{forward:true,right:true},{backward:true,left:true},{backward:true,right:true}]){
    for(let i=0;i<50;i++)advancePlayer(1/90,input);
    poseActor(characterState.player,0,true);results.push(Scooter100.snapshot());
   }
   return results;
  });
  for(const s of samples){
   assert(s.poseError.every(e=>e.error<.022),id+' grip/foot IK '+JSON.stringify(s.poseError));assert(s.lean.every(Number.isFinite));
   if(id==='segway')for(const e of s.poseError.filter(e=>e.limb==='leg')){
    const sign=e.side==='Left'?1:-1;assert(e.foot[0]*sign>.14,'each foot stays on its own deck side');
    assert(e.knee[0]*sign>.025,'knees do not cross the centerline');
    assert(e.knee[2]>Math.min(e.hip[2],e.foot[2])+.08,'knees bend forward, not backward');
   }
  }
  assert(samples[0].lean[1]<0&&samples[1].lean[1]>0,'left/right lean');
  assert(Object.values(samples[0].rides[id].wheels).some(a=>Math.abs(a)>.3),'wheel spin');
  assert(Object.values(samples[3].rides[id].wheels).reduce((a,b)=>a+b,0)<Object.values(samples[2].rides[id].wheels).reduce((a,b)=>a+b,0),'reverse wheel rotation');
  if(id==='segway')assert(samples[0].lean[0]>0&&samples[3].lean[0]<0,'forward/reverse lean');
  await page.keyboard.down('Space');await page.waitForTimeout(450);const braking=await page.evaluate(()=>Scooter100.snapshot());assert(braking.braking);assert(Math.abs(braking.speed)<.05);await page.screenshot({path:out(id+'-braking')});await page.waitForTimeout(100);assert.deepEqual(await page.evaluate(id=>Scooter100.snapshot().rides[id].wheels,id),braking.rides[id].wheels,'wheels stop under braking');await page.keyboard.up('Space');
  await page.evaluate(()=>{for(let i=0;i<45;i++)advancePlayer(1/90,{forward:true,left:true});poseActor(characterState.player,0,true);state.paused=true;state.orbitYaw=2.9;updateCamera(0,true);});await page.waitForTimeout(100);await page.screenshot({path:out(id+'-lean')});await page.evaluate(()=>{state.paused=false;});
  await page.evaluate(()=>{Scooter100.dismount(true);});
 }
 await page.evaluate(()=>{HubGuide.visit();HubGuide.showRoute({name:'Agribusiness',goal:HUB_SECTORS.Agribusiness.goal});state.orbitYaw=0;state.radius=1.5;updateCamera(0,true);});await page.waitForTimeout(300);
 const first=await page.evaluate(()=>Wayfinder103.snapshot());assert(first.active&&first.markers.length>3);assert(await page.evaluate(()=>hubRouteBatch===null),'ground ribbon removed');
 const aFrame=await page.locator('#canvas').screenshot();await page.waitForTimeout(200);assert(!aFrame.equals(await page.locator('#canvas').screenshot()),'navigation is animated');
 await page.screenshot({path:out('navigation-desktop')});
 const popped=await page.evaluate(()=>{const p=Wayfinder103.snapshot().markers[2];player.position=[p.x,floorHeightAt(p.x,p.z)+PHYSICS.radii[1],p.z];Wayfinder103.snapshot();HubGuide.drawRoute();return Wayfinder103.snapshot();});assert(popped.markers[2].popped,'walking through marker pops it');
 await page.waitForTimeout(100);const stable=await page.evaluate(()=>Wayfinder103.snapshot());assert(stable.markers[2].popped,'pop persists');
 const directions=await page.evaluate(()=>{player.position[0]+=.5;HubGuide.drawRoute();const a=Wayfinder103.snapshot().bearing;player.yaw+=1;HubGuide.drawRoute();return[a,Wayfinder103.snapshot().bearing,Math.atan2(hubRoute.goal[0]-player.position[0],hubRoute.goal[1]-player.position[2])];});assert(Math.abs(directions[1]-directions[2])<1e-8,'compass retains world-space destination bearing when player turns');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===1440?1000:844});await page.waitForTimeout(400);await page.screenshot({path:out('navigation-'+width)});
  const {data,info}=await sharp(await page.locator('#canvas').screenshot()).raw().toBuffer({resolveWithObject:true}),colors=new Set();for(let i=0;i<data.length;i+=info.channels*83)colors.add(data.slice(i,i+3).toString('hex'));assert(colors.size>100,'nonblank canvas');
 }
 await page.evaluate(()=>{HubGuide.clearRoute();HubGuide.drawRoute();});assert(!await page.evaluate(()=>Wayfinder103.snapshot().active));
 assert.deepEqual(errors,[]);console.log('PASS both rideables, nearest mount, mission lock, lean/IK, wheels, braking, popping navigation, compass, desktop/mobile pixels');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
