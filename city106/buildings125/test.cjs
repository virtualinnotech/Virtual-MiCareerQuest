const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../../work/'+(require('../report.json').buildings.preserved127?'skins127':'buildings125'));fs.mkdirSync(out,{recursive:true});
async function main(){
 const report=require('../report.json').buildings;
 assert(report.placements.length>=395);assert.equal(report.facade.panels,15);
 const bytes=fs.readFileSync(path.join(__dirname,'../city.glb')),asset=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
 if(report.preserved127){
  assert.equal(report.placements.length,395);assert.equal(asset.extras.skins127.length,24);
  assert.equal(asset.nodes.filter(n=>n.extras?.building125).length,0);
 }else{
 assert.deepEqual(Object.keys(report.counts).sort(),['chicago','london','nyc','pbr','procedural','scene']);
 assert(Object.keys(report.variants).length>=16);
 const buildingMaterials=asset.materials.filter(m=>m.name.startsWith('Building125 ')),glazing=buildingMaterials.filter(m=>m.extras?.reflectiveWindow125);
 assert(glazing.length>=3);assert(glazing.every(m=>m.extras.surfaceType===4&&m.pbrMetallicRoughness.roughnessFactor<=.15));
 const concrete=buildingMaterials.find(m=>m.name==='Building125 scene:Color2').pbrMetallicRoughness.baseColorFactor;
 assert(concrete[0]<concrete[1]&&concrete[1]<=concrete[2],'lavender plaster replaced with neutral gray concrete');
 for(const m of buildingMaterials){const c=m.pbrMetallicRoughness.baseColorFactor||[1,1,1,1];assert(!(c[0]>.15&&c[0]>c[1]*1.06&&c[2]>c[1]*1.06),'pink building material: '+m.name);}
 }
 for(const p of report.placements)for(const axis of[0,2]){
  assert(p.bounds.lo[axis]>=p.lot.lo[axis]-.001,p.name+' extends beyond lot');
  assert(p.bounds.hi[axis]<=p.lot.hi[axis]+.001,p.name+' extends beyond lot');
 }
 console.log('PASS '+report.placements.length+' buildings and lot clearance');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('page crash'));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-skins127');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.Ambulance35?.snapshot().status==='ready'&&characterState.player&&window.walkSurfacesReady118,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.ghost=false;state.speed=1;});
  const wall=await page.evaluate(()=>{
   function walk(x,z,yaw,sprint=false,diagonal=false){state.overview=null;player.position=[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.002,z];player.yaw=yaw+(diagonal?.45:0);player.vy=0;player.grounded=true;for(let i=0;i<600;i++)advancePlayer(1/120,{forward:true,fast:sprint});return [...player.position];}
   const tests=[];
   for(let x=9.8;x<64;x+=3.72)for(const side of[-1,1])tests.push({x,side,p:walk(x,34.287+side*1.2,side===1?0:Math.PI,true)});
   const diagonal=[-1,1].map(side=>({side,p:walk(30,34.287+side*1.2,side===1?0:Math.PI,true,true)}));
   const entrance=walk(0,36,0,true);
   return {tests,diagonal,entrance,colliders:colliders.filter(c=>c.name==='DeVos125 front glass wall').map(c=>({lo:c.lo,hi:c.hi,barrier:c.barrier}))};
  });
  assert.equal(wall.colliders.length,1);assert(wall.colliders[0].barrier);
  for(const t of[...wall.tests,...wall.diagonal])assert(t.side>0?t.p[2]>34.4:t.p[2]<34.15,'walked through front wall '+JSON.stringify(t));
  console.log('Front entry position',wall.entrance);
  assert(wall.entrance[2]<33.4,'entrance is still usable');
  console.log('PASS 30 two-sided front-window contacts, diagonal approaches and entrance traversal');
  const exits=await page.evaluate(()=>{
   const results=[],A=Ambulance35;
   for(const phase of['running','timeout','breakdown','complete']){
    state.paused=false;state.overview=null;A.visit();A.enter();if(!A.mounted)throw Error('Could not enter');
    A.test.place(60,42.9,Math.PI/2);Object.assign(A.test.state,{phase,health:phase==='breakdown'?0:70,next:3,elapsed:19,warning:'test'});
    A.exit();state.paused=true;
    results.push({phase,snapshot:A.snapshot(),pose:A.test.physics.pose(),player:[...player.position],obstacle:CityLifeCore111.ambulanceObstacle(A.snapshot())});
   }
   return results;
  });
  for(const r of exits){
   const s=r.snapshot;assert(!s.mounted);assert.equal(s.phase,'ready');assert.equal(s.next,0);assert.equal(s.elapsed,0);assert.equal(s.health,100);
   for(const k of['x','z','yaw']){assert(Math.abs(s[k]-s.parked[k])<1e-7);assert(Math.abs(r.pose[k]-s.parked[k])<1e-7);}
   assert(Math.hypot(r.player[0]-60,r.player[2]-42.9)<2,'player must stay where they exited');
   assert(Math.abs(r.obstacle.p[0]-s.parked.x)<1e-7);assert(Math.abs(r.obstacle.p[2]-s.parked.z)<1e-7);
  }
  assert(await page.locator('#ambulanceMap120').isHidden());assert(await page.locator('#controlsIconBtn').isVisible());
  await page.evaluate(()=>{state.paused=false;Ambulance35.visit();Ambulance35.enter();Ambulance35.test.place(71,10,Math.PI);});
  await page.keyboard.press('Escape');
  const escape=await page.evaluate(()=>{state.paused=true;return Ambulance35.snapshot();});assert(!escape.mounted&&escape.x===escape.parked.x&&escape.z===escape.parked.z);
  console.log('PASS return-to-bay after normal exit, timeout, breakdown, completion and Escape; physical obstacle and HUD reset');
  async function view(name,camera,target){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});
   const shot=await page.locator('#canvas').screenshot(),stats=await sharp(shot).stats();assert(stats.channels.some(c=>c.stdev>20),'nonblank '+name);
   await page.screenshot({path:path.join(out,name+'.png')});
  }
  await view('avenue',[4,1.3,43],[8,3.5,58]);
  await view('river-skyline',[5,1.3,-35],[12,4,-76]);
  await view('east-street',[71,1.3,24],[90,3,9]);
  const shadows=await page.locator('#canvas').screenshot();
  await page.evaluate(()=>{state.sunShadows=false;render();});
  const unshadowed=await page.locator('#canvas').screenshot();assert(!shadows.equals(unshadowed),'sun shadows visibly shade the buildings and street');
  await page.evaluate(()=>{state.sunShadows=true;render();});
  await view('front-wall',[27,1.35,37],[28,1.5,34]);
  await view('gallery-preserved',[-2.4,1.25,28],[4.2,3.8,2]);
  const runtime=await page.evaluate(()=>({city:City106.snapshot(),buildingBatches:City106.batches.filter(b=>b.building125).length,reflectiveGlazing:City106.batches.filter(b=>b.building125&&b.surfaceType===4).length,shadowSize:SUN_MAP_SIZE,oldBuildings:renderBatches.filter(b=>b.cityInfill||b.skyline&&!b.vehicleInstance).map(b=>b.name),challengeExclusions:venueSceneJSON.nodes.filter(n=>n.extras?.removedForCrane39&&['cityBuildingDetailed','distantCityBackdropDetailed'].includes(n.extras?.kind)).map(n=>n.name),gl:gl.getError(),lost:gl.isContextLost()}));
  assert.equal(runtime.shadowSize,4096);
  if(report.preserved127){
   assert.equal(runtime.buildingBatches,0);assert.deepEqual(runtime.oldBuildings.slice().sort(),report.placements.map(p=>p.name).filter(n=>!runtime.challengeExclusions.includes(n)).sort());assert.equal(runtime.city.skins,24);
   const surfaces=await page.evaluate(()=>renderBatches.filter(b=>b.cityInfill||b.skyline&&!b.vehicleInstance).every(b=>b.baseTexture&&b.normalTexture&&b.surfaceType===17));assert(surfaces,'restored buildings have textured masonry and reflective window masks');
  }else{assert(runtime.reflectiveGlazing>100);assert(runtime.buildingBatches>395);assert.equal(runtime.oldBuildings.length,0);}
  assert.equal(runtime.gl,0);assert(!runtime.lost);
  await page.evaluate(()=>{state.overview=null;player.position=[0,.6,24];player.yaw=0;updateCamera(0,true);render();});
  const before=await page.locator('#canvas').screenshot();await page.evaluate(()=>{for(let i=0;i<180;i++)advancePlayer(1/120,{forward:true});updateCamera(0,true);render();});
  assert(!before.equals(await page.locator('#canvas').screenshot()),'interactive canvas moves');
  await page.setViewportSize({width:390,height:844});await view('mobile-city',[4,1.3,43],[8,3.5,58]);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({wall,exits,escape,runtime,errors},null,2));
  console.log('PASS desktop/mobile city and gallery rendering, actual textured model batches, moving canvas, no JS/WebGL errors');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
