const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const {chromium}=require('playwright'),sharp=require('sharp'),C=require('./life111.js');
const bytes=zlib.gunzipSync(fs.readFileSync(__dirname+'/city.glb.gz'));
const city=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),expected=city.extras.life111.vehicles.map(C.scaledVehicle144);
const out=path.resolve(__dirname,'../../work/vehicles144');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/GL_INVALID|shader.*ERROR/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261019-vehicles144&time=night');
  await page.waitForFunction(()=>state.ready&&City106.snapshot().ready&&CityLife111.snapshot().peopleReady&&AnimatedCharacters.snapshot().status==='ready'&&Hospitality140.snapshot().ready,null,{timeout:180000});
  await page.evaluate(async()=>{await venueLayoutReady;state.paused=true;Crowd.pause(true);applyStudentMode();CityLife111.settle();});
  const fleet=await page.evaluate(()=>CityLife111.trafficBodies().map(v=>({id:v.id,kind:v.kind,length:v.length,width:v.width,height:v.height,scale:v.scale144,parked:v.parked,axles:v.axles117})));
  for(let i=0;i<fleet.length;i++){
   const actual=fleet[i],v=expected[i];assert.equal(actual.id,v.id);assert.equal(actual.scale,v.scale144);
   for(const key of ['length','width','height'])assert.equal(actual[key],v[key]);assert.deepEqual(actual.axles,v.axles117);
  }
  const parts=await page.evaluate(()=>City106.batches.filter(b=>b.vehicle114).map(b=>({name:b.name,id:b.vehicle114.id,role:b.vehicle114.role,scale:[0,4,8].map(k=>Math.hypot(...b.modelMatrix.slice(k,k+3))),center:b.center,cullRadius:b.cullRadius})));
  const nodes=new Map(city.nodes.filter(n=>n.extras?.life111).map(n=>[n.name,n])),byId=new Map(expected.map(v=>[v.id,v]));
  for(const part of parts){
   const n=nodes.get(part.name),v=byId.get(part.id);assert(n&&v);
   const p=C.scaledVehiclePart144(n.extras.life111,n.scale,v.scale144);
   assert(part.scale.every((s,i)=>Math.abs(s-p.scale[i])<1e-5));assert(part.center.every(Number.isFinite));assert(part.cullRadius>0&&Number.isFinite(part.cullRadius));
  }
  console.log('PASS production fleet metadata and '+parts.length+' visible part transforms');
  await page.evaluate(()=>{
   window.scaleTestSaved144=CityLife111.trafficBodies().map(v=>({...v,p:[...v.p]}));
   window.scaleTestCamera144=updateCamera;
   updateCamera=function(dt,immediate){if(window.scaleTestView144){camera=[...scaleTestView144.eye];target=[...scaleTestView144.target];smoothRadius=3;return;}return scaleTestCamera144(dt,immediate);};
   for(const v of CityLife111.trafficBodies()){v.parked=true;v.p=[500+Number(v.id.split('-')[1])*6,-.1275,500];}
   state.overview=null;state.firstPerson=false;state.ghost=false;player.walkAmount=0;player.grounded=true;
  });
  async function shot(kind,time,name=kind){
   const placement=await page.evaluate(({kind,time})=>{
    const cars=CityLife111.trafficBodies();for(const v of cars)v.p=[500+Number(v.id.split('-')[1])*6,-.1275,500];
    const v=cars.find(v=>v.kind===kind);Object.assign(v,{p:[-5,-.1275,41.6],yaw:Math.PI/2,travel:0,turn114:null,crashed:false,health:100,parked:time===900});
    const x=-5+v.length/2+.35,z=41.6-v.width/2-.35;
    player.position=[x,-.1275+PHYSICS.radii[1]+.002,z];player.yaw=Math.PI;AnimatedCharacters.update(.02);CityLife111.settle();CityLighting131.test.setTime(time);
    const distance=Math.max(3.4,v.length*1.4);
    scaleTestView144={eye:[-5+distance*.45,1.05,41.6-distance],target:[-5+v.length*.12,.27,41.6]};updateCamera(0,true);render();
    const wheel=City106.batches.filter(b=>b.vehicle114?.id===v.id&&b.vehicle114.role==='wheel');
    return {id:v.id,kind,height:v.height,length:v.length,width:v.width,characterHeight:CHARACTER_HEIGHT,feet:player.position[1]-PHYSICS.radii[1],wheelCenters:wheel.map(b=>Array.from(b.modelMatrix.slice(12,15)))};
   },{kind,time});
   const png=await page.screenshot();fs.writeFileSync(path.join(out,name+'.png'),png);
   const stats=await sharp(png).extract({left:200,top:220,width:800,height:480}).stats();assert(stats.channels.some(c=>c.stdev>12),'nonblank '+name);
   assert.equal(await page.evaluate(()=>gl.getError()),0);return placement;
  }
  const views=[];
  for(const kind of ['classic','sedan','taxi','suv','pickup','van','delivery','police','police-suv','bus'])views.push(await shot(kind,900));
  await shot('classic',2100,'classic-night');
  await page.setViewportSize({width:1280,height:800});await shot('classic',900,'classic-laptop');
  await page.setViewportSize({width:1440,height:960});
  const motion=await page.evaluate(()=>{
   updateCamera=scaleTestCamera144;scaleTestView144=null;
   CityLife111.trafficBodies().forEach((v,i)=>Object.assign(v,scaleTestSaved144[i]));CityLife111.settle();
   const bodies=CityLife111.trafficBodies(),v=bodies.find(v=>!v.parked&&v.kind==='classic'),lane=CityLife111.mapLanes().find(l=>l.id==='front-east');
   for(const o of bodies){o.parked=true;o.p=[500+Number(o.id.split('-')[1])*6,-.1275,500];}
   Object.assign(v,{parked:false,p:[20,-.1275,lane.cross],yaw:Math.PI/2,lane:lane.id,s:20-lane.start,travel:0,speed:1,maxSpeed:1,turn114:null,turns114:false,yieldPath120:null,yieldTimer:0,steer115:0,offset115:0});
   CityLife111.settle();City106.setTrafficTime(26);
   player.position=[20,.36,38];state.overview=null;state.firstPerson=false;state.radius=2.5;updateCamera(0,true);
   const wheel=City106.batches.find(b=>b.vehicle114?.id===v.id&&b.vehicle114.role==='wheel'),before=wheel.vehicle114.spin,samples=[];
   for(let i=0;i<120;i++){CityLife111.update(1/60);CityLife111.present();samples.push(wheel.vehicle114.spin);}
   CityLife111.settle();render();
   const front=RoadPose117.matrix(v.poseCache117.pose.front),result={rotation:wheel.vehicle114.spin-before,samples,travel:v.travel,radius:v.radius,light:v.light134,position:[...v.p],height:v.height,frontZ:v.frontZ,expectedBeam:tp(front,0,v.height*.43,v.frontZ+.03)};
   bodies.forEach((v,i)=>Object.assign(v,scaleTestSaved144[i]));CityLife111.settle();City106.setTrafficTime(null);return result;
  });
  assert(motion.rotation>0);assert(Math.abs(motion.rotation-motion.travel/motion.radius)<1e-5,'wheel rotation uses scaled tire radius');
  assert(motion.samples.slice(6).every((s,i)=>s>motion.samples[i+5]),'wheels move every rendered frame');
  console.log('HEADLIGHT',JSON.stringify({p:motion.light.p,expected:motion.expectedBeam,position:motion.position}));
  assert(motion.light.p.every((p,i)=>Math.abs(p-motion.expectedBeam[i])<1e-5),'beam remains attached to scaled bumper on the rendered road pose');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>gl.getError()),0);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({fleet,views,motion,parts:parts.length,errors},null,2));
  console.log('PASS 10 models beside adult, day/night, desktop/laptop, proportional wheel rotation, headlight anchors and clean WebGL');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
