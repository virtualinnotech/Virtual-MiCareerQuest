const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work/performance160');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1720,height:965}}),errors=[],results={errors};
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=performance160&time=day',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HotelScene146?.ready&&!Loading155.blocked,null,{timeout:300000});
  await page.evaluate(()=>{
   window.saved160={hotel:HotelScene146.draw,shell:HotelScene146.drawShell150,crowd:Crowd.update,characters:AnimatedCharacters.update};
   window.measures160={};
   const wrap=(obj,key,name)=>{const old=obj[key];obj[key]=function(...args){const t=performance.now();try{return old.apply(this,args);}finally{const m=measures160[name]??={ms:0,calls:0,max:0},d=performance.now()-t;m.ms+=d;m.calls++;m.max=Math.max(m.max,d);}};};
   for(const [obj,key,name]of [[HotelScene146,'draw','hotel'],[HotelScene146,'update','hotelUpdate'],[CityMaterials129,'frame','streetEffects'],[CityLife111,'update','cityUpdate'],[CityLife111,'present','trafficPose'],[Crowd,'update','indoorCrowd'],[AnimatedCharacters,'update','characters'],[StreetProps128,'frame','props']])wrap(obj,key,name);
   saved160.hotel=HotelScene146.draw;saved160.crowd=Crowd.update;saved160.characters=AnimatedCharacters.update;
   window.frameTimes160=[];let last=performance.now();const frame=now=>{frameTimes160.push(now-last);last=now;requestAnimationFrame(frame);};requestAnimationFrame(frame);
   window.place160=(p,eye,look)=>{player.position=p;player.velocity=[0,0,0];camera=eye;target=look;state.paused=false;updateCamera=()=>{};};
  });
  const client=await page.context().newCDPSession(page);await client.send('Profiler.enable');
  async function sample(name,setup){
   await page.evaluate(setup);await page.waitForTimeout(1500);
   await page.evaluate(()=>{measures160={};frameTimes160=[];Performance21.meter.frames=[];});
   await client.send('Profiler.start');await page.waitForTimeout(7000);const {profile}=await client.send('Profiler.stop');
   const data=await page.evaluate(()=>({measures:measures160,frames:frameTimes160,report:MCQPerformance21.report(),effects:CityMaterials129.snapshot(),memory:performance.memory&&{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize},size:[canvas.width,canvas.height]}));
   const counts=new Map();for(const id of profile.samples||[])counts.set(id,(counts.get(id)||0)+1);
   data.hot=profile.nodes.map(n=>({name:n.callFrame.functionName,url:n.callFrame.url.split('/').slice(-2).join('/'),line:n.callFrame.lineNumber+1,samples:counts.get(n.id)||0})).sort((a,b)=>b.samples-a.samples).slice(0,25);
   const sorted=data.frames.slice().sort((a,b)=>a-b);data.timing={frames:sorted.length,median:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:Math.max(...sorted)};
   results[name]=data;console.log(name,JSON.stringify({timing:data.timing,summary:data.report.summary,measures:data.measures,hot:data.hot.slice(0,12),gpu:data.report.gpu,size:data.size,memory:data.memory}));
   fs.writeFileSync(path.join(out,name+'-profile.json'),JSON.stringify(profile));
   if(name==='entrance'||name==='hotel'||name==='lobby')await page.screenshot({path:path.join(out,name+'.png')});
  }
  await sample('entrance',()=>place160([0,.45,38.4],[0,1.8,40],[0,1,28]));
  await sample('entrance-no-hotel',()=>{HotelScene146.draw=()=>{};HotelScene146.drawShell150=()=>{};});
  await sample('entrance-no-reflections',()=>{HotelScene146.draw=saved160.hotel;HotelScene146.drawShell150=saved160.shell;CityMaterials129.configure({reflections:false});});
  await sample('entrance-no-indoor-updates',()=>{Crowd.update=()=>{};AnimatedCharacters.update=()=>{};});
  await sample('hotel',()=>{Crowd.update=saved160.crowd;AnimatedCharacters.update=saved160.characters;CityMaterials129.configure();place160([-26.7,.45,45.5],[-26.7,1.55,44.5],[-26.7,1.2,50]);});
  await sample('hotel-no-hotel',()=>{HotelScene146.draw=()=>{};HotelScene146.drawShell150=()=>{};});
  await sample('hotel-no-reflections',()=>{HotelScene146.draw=saved160.hotel;HotelScene146.drawShell150=saved160.shell;CityMaterials129.configure({reflections:false});});
  await sample('lobby',()=>{CityMaterials129.configure();place160([-26.7,.4,49.2],[-26.7,1.5,48.5],[-26.7,1.2,54]);});
  await sample('lobby-no-hotel',()=>{HotelScene146.draw=()=>{};HotelScene146.drawShell150=()=>{};});
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(results,null,2));
  if(errors.length)throw Error(errors.join('\n'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
