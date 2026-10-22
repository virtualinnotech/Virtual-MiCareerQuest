const {chromium}=require('playwright'),sharp=require('sharp'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../../work/river121');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-river121');
  await page.waitForFunction(()=>window.CityLife111?.snapshot().peopleReady&&window.City106?.snapshot().ready&&window.walkSurfacesReady118,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  console.log('Loaded rebuilt scene');
  async function shot(name,camera,target){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,name+'.png')});}
  await shot('textured-planters',[18,1.7,-33],[20.4,.45,-29.7]);
  await shot('park-junction',[-32,3.4,-28],[-28,-.021,-25]);
  await shot('riverwalk-red-trees',[40,2.5,-36],[25,1,-31.35]);
  await shot('road-bridge',[65,4,-32],[69.9,.2,-43]);
  await shot('flower-stall',[42,1.1,38],[40.7,.7,35.9]);
  const bus=await page.evaluate(()=>{const v=CityLife111.trafficBodies().find(v=>v.kind==='bus'&&v.lane.startsWith('front'));player.position=[v.p[0],floorHeightAt(v.p[0],v.p[2]-1.5)+PHYSICS.radii[1],v.p[2]-1.5];characterState.player.position=player.position;return {p:[...v.p],yaw:v.yaw,length:v.length,width:v.width};});
  await shot('bus-scale',[bus.p[0]+4,1.8,bus.p[2]-3.2],[bus.p[0],.6,bus.p[2]]);
  const fixture=await page.evaluate(()=>{
   const all=new Map(),paths=new Map();for(const p of CityLife111.snapshot().people){camera[0]=p.x;camera[2]=p.z;for(const a of CityLife111.people()){all.set(a.id,a);paths.set(a.path.id,a.path);}}
   return [...paths.values()].map(w=>({id:w.id,axis:w.axis,start:w.start,end:w.end,cross:w.cross,width:w.width,count:[...all.values()].filter(a=>a.path===w).length,obstacles:w.obstacles.map(o=>({name:o.name,lo:[...o.lo],hi:[...o.hi]}))}));
  });
  fs.writeFileSync(path.join(__dirname,'pedestrian121-fixture.json'),JSON.stringify(fixture));
  // Advance the actual runtime, with the stationary player away from routes.
  const crowd=await page.evaluate(frames=>{
   player.position=[0,1,0];const before=CityLife111.snapshot().people;let maxTurn=0,minimumWindow=Infinity,minimumSpan=Infinity,previous=before,windowStart=before;
   const history=[];
   for(let i=0;i<frames;i++){
    CityLife111.update(1/30);const next=CityLife111.snapshot().people;
    for(let k=0;k<next.length;k++)maxTurn=Math.max(maxTurn,Math.abs(Math.atan2(Math.sin(next[k].yaw-previous[k].yaw),Math.cos(next[k].yaw-previous[k].yaw))));
    if(i%900===899){minimumWindow=Math.min(minimumWindow,...next.map((a,k)=>a.walked-windowStart[k].walked));windowStart=next;}
    if(i%30===29){
     history.push(next);if(history.length>60)history.shift();
     if(history.length===60)for(let k=0;k<next.length;k++){
      const x=history.map(p=>p[k].x),z=history.map(p=>p[k].z);
      minimumSpan=Math.min(minimumSpan,Math.max(Math.max(...x)-Math.min(...x),Math.max(...z)-Math.min(...z)));
     }
    }
    previous=next;
   }
   const after=previous;return {frames,maxTurn,minimumWindow,minimumSpan:frames>=1800?minimumSpan:null,total:after.length,minimumTravel:Math.min(...after.map((a,i)=>a.walked-before[i].walked)),travel:after.map((a,i)=>({id:a.id,distance:a.walked-before[i].walked}))};
  },process.argv.includes('--stress')?18000:900);
  console.log('Runtime crowd',crowd.total,crowd.minimumTravel,crowd.maxTurn);assert(crowd.minimumTravel>.2);assert(crowd.maxTurn<=.08001);
  assert(crowd.minimumWindow>1,'every live walker makes progress in each 30-second window');
  if(crowd.minimumSpan!==null){console.log('Runtime pacing audit',crowd.minimumWindow,crowd.minimumSpan);assert(crowd.minimumSpan>1,'no live walker stays in a one-unit area for sixty seconds');}
  await shot('calder-pedestrians',[-24,1.3,40],[-25.5,.4,37.9]);
  const surfaces=await page.evaluate(()=>({corner:[[-28.2,-31.4],[-25,-32.3],[-14,-32.3],[-28,-25],[-30.5,-25]].map(([x,z])=>{const h=raycast([x,.6,z],[0,-1,0],1,o=>!o.boundary);return {x,z,name:h?.object?.name,y:h?.point[1]};}),gl:gl.getError()}));
  assert(surfaces.corner.every(h=>/park path joined pavers/.test(h.name)&&Math.abs(h.y+.021)<.001));
  await page.setViewportSize({width:390,height:844});await shot('mobile-riverwalk',[18,1.7,-33],[20.4,.45,-29.7]);await shot('mobile-park',[-32,3.4,-28],[-28,-.021,-25]);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.equal(surfaces.gl,0);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({bus,crowd,surfaces,errors},null,2));
  console.log('PASS actual build, desktop/mobile canvas pixels, floor continuity, all pedestrians moving, no rendering errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
