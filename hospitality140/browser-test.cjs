const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/hospitality142');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.message);});page.on('console',m=>{if(/ReferenceError|TypeError|GL_INVALID/.test(m.text()))errors.push(m.text());if(m.type()==='warning'||m.type()==='error')console.log('CONSOLE',m.text().slice(0,240));});
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.route('**/hospitality-audit.html',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0}iframe{border:0;width:100vw;height:100vh}#studio{display:none}</style><iframe id="studio" src="/studio-frame.html"></iframe><iframe id="venue" src="/venue-frame.html?time=night&sector=hospitality"></iframe>'}));
 await page.goto('http://127.0.0.1:8014/hospitality-audit.html');
 const venue=await(await page.locator('#venue').elementHandle()).contentFrame(),studio=await(await page.locator('#studio').elementHandle()).contentFrame();
 await venue.waitForFunction(()=>state.ready&&window.Hospitality140?.snapshot().ready&&window.VenueShipping,null,{timeout:180000});
 await venue.evaluate(async()=>{await venueLayoutReady;state.paused=true;Crowd.pause(true);applyStudentMode();});
 console.log('LAYOUT',await venue.evaluate(()=>DISCOVERY_LAYOUT.sectors.map(s=>({industry:s.industry,slots:s.slots.length,scale:s.boothScale}))));
 async function shot(name){await venue.evaluate(()=>render());const img=await page.locator('#venue').screenshot();fs.writeFileSync(path.join(out,name+'.png'),img);const info=await sharp(img).metadata(),scene=await sharp(img).extract({left:Math.round(info.width*.15),top:Math.round(info.height*.27),width:Math.round(info.width*.7),height:Math.round(info.height*.45)}).stats();assert(scene.channels.some(c=>c.stdev>9),'scene pixels are nonblank: '+name);assert.equal(await venue.evaluate(()=>gl.getError()),0);}
 await venue.evaluate(()=>discoveryWalk('Hospitality'));await shot('upper-empty');
 await venue.evaluate(()=>teleport('stairs'));await shot('escalators');
 const architecture=await venue.evaluate(()=>({hospitality:Hospitality140.snapshot(),stairs:colliders.filter(o=>HospitalityCore140.removeOriginal(o.name)).length,wall:colliders.filter(o=>HospitalityCore140.opensWall(o.name,o.lo,o.hi)).map(o=>({name:o.name,lo:o.lo,hi:o.hi})),upperSupport:floorHeightAt(-10,-20,HospitalityCore140.floor),oldOpeningSupport:floorHeightAt(-7.9,-22,HospitalityCore140.floor),entry:resolveEllipsoid([-5.6,3.39,-29.55],[1.6,0,0]).position,route:hubPlanRoute([0,0],HospitalityCore140.sector().entry,HospitalityCore140.floor,.24),guard:(()=>{let p=[-10,3.389,-16];for(let i=0;i<100;i++)p=resolveEllipsoid(p,[0,0,.02]).position;return p;})()}));
 fs.writeFileSync(path.join(out,'architecture.json'),JSON.stringify(architecture,null,2));console.log('ARCHITECTURE',JSON.stringify({...architecture,route:architecture.route&&{length:architecture.route.length,points:architecture.route.points.length}}));
 const rides=await venue.evaluate(()=>HospitalityCore140.escalators.map(e=>{state.overview=null;state.ghost=false;const x=e.direction<0?HospitalityCore140.bottom-.02:HospitalityCore140.top+.02;player.position=HospitalityCore140.point(e,x,HospitalityCore140.height(x)+PHYSICS.radii[1]+.002);player.grounded=true;player.vy=0;const start=[...player.position],samples=[];for(let i=0;i<2250;i++){advancePlayer(1/90,{});if(i%225===0)samples.push([...player.position]);}return {direction:e.direction,start,end:[...player.position],samples};}));
 fs.writeFileSync(path.join(out,'rides.json'),JSON.stringify(rides,null,2));console.log('RIDES',JSON.stringify(rides));
 const connection=await venue.evaluate(()=>{
  player.position=HospitalityCore140.point(HospitalityCore140.escalators[0],HospitalityCore140.top-.10,HospitalityCore140.floor+PHYSICS.radii[1]+.002);player.vy=0;player.grounded=true;state.overview=null;state.ghost=false;
  const goals=[[-14.9,-13.99],[-15.1,-14.8],[-13.2,-16.1]],segments=[];
  for(const goal of goals){let ticks=0;while(Math.hypot(goal[0]-player.position[0],goal[1]-player.position[2])>.04&&ticks++<2400){player.yaw=Math.atan2(player.position[0]-goal[0],player.position[2]-goal[1]);advancePlayer(1/90,{forward:true});}segments.push({goal,ticks,position:[...player.position],remaining:Math.hypot(goal[0]-player.position[0],goal[1]-player.position[2])});}
  return segments;
 });
 console.log('WALK CONNECTION',JSON.stringify(connection));assert(connection.every(s=>s.remaining<.05&&s.position[1]>3.35),'walk off escalator and through the opened wall');
 const animationBefore=await venue.evaluate(()=>{state.paused=false;return Hospitality140.snapshot().phase;});
 await venue.waitForFunction(p=>Hospitality140.snapshot().phase>p+.10,animationBefore);
 await venue.evaluate(()=>{state.paused=true;discoveryWalk('Hospitality');});await shot('walk-connection');
 assert.equal(architecture.stairs,0);assert(architecture.route);assert(Math.abs(architecture.upperSupport-3.027)<.01);
 assert(rides[0].end[0]<-14.18&&rides[0].end[1]>3.35);assert(rides[1].end[0]>-6.92&&rides[1].end[1]<.7);assert(architecture.guard[2]<-15.5,'upper glass guard blocks the floor opening');assert(Math.abs(architecture.oldOpeningSupport-3.027)<.01,'old opening is restored to solid floor');assert.deepEqual(errors,[]);
 if(process.env.QUICK==='1'){console.log('PASS: architecture, walking connection, animated escalators, and both rides.');return;}
 await studio.waitForFunction(()=>window.StudioShipping,null,{timeout:180000});
 await page.evaluate(()=>{document.getElementById('studio').style.display='block';document.getElementById('venue').style.display='none';});
 await studio.locator('[data-industry="Hospitality"]').click();assert.equal(await studio.locator('#industry').inputValue(),'Hospitality');
 await page.screenshot({path:path.join(out,'builder-picker.png')});
 await page.evaluate(()=>{document.getElementById('studio').style.display='none';document.getElementById('venue').style.display='block';});
 await page.evaluate(()=>{let serial=0;window.rpc=(frame,action,payload)=>new Promise((resolve,reject)=>{const id='hospitality-'+(++serial),w=document.getElementById(frame).contentWindow,timer=setTimeout(()=>{window.removeEventListener('message',on);reject(Error('RPC '+action));},120000);function on(e){if(e.source===w&&e.data?.reply===id){clearTimeout(timer);window.removeEventListener('message',on);e.data.error?reject(Error(e.data.error)):resolve(e.data.result);}}window.addEventListener('message',on);w.postMessage({_mcq:true,id,action,payload},'*');});});
 const sectors=await venue.evaluate(()=>DISCOVERY_LAYOUT.sectors.map(s=>s.industry));
 for(const [s,industry]of sectors.entries()){const count=industry==='Hospitality'?25:30;for(let i=0;i<count;i++)await page.evaluate(async({s,industry,i})=>{const packet=await rpc('studio','sample',{id:'hospitality-audit-'+s+'-'+i,name:industry+' Employer '+(i+1),industry,family:(i+s*7)%32,variant:i%12,palette:(i*3)%36,size:i%10===0?'wide':i%5===0?'standard':'compact'});packet.focus=false;await rpc('venue','ship',packet);},{s,industry,i});console.log('LOADED',industry,count);}
 const audit=await venue.evaluate(()=>[...shippedBooths.values()].map(r=>{const a=shipmentApproach(r),floor=sectorFloorHeight(r.industry);return {id:r.id,industry:r.industry,problem:placementProblem(r,r.placement),approach:a?.point,bounds:worldBound(r,r.placement),route:!!a&&!!hubPlanRoute(HUB_SECTORS[r.industry].goal,[a.point[0],a.point[2]],floor,floor)};}));
 fs.writeFileSync(path.join(out,'booths.json'),JSON.stringify(audit,null,2));console.log('PROBLEMS',audit.filter(r=>r.problem||!r.approach||!r.route));
 await venue.evaluate(()=>discoveryOverview('Hospitality'));await shot('25-booths-night');
 await venue.evaluate(()=>walkToShipment('hospitality-audit-5-0'));await shot('booth-night');
 await venue.evaluate(()=>{discoveryWalk('Hospitality');state.overview={target:[-11.5,3.2,-14.2],camera:[-8.8,5.3,-18.1]};updateCamera(0,true);});await shot('nook-night');
 await venue.evaluate(()=>{CityLighting131.test.setTime(900);discoveryOverview('Hospitality');});await shot('25-booths-day');
 await page.setViewportSize({width:1280,height:800});await venue.evaluate(()=>discoveryWalk('Hospitality'));await shot('laptop');
 assert(await venue.evaluate(()=>[...document.querySelectorAll('#sectorShortcuts button')].length===7&&[...document.querySelectorAll('#sectorShortcuts button')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})));
 assert.equal(architecture.stairs,0);assert(architecture.route);assert(Math.abs(architecture.upperSupport-3.027)<.01);
 assert.equal(audit.length,175);assert(audit.every(r=>!r.problem&&r.approach&&r.route));assert(audit.filter(r=>r.industry==='Hospitality').every(r=>Math.abs(r.bounds.lo[1]-3.092)<.01&&r.approach[1]>3.35));assert.deepEqual(errors,[]);
 console.log('PASS: 175 booths, 25 upstairs, floor opening and guards, both escalators, routes, desktop/laptop day/night.');
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,booths:175,errors,completedAt:new Date().toISOString()},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
