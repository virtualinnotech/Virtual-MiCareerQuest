const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/farm65');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=homestead89&entry=farm');await p.waitForFunction(()=>window.FarmVehicles53?.snapshot().ready,null,{timeout:120000});
 await p.evaluate(()=>{document.getElementById('controlsPopup')?.classList.add('hidden');FarmVehicles53.visit();});await p.waitForFunction(()=>Farmstead65.snapshot().ready,null,{timeout:120000});
 const s=await p.evaluate(()=>Homestead89.snapshot());assert.equal(s.twoTracks,false);assert(s.batches<25&&s.triangles<150000);assert.equal(s.driveway[0][0],-4);assert.equal(s.road.x,-3.65);
 await p.evaluate(()=>{window.homesteadCamera=updateCamera;window.farmView89={position:[-5,17,26],target:[-24,1,48]};updateCamera=()=>{camera=[...farmView89.position];target=[...farmView89.target];};});
 for(const [name,position,target]of [['overview',[-6,17,27],[-24,1,46]],['garage',[-22,3.1,41],[-30.5,1.8,50]],['house',[-23,2.6,40],[-17,1.5,49]],['garden',[-13,3.5,52],[-19,.5,55.3]]]){
  await p.evaluate(v=>Object.assign(farmView89,v),{position,target});await p.waitForTimeout(250);await p.screenshot({path:path.join(out,'homestead89-'+name+'.png')});assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
 }
 const samples=[];for(let i=0;i<12;i++){
  await p.evaluate(i=>{const a=i*Math.PI/6;farmView89.position=[-25+Math.sin(a)*2,[.65,1.3,4,8][i%4],42+Math.cos(a)*2];farmView89.target=[-25,.175,42];},i);await p.waitForTimeout(120);
  samples.push(await p.evaluate(()=>{render();const a=new Uint8Array(8*8*4);gl.readPixels(Math.floor(canvas.width/2)-4,Math.floor(canvas.height/2)-4,8,8,gl.RGBA,gl.UNSIGNED_BYTE,a);let green=0;for(let i=0;i<a.length;i+=4)if(a[i+1]>a[i]*1.10)green++;return green;}));
 }assert(samples.every(v=>v===0),'no grass flicker through driveway: '+samples);
 const obstacles=await p.evaluate(()=>{const garage=baselineColliders.filter(c=>c.name.startsWith('Farm65 home garage')).length;const height=raycast([-25,.3,42],[0,-1,0],.4,c=>c.kind==='floor')?.point[1];return {garage,height};});assert(obstacles.garage>=8);assert(Math.abs(obstacles.height-.14)<.0001);
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>Object.assign(farmView89,{position:[-7,15,28],target:[-23,1,48]}));await p.waitForTimeout(250);await p.screenshot({path:path.join(out,'homestead89-mobile.png')});assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
 await p.evaluate(()=>{updateCamera=homesteadCamera;FarmScene63.back();});assert(await p.evaluate(()=>!FarmScene63.active&&colliders.every(c=>!c.name.startsWith('Farm65'))));
 assert.deepEqual(errors,[]);console.log('PASS detailed homestead, connected entrance, garage collision, no paired tracks, 12 stable driveway angles, desktop/mobile, city isolation',s,obstacles);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
