const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.route('**/api/manifest',r=>r.fulfill({json:{booths:[]}}));await page.route('**/api/sectors',r=>r.fulfill({json:{sectors:[]}}));
 await page.goto(process.env.VENUE_URL||'http://127.0.0.1:8014/venue-frame.html');
 await page.waitForFunction(()=>['ready','error'].includes(window.Ambulance35?.snapshot().status),null,{timeout:60000});
 assert.equal(await page.evaluate(()=>Ambulance35.snapshot().status),'ready');
 await page.waitForFunction(()=>!window.Farming36||Farming36.snapshot().status==='ready',null,{timeout:60000});
 await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady,null,{timeout:180000});
 await page.evaluate(()=>{
  const a=Ambulance35.snapshot(),lanes=CityLife111.mapLanes(),cars=CityLife111.trafficBodies();
  for(const [prefix,center]of[['front-',a.route[0][1]],['east-',a.route[3][0]],['river-',a.route.at(-1)[1]]])for(const l of lanes.filter(l=>l.id.startsWith(prefix))){
   const width=Math.max(...cars.filter(v=>v.lane===l.id).map(v=>v.width));
   if(Math.abs(l.cross-center)<=width/2+.62+.035)throw Error('No ambulance passing clearance: '+l.id);
  }
  const lane=lanes.find(l=>l.id==='front-east'),bus=cars.find(v=>v.kind==='bus');
  const passing={...bus,p:[a.parked.x,-.1275,lane.cross],yaw:Math.PI/2};
  if(CityLifeCore111.overlap(passing,CityLifeCore111.ambulanceObstacle(a.parked)))throw Error('Parked ambulance blocks a full-size bus');
 });
 const audit=await page.evaluate(()=>{
   const A=Ambulance35,r=A.snapshot().route,bad=[];
   for(let i=0;i<r.length-1;i++)for(let t=0;t<=1;t+=.05){const x=r[i][0]+(r[i+1][0]-r[i][0])*t,z=r[i][1]+(r[i+1][1]-r[i][1])*t;
     const yaw=Math.atan2(r[i+1][0]-r[i][0],r[i+1][1]-r[i][1]);
     if(A.test.blocked(x,z,yaw))bad.push({i,x,z,names:A.test.physics.overlaps(x,z,yaw,A.test.height(x,z))});}
   return bad;
 });if(audit.length)console.log('ROUTE OBSTRUCTIONS',JSON.stringify(audit));assert.deepEqual(audit,[],'route centerline is obstructed');
 await page.evaluate(()=>{Ambulance35.enter();if(Ambulance35.mounted)throw Error('Remote entry');Ambulance35.visit();});
 await page.keyboard.press('t');assert(await page.evaluate(()=>Ambulance35.mounted));
 const initial=await page.evaluate(()=>Ambulance35.snapshot());
 await page.waitForTimeout(900);
 const idle=await page.evaluate(()=>Ambulance35.snapshot());
 assert(Math.hypot(idle.x-initial.x,idle.z-initial.z)<.08,'nearby traffic must not shove the ambulance out of its starting bay');
 assert.equal(idle.health,100,'mission begins without a traffic collision');
 await page.evaluate(()=>{
   const t=Ambulance35.test;
   if(t.nodes.filter(n=>n.name.startsWith('Wheel_')).length!==4)throw Error('Missing wheel pivots');
   if(!t.lampLit(true,0)||t.lampLit(false,0)||t.lampLit(true,250)||!t.lampLit(false,250))throw Error('Red/white lamps failed to alternate');
 });
 await page.waitForTimeout(500);await page.screenshot({path:'../work/ambulance-start.png'});
 await page.setViewportSize({width:390,height:844});
 assert(await page.locator('#controlsIconBtn').isHidden(),'controls circle is replaced during driving');
 assert(await page.locator('#ambulanceMap120').isVisible(),'navigation map is shown during driving');
 const mapBounds=await page.locator('#ambulanceMap120').boundingBox();assert(mapBounds&&mapBounds.x>=0&&mapBounds.y+mapBounds.height<=844);
 await page.getByRole('button',{name:'Show controls and map',exact:true}).click();
 const controlsBounds=await page.locator('#ambulancePanel35').boundingBox();assert(controlsBounds&&controlsBounds.x>=0&&controlsBounds.x+controlsBounds.width<=390&&controlsBounds.y+controlsBounds.height<=844);
 assert(controlsBounds.y+controlsBounds.height<mapBounds.y,'map does not overlap challenge controls');
 await page.screenshot({path:'../work/ambulance-map-mobile.png'});await page.getByRole('button',{name:'Show controls and map',exact:true}).click();await page.setViewportSize({width:1440,height:1000});
 const result=await page.evaluate(()=>{
   const A=Ambulance35,s=A.test.state,c=A.test.controls,r=A.snapshot().route;let elapsed=0,lastNext=s.next,stuck=0;window.driveHits118=[];
   for(let frame=0;frame<3600&&s.phase==='running';frame++){
     // Follow a short look-ahead on the route, including the next corner.
     // Aiming at a distant checkpoint cuts through stopped roadside traffic.
     const previous=s.next?r[s.next-1]:[A.snapshot().parked.x,A.snapshot().parked.z],end=r[s.next],dx=end[0]-previous[0],dz=end[1]-previous[1],len=Math.hypot(dx,dz),t=Math.max(0,Math.min(1,((s.x-previous[0])*dx+(s.z-previous[1])*dz)/(len*len)));
     let target=[previous[0]+dx*t,previous[1]+dz*t],ahead=3.2;
     for(let i=s.next;i<r.length;i++){const point=r[i],d=Math.hypot(point[0]-target[0],point[1]-target[1]);if(d>=ahead){target=[target[0]+(point[0]-target[0])*ahead/d,target[1]+(point[1]-target[1])*ahead/d];break;}target=point;ahead-=d;}
     const angle=Math.atan2(target[0]-s.x,target[1]-s.z),error=Math.atan2(Math.sin(angle-s.yaw),Math.cos(angle-s.yaw));
     c.clear();c.add('w');if(Math.abs(error)>.035)c.add(error>0?'a':'d');
     if(s.next===0&&Math.hypot(s.x-A.snapshot().parked.x,s.z-A.snapshot().parked.z)<.5){
      // A driver waits for traffic already alongside the bay to clear before
      // merging. Keep this waiting time inside the challenge's deadline.
      const bay=A.snapshot().parked,join=r[0],yaw=Math.atan2(join[0]-bay.x,join[1]-bay.z);
      const occupied=Array.from({length:17},(_,i)=>i/16).some(t=>{
       const probe={p:[bay.x+(join[0]-bay.x)*t,-.1275,bay.z+(join[1]-bay.z)*t],yaw,width:1.24,length:2.95};
       return CityLife111.trafficBodies().some(v=>!v.parked&&CityLifeCore111.overlap(probe,v));
      });
      if(occupied){c.clear();c.add(' ');}
     }
     // Brake for corners using the same player controls; never move or teleport the vehicle.
     const d=Math.hypot(end[0]-s.x,end[1]-s.z);
     if((Math.abs(error)>.3||d<6)&&s.speed>2)c.add(' ');
     elapsed+=.016;City106.setTrafficTime(elapsed);CityLife111.update(.016);A.update(.016,s.started+elapsed*1000);
     if(s.impacts>driveHits118.length)driveHits118.push({x:s.x,z:s.z,health:s.health,hit:s.lastHit,traffic:CityLife111.snapshot().vehicleStates.filter(v=>Math.hypot(v.p[0]-s.x,v.p[2]-s.z)<4)});
     if(s.z<-45&&s.z>-55&&s.x>66&&!window.__ambulanceBridgeImage){updateCamera(0,true);__walktest.render();window.__ambulanceBridgeImage=canvas.toDataURL('image/png');}
     if(s.next===lastNext&&Math.abs(s.speed)<.01&&s.next!==0)stuck++;else stuck=0;
     lastNext=s.next;if(stuck>90)break;
   }
   c.clear();return A.snapshot();
 });
 console.log('DRIVE RESULT',result);
 console.log('DRIVE HITS',JSON.stringify(await page.evaluate(()=>driveHits118)));
 const bridgeImage=await page.evaluate(()=>window.__ambulanceBridgeImage);assert(bridgeImage,'bridge midpoint was not visited');
 require('node:fs').writeFileSync('../work/ambulance-bridge.png',Buffer.from(bridgeImage.split(',')[1],'base64'));
 await page.waitForTimeout(200);await page.screenshot({path:'../work/ambulance-finish.png'});
 assert.equal(result.phase,'complete','entire course should be drivable under 60 seconds');
 assert(result.elapsed<60);
 assert(result.health>0,'the dense-traffic course remains survivable');
 assert.equal(result.points,150);
 await page.evaluate(()=>{
   __walktest.render();const pixels=new Uint8Array(64*64*4);gl.readPixels(Math.floor(gl.drawingBufferWidth/2)-32,Math.floor(gl.drawingBufferHeight/2)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   if(new Set(pixels).size<8)throw Error('Blank canvas');
   const t=Ambulance35.test,i=t.nodes.findIndex(n=>n.name==='Wheel_1');
   if(Math.abs(t.worlds[i][5]-Math.cos(t.state.distance/(.4*t.nodes[i].extras.radius)))>.001)throw Error('Wheel did not rotate with travel');
 });
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../work/ambulance-mobile.png'});
 const resultBounds=await page.locator('#ambulanceResult35').boundingBox();assert(resultBounds&&resultBounds.x>=0&&resultBounds.x+resultBounds.width<=390&&resultBounds.y+resultBounds.height<=844);
 await page.evaluate(()=>{const A=Ambulance35;A.reset();A.visit();A.enter();A.update(.016,A.test.state.started+60000);if(A.snapshot().phase!=='timeout')throw Error('Deadline failed');A.reset();if(A.snapshot().elapsed!==0)throw Error('Reset failed');});
 await page.evaluate(()=>{
   const A=Ambulance35,s=A.test.state;A.visit();A.enter();
   A.test.place(-24,-69.6,Math.PI/2);A.update(0,s.started+1000);
   if(s.phase==='complete')throw Error('Finish bypassed route checkpoints');
   A.reset();if(A.test.lampLit(true,0))throw Error('Parked lights still flashing');
 });
 await page.evaluate(()=>{
   const A=Ambulance35,s=A.test.state;
   A.visit();A.enter();
   // Miss the first corner, leave the course, then rejoin beyond that corner.
   A.test.place(82,12,Math.PI);A.update(0,s.started+10000);
   if(!s.warning.includes('Off course'))throw Error('Missing detour warning');
   A.test.place(71,12,Math.PI);A.update(0,s.started+12000);
   if(s.next!==3||s.warning)throw Error('Rejoining did not recover missed turn');
   A.test.place(69.9,-42,Math.PI);A.update(0,s.started+20000);
   if(s.next!==4||s.warning)throw Error('Road bridge approach did not recover');
   A.test.place(69.9,-58,Math.PI);A.update(0,s.started+35000);
   if(s.next!==5||s.warning)throw Error('Road bridge crossing did not recover');
   A.test.place(66,-69.6,-Math.PI/2);A.update(0,s.started+40000);
   A.test.place(50,-69.6,-Math.PI/2);A.update(0,s.started+45000);
   if(s.next!==7||s.warning)throw Error('Far bank did not recover');
   A.test.place(-24,-69.6,Math.PI/2);A.update(0,s.started+50000);
   if(s.phase!=='complete'||s.points!==150||s.warning)throw Error('Detour prevented completion');
   A.reset();
 });
 await page.setViewportSize({width:1440,height:1000});
 assert(await page.locator('#ambulanceMap120').isHidden(),'navigation hides after reset');
 assert(await page.locator('#controlsIconBtn').isVisible(),'controls return after reset');
 await page.evaluate(()=>{state.overview={camera:[-8,28,-52],target:[-24,10,-77]};updateCamera(0,true);__walktest.render();});
 await page.waitForTimeout(300);await page.screenshot({path:'../work/ambulance-hospital.png'});
 assert.deepEqual(errors,[]);console.log('PASS: entry, complete driving route, timer, timeout, reset, mobile layout.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
