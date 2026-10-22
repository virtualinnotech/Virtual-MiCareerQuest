const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../../work/street128');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});
  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
  const missing=[];page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1','{"seen":true}');});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261020-collision161');
  await page.waitForFunction(()=>window.StreetProps128?.snapshot().ready&&window.Scooter100?.snapshot().ready&&window.RideDocks128?.snapshot().ready&&window.Ambulance35?.snapshot().status==='ready'&&characterState.player&&!window.Loading155?.blocked,null,{timeout:300000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.ghost=false;});
  console.log('READY',await page.evaluate(()=>({props:StreetProps128.snapshot(),docks:RideDocks128.snapshot(),rides:Object.keys(Scooter100.snapshot().rides)})));
  console.log('INITIAL ACTIVE',JSON.stringify(await page.evaluate(()=>StreetProps128.snapshot().active)));
  assert.equal((await page.evaluate(()=>StreetProps128.snapshot().active)).length,0,'normal startup traffic does not hit misplaced furniture');
  assert(await page.evaluate(()=>[...StreetProps128.test.records.keys()].every(n=>!/\btree\b|planter|building|concrete/i.test(n))),'trees, concrete and buildings stay fixed');
  async function view(name,camera,target){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});
   const pixels=await page.evaluate(()=>{render();const p=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,p);const colors=new Set();for(let i=0;i<p.length;i+=4096)colors.add(p.slice(i,i+3).join(','));return colors.size;});
   assert(pixels>30,'rendered canvas is blank');
   const buffer=await page.locator('#canvas').screenshot();assert((await sharp(buffer).stats()).channels.some(c=>c.stdev>18));fs.writeFileSync(path.join(out,name+'.png'),buffer);
  }
  await view('pavement',[1.5,2.4,40.8],[0,0,36.4]);
  await view('docks',[15.7,1.1,41],[14.4,.3,38.15]);
  await view('river-docks',[24,1.1,-33.8],[22.4,.3,-36.55]);
  console.log('GEOMETRY',await page.evaluate(()=>({paint:renderBatches.filter(b=>b.citySurface106==='paintedPaving').map(b=>({textured:!!b.baseTexture,uv:!!b.uv})),types:StreetProps128.snapshot().types})));
  const impact=await page.evaluate(()=>{const id='City107 streetlights 5',r=StreetProps128.test.records.get(id),original=r.parts.map(p=>Array.from(p.batch.modelMatrix));StreetProps128.test.hit(id,{x:0,z:4,mass:3600});StreetProps128.test.advance(2);return {id,original,snapshot:StreetProps128.snapshot(),disabled:StreetProps128.disabled(id),parts:r.parts.map(p=>({broken:p.glass,hidden:p.batch.hidden128,m:Array.from(p.batch.modelMatrix)}))};});
  assert(impact.disabled);assert(impact.snapshot.shards>0);assert(impact.parts.some(p=>p.hidden));
  const lampPose=impact.snapshot.active.find(p=>p.id===impact.id).position;
  await view('lamp-impact',[lampPose[0]+2,2.2,lampPose[2]-2],[lampPose[0],.2,lampPose[2]]);
  const reset=await page.evaluate(({id,original})=>{StreetProps128.test.advance(28.01);const r=StreetProps128.test.records.get(id);return {active:StreetProps128.disabled(id),restored:r.parts.every((p,i)=>Array.from(p.batch.modelMatrix).every((v,k)=>Math.abs(v-original[i][k])<1e-6)),glass:r.parts.every(p=>!p.batch.hidden128)};},impact);
  assert.deepEqual(reset,{active:false,restored:true,glass:true});
  await page.evaluate(()=>{StreetProps128.test.hit('City109 hydrants 1',{x:3,z:0,mass:95});StreetProps128.test.advance(1);});
  await view('hydrant',[-19.8,1.1,41],[-21,.65,39.1]);
  console.log('PASS rigid-body fall, lens shatter and exact assembled reset');
  const locked=await page.evaluate(()=>{
   state.overview=null;state.paused=false;const id='front-west-bike-0',p=Scooter100.snapshot().rides[id].parked;player.position=[p.x,floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.002,p.z+.38];player.vy=0;player.grounded=true;
   return {unlocked:StudentProgress99.complete(),mounted:Scooter100.mount(id)};
  });assert(!locked.unlocked&&!locked.mounted,'new bikes stay challenge locked');
  const riding=await page.evaluate(()=>{
   StudentProgress99.completeForTesting();StudentRewards100.close();state.paused=false;state.overview=null;state.speed=1;
   const id='front-west-bike-0',mounted=Scooter100.mount(id);if(!mounted)return {mounted,p:player.position,ride:Scooter100.snapshot(),busy:Scooter100.busy(),disabled:StreetProps128.disabled('Ride128 '+id),paused:state.paused,toast:document.querySelector('#toast')?.textContent};
   const before=[...player.position];for(let i=0;i<55;i++){advancePlayer(1/120,{forward:true});AnimatedCharacters.update(1/120);}
   state.paused=true;updateCamera(0,true);render();return {mounted,before,after:[...player.position],ride:Scooter100.snapshot()};
  });console.log('RIDING',JSON.stringify({mounted:riding.mounted,before:riding.before,after:riding.after,error:riding.ride?.poseError}));assert(riding.mounted,'unlocked bike can be mounted');assert(Math.hypot(riding.after[0]-riding.before[0],riding.after[2]-riding.before[2])>.15,'bike leaves dock');
  await page.screenshot({path:path.join(out,'riding.png')});
  await page.evaluate(()=>{state.overview=null;state.orbitYaw=Math.PI/2;state.pitch=-.1;updateCamera(0,true);render();});await page.screenshot({path:path.join(out,'riding-side.png')});
  assert(riding.ride.poseError.every(e=>e.error<.02),'hands and feet reach bike');
  const returned=await page.evaluate(()=>{state.paused=false;const id=Scooter100.snapshot().activeId,home=RideDocks128.snapshot().stations[0];Scooter100.dismount(true);state.paused=true;return {mounted:Scooter100.mounted,parked:Scooter100.snapshot().rides[id].parked,home};});assert(!returned.mounted);assert(Math.abs(returned.parked.z-returned.home.z-.38)<1e-6);
  console.log('PASS challenge lock, unlock, bike boarding, riding pose, wheel movement and return to dock');
  const dockTests=await page.evaluate(()=>{
   const results=[];StreetProps128.test.advance(31);state.overview=null;state.paused=false;
   for(const [id,r]of Object.entries(Scooter100.snapshot().rides).filter(([id])=>id.includes('-'))){
    const p=r.parked;player.position=[p.x,floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.002,p.z-Math.cos(p.yaw)*.38];player.yaw=p.yaw;player.grounded=true;player.vy=0;
    const mounted=Scooter100.mount(id);results.push({id,mounted});if(mounted){for(let i=0;i<30;i++)advancePlayer(1/120,{forward:true});Scooter100.dismount(true);}
   }state.paused=true;return results;
  });console.log('DOCKS',dockTests);assert(dockTests.every(r=>r.mounted),'all twelve rentals are reachable');
  const rideImpacts=await page.evaluate(()=>{
   const out=[];state.overview=null;state.paused=false;
   for(const id of ['front-west-bike-0','front-west-scooter-2']){
    StreetProps128.test.advance(31);const p=Scooter100.snapshot().rides[id].parked;player.position=[p.x,floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.002,p.z+.38];player.grounded=true;player.vy=0;
    const mounted=Scooter100.mount(id),r=StreetProps128.test.records.get('City109 hydrants 1'),hits=r.prop.hitCount;
    player.position=[r.prop.origin[0]-1.5,floorHeightAt(r.prop.origin[0],r.prop.origin[2])+PHYSICS.radii[1]+.002,r.prop.origin[2]];player.yaw=-Math.PI/2;
    for(let i=0;i<180;i++){advancePlayer(1/120,{forward:true});StreetProps128.test.advance(1/120);}
    out.push({id,mounted,hit:r.prop.hitCount>hits});Scooter100.dismount(true);
   }state.paused=true;return out;
  });console.log('RIDE IMPACTS',rideImpacts);assert(rideImpacts.every(v=>v.mounted&&v.hit));
  const ambulance=await page.evaluate(()=>{
   StreetProps128.test.advance(31);state.overview=null;state.paused=false;
   const A=Ambulance35;A.reset();A.enter();const r=StreetProps128.test.records.get('City109 hydrants 1'),p=r.prop.origin,hits=r.prop.hitCount;
   A.test.place(p[0]-4,p[2],Math.PI/2);
   for(let i=0;i<180;i++){Object.assign(A.test.state,A.test.physics.step(1/120,{throttle:1,steer:0,brake:false},A.test.height(A.test.state.x,A.test.state.z)));StreetProps128.test.advance(1/120);}
   const result={mounted:A.mounted,hit:r.prop.hitCount>hits,health:A.snapshot().health,impacts:A.snapshot().impacts};A.test.physics.stop();A.exit();state.paused=true;return result;
  });console.log('AMBULANCE IMPACT',ambulance);assert(ambulance.mounted&&ambulance.hit&&ambulance.impacts>0);
  const glass=await page.evaluate(()=>{StreetProps128.test.advance(31);const r=[...StreetProps128.test.records.values()].find(r=>r.type==='busShelters');StreetProps128.test.hit(r.id,{x:4,z:0,mass:3600});return {glass:r.glass.length,hidden:r.parts.filter(p=>p.glass).every(p=>p.batch.hidden128),frame:r.parts.filter(p=>!p.glass).every(p=>!p.batch.hidden128)};});assert(glass.glass&&glass.hidden&&glass.frame);
  console.log('PASS all docks, bicycle/scooter/ambulance driving impacts, damage and shelter glass');
  const trafficHit=await page.evaluate(()=>{
   StreetProps128.test.advance(31);state.paused=false;
   const r=StreetProps128.test.records.get('City109 hydrants 1'),p=r.prop.origin,source=CityLife111.trafficBodies;
   const vehicle={id:'traffic-impact-test',kind:'car',p:[p[0]-2,p[1],p[2]],yaw:Math.PI/2,width:.7,length:1.5,height:.8,speed:2};
   CityLife111.trafficBodies=()=>[vehicle];try{StreetProps128.test.tick(.05);for(let i=0;i<30;i++){vehicle.p[0]+=.1;StreetProps128.test.tick(.05);}return {active:!!r.prop.body,vehicles:StreetProps128.test.engine.vehicleBodies.size};}finally{CityLife111.trafficBodies=source;state.paused=true;}
  });assert(trafficHit.active&&trafficHit.vehicles>0);console.log('PASS NPC traffic impact and vehicle/furniture contact bodies');
  await page.setViewportSize({width:390,height:844});await view('mobile-docks',[15.3,1.2,41.4],[14.4,.3,38.15]);
  console.log('MISSING',missing);assert(!missing.some(u=>/street128|city106|vehicle-physics/.test(u)),'all changed assets load');
  assert.deepEqual(errors,[]);console.log('PASS desktop/mobile rendered canvas, no runtime errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
