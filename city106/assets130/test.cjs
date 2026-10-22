const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../../work/assets130/qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const report=JSON.parse(fs.readFileSync(path.join(__dirname,'../report.json'))).assets130;
 assert.equal(new Set(report.sources.map(s=>s.archive)).size,15);assert.equal(report.schoolBuses.length,9);assert.equal(report.interior.drapes,4);assert.equal(report.interior.hallLetters,3);assert.equal(report.interior.wasteStations,6);assert.equal(new Set(report.benches.map(b=>b.asset)).size,3);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/WebGL|shader|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-assets130');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.StreetProps128?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.firstPerson=false;});
  async function view(name,eye,at){
   await page.evaluate(({eye,at})=>{player.position=[eye[0],floorHeightAt(eye[0],eye[2])+PHYSICS.radii[1]+.002,eye[2]];state.overview={camera:eye,target:at};AnimatedCharacters.update(.01);updateCamera(0,true);render();},{eye,at});
   await page.waitForTimeout(150);await page.evaluate(()=>render());const b=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),b);assert((await sharp(b).stats()).channels.some(c=>c.stdev>15),'nonblank '+name);
  }
  await view('hall-A',[-1.7,1.8,22],[4.2,3.2,18]);
  await view('hall-B',[-1.7,1.8,4],[4.2,3.2,0]);
  await view('hall-C',[-1.7,1.8,-14],[4.2,3.2,-18]);
  await view('restrooms',[0,1.1,15],[-4.7,1.1,12.65]);
  await view('check-in-queue',[.2,1.3,29.3],[2.8,.75,24.6]);
  await view('metro-bench',[16.0,.8,35.1],[15,.2,36.6]);
  for(const key of ['bench-metro','bench-soviet','bench-002']){
   const {p}=report.benches.find(b=>b.asset===key);await view(key,[p[0]+1.4,p[1]+.9,p[2]+1.4],[p[0],p[1]+.2,p[2]]);
  }
  await view('school-bus',[9.5,1.7,37],[6,.55,40.33]);
  await page.evaluate(()=>{for(const b of City106.batches)if(/^Supplied130 School_bus/.test(b.name))b.surfaceType=0;});
  await view('school-bus-flat',[9.5,1.7,37],[6,.55,40.33]);
  await page.evaluate(()=>{for(const b of City106.batches)if(/^Supplied130 School_bus/.test(b.name))b.surfaceType=21;});
  await view('grass-cobble',[-24,1.4,16],[-28,.0,19]);
  await view('pavement',[16.2,1.0,39],[15.8,0,37.5]);
  const s=JSON.parse(fs.readFileSync(path.join(__dirname,'../report.json'))).signals.placements.find(s=>s.p[0]>60&&s.p[2]>30);
  await view('supplied-signals',[s.p[0]-3,s.p[1]+1.6,s.p[2]+3],[s.p[0]-.8,s.p[1]+1.9,s.p[2]]);
  const bus=await page.evaluate(()=>CityLife111.snapshot().vehicleStates.find(v=>v.kind==='bus'&&!v.parked));
  await view('city-bus',[bus.p[0]+3,1.8,bus.p[2]+4],[bus.p[0],.55,bus.p[2]]);
  const busAnimation=await page.evaluate(()=>{
   const ids=new Set(CityLife111.snapshot().vehicleStates.filter(v=>v.kind==='bus').map(v=>v.id));
   const wheels=()=>City106.batches.filter(b=>ids.has(b.vehicle114?.id)&&b.vehicle114.role==='wheel').map(b=>({id:b.vehicle114.id,spin:b.vehicle114.spin,front:b.vehicle114.front,matrix:Array.from(b.modelMatrix)}));
   const before=wheels();for(let i=0;i<900;i++){City106.setTrafficTime(22+(i*.05)%18);CityLife111.update(.05);}
   return {before,after:wheels(),states:CityLife111.snapshot().vehicleStates.filter(v=>ids.has(v.id))};
  });
  for(const b of busAnimation.states){assert(Math.abs(b.length-4.9)<.001);assert.equal(busAnimation.after.filter(w=>w.id===b.id).length,4);}
  assert(busAnimation.after.some((w,i)=>Math.abs(w.spin-busAnimation.before[i].spin)>1),'new bus wheels rotate with traffic');
  assert(busAnimation.after.every(w=>w.matrix.every(Number.isFinite)));
  await view('reflection',[-36.9,1.6,6.95],[-38,.1,8]);
  const frames=await page.evaluate(()=>{const before=CityMaterials129.snapshot(),times=[],matrices=[];for(let i=0;i<8;i++){state.overview.camera[2]+=.012;state.overview.target[2]+=.012;updateCamera(0,true);const start=performance.now();render();gl.finish();times.push(performance.now()-start);matrices.push(CityMaterials129.snapshot().reflectionVP);}return {before,after:CityMaterials129.snapshot(),times,matrices};});
  assert.equal(frames.after.reflectionFrames-frames.before.reflectionFrames,8,'reflection must update every camera frame');assert.equal(frames.after.reflectionSize[0],1440);assert.notDeepEqual(frames.matrices[0],frames.matrices[1]);
  const models=await page.evaluate(()=>({oldBuses:renderBatches.filter(b=>b.vehicleInstance).length,newBuses:City106.batches.filter(b=>/^Supplied130 School_bus/.test(b.name)).length,phase:City106.trafficState(0),lights:City106.batches.filter(b=>b.traffic108).map(b=>b.traffic108),gl:gl.getError(),props:StreetProps128.snapshot()}));
  assert.equal(models.oldBuses,0);assert(models.newBuses>=9);assert.equal(models.gl,0);assert(models.lights.some(l=>l.color==='red')&&models.lights.some(l=>l.color==='green'));
  await page.setViewportSize({width:390,height:844});await view('mobile-hall-A',[-1.7,1.8,22],[4.2,3.2,18]);await view('mobile-exterior',[15,1.2,38],[15,.2,36.6]);
  assert.equal(await page.evaluate(()=>gl.getError()),0);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({report,frames,models,busAnimation,errors},null,2));console.log('PASS all 15 archives, 3 bench styles, 9 school buses, animated city buses, 4 flags, 3 hall markers, 6 sorting stations, per-frame reflections, desktop/mobile rendering');console.log({renderMs:frames.times,reflectionSize:frames.after.reflectionSize});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
