const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const report=require('./report.json'),out=path.resolve(__dirname,'../../work/city106');
assert.equal(report.version,113);
assert(report.bytes<8_500_000,'city asset remains under 8.5 MB including street life and sculpture');
assert(report.uniqueTriangles<40_000,'shared geometry budget including autumn trees and sculpture');
assert.equal(report.benches,31);
const f=report.furnishings.counts;
for(const key of['streetlights','lanterns','signs','addedBenches','planters','bushes','plants'])assert(f[key]>5,'multiple '+key);
for(const p of report.furnishings.placements){
 assert(p.p.every(Number.isFinite));
 assert(!(p.p[0]>-27&&p.p[0]<65&&p.p[2]>-30&&p.p[2]<34),'no furnishings inside venue');
 assert(!(Math.abs(p.p[0])<2&&p.p[2]>34&&p.p[2]<40),'main entry clear');
 assert(!(Math.abs(p.p[0])<2&&p.p[2]>-38&&p.p[2]<-30),'river entrance clear');
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261013-streets107');
  await page.waitForFunction(()=>City106.snapshot().ready&&characterState.player&&Crowd.snapshot().status==='ready',null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  const live=await page.evaluate(()=>{
   const batches=City106.batches,newBatches=batches.filter(b=>b.name.startsWith('City107'));
   return {stats:City106.snapshot(),furnishings:new Set(newBatches.map(b=>b.name)).size,lenses:newBatches.filter(b=>b.emission.some(n=>n>0)).length,colliderCount:colliders.filter(c=>c.kind==='cityFurniture').length};
  });
  console.log('LIVE FURNISHINGS',live);assert.equal(live.stats.error,null);assert(live.furnishings>200);assert(live.lenses>30);assert(live.colliderCount>80);assert(live.stats.uniquePropBatches<=82);
  const views={frontage:{camera:[-25,1.15,38.4],target:[-10,1.25,36.9]},riverwalk:{camera:[-24,1.10,-33],target:[-15,1.1,-37]},sign:{camera:[-4.5,1.30,40],target:[-4.5,1.30,38.4]},planting:{camera:[-19.8,.8,-32.7],target:[-18.6,.55,-31.35]}};
  for(const [name,v]of Object.entries(views)){
   await page.evaluate(v=>{player.position=[v.camera[0],.35,v.camera[2]];state.overview=v;updateCamera(0,true);render();},v);
   const shot=await page.locator('#canvas').screenshot();assert((await sharp(shot).stats()).channels.some(c=>c.stdev>20),'nonblank '+name);
   await page.screenshot({path:path.join(out,'furnishings-'+name+'.png')});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},views.riverwalk);
  assert((await sharp(await page.locator('#canvas').screenshot()).stats()).channels.some(c=>c.stdev>20));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile fits');
  await page.screenshot({path:path.join(out,'furnishings-mobile.png')});
  const movement=await page.evaluate(()=>{
   state.ghost=false;state.overview=null;state.speed=2;
   function walk(x,z,yaw,steps){player.position=[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.003,z];player.yaw=yaw;player.vy=0;player.grounded=true;for(let i=0;i<steps;i++)advancePlayer(1/90,{forward:true});return [...player.position];}
   return {front:walk(-25,37.9,-Math.PI/2,1000),river:walk(-25,-34,-Math.PI/2,1000),bench:walk(35.5,37.2,0,130)};
  });
  console.log('WALKING',movement);assert(movement.front[0]>-15,'frontage path');assert(movement.river[0]>-15,'riverwalk path');assert(movement.bench[2]>36.85,'bench blocks walking through seat');
  assert.deepEqual(errors,[]);console.log('PASS asset budgets, exterior-only placements, instancing, lamp emission, physical props, desktop/mobile pixels and walking clearances');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
