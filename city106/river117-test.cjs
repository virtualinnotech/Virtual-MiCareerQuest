const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('./road-pose117.js'),D=require('./district115.js'),fleet=require('./vehicles114/manifest.json');
const height=(x,z)=>D.heightAt(x,z)??-.1275;
let contacts=0,maxError=0,maxBend=0;
for(const model of fleet.models)for(const bridge of D.bridges.filter(b=>!b.foot))for(const yaw of[0,Math.PI]){
 const v={...model,p:[bridge.x,0,0],yaw,axles117:R.axles(model.wheels)};
 for(let z=bridge.end-4;z<bridge.start+4;z+=.11){
  v.p[2]=z;const pose=R.vehicle(v,height);
  for(const a of v.axles117){const f=model.articulation117&&a.z<model.articulation117.rearZ?pose.rear:pose.front,q=R.point(f,[0,a.y,a.z]),error=Math.abs(q[1]-a.radius-height(q[0],q[2]));maxError=Math.max(maxError,error);contacts++;assert(error<.0001,model.id+' axle floats '+error);}
  if(model.articulation117){const h=[0,model.articulation117.hingeY,model.articulation117.hingeZ],a=R.point(pose.front,h),b=R.point(pose.rear,h);assert(Math.hypot(...a.map((v,i)=>v-b[i]))<1e-9);maxBend=Math.max(maxBend,Math.abs(pose.front.pitch-pose.rear.pitch));}
 }
}
assert(maxBend>.015,'bus sections pitch independently across the crest');
const bus=fleet.models.find(m=>m.id==='bus'),v={...bus,p:[0,0,0],yaw:0,axles117:R.axles(bus.wheels)};
let maxYaw=0;
for(let i=0;i<300;i++){v.yaw=i*.002;v.p[0]+=Math.sin(v.yaw)*.02;v.p[2]+=Math.cos(v.yaw)*.02;const p=R.vehicle(v,()=>0);maxYaw=Math.max(maxYaw,Math.abs(p.bend));}
assert(maxYaw>.08&&maxYaw<.7,'rear axle trails a turn without detaching');
console.log('PASS axle contact, connected hitch and horizontal/vertical articulation',JSON.stringify({contacts,maxError,maxBend,maxYaw}));
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp');
(async()=>{
 const out=path.resolve(__dirname,'../../work/river117');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('crash'));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-river117');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  const status=await page.evaluate(()=>({city:City106.snapshot(),gl:gl.getError()}));console.log('READY',status.city.district.counts);
  assert.equal(status.city.district.counts.sealedReturns,2);assert(status.city.district.counts.restoredBridgeMembers>500);
  const gaps=await page.evaluate(()=>[-1,1].flatMap(side=>[-30.1,-29.5,-28.9].map(z=>{
   const hit=raycast([side*4.7,.8,z],[side,0,0],.8,o=>o.name.includes('sealed side return')),floor=raycast([side*5.5,1,z],[0,-1,0],2,o=>!o.boundary);
   return {side,z,wall:hit?.object?.name,floor:floor?.point[1]};
  })));
  console.log('RETURNS',gaps);assert(gaps.every(g=>g.wall?.includes('sealed side return')),'both side openings have solid collision');assert(gaps.every(g=>g.floor<.1),'no raised gallery floor outside the return walls');
  async function view(name,camera,target){await page.evaluate(({camera,target})=>{state.overview={camera,target};updateCamera(0,true);CityLife111.settle();render();},{camera,target});const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20),'nonblank '+name);await page.screenshot({path:path.join(out,name+'.png')});}
  await view('rear-inside',[1.5,1.4,-27.2],[4.8,1,-30]);
  await view('rear-outside',[8,2,-34],[2,1,-29.7]);
  await view('blue-bridge',[-17,6,-33],[-6.3,.7,-50]);
  await view('bridge-bracing',[-6.3,1,-39],[-6.3,1.6,-55]);
  await page.evaluate(()=>{
   const all=CityLife111.trafficBodies(),bus=all.find(v=>v.kind==='bus'),car=all.find(v=>v.kind==='sedan');window.testBus117=bus;window.testCar117=car;
   for(const v of all)if(v!==bus&&v!==car&&Math.abs(v.p[0]-69.9)<5&&v.p[2]<-30)v.p[0]+=150;
   Object.assign(bus,{p:[69,0,-49.5],yaw:Math.PI,parked:true,trailer117:null});Object.assign(car,{p:[71,0,-43.2],yaw:Math.PI,parked:true});CityLife111.settle();
  });
  await view('bus-crest',[75.5,1.8,-49.5],[69,1.0,-49.5]);
  await view('car-slope',[74,1.0,-43.2],[71,.6,-43.2]);
  const movement=await page.evaluate(()=>{
   const v=testBus117,results=[];
   for(let i=0;i<120;i++){v.p[2]=-36-i*.24;v.travel+=.24;CityLife111.settle();results.push({...v.roadPose117});}
   return {results,joints:City106.batches.filter(b=>b.vehicle114?.id===v.id&&b.boneTexture).map(b=>({skin:!!b.boneTexture,instanced:b.sceneInstance})),gl:gl.getError()};
  });
  assert(movement.results.some(r=>r.pitch>.02)&&movement.results.some(r=>r.pitch<-.02),'bus tips both uphill and downhill');assert(movement.results.some(r=>Math.abs(r.pitch-r.rearPitch)>.01));assert(movement.joints.length&&movement.joints.every(j=>j.skin&&!j.instanced));assert.equal(movement.gl,0);
  await page.setViewportSize({width:390,height:844});await view('mobile-bridge',[-12,4,-34],[-6.3,.7,-46]);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({gaps,status,movement,errors},null,2));console.log('PASS desktop/mobile renders, side closure and live skinned bus');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
