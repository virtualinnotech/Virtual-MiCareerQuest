const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/farm65');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=pickup94&challenge=drone');
 await page.waitForFunction(()=>window.FarmVehicles53?.snapshot().ready,null,{timeout:120000});
 await page.evaluate(()=>{document.getElementById('controlsPopup')?.classList.add('hidden');Drone44.enter();});
 await page.waitForFunction(()=>window.Farmstead65?.snapshot().ready,null,{timeout:120000});
 const initial=await page.evaluate(()=>({truck:FarmTruck67.snapshot(),utv:FarmVehicles53.snapshot(),garage:Garage93.snapshot()}));
 assert(Math.abs(initial.truck.x+31.55)<.01&&initial.truck.z>48.5,'pickup starts inside double bay');
 assert(Math.abs(initial.utv.x+28.65)<.01&&initial.utv.z>48.5,'UTV starts inside single bay');
 assert(initial.garage.bays.every(b=>!b.highlight),'no repair glow during drone flight');
 await page.evaluate(()=>{
  window.originalCamera94=updateCamera;
  window.tick94=(n=1)=>{for(let i=0;i<n;i++){FarmVehicles53.update(.016);Farmstead65.update(.016);Drone44.update(.016);}};
  window.land94=()=>{const g=Drone44.test.game;g.launch();const s=DroneCore44.sprinklers[g.state.fault];Object.assign(g.state,{x:s.x,z:s.z,y:5,vx:0,vz:0});g.inspect(g.state.fault);g.report();Object.assign(g.state,{x:-72,z:36,y:.25,vx:0,vz:0});Drone44.land();tick94(5);};
 });
 for(const id of ['truck','utv']){
  if(id==='utv')await page.evaluate(()=>Drone44.restart());
  await page.evaluate(()=>{land94();tick94(200);});
  const landed=await page.evaluate(()=>({garage:Garage93.snapshot(),mission:Drone44.snapshot(),paused:state.paused,truck:FarmTruck67.snapshot(),utv:FarmVehicles53.snapshot()}));
  assert(landed.garage.bays.every(b=>b.highlight&&b.amount===0),'both closed doors guide vehicle choice after landing: '+JSON.stringify(landed));
  assert.equal(await page.evaluate(()=>Drone44.snapshot().vehicle),null);
  if(id==='truck'){
   await page.evaluate(()=>{updateCamera=()=>{camera=[-30.4,2.1,41.8];target=[-30.4,1,49.1];};});
   await page.waitForTimeout(200);await page.screenshot({path:path.join(out,'pickup94-green-doors.png')});
   const pixels=await sharp(await page.locator('canvas').first().screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});let green=0;
   for(let i=0;i<pixels.data.length;i+=pixels.info.channels)if(pixels.data[i+1]>150&&pixels.data[i+1]>pixels.data[i]*1.5&&pixels.data[i+1]>pixels.data[i+2]*1.3)green++;
   assert(green>1500,'visible green guidance, not just a state flag');
   await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.screenshot({path:path.join(out,'pickup94-mobile.png')});assert((await sharp(await page.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
   await page.setViewportSize({width:1440,height:950});
  }
  const depart=await page.evaluate(id=>{
   const v=id==='truck'?FarmTruck67:FarmVehicles53,x=v.snapshot().x;
   player.position=[x,.14+PHYSICS.radii[1]+.002,45.5];tick94(50);
   // Walk up the side of the parked vehicle through the actual open doorway.
   player.position=[x+.57,.14+PHYSICS.radii[1]+.002,45.7];
   for(let i=0;i<102;i++){player.position=resolveEllipsoid(player.position,[0,0,.025]).position;tick94();}
   v.enter();tick94(125);v.test.held.add('w');let n=0;while(v.snapshot().z>43.6&&n++<500)tick94();v.test.held.clear();v.test.physics.stop();
   return {vehicle:v.snapshot(),mission:Drone44.snapshot(),garage:Garage93.snapshot()};
  },id);
  assert(depart.vehicle.mounted,'walk-up boarding works');assert(depart.vehicle.z<43.7,'vehicle drives forward out of garage');assert.equal(depart.vehicle.health,100);assert.equal(depart.mission.vehicle,id);assert(depart.garage.bays.every(b=>!b.highlight),'guidance stops after selection');
  const result=await page.evaluate(id=>{
   const v=id==='truck'?FarmTruck67:FarmVehicles53,p=DroneCore44.pumps[Drone44.snapshot().fault];
   v.test.place(-69,p.z+8,Math.PI);Drone44.update(.016);v.test.held.add('w');
   let n=0;while(v.snapshot().z>p.z+.4&&n++<500)tick94();v.test.held.clear();v.test.physics.stop();
   const before=Drone44.snapshot().phase;Drone44.resetPump();const mountedPhase=Drone44.snapshot().phase;
   v.exit(true);player.position=[p.x+.7,.54,p.z];Drone44.update(.016);Drone44.resetPump();tick94(3);
   return {before,mountedPhase,state:Drone44.snapshot(),garage:Garage93.snapshot()};
  },id);
  assert.equal(result.mountedPhase,result.before,'cannot reset pump while mounted');assert.equal(result.state.phase,'complete',id+' counts toward repair arrival');assert.equal(result.state.points,200);assert(result.garage.bays.every(b=>!b.highlight));
 }
 await page.evaluate(()=>{Drone44.restart();land94();Drone44.exit();Garage93.update(.016);updateCamera=originalCamera94;});
 assert(await page.evaluate(()=>!Drone44.mission&&!FarmTruck67.mounted&&!FarmVehicles53.mounted));
 assert.deepEqual(errors,[]);console.log('PASS garage spawns, repair-only green door pixels, desktop/mobile, walk-up selection, forward garage exit, pickup AND UTV arrival/repair, mounted reset blocked, restart and exit');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
