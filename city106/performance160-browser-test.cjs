const {chromium}=require('playwright'),sharp=require('sharp'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work/performance160');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1720,height:965}}),errors=[],results={};
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261020-performance160&time=day',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.Rivian147?.snapshot().ready&&window.HotelScene146?.ready&&!Loading155.blocked,null,{timeout:300000});
  await page.evaluate(()=>{
   StudentRewards100.cheat();StudentRewards100.close();state.paused=false;
   window.cost160={};window.frames160=[];let last=performance.now();
   requestAnimationFrame(function frame(now){frames160.push(now-last);last=now;requestAnimationFrame(frame);});
   const wrap=(obj,key,name)=>{const old=obj[key];obj[key]=function(...args){const t=performance.now();try{return old.apply(this,args);}finally{const d=performance.now()-t,m=cost160[name]??={ms:0,max:0,calls:0};m.ms+=d;m.max=Math.max(m.max,d);m.calls++;}};};
   for(const [obj,key,name]of [[Rivian147,'update','carUpdate'],[Rivian147,'draw','carDraw'],[Rivian147,'drawLighting','carLighting'],[HotelScene146,'draw','hotelDraw'],[CityMaterials129,'frame','streetEffects']])wrap(obj,key,name);
   window.saved160={car:Rivian147.draw,carLight:Rivian147.drawLighting,hotel:HotelScene146.draw,shell:HotelScene146.drawShell150};
  });
  await page.waitForFunction(()=>Rivian147.snapshot().visible);
  async function sample(name,setup,ms=8000){
   await page.evaluate(setup);await page.waitForTimeout(700);
   await page.evaluate(()=>{frames160=[];cost160={};Performance21.meter.frames=[];});
   await page.waitForTimeout(ms);
   results[name]=await page.evaluate(()=>{
    const sorted=frames160.slice().sort((a,b)=>a-b),report=MCQPerformance21.report();
    return {frames:sorted.length,median:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:Math.max(...sorted),summary:report.summary,cost:cost160,effects:CityMaterials129.snapshot(),position:player.position.slice(),car:Rivian147.snapshot(),gpu:report.gpu};
   });
   assert(results[name].frames>ms/150,'responsive animation: '+name);assert(results[name].max<1500,'no long freeze: '+name);
   console.log(name,JSON.stringify({frames:results[name].frames,median:results[name].median,p95:results[name].p95,max:results[name].max,cost:results[name].cost,summary:results[name].summary}));
  }
  async function shot(name){
   const health=await page.evaluate(()=>{const p=new Uint8Array(64*64*4);gl.readPixels(Math.floor(canvas.width/2)-32,Math.floor(canvas.height/2)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,p);return {lost:gl.isContextLost(),error:gl.getError(),colors:new Set(Array.from({length:4096},(_,i)=>p.slice(i*4,i*4+3).join(','))).size};});
   assert(!health.lost&&health.error===0&&health.colors>12,'healthy nonblank canvas: '+name);
   const png=await page.locator('#canvas').screenshot(),stats=await sharp(png).stats();assert(stats.channels.some(c=>c.stdev>15));fs.writeFileSync(path.join(out,name+'.png'),png);
  }
  await sample('fresh-unlocked',()=>{});
  await shot('front-final');
  if(process.argv.includes('--probe')){
   const batches=await page.evaluate(()=>{
    state.paused=true;const original=drawBatch,instances=drawBuildingInstances,rows=new Map();
    const record=(b,n,t)=>{const key=b.name||b.sharedKey||b.shipmentId||'custom',r=rows.get(key)||{name:key,calls:0,triangles:0,ms:0,instances:0};r.calls++;r.triangles+=b.count/3*n;r.instances+=n;r.ms+=performance.now()-t;rows.set(key,r);};
    drawBatch=function(b,...args){const t=performance.now();try{return original(b,...args);}finally{record(b,1,t);}};
    drawBuildingInstances=function(b,list){const t=performance.now();try{return instances(b,list);}finally{record(b,list.length,t);}};
    try{render();}finally{drawBatch=original;drawBuildingInstances=instances;}
    return [...rows.values()].sort((a,b)=>b.ms-a.ms);
   });
   fs.writeFileSync(path.join(out,'batches.json'),JSON.stringify(batches,null,2));console.log(JSON.stringify(batches.slice(0,30)));return;
  }
  await sample('same-view-without-car-hotel',()=>{Rivian147.draw=()=>{};Rivian147.drawLighting=()=>{};HotelScene146.draw=()=>{};HotelScene146.drawShell150=()=>{};});
  await page.evaluate(()=>{Rivian147.draw=saved160.car;Rivian147.drawLighting=saved160.carLight;HotelScene146.draw=saved160.hotel;HotelScene146.drawShell150=saved160.shell;});
  const start=await page.evaluate(()=>player.position.slice());
  await sample('walking',()=>{keys.add('w');},10000);
  await page.evaluate(()=>keys.clear());
  assert(Math.hypot(results.walking.position[0]-start[0],results.walking.position[2]-start[2])>.3,'walking changes position');
  await shot('walking-final');
  await sample('driving',()=>{Rivian147.test.place(4,37.5,Math.PI/2);player.position=[4,PHYSICS.radii[1]+.015,36.5];if(!Rivian147.enter())throw Error('Could not enter');Rivian147.test.place(12,42.9,Math.PI/2);Rivian147.test.controls.add('w');},22000);
  await page.evaluate(()=>Rivian147.test.controls.clear());await shot('drive-final');
  assert(results.driving.car.mounted);assert(Math.hypot(results.driving.car.x-12,results.driving.car.z-42.9)>1);
  await sample('walk-after-driving',()=>{Rivian147.test.place(4,37.5,Math.PI/2);Rivian147.exit(true);keys.add('w');},8000);await page.evaluate(()=>keys.clear());
  await sample('hotel-final',()=>{Hotel146.visit();state.overview={camera:[-26.7,1.5,48.5],target:[-26.7,1.2,54]};updateCamera(0,true);});
  await shot('hotel-final');
  await page.setViewportSize({width:3442,height:1930});await page.waitForTimeout(1500);await shot('large-hotel-final');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1500);await shot('mobile-hotel-final');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verified.json'),JSON.stringify({results,errors},null,2));
  console.log('PASS fresh unlocked scene, walking, sustained driving, walking afterward, hotel, large/mobile screenshots and canvas pixels');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
