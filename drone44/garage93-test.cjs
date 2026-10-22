const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/farm65');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=garage93&entry=farm');
  await page.waitForFunction(()=>window.FarmVehicles53?.snapshot().ready,null,{timeout:120000});
  await page.evaluate(()=>{document.getElementById('controlsPopup')?.classList.add('hidden');FarmVehicles53.visit();});
  await page.waitForFunction(()=>Farmstead65.snapshot().ready,null,{timeout:120000});
  const setup=await page.evaluate(()=>{
   window.camera93=updateCamera;updateCamera=()=>{camera=[-24,3.5,41];target=[-30.4,1.2,49];};
   window.tick93=(count=1)=>{for(let i=0;i<count;i++){FarmVehicles53.update(.016);Farmstead65.update(.016);}};
   player.position=[-25,.52,43];tick93(240);return Garage93.snapshot();
  });
  assert.equal(setup.bays.length,2);assert(setup.bays[0].opening>.95+.67+.8);assert(setup.bays.every(b=>b.amount===0&&b.blocked));
  await page.screenshot({path:path.join(out,'garage93-closed.png')});
  // Use throttle and the real vehicle physics to drive through each doorway, not teleport inside.
  const park=async(controller,x)=>page.evaluate(({controller,x})=>{
   const v=window[controller];v.test.place(x,42.8,0);v.visit();v.enter();tick93(125);v.test.held.add('w');
   let n=0;while(v.snapshot().z<49.25&&n++<600)tick93();v.test.held.clear();v.test.physics.stop();const result=v.snapshot();v.exit(true);tick93(50);return {result,doors:Garage93.snapshot().bays};
  },{controller,x});
  const truck=await park('FarmTruck67',-31.55);assert(truck.result.z>=49.25,'pickup parks inside double garage');assert.equal(truck.result.health,100);assert.equal(truck.doors[0].amount,1);
  await page.evaluate(()=>{player.position=[-25,.52,43];tick93(240);});assert.equal(await page.evaluate(()=>Garage93.snapshot().bays[0].amount),0,'door closes after walking away with pickup parked');
  const utv=await park('FarmVehicles53',-28.65);assert(utv.result.z>=49.25,'UTV parks inside attached single garage');assert.equal(utv.result.health,100);
  await page.evaluate(()=>{player.position=[-25,.52,43];tick93(240);});assert(await page.evaluate(()=>Garage93.snapshot().bays.every(b=>b.amount===0)),'both parked vehicles allow doors to close');
  await page.evaluate(()=>{player.position=[-31.55,.52,45.5];tick93(50);});assert.equal(await page.evaluate(()=>Garage93.snapshot().bays[0].amount),1,'walking back opens pickup bay');
  // Walk through the now-open door with the actual character collider.
  const walk=await page.evaluate(()=>{let p=[-30.55,.14+PHYSICS.radii[1]+.002,45.8];for(let i=0;i<80;i++)p=resolveEllipsoid(p,[0,0,.025]).position;return p;});assert(walk[2]>47.4,'open doorway is walkable');
  await page.evaluate(()=>{player.position=[-28.65,.52,45.5];tick93(50);});assert.equal(await page.evaluate(()=>Garage93.snapshot().bays[1].amount),1,'walking back opens UTV bay');
  await page.evaluate(()=>{player.position=[-30.4,.52,46];tick93(50);updateCamera=()=>{camera=[-30.4,2.1,41.8];target=[-30.4,1,49.1];};});await page.waitForTimeout(200);
  await page.screenshot({path:path.join(out,'garage93-parked.png')});
  assert((await sharp(await page.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
  const backOut=await page.evaluate(()=>{FarmTruck67.visit();FarmTruck67.enter();tick93(50);FarmTruck67.test.held.add('s');let n=0;while(FarmTruck67.snapshot().z>44&&n++<700)tick93();FarmTruck67.test.held.clear();const result=FarmTruck67.snapshot();FarmTruck67.exit(true);return result;});assert(backOut.z<44.1,'pickup can reverse back out');assert.equal(backOut.health,100);
  const safety=await page.evaluate(()=>{FarmTruck67.test.place(-31.55,47,0);player.position=[-25,.52,43];tick93(240);return Garage93.snapshot().bays[0];});assert.equal(safety.amount,1,'parked vehicle crossing threshold holds door open');
  await page.evaluate(()=>{FarmTruck67.test.place(-31.55,49.25,0);player.position=[-25,.52,43];tick93(240);});
  // Closed panels block vehicles and pedestrians in their own independent physics worlds.
  const collision=await page.evaluate(()=>{let p=[-31.55,.14+PHYSICS.radii[1]+.002,46.5];for(let i=0;i<50;i++)p=resolveEllipsoid(p,[0,0,.025]).position;return {z:p[2],masks:[FarmTruck67,FarmVehicles53].map(v=>Matter.Composite.allBodies(v.test.physics.engine.world).filter(b=>b.label==='Farm93 double garage door').map(b=>b.collisionFilter.mask))};});assert(collision.z<47);assert(collision.masks.every(a=>a.length===1&&a[0]!==0));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{player.position=[-30.4,.52,46];tick93(50);updateCamera=()=>{camera=[-28,6.8,35];target=[-30.5,1,49];};});await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'garage93-mobile.png')});
  assert((await sharp(await page.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
  await page.evaluate(()=>{updateCamera=camera93;FarmScene63.back();});assert(await page.evaluate(()=>colliders.every(c=>!c.name.startsWith('Farm93'))),'garage colliders stay out of the IT venue');
  assert.deepEqual(errors,[]);console.log('PASS pickup and UTV park with no impacts, walk-away closing, walk-up reopening, reverse exit, threshold safety, independent door collisions, desktop/mobile, city isolation',truck.result,utv.result);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
