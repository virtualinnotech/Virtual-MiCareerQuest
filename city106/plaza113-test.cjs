const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/city113');fs.mkdirSync(out,{recursive:true});
const report=require('./report.json'),maples=require('./fall113/report.json');
assert.equal(maples.trees.length,3);assert(maples.bytes<1100000);assert(maples.trees.every(t=>t.triangles<3000));
assert.equal(report.landmark.title,'La Grande Vitesse');assert(report.landmark.triangles<12000);
assert.equal(report.lightClearance.length,107);assert(report.lightClearance.every(l=>l.blockedBy.length===0),'all signal and lamp heads clear of foliage');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261014-city113');
  await page.waitForFunction(()=>City106.snapshot().ready&&CityLife111.snapshot().peopleReady&&Ambulance35.snapshot().status==='ready',null,{timeout:180000});
  const views={
   sculpture:{camera:[-20.8,2.5,42.3],target:[-25.5,2.0,36.1]},
   sculptureSide:{camera:[-31,2.4,38.1],target:[-25.6,2.0,36.1]},
   plaque:{camera:[-25.6,.9,39.1],target:[-25.6,.4,38.04]},
   autumn:{camera:[21,1.4,37.8],target:[32.25,1.8,39.39]},
   mapleClose:{camera:[30.7,1.5,36.7],target:[32.25,1.9,39.39]},
   pillars:{camera:[-7.2,.22,40.6],target:[-6.54,.55,37.3]},
   parking:{camera:[12,2,41],target:[18,.6,45.55]}
  };
  for(const [name,v]of Object.entries(views)){
   await page.evaluate(v=>{state.paused=true;Crowd.pause(true);player.position=[...v.camera];state.overview=v;updateCamera(0,true);CityLife111.update(.001);render();},v);
   const image=await page.locator('#canvas').screenshot();assert((await sharp(image).stats()).channels.some(c=>c.stdev>20),'nonblank '+name);
   await page.screenshot({path:path.join(out,name+'.png')});
  }
  const staticState=await page.evaluate(()=>({ambulance:Ambulance35.snapshot(),city:City106.snapshot(),footings:colliders.filter(c=>c.name.startsWith('Gallery105 Entrance boomerang steel footing contact')).map(c=>({name:c.name,lo:c.lo,hi:c.hi}))}));
  fs.writeFileSync(path.join(out,'state.json'),JSON.stringify(staticState,null,2));console.log('STATIC',JSON.stringify(staticState));
  const motion=await page.evaluate(()=>{
   const contacts=[];player.position=[-10,.4,38];let nearPillars=0;
   for(let i=0;i<1600;i++){
    CityLife111.update(.05);if(i%10)continue;
    for(const p of CityLife111.snapshot().people){
     if(p.x>-7.4&&p.x<-5.8&&p.id.startsWith('front-'))nearPillars++;
     for(const c of colliders)if((c.kind==='cityFurniture'||c.name.startsWith('Gallery105 Entrance boomerang steel footing contact'))&&p.x>c.lo[0]-.1&&p.x<c.hi[0]+.1&&p.z>c.lo[2]-.1&&p.z<c.hi[2]+.1)contacts.push({person:p.id,prop:c.name,x:p.x,z:p.z});
    }
   }return {contacts:contacts.slice(0,20),nearPillars};
  });console.log('MOTION',JSON.stringify(motion));assert.deepEqual(motion.contacts,[]);assert(motion.nearPillars>0);
  assert.equal(staticState.footings.length,2);for(const c of staticState.footings)assert(c.lo[1]<=-.0285+.001,'grounded footing');
  assert.equal(staticState.ambulance.z,45.55);assert.equal(staticState.ambulance.x,15);assert.equal(staticState.ambulance.turnMarkers.length,5);
  await page.evaluate(()=>{state.paused=false;state.overview=null;Ambulance35.visit();Ambulance35.enter();Ambulance35.test.place(63,43,Math.PI/2);state.paused=true;state.overview={camera:[61,1.2,43],target:[70,2,43]};updateCamera(0,true);render();});
  await page.screenshot({path:path.join(out,'blue-turn.png')});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{Ambulance35.reset();player.position=[-25.6,.4,43];state.overview={camera:[-11.5,3.2,44.5],target:[-25.6,2,36.1]};Ambulance35.update(0);ChallengeEntry38.update();updateCamera(0,true);render();});
  await page.waitForTimeout(250);
  await page.screenshot({path:path.join(out,'mobile.png')});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.evaluate(()=>gl.getError()),0);assert.deepEqual(errors,[]);
  console.log('PASS plaza views, moving pedestrians avoid pillars and sculpture, parking, turn markers, desktop/mobile pixels');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
