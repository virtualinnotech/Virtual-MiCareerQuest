const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const report=require('./report.json'),out=path.resolve(__dirname,'../../work/city106');
assert.equal(report.version,113);
assert(report.bytes<8_500_000,'complete city asset under 8.5 MB');
assert(report.uniqueTriangles<40_000,'shared geometry remains below 40k triangles including autumn trees and sculpture');
for(const key of['covers','drains','treeGrates','bins','hydrants','bollards','cycleRacks','shopfronts'])assert(report.details.counts[key]>0,key);
for(const p of report.details.placements){
 assert(p.p.every(Number.isFinite));
 assert(!(p.p[0]>-27&&p.p[0]<65&&p.p[2]>-30&&p.p[2]<34),'new detail outside exhibit halls');
 assert(!(Math.abs(p.p[0])<2&&p.p[2]>34&&p.p[2]<40),'entrance clear');
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[],warnings=[],missing=[];
  page.on('pageerror',e=>{errors.push(e.stack);console.log('PAGE ERROR',e.stack);});
  page.on('console',m=>{if(m.text().includes('GL_INVALID')||m.type()==='error'&&!m.text().startsWith('Failed to load resource:'))warnings.push(m.text());});
  // The static preview intentionally lacks the optional shipping API and favicon.
  page.on('response',r=>{if(r.status()>=400&&!/^\/(?:api\/(?:sectors|manifest)|favicon\.ico)$/.test(new URL(r.url()).pathname))missing.push(r.url());});
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261013-atmosphere109');
  await page.waitForFunction(()=>City106.snapshot().ready&&characterState.player&&Crowd.snapshot().status==='ready',null,{timeout:180000});
  await page.waitForTimeout(7000);
  await page.waitForFunction(()=>PCChallenge66.snapshot().ready,null,{timeout:30000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  const live=await page.evaluate(()=>({stats:City106.snapshot(),glError:gl.getError(),normalSurfaces:renderBatches.filter(b=>b.normalTexture).length,detailBatches:City106.batches.filter(b=>b.name.startsWith('City109')).length}));
  console.log('LIVE ATMOSPHERE',live);assert(live.stats.sky);assert.equal(live.stats.normalMaps,10);assert(live.normalSurfaces>30);assert(live.detailBatches>500);assert(live.stats.uniquePropBatches<=82);assert.equal(live.glError,0);
  const views={
   city:{camera:[-26,1.3,38.5],target:[-55,2,38.5]},
   river:{camera:[-11,1.1,-32],target:[-17,1.5,-38]},
   sunset:{camera:[-11,6,-32],target:[-83,54,-80]},
   pavement:{camera:[-23,.75,38.6],target:[-23,-.05,39.6]},
   hardware:{camera:[21.7,.6,39.8],target:[21,.23,39.1]},
   skyline:{camera:[-18,18,60],target:[-40,9,28]}
  };
  for(const [name,v]of Object.entries(views)){
   await page.evaluate(v=>{player.position=[v.camera[0],.35,v.camera[2]];state.overview=v;updateCamera(0,true);render();},v);
   const shot=await page.locator('#canvas').screenshot(),stats=await sharp(shot).stats();
   assert(stats.channels.some(c=>c.stdev>20),'nonblank '+name);await page.screenshot({path:path.join(out,'atmosphere109-'+name+'.png')});
  }
  const motion=await page.evaluate(v=>{
   state.overview=v;updateCamera(0,true);City106.setTrafficTime(10);const now=performance.now.bind(performance),t=now();
   const capture=time=>{performance.now=()=>time;render();const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
   const a=capture(t),b=capture(t+6000);performance.now=now;let changed=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>12)changed++;return changed;
  },views.river);assert(motion>30,'river reflections animate');
  await page.setViewportSize({width:390,height:844});await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},views.city);
  assert((await sharp(await page.locator('#canvas').screenshot()).stats()).channels.some(c=>c.stdev>20));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile fits');await page.screenshot({path:path.join(out,'atmosphere109-mobile.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(missing,[]);console.log('PASS sky, normal maps, detail placements, shared budgets, animated water, desktop/mobile pixels and WebGL errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
