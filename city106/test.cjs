const {chromium}=require('playwright'),assert=require('node:assert/strict'),sharp=require('sharp'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const out=path.resolve(__dirname,'../../work/city106');
const sandbox={window:{},URL,URLSearchParams,location:{search:''},document:{currentScript:{src:'http://localhost/city106/runtime.js'}},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8'),sandbox);
const C=sandbox.window.City106,data=new Float32Array([-4,0,0,0,0,1,4,0,0,0,0,1,4,4,0,0,0,1,-4,4,0,0,0,1]);
C.collectOccluders('Solid wall',data,new Uint32Array([0,1,2,0,2,3]));C.finishOccluders();
assert(C.hiddenBox([-.5,.5,-3],[.5,1.5,-2],[0,1,3]),'fully covered box hidden');
assert(!C.hiddenBox([-.5,4,-3],[.5,8,-2],[0,1,3]),'object extending above wall retained');
assert(!C.hiddenBox([7,.5,-3],[15,1.5,-2],[0,1,3]),'object beside wall retained');
assert(!C.hiddenBox([-.5,.5,1],[.5,1.5,2],[0,1,3]),'object in front retained');
assert(!C.hiddenBox([-.5,.5,-.2],[.5,1.5,.2],[0,1,3]),'object crossing wall retained');
assert(C.hiddenBox([-.5,.5,2],[.5,1.5,3],[0,1,-3]),'reverse-facing wall works');
console.log('PASS conservative wall visibility unit cases');

(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261013-city106');
  await page.waitForFunction(()=>City106.snapshot().ready&&Scooter100?.snapshot().ready&&characterState.player&&Crowd.snapshot().status==='ready',null,{timeout:180000});
  await page.evaluate(()=>{Crowd.pause(true);state.paused=true;});
  const city=await page.evaluate(()=>City106.snapshot());assert.equal(city.error,null);assert.equal(city.trees,109);assert.equal(city.benches,31);assert(city.occluders>0);console.log('DETAIL ASSETS',city);
  const lines=await page.locator('#missionIconBtn .mib-icon svg').innerHTML();console.log('MENU',lines);
  assert(await page.evaluate(()=>document.querySelector('#missionIconBtn .mib-icon svg')?.innerHTML===lucide.createElement(lucide.icons.Menu).innerHTML),'Lucide hamburger icon');
  await page.getByRole('button',{name:'Missions',exact:true}).click();assert(await page.getByRole('button',{name:'Open My Next Step'}).isVisible());await page.keyboard.press('Escape');
  const comparisons=[];
  const views=[{name:'entrance',camera:[-11,4,46],target:[0,5,35],p:[-11,.36,46]},{name:'gallery',camera:[.7,1.6,22],target:[0,5,-10],p:[0,.6,22]},{name:'doorway',camera:[3.5,1.15,.5],target:[15,1,-3],p:[3.5,.6,.5]},{name:'hall',camera:[18,2,4],target:[32,1.5,-9],p:[18,.6,4]},{name:'street',camera:[-26,1.3,38.5],target:[-55,2,38.5],p:[-26,.36,38.5]}];
  for(const view of views){
   const comparison=await page.evaluate(v=>{
    state.paused=true;state.overview=v;player.position=v.p;updateCamera(0,true);
    const now=performance.now.bind(performance),fixed=now();performance.now=()=>fixed;
    const capture=enabled=>{City106.setOcclusion(enabled);render();const bytes=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return {bytes,draws:MCQPerformance21.meter.last.draws,triangles:MCQPerformance21.meter.last.triangles};};
    const before=capture(false),after=capture(true);performance.now=now;let changed=0,max=0;
    for(let i=0;i<before.bytes.length;i+=4){const d=Math.max(...[0,1,2].map(k=>Math.abs(before.bytes[i+k]-after.bytes[i+k])));if(d>3)changed++;max=Math.max(max,d);}
    return {name:v.name,changedPixels:changed,totalPixels:canvas.width*canvas.height,maxDifference:max,drawsBefore:before.draws,drawsAfter:after.draws,trianglesBefore:before.triangles,trianglesAfter:after.triangles};
   },view);comparisons.push(comparison);console.log('VISIBILITY',comparison);
   assert(comparison.changedPixels/comparison.totalPixels<.001,'wall culling must preserve visible pixels in '+view.name);
  }
  fs.writeFileSync(path.join(out,'visibility.json'),JSON.stringify(comparisons,null,2));
  for(const size of[{width:1366,height:768},{width:390,height:844}]){
   await page.setViewportSize(size);await page.evaluate(()=>{state.overview={camera:[-11,1.1,-32],target:[-17,1.5,-38]};updateCamera(0,true);render();});
   const img=await page.locator('#canvas').screenshot();assert((await sharp(img).stats()).channels.some(c=>c.stdev>20));
   await page.screenshot({path:path.join(out,'verified-'+size.width+'.png')});
   await page.getByRole('button',{name:'Missions',exact:true}).click();assert(await page.evaluate(()=>{const r=document.getElementById('missions99').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);
  await page.close();
  // A low-memory/low-core browser profile and CPU throttling are not a Chromebook GPU emulator.
  const low=await browser.newPage({viewport:{width:1366,height:768}}),lowErrors=[];low.on('pageerror',e=>lowErrors.push(e.message));
  await low.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});Object.defineProperty(navigator,'deviceMemory',{get:()=>4});localStorage.setItem('mcqOnboardingDone_v1','1');});
  await low.goto('http://127.0.0.1:8014/venue-frame.html?v=20261013-city106-low');
  await low.waitForFunction(()=>City106.snapshot().ready&&Crowd.snapshot().status==='ready',null,{timeout:180000});
  assert(await low.evaluate(()=>state.sunShadows&&state.quality===1),'low-power profile retains shadows and native resolution');
  const cdp=await low.context().newCDPSession(low);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const stress=await low.evaluate(async()=>{state.overview=null;teleport('gallery');const positions=[];for(let i=0;i<40;i++){advancePlayer(1/90,{forward:true});positions.push([...player.position]);await new Promise(requestAnimationFrame);}const report=MCQPerformance21.report();return {settings:report.settings,summary:report.summary,crowd:report.crowd.count,moved:Math.hypot(...positions[0].map((v,k)=>positions.at(-1)[k]-v)),gpu:report.gpu};});
  assert(stress.moved>.05,'native walking responds under CPU throttling');assert.deepEqual(lowErrors,[]);
  fs.writeFileSync(path.join(out,'low-power-cpu4x.json'),JSON.stringify(stress,null,2));console.log('LOW-POWER SIMULATION',stress);
  await low.close();console.log('PASS city assets, menu, visibility equivalence, desktop/mobile, low-memory profile and CPU-throttled movement');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
