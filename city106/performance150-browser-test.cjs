const {chromium}=require('playwright'),sharp=require('sharp'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work/performance150');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],results={};
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(180000);
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261019-performance150&time=day&challenge=hotel');
 await page.waitForFunction(()=>window.Hotel146?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady);
 assert(await page.evaluate(()=>City106.batches.filter(b=>b.detailLOD150).length>300),'background detail levels loaded');
 await page.evaluate(()=>{applyStudentMode();state.paused=true;Crowd.pause(false);});
 async function capture(name){
  const gpu=await page.evaluate(()=>{const pixels=new Uint8Array(64*64*4);gl.readPixels(Math.floor(canvas.width/2)-32,Math.floor(canvas.height/2)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return {lost:gl.isContextLost(),error:gl.getError(),colors:new Set(Array.from({length:4096},(_,i)=>pixels.slice(i*4,i*4+3).join(','))).size};});
  assert(!gpu.lost&&gpu.error===0,'healthy graphics context: '+name);assert(gpu.colors>12,'nonblank framebuffer: '+name);
  const pixels=await page.locator('#canvas').screenshot();const stats=await sharp(pixels).stats();assert(stats.channels.some(c=>c.stdev>15),'nonblank '+name);fs.writeFileSync(path.join(out,name+'.png'),pixels);
 }
 async function measure(name){
  await page.evaluate(()=>{CityLighting131.test.setTime(450);CityLighting131.test.resume();MCQPerformance21.meter.frames=[];MCQPerformance21.meter.frameAt=0;state.paused=false;});await page.waitForTimeout(7000);
  results[name]=await page.evaluate(()=>{state.paused=true;const f=MCQPerformance21.meter.frames.slice(10),avg=k=>f.reduce((s,r)=>s+r[k],0)/f.length;return {frames:f.length,frameMs:avg('interval'),renderMs:avg('renderCPU'),triangles:avg('triangles'),size:[canvas.width,canvas.height],materials:CityMaterials129.snapshot()};});
  console.log(name,JSON.stringify(results[name]));await capture(name);
 }
 await page.evaluate(()=>{player.position=[-26,.4,38.5];state.overview={camera:[-26,1.3,38.5],target:[-55,2,38.5]};updateCamera(0,true);});
 await measure('street-final');assert(results['street-final'].materials.reflectionSize[0]<=960);
 await page.evaluate(()=>{Hotel146.visit();state.paused=false;Hotel146.enter();});
 await measure('lobby-final');
 const indoor=await page.evaluate(async()=>{const before=CityMaterials129.snapshot();for(let i=0;i<3;i++){await new Promise(requestAnimationFrame);render();}const after=CityMaterials129.snapshot();return {before,after,position:player.position};});
 assert.equal(indoor.before.frames,indoor.after.frames,'no outdoor moving-shadow pass inside lobby');
 assert.equal(indoor.before.reflectionFrames,indoor.after.reflectionFrames,'no puddle capture inside lobby');
 const disabled=await page.evaluate(async()=>{state.sunShadows=false;const before=sunSlot132;CityLighting131.test.setTime(1000);await new Promise(requestAnimationFrame);render();const after=sunSlot132;state.sunShadows=true;await new Promise(requestAnimationFrame);render();return {before,after};});assert.equal(disabled.before,disabled.after);
 await page.setViewportSize({width:3442,height:1930});await page.evaluate(()=>{render();});await capture('large-lobby');
 const large=await page.evaluate(()=>({w:canvas.width,h:canvas.height,css:[canvas.clientWidth,canvas.clientHeight]}));assert(large.w*large.h<=2400000);results.large=large;
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{render();});await capture('mobile-lobby');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const status=await page.evaluate(()=>({lost:gl.isContextLost(),error:gl.getError(),hotel:Hotel146.snapshot().error}));assert.deepEqual(status,{lost:false,error:0,hotel:null});assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'final.json'),JSON.stringify({results,indoor,disabled,status,errors},null,2));
 console.log('PASS live street/lobby, indoor pass exclusion, shadow toggle, large/mobile canvas pixels and no runtime/WebGL errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
