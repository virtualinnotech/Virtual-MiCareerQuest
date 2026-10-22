const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/booths139');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(/WebGL|CONTEXT_LOST|GPU stall|graphics connection/i.test(m.text()))console.log('GRAPHICS',m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.route('**/booth-audit139.html',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0}iframe{border:0;width:100vw;height:100vh}#studio{display:none}</style><iframe id="studio" src="/studio-frame.html"></iframe><iframe id="venue" src="/venue-frame.html?time=night"></iframe>'}));
  await page.goto('http://127.0.0.1:8014/booth-audit139.html');
  const venue=await (await page.locator('#venue').elementHandle()).contentFrame(),studio=await (await page.locator('#studio').elementHandle()).contentFrame();
  await studio.waitForFunction(()=>window.StudioShipping,null,{timeout:180000});
  await venue.waitForFunction(()=>window.City106?.snapshot().ready&&window.MRI42?.snapshot().ready&&window.Robotics37?.snapshot().ready&&window.VenueShipping,null,{timeout:180000});
  await venue.evaluate(async()=>{await venueLayoutReady;state.paused=true;Crowd.pause(true);});
  console.log('ENTRY ROUTES',await venue.evaluate(()=>Object.entries(HUB_SECTORS).map(([industry,s])=>({industry,reachable:!!hubPlanRoute([0,0],s.goal)}))));
  await page.evaluate(()=>{
   let serial=0;
   window.auditRPC=(frame,action,payload)=>new Promise((resolve,reject)=>{
    const id='audit-'+(++serial),w=document.getElementById(frame).contentWindow;
    const timer=setTimeout(()=>{window.removeEventListener('message',onMessage);reject(Error('RPC timeout '+action));},120000);
    function onMessage(e){if(e.source===w&&e.data?.reply===id){clearTimeout(timer);window.removeEventListener('message',onMessage);e.data.error?reject(Error(e.data.error)):resolve(e.data.result);}}
    window.addEventListener('message',onMessage);w.postMessage({_mcq:true,id,action,payload},'*');
   });
  });
  const sectors=await venue.evaluate(()=>DISCOVERY_LAYOUT.sectors.map(s=>s.industry));
  console.log('LAYOUT',await venue.evaluate(()=>DISCOVERY_LAYOUT.sectors.map(s=>({industry:s.industry,slots:s.slots.length,scale:s.boothScale}))));
  for(const [sectorIndex,industry]of sectors.entries()){
   for(let i=0;i<30;i++){
    await page.evaluate(async({industry,sectorIndex,i})=>{
     const packet=await auditRPC('studio','sample',{id:'audit-'+sectorIndex+'-'+i,name:'Preview '+industry+' '+(i+1),industry,family:(i+sectorIndex*7)%32,variant:i%12,palette:(i*3)%36,size:i%10===0?'wide':i%5===0?'standard':'compact'});
     packet.focus=false;await auditRPC('venue','ship',packet);
    },{industry,sectorIndex,i});
   }
   console.log('LOADED',industry,30);
  }
  const audit=await venue.evaluate(async()=>{
   const first=shippedBooths.values().next().value,saved={...first.placement};
   await acceptShipment({id:first.id,model:first.model,industry:first.industry,name:first.name,placement:saved},false);
   const stable=JSON.stringify(shippedBooths.get(first.id).placement)===JSON.stringify(saved);
   const records=[...shippedBooths.values()],problems=[],approaches=[],routes=[];
   for(const r of records){
    const problem=placementProblem(r,r.placement);if(problem)problems.push({name:r.name,problem});
    const a=shipmentApproach(r);if(!a)problems.push({name:r.name,problem:'No walk-up approach'});
    else {approaches.push({id:r.id,point:a.point});routes.push({id:r.id,reachable:!!hubPlanRoute(HUB_SECTORS[r.industry].goal,[a.point[0],a.point[2]])});}
    if(!r.batches.length)problems.push({name:r.name,problem:'No render batches'});
   }
   return {count:records.length,problems,approaches,routes,stable,sectors:DISCOVERY_LAYOUT.sectors.map(s=>({industry:s.industry,scale:s.boothScale,count:records.filter(r=>r.industry===s.industry).length})),gl:gl.getError()};
  });
  fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(audit,null,2));
  console.log('AUDIT',JSON.stringify({count:audit.count,problems:audit.problems,sectors:audit.sectors,gl:audit.gl,stable:audit.stable,unreachable:audit.routes.filter(r=>!r.reachable)}));
  await venue.evaluate(()=>applyStudentMode());
  async function shot(name){await venue.evaluate(()=>render());const img=await page.locator('#venue').screenshot();fs.writeFileSync(path.join(out,name+'.png'),img);const status=await venue.evaluate(()=>({lost:gl.isContextLost(),gl:gl.getError(),report:Performance21.report()}));fs.writeFileSync(path.join(out,name+'-graphics.json'),JSON.stringify(status));console.log('VIEW',name,status.lost,status.report.summary,status.report.geometry);assert(!status.lost,'graphics context '+name);assert.equal(status.gl,0);assert((await sharp(img).stats()).channels.some(c=>c.stdev>12),'nonblank '+name);}
  for(const [i,industry]of sectors.entries()){
   await venue.evaluate(industry=>discoveryOverview(industry),industry);
   assert(await venue.evaluate(industry=>{
    const vp=mm(perspective(canvas.clientWidth/canvas.clientHeight),lookAt(camera,target));
    return [...shippedBooths.values()].filter(r=>r.industry===industry).every(r=>{
     const b=r.cachedBound;return [b.lo[0],b.hi[0]].every(x=>[b.lo[1],b.hi[1]].every(y=>[b.lo[2],b.hi[2]].every(z=>{const q=[0,1,2,3].map(k=>vp[k]*x+vp[k+4]*y+vp[k+8]*z+vp[k+12]);return q[3]>0&&Math.abs(q[0]/q[3])<.95&&Math.abs(q[1]/q[3])<.95;})));
    });
   },industry),'every booth fits the sector view');await shot('sector-'+i);
   await venue.evaluate(id=>{walkToShipment(id);state.paused=true;},'audit-'+i+'-29');await shot('walk-'+i);
  }
  await page.setViewportSize({width:390,height:844});await venue.evaluate(()=>walkToShipment('audit-0-0'));await shot('mobile-booth');
  await venue.evaluate(()=>discoveryOverview('Manufacturing'));await shot('mobile-sector');
  await page.setViewportSize({width:1440,height:960});await venue.evaluate(()=>{CityLighting131.test.setTime(900);discoveryOverview('Agribusiness');});await shot('day-sector');
  await venue.evaluate(()=>{walkToShipment('audit-2-0');state.paused=false;canvas.focus();});
  const before=await venue.evaluate(()=>[...player.position]);await page.keyboard.down('w');await page.waitForTimeout(600);await page.keyboard.up('w');
  const moved=await venue.evaluate(before=>{state.paused=true;return Math.hypot(player.position[0]-before[0],player.position[2]-before[2]);},before);assert(moved>.01,'player can walk with all booths loaded');await shot('day-walk');
  assert.equal(audit.count,150);assert.deepEqual(audit.problems,[]);assert.equal(audit.gl,0);assert(audit.stable);assert(audit.routes.every(r=>r.reachable));assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,booths:audit.count,movement:moved,errors,completedAt:new Date().toISOString()},null,2));
  console.log('PASS 150 actual booth models, all five sectors, walk-up approaches, desktop/mobile screenshots, no WebGL or script errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
