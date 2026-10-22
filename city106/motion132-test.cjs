const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./life111.js');
const car=()=>({id:'car',p:[0,0,0],yaw:0,s:100,travel:0,speed:1.2,maxSpeed:1.2,width:.6,length:1.4,wheelbase:.9,lane:'test'});
const frame=v=>C.vehicleFrame(v),mix=C.interpolateVehicle,close=(a,b,e=1e-8)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
for(const rate of[30,60,90,120,144]){
 const v=car(),lane={id:'test',axis:2,dir:1,start:-100,end:100,length:200,cross:0,signal:'ns',stops:[],junctions:[]};
 let previous=frame(v),current=previous,acc=0,time=0;
 for(let i=0;i<rate*3;i++){
  const dt=1/rate;time+=dt;acc+=dt;
  while(acc>=C.TRAFFIC_STEP){previous=current;C.trafficStep([v],[lane],C.TRAFFIC_STEP,{ns:'green'},null);current=frame(v);acc-=C.TRAFFIC_STEP;}
  const copy=JSON.stringify(v),rendered=mix(previous,current,acc/C.TRAFFIC_STEP);
  if(time>.1)close(rendered.p[2],(time-C.TRAFFIC_STEP)*1.2);
  assert.equal(JSON.stringify(v),copy,'render sampling leaves physics untouched');
 }
}
const a=frame(car()),b={...a,p:[0,0,.06],travel:.06};
close(mix(a,b,.25).p[2],.015);close(mix(a,b,.75).travel,.045);
close(Math.abs(mix({...a,yaw:Math.PI-.01},{...b,yaw:-Math.PI+.01},.5).yaw),Math.PI);
assert.equal(mix(a,{...b,p:[80,0,0]},.1).snap,true,'route wrapping snaps');
assert.equal(mix(a,{...b,travel:-1},.1).snap,true,'odometer reset snaps');
for(const state of[{crashed:true},{parked:true},{recoveries:1}])assert.equal(mix(a,{...b,...state},.1).snap,true);
const turn={...b,turn114:{radius:1.45}};close(mix(a,turn,.5).steer([.2,0,.4],true),C.wheelSteer(turn,[.2,0,.4],true)/2);
close(mix(a,turn,.5).steer([.2,0,-.4],false),0);
assert(!C.sameVehicleFrame(a,{...car(),p:[.01,0,0]}),'external physics changes invalidate interpolation');
console.log('PASS 30/60/90/120/144 Hz traffic, wheel steering, angle wrap, teleport, crash and reset boundaries');
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/motion132');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGL|GL_INVALID/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-motion132');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.StreetProps128?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);CityLighting131.test.setTime(900);});
  const motion=await page.evaluate(()=>{
   const bodies=CityLife111.trafficBodies(),saved=bodies.map(v=>({...v,p:[...v.p]})),v=bodies.find(v=>!v.parked&&v.kind==='taxi'),lane=CityLife111.mapLanes().find(l=>l.id==='front-west');
   for(const o of bodies){o.parked=true;o.p=[500+Number(o.id.split('-')[1])*5,-.1275,500];}
   Object.assign(v,{parked:false,crashed:false,p:[28,-.1275,lane.cross],lane:lane.id,s:lane.end-28,yaw:-Math.PI/2,speed:1.2,maxSpeed:1.2,travel:0,turn114:null,turns114:false,yieldPath120:null,yieldTimer:0,offset115:0,steer115:0});
   City106.setTrafficTime(26);CityLife111.settle();
   player.position=[28,.34,38.5];player.yaw=Math.PI/2;state.firstPerson=false;state.overview=null;state.orbitYaw=-Math.PI/2;state.pitch=.1;state.radius=.7;state.ghost=true;state.speed=2;accumulator=0;
   const body=City106.batches.find(b=>b.vehicle114?.id===v.id&&b.vehicle114.role==='body'),wheel=City106.batches.find(b=>b.vehicle114?.id===v.id&&b.vehicle114.role==='wheel'),samples=[];
   for(let i=0;i<180;i++){
    CityLife111.update(1/60);accumulator+=1/60;
    while(accumulator>=PHYSICS.step){advanceFramePlayer132(PHYSICS.step,{forward:true});accumulator-=PHYSICS.step;}
    updateCamera(1/60,true);CityLife111.present();
    samples.push({x:body.modelMatrix[12],physical:v.p[0],relative:body.modelMatrix[12]-camera[0],spin:wheel.vehicle114.spin});
   }
   render();const frames=CityMaterials129.snapshot();for(let i=0;i<6;i++)render();const later=CityMaterials129.snapshot();
   const copy=JSON.stringify({p:v.p,yaw:v.yaw,travel:v.travel}),matrix=Array.from(body.modelMatrix);CityLife111.present();
   const unchanged=JSON.stringify({p:v.p,yaw:v.yaw,travel:v.travel})===copy&&matrix.every((n,i)=>n===body.modelMatrix[i]);
   Object.assign(v,{crashed:true,p:[24,-.1275,41.6]});CityLife111.present();const crashed=body.modelMatrix[12];
   Object.assign(v,{crashed:false,p:[18,-.1275,41.6],recoveries123:1});CityLife111.present();const reset=body.modelMatrix[12];
   bodies.forEach((v,i)=>Object.assign(v,saved[i]));CityLife111.settle();City106.setTrafficTime(null);state.ghost=false;state.radius=3.95*PLAYER_SCALE;
   return {samples,unchanged,crashed,reset,shadowFrames:later.frames-frames.frames,reflectionFrames:later.reflectionFrames-frames.reflectionFrames};
  });
  const samples=motion.samples.slice(10),diff=key=>samples.slice(1).map((s,i)=>s[key]-samples[i][key]);
  const held=diff('physical').filter(x=>Math.abs(x)<1e-7).length,visualHeld=diff('x').filter(x=>Math.abs(x)<1e-7).length;
  assert(held>60,'20 Hz physical simulation retained');assert.equal(visualHeld,0,'vehicle moves on every 60 Hz frame');
  assert(Math.max(...diff('relative').map(Math.abs))<.00002,'equal-speed walking camera has stable relative vehicle position');
  assert(diff('spin').every(n=>n>0),'wheels rotate every rendered frame');assert(motion.unchanged);
  close(motion.crashed,24,.001);close(motion.reset,18,.001);assert.equal(motion.shadowFrames,6);assert.equal(motion.reflectionFrames,6);
  async function view(name,eye,at){
   await page.evaluate(({eye,at})=>{player.position=[eye[0],floorHeightAt(eye[0],eye[2])+PHYSICS.radii[1]+.002,eye[2]];state.overview={camera:eye,target:at};AnimatedCharacters.update(.02);updateCamera(0,true);render();},{eye,at});
   const pixels=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),pixels);assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>15),'nonblank '+name);
  }
  console.log('PASS render interpolation and authoritative crash/reset poses');
  await view('park-benches',[-28.2,.85,16.5],[-26.65,.25,16]);
  await view('park-south-bench',[-16,.9,-26],[-15,.3,-23.9]);
  await view('sun-wall',[-29,1.5,17],[-24,4,7]);
  const sun=await page.evaluate(async()=>{
   const result=[];for(let i=0;i<=120;i++){CityLighting131.test.setTime(450+i/60);render();result.push({slot:sunSlot132,blend:gl.getUniform(program,uniforms.uSunBlend132),next:Array.from(sunNextVP132),matrix:Array.from(sunLightVP)});await new Promise(requestAnimationFrame);}return result;
  });
  fs.writeFileSync(path.join(out,'sun-verification.json'),JSON.stringify(sun,null,2));
  assert(new Set(sun.map(s=>s.slot)).size>=4);
  for(let i=1;i<sun.length;i++){
   const a=sun[i-1],b=sun[i];if(a.slot===b.slot)assert(b.blend>a.blend,`sun blend advances every frame (${i}: ${a.blend} -> ${b.blend})`);
   else assert.deepEqual(b.matrix,a.next,'shadow handoff reuses the exact previous endpoint');
  }
  await page.evaluate(()=>{CityLighting131.test.setTime(900);state.overview=null;state.orbitYaw=.7;player.yaw=0;player.grounded=true;player.position=[-27.9,floorHeightAt(-27.9,12)+PHYSICS.radii[1],12];AnimatedCharacters.update(.02);updateCamera(0,true);render();});
  const calls=await page.evaluate(()=>{const old=drawBatch;let circles=0;drawBatch=function(b,...args){if(b===avatarSphere)circles++;return old(b,...args);};try{render();}finally{drawBatch=old;}return circles;});
  assert.equal(calls,0,'no fallback sphere shadow below loaded character');
  await page.screenshot({path:path.join(out,'player-real-shadow.png')});
  await page.evaluate(()=>{state.paused=false;});await page.keyboard.down('w');await page.waitForTimeout(650);await page.keyboard.up('w');await page.evaluate(()=>{state.paused=true;render();});
  await page.screenshot({path:path.join(out,'walking-park.png')});
  await page.setViewportSize({width:390,height:844});await view('mobile-park',[-28.2,.85,16.5],[-26.65,.25,16]);
  await view('mobile-traffic',[20,1.2,38.4],[25,.5,41.6]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),frames:CityMaterials129.snapshot(),traffic:CityLife111.snapshot().moving}));assert.equal(status.gl,0);assert(!status.lost);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({held,visualHeld,motion,sun,status,errors},null,2));
  console.log('PASS frame-synchronous cars/wheels/shadows/reflections, same-direction camera, crash/reset, continuous sun, no circular shadow, desktop/mobile', {held,visualHeld});
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'error.txt'),e.stack);console.error(e);process.exitCode=1;});
