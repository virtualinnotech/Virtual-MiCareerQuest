const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.route('**/api/manifest',r=>r.fulfill({json:{booths:[]}}));await page.route('**/api/sectors',r=>r.fulfill({json:{sectors:[]}}));
  await page.goto(process.env.VENUE_URL||'http://127.0.0.1:8014/venue-frame.html');
  await page.waitForFunction(()=>['ready','error'].includes(window.Farming36?.snapshot().status),null,{timeout:60000});
  const initial=await page.evaluate(()=>Farming36.snapshot());assert.equal(initial.status,'ready',initial.error);assert(initial.removed.length>0);
  const scale=await page.evaluate(()=>{
   const body=Farming36.test.physics.tractor.body,p=Farming36.snapshot();
   return {model:HarvestCore36.vehicleScale,player:PLAYER_SCALE,width:(body.bounds.max.x-body.bounds.min.x)/100,hitch:Math.hypot(p.trailer.x-p.vehicles.tractor.x,p.trailer.z-p.vehicles.tractor.z)};
  });assert.equal(scale.model,scale.player);assert(Math.abs(scale.width-1.55*.4/.6)<.02);assert(Math.abs(scale.hitch-3.18*.4/.6)<.001);
  await page.evaluate(()=>{player.position=[-31.3,.14+PHYSICS.radii[1]+.02,28];player.yaw=-Math.PI/2;Object.assign(state,{radius:4.5,pitch:.15,orbitYaw:.3,firstPerson:false});updateCamera(0,true);});
  await page.waitForTimeout(300);await page.screenshot({path:'../work/farm-player-scale.png'});
  assert.deepEqual(await page.evaluate(()=>['combine','tractor','baler'].map(name=>new Set(Farming36.test.models[name].filter(p=>p.node.name.startsWith('Wheel_')).map(p=>p.node.name)).size)),[4,4,2]);
  console.log('READY',initial.removed.length,'buildings cleared');
  assert.equal(await page.evaluate(()=>{
   const removed=new Set(Farming36.snapshot().removed);
   return renderBatches.some(b=>removed.has(b.name))||colliders.some(c=>removed.has(c.name.replace(/_footprint_collider$/,'')));
  }),false,'Removed buildings must have no visible mesh or collision');
  await page.evaluate(()=>{player.position=[-48,1,0];Farming36.enter();if(Farming36.mounted)throw Error('Remote entry');Farming36.visit();});
  await page.keyboard.press('t');assert(await page.evaluate(()=>Farming36.mounted));
  await page.waitForFunction(()=>characterState.player?.farmArms,null,{timeout:60000});
  async function checkDriver(name){
   const fit=await page.evaluate(()=>{
    const a=characterState.player,F=Farming36,car=F.test.vehicles[F.snapshot().vehicle];poseActor(a,0,true);
    const hip=a.world[a.model.skins[0].joints[0]],correction=[hip[12]-a.bindHip[0],0,hip[14]-a.bindHip[1]],matrix=actorMatrix(a);
    const worldPoint=i=>tp(matrix,...sub(a.world[i].slice(12,15),correction));
    const seat=tp(transform([car.x,.14,car.z],[HarvestCore36.vehicleScale,HarvestCore36.vehicleScale,HarvestCore36.vehicleScale],0,car.yaw+Math.PI),...F.test.cab().seat);
    const hands=a.farmArms.map((arm,i)=>len(sub(worldPoint(arm.palm>=0?arm.palm:arm.hand),a.farmGripTargets[i])));
    return {seatError:len(sub(worldPoint(a.model.skins[0].joints[0]),seat)),hands,model:a.model.id,seat,grips:a.farmGripTargets,shoulders:a.farmArms.map(arm=>worldPoint(arm.upper)),bones:a.model.j.nodes.filter(n=>/spine/i.test(n.name)).map(n=>n.name)};
   });console.log('DRIVER',name,fit);
   await page.evaluate(()=>{state.radius=3;state.orbitYaw=2.4;state.pitch=.08;updateCamera(0,true);__walktest.render();});
   await page.screenshot({path:'../work/farm-driver-'+name+'.png'});
   assert(fit.seatError<.01);assert(fit.hands.every(d=>d<.07),'Hands should grip the steering wheel');
   await page.locator('#farmView36').click();
  }
  await checkDriver('combine');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{const car=Farming36.test.vehicles.tractor;player.position=[car.x,.14+PHYSICS.radii[1],car.z];});
  await page.keyboard.press('t');
  assert.equal(await page.evaluate(()=>Farming36.snapshot().vehicle),'tractor','Tractor entry is available before any harvesting');
  assert(await page.evaluate(()=>Farming36.mounted));
  await page.locator('#farmSwitch36').click();
  assert.equal(await page.evaluate(()=>Farming36.snapshot().vehicle),'combine');
  await page.waitForTimeout(300);await page.screenshot({path:'../work/farm-start.png'});
  await page.evaluate(()=>{state.orbitYaw=1.9;updateCamera(0,true);__walktest.render();});
  await page.screenshot({path:'../work/farm-combine.png'});
  const first=await page.evaluate(()=>{
   const F=Farming36,c=F.test.controls;c.add('w');for(let i=0;i<620;i++){
    F.update(.016);
    if(i===500){updateCamera(0,true);__walktest.render();window.__farmPipeImage=canvas.toDataURL('image/png');}
   }c.clear();
   F.test.physics.combine.stop();F.test.vehicles.combine.speed=0;updateCamera(0,true);__walktest.render();return F.snapshot();
  });console.log('FIRST PASS',first.cut,first.vehicles.combine);assert(first.cut>80,'Real forward movement must cut a crop swath');assert(first.remaining>10);
  await page.screenshot({path:'../work/farm-cut.png'});
  await page.evaluate(()=>Farming36.test.toggleUnload());
  assert.equal(await page.evaluate(()=>Farming36.snapshot().unloading),false,'Cannot unload away from a hopper');
  await page.locator('#farmSwitch36').click();
  const partial=await page.evaluate(()=>{
   const F=Farming36,h=F.test.crop.hay.find(h=>!h.collected);
   F.test.place('tractor',h.x,h.z-1.62,Math.PI);
   F.test.controls.add('w');for(let i=0;i<100;i++)F.update(.016);F.test.controls.clear();
   return F.snapshot();
  });assert(partial.collected>0&&partial.cut<partial.total,'A partially harvested row can be baled');
  await page.locator('#farmSwitch36').click();
  assert.equal(await page.evaluate(()=>Farming36.snapshot().cut),first.cut,'Switching retains harvested crop');
  assert.equal(await page.evaluate(()=>Farming36.snapshot().grain),first.grain,'Switching retains grain in the combine');
  await page.evaluate(()=>Farming36.test.place('tractor',-30,28,Math.PI));
  const pipe=await page.evaluate(()=>window.__farmPipeImage);require('node:fs').writeFileSync('../work/farm-pipe.png',Buffer.from(pipe.split(',')[1],'base64'));
  const harvest=await page.evaluate(()=>{
   const F=Farming36,c=F.test.controls;
   window.__unloadGrain=()=>{
    const old={...F.test.vehicles.combine},h=F.test.hopper(F.test.silos[F.snapshot().delivered>0?1:0]);
    c.clear();F.test.place('combine',h.x+2.244,h.z+.1,0);
    if(F.test.physics.combine.overlaps(h.x+2.244,h.z+.1,0,.14).length)throw Error('Silo parking bay is obstructed');
    F.test.toggleUnload();
    if(!F.snapshot().unloading)throw Error('Valid silo unloading refused');
    for(let j=0;j<1400;j++){
     F.update(.016);
     if(j===100){state.radius=8;state.orbitYaw=1.2;state.pitch=.45;updateCamera(0,true);__walktest.render();window.__farmSiloImage=canvas.toDataURL('image/png');}
    }
    if(F.snapshot().grain!==0)throw Error('Grain failed to unload');
    F.test.place('combine',old.x,old.z,old.yaw);
   };
   // Each row is driven with normal physics; place only on the clear turning headland.
   for(const x of HarvestCore36.rows){
    F.test.place('combine',x,26,Math.PI);c.add('w');
    for(let i=0;i<1000&&F.snapshot().stage==='harvest';i++){
     F.update(.016);
     if(F.snapshot().grain===F.snapshot().capacity){window.__unloadGrain();c.add('w');}
    }
    c.clear();F.test.physics.combine.stop();F.test.vehicles.combine.speed=0;
   }
   if(F.snapshot().grain>0)window.__unloadGrain();
   return {...F.snapshot(),missed:F.test.crop.cells.filter(c=>!c.cut)};
  });console.log('HARVEST',harvest.cut,harvest.total,harvest.stage,harvest.missed);assert.equal(harvest.cut,harvest.total);assert.equal(harvest.stage,'bale');assert(harvest.collected>0);assert.equal(harvest.points,0);
  await page.locator('#farmSwitch36').click();assert.equal(await page.evaluate(()=>Farming36.snapshot().vehicle),'tractor');
  assert.equal(harvest.delivered,harvest.total);
  const siloImage=await page.evaluate(()=>window.__farmSiloImage);require('node:fs').writeFileSync('../work/farm-silos.png',Buffer.from(siloImage.split(',')[1],'base64'));
  await page.evaluate(()=>Farming36.test.place('combine',-29,4,Math.PI));
  await checkDriver('tractor');
  await page.evaluate(()=>{state.orbitYaw=1.5;updateCamera(0,true);__walktest.render();});await page.screenshot({path:'../work/farm-tractor.png'});
  const baled=await page.evaluate(()=>{
   const F=Farming36,c=F.test.controls;
   for(const x of HarvestCore36.rows){
    F.test.place('tractor',HarvestCore36.hayOutlet(x,0,Math.PI).x,28,Math.PI);c.add('w');
    for(let i=0;i<1400&&F.snapshot().stage!=='complete';i++){
     F.update(.016);
     if(!window.__farmGateImage&&F.snapshot().cycle>1.1){
      if(F.snapshot().vehicles.tractor.speed<2)throw Error('Ejection must not stop the moving tractor');
      updateCamera(0,true);__walktest.render();window.__farmGateImage=canvas.toDataURL('image/png');
     }
    }
    c.clear();F.test.physics.tractor.stop();F.test.vehicles.tractor.speed=0;
   }
   for(let i=0;i<2400&&F.snapshot().stage!=='complete';i++)F.update(.016);
   updateCamera(0,true);__walktest.render();return F.snapshot();
  });console.log('BALED',baled);assert.equal(baled.stage,'complete');assert.equal(baled.collected,baled.total);assert.equal(baled.remaining,0);assert.equal(baled.points,200);assert(baled.bales>=10);
  const gate=await page.evaluate(()=>window.__farmGateImage);assert(gate);require('node:fs').writeFileSync('../work/farm-gate.png',Buffer.from(gate.split(',')[1],'base64'));
  await page.screenshot({path:'../work/farm-complete.png'});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.screenshot({path:'../work/farm-mobile.png'});
  const bounds=await page.locator('#farmPanel36').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.y+bounds.height<=844);
  const result=await page.locator('#farmResult36').boundingBox();assert(result.y>bounds.y+bounds.height,'Completion result overlaps top controls');
  await page.evaluate(()=>{Farming36.reset();Farming36.visit();Farming36.enter();});
  await page.screenshot({path:'../work/farm-mobile-driving.png'});
  await page.mouse.move(120,650);await page.mouse.wheel(0,1000);await page.mouse.wheel(0,1000);assert.equal(await page.evaluate(()=>state.radius),20);
  await page.mouse.wheel(0,-1000);await page.mouse.wheel(0,-1000);assert.equal(await page.evaluate(()=>state.radius),3);
  await page.locator('#farmView36').click();assert.equal(await page.evaluate(()=>state.radius),7);
  const turn=await page.evaluate(()=>{
   const F=Farming36;F.test.place('combine',-48,0,Math.PI);F.test.controls.add('w');F.test.controls.add('a');
   for(let i=0;i<360;i++)F.update(.016);
   F.test.controls.clear();return F.snapshot().vehicles.combine;
  });assert(Math.abs(turn.yaw-Math.PI)>2,'Steering must turn the combine');assert(turn.x>-68&&turn.x<-26&&turn.z>-25&&turn.z<35);
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>Farming36.mounted),false);
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>{Farming36.reset();state.overview={camera:[-82,55,61],target:[-40,0,4]};updateCamera(0,true);__walktest.render();});await page.screenshot({path:'../work/farm-field.png'});
  const pixel=await page.evaluate(()=>{__walktest.render();const p=new Uint8Array(64*64*4);gl.readPixels(500,350,64,64,gl.RGBA,gl.UNSIGNED_BYTE,p);return new Set(p).size;});assert(pixel>12,'Scene canvas is blank');
  for(const vehicle of ['combine','tractor']){
   await page.evaluate(vehicle=>{
    const F=Farming36;state.overview=null;state.showStaff=true;F.reset();
    const car=F.test.vehicles[vehicle];player.position=[car.x,.14+PHYSICS.radii[1],car.z];F.enter(vehicle);
    F.test.place(vehicle,-23,38,0);
    const npc={...characterState.player,player:false,position:[-23,.14,38]};
    characterState.actors.push(npc);
    try{F.test.controls.add('w');F.update(.016);}finally{characterState.actors.splice(characterState.actors.indexOf(npc),1);}
    if(F.snapshot().stage!=='failed'||F.snapshot().points!==0)throw Error('Pedestrian collision did not fail '+vehicle);
    const before=F.snapshot();F.test.controls.add('w');for(let i=0;i<30;i++)F.update(.016);
    const after=F.snapshot();if(after.vehicles[vehicle].z!==before.vehicles[vehicle].z||after.cut!==before.cut)throw Error('Failed attempt continued');
    F.exit();F.enter(vehicle);if(F.mounted)throw Error('Failure bypassed by reentering');
   },vehicle);
   assert.match(await page.locator('#farmResultDetail36').textContent(),/You hit a pedestrian/);
   await page.locator('#farmAgain36').click();
   const clean=await page.evaluate(()=>Farming36.snapshot());
   assert.equal(clean.stage,'harvest');for(const key of ['cut','collected','grain','delivered','fill','bales','points'])assert.equal(clean[key],0);
  }
  assert.deepEqual(errors,[]);console.log('PASS: full farming challenge, pedestrian failure for both vehicles, immobilization, reentry lock and restart.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
