const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r.url()));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?entry=farm&v=country63');await p.waitForFunction(()=>window.FarmVehicles53?.snapshot().ready&&window.FarmPeople55?.snapshot().ready&&window.Stables52?.snapshot?.().ready!==false&&window.ChallengeEntry38?.snapshot().ready,null,{timeout:120000});
 await p.evaluate(()=>document.getElementById('controlsPopup').classList.add('hidden'));
 assert(await p.evaluate(()=>!FarmScene63.active));
 const city=await p.evaluate(()=>({batches:baseRenderBatches.length,buildings:baseRenderBatches.filter(b=>b.skyline&&!b.vehicleInstance).length,colliders:colliders.length,removed:Drone44.snapshot().removed.length+Farming36.snapshot().removed.length}));assert.equal(city.removed,0);
 assert(await p.evaluate(()=>colliders.every(c=>FarmScene63.acceptCollider(c))));
 await p.evaluate(()=>ChallengeEntry38.begin('farm'));await p.waitForFunction(()=>FarmScene63.active&&Farming36.mounted);
 assert(await p.evaluate(()=>colliders.every(c=>/^(Farm(?:_|\d)|Stable52 |UTV53 )/.test(c.name))));
 await p.waitForTimeout(300);await p.screenshot({path:'../work/country63-harvest.png'});
 assert.equal(await p.evaluate(()=>state.frameStats.visibleBuildings),0);
 assert.equal(await p.evaluate(()=>{render();return gl.getUniform(program,uniforms.uHall);}),0,'Venue lighting is disabled on all countryside geometry');
 await p.evaluate(()=>{window.hillCamera64=updateCamera;updateCamera=()=>{camera=[-28,1.5,29];target=[90,5,5];};});await p.waitForTimeout(250);await p.screenshot({path:'../work/country64-hills.png'});await p.evaluate(()=>{updateCamera=hillCamera64;});
 const before=await p.evaluate(()=>Farming36.snapshot().vehicles.combine);await p.keyboard.down('w');await p.waitForTimeout(700);await p.keyboard.up('w');const after=await p.evaluate(()=>Farming36.snapshot().vehicles.combine);assert(Math.hypot(before.x-after.x,before.z-after.z)>.05);
 assert(await p.evaluate(()=>{Farming36.test.controls.add('w');for(let i=0;i<650;i++)Farming36.update(.016);Farming36.test.controls.clear();return Farming36.snapshot().cut>20;}),'Driving through wheat harvests it in the separate farm');
 await p.evaluate(()=>{Farming36.exit(true);Farming36.visit('tractor');Farming36.enter('tractor');});assert(await p.evaluate(()=>FarmScene63.active&&Farming36.mounted&&Farming36.snapshot().vehicle==='tractor'&&Farming36.snapshot().cut>20));
 await p.locator('#farmReturn63').click();await p.waitForFunction(()=>!FarmScene63.active&&!Farming36.mounted);
 assert.equal(await p.evaluate(()=>baseRenderBatches.length),city.batches);assert(await p.evaluate(()=>colliders.every(c=>FarmScene63.acceptCollider(c))));
 assert.equal(await p.evaluate(()=>{render();return gl.getUniform(program,uniforms.uHall);}),1,'Venue lighting returns with the city');
 await p.evaluate(()=>{window.camera63=updateCamera;player.position=[-72,PHYSICS.radii[1],40];updateCamera=()=>{camera=[-74,42,64];target=[-67,0,5];};});await p.waitForTimeout(300);await p.screenshot({path:'../work/country63-city-restored.png'});assert((await p.evaluate(()=>state.frameStats.visibleBuildings))>0);
 await p.evaluate(()=>{updateCamera=camera63;Drone44.visit();Drone44.enter();});await p.getByRole('button',{name:'Launch drone',exact:true}).click();assert(await p.evaluate(()=>FarmScene63.active));await p.waitForTimeout(300);await p.screenshot({path:'../work/country63-drone.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:'../work/country63-mobile.png'});
 assert(await p.evaluate(()=>{render();const px=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,px);const c=new Set();for(let i=0;i<px.length;i+=64)c.add(px.slice(i,i+3).join());return c.size>100;}));
 await p.locator('#farmReturn63').click();assert(await p.evaluate(()=>!FarmScene63.active&&!Drone44.mission));
 const downloads=requests.filter(u=>/\.(glb|ply|fbx)(?:\?|$)/i.test(u));const count=downloads.length;
 for(let i=0;i<2;i++){await p.evaluate(()=>FarmVehicles53.visit());await p.waitForFunction(()=>FarmScene63.active);await p.locator('#farmReturn63').click();await p.waitForFunction(()=>!FarmScene63.active);}
 assert.equal(requests.filter(u=>/\.(glb|ply|fbx)(?:\?|$)/i.test(u)).length,count,'Travel reuses loaded models');assert.deepEqual(errors,[]);console.log('PASS city restored, exclusive render/collisions, crop entry/driving/return, drone entry/return, mobile pixels, no model redownloads',city);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
