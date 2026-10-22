const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
async function main(){
 const {exhibitBays122,exhibitDoors122,brickFront122,soffit122}=await import('./gallery122.mjs');
 const html=fs.readFileSync(path.join(__dirname,'../venue-frame.html'),'utf8'),bytes=zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64'));
 const j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),r=j.extras.gallery105,added=j.nodes.slice(r.counts.nodes);
 assert(r.version>=122);assert.equal(r.rightWing122.bays,3);
 const bounds=n=>{const a=j.accessors[j.meshes[n.mesh].primitives[0].attributes.POSITION];return {lo:a.min.map(v=>v*.3),hi:a.max.map(v=>v*.3)};};
 for(const [a,b]of exhibitBays122){
  const prefix='Gallery105 122 bay '+a;
  const base=bounds(added.find(n=>n.name===prefix+' brick front')),upper=bounds(added.find(n=>n.name===prefix+' white inclined face'));
  assert(Math.abs(base.lo[0]-brickFront122)<1e-5);assert(Math.abs(base.lo[1]-.24)<1e-5);assert(Math.abs(base.hi[1]-3.027)<1e-5);
  assert(Math.abs(upper.lo[1]-soffit122)<1e-5);assert(upper.hi[0]-upper.lo[0]>1.4,'true triangular cross section');
  assert(upper.lo[1]-base.hi[1]>1.3,'open balcony seating storey');
  assert(added.some(n=>n.name===prefix+' solid contact'&&n.extras.walktestBarrier));
  assert(added.some(n=>n.name===prefix+' recessed light lens'));
  for(const [c,d]of exhibitDoors122)assert(b<=c||a>=d,'wedge never closes an entrance');
 }
 assert.equal(added.filter(n=>/white inclined face/.test(n.name)).length,3);
 assert(!added.some(n=>/upper rainscreen cassettes 1$/.test(n.name)),'flat right wall skin retired');
 console.log('PASS three tapered brick/white bays, balcony opening, lighting, contacts and preserved door widths');
 if(process.argv.includes('--unit'))return;
 const {chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(__dirname,'../../work/gallery122');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('crash'));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-gallery122');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&characterState.player&&window.walkSurfacesReady118,null,{timeout:180000});
  await page.evaluate(async()=>{await EventFlow22.load();});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.ghost=false;state.speed=1;});
  async function view(name,camera,target){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});
   const shot=await page.locator('#canvas').screenshot(),stats=await sharp(shot).stats();assert(stats.channels.some(c=>c.stdev>20),'nonblank '+name);
   await page.screenshot({path:path.join(out,name+'.png')});
  }
  await view('right-gallery',[-2.4,1.25,28],[4.2,3.8,2]);
  await view('right-gallery-reverse',[-2.5,1.35,-25],[4.3,3.6,13]);
  await view('entrance-recess',[.3,1.2,2],[4.95,1.15,0]);
  await view('balcony-soffit',[.2,2.1,12],[4.4,4.9,7]);
  await view('balcony-seating',[3.95,3.65,14],[4.5,3.5,5]);
  await view('check-in',[-.1,1.35,29],[3.15,.85,24.5]);
  await view('left-preserved',[1.5,1.2,25],[-3.4,3,-9]);
  await view('hospital-clear',[-24,1.2,-68.8],[-24,2,-74]);
  await view('relocated-yellow-tree',[-14,1.2,-35],[-15.5,1.1,-31.35]);
  const routes=await page.evaluate(()=>{
   function walk(x,z,yaw,steps=800,y=null){player.position=[x,(y??floorHeightAt(x,z))+PHYSICS.radii[1]+.002,z];player.vy=0;player.grounded=true;player.yaw=yaw;for(let i=0;i<steps;i++)advancePlayer(1/120,{forward:true});return [...player.position];}
   return {inward:[-18,0,18].map(z=>walk(2.6,z,-Math.PI/2)),outward:[-18,0,18].map(z=>walk(5.8,z,Math.PI/2)),walls:[-9,9,23].map(z=>walk(2.6,z,-Math.PI/2)),gallery:walk(0,28,0,10000),balcony:walk(4.12,14,0,6000,3.027),table:CheckInScene31.layout,staff:EventFlow22.forInteraction().filter(a=>a.kind==='checkInVolunteer').map(a=>a.position),plantingFloors:[-15.5,27.5].map(x=>floorHeightAt(x,-31.35)),oldColumns:colliders.filter(c=>/^Gallery_east_column_/.test(c.name)).length};
  });
  console.log('ROUTES',JSON.stringify(routes));
  assert(routes.inward.every(p=>p[0]>5.5),'all three entries inward');assert(routes.outward.every(p=>p[0]<3),'all three entries outward');
  assert(routes.walls.every(p=>p[0]<3.5),'solid brick faces');assert(routes.gallery[2]<-20,'main aisle');assert(routes.balcony[2]<-10&&routes.balcony[1]>3.3,'balcony aisle');
  assert(Math.abs(routes.table.table.x0-2.47)<.001);assert.equal(routes.table.wallX,3.5);assert.equal(routes.oldColumns,0);
  assert(routes.table.table.x1+.145+.16<routes.table.wallX,'staff fit between table and brick');
  assert.equal(routes.staff.length,6);assert(routes.staff.every(p=>p[0]>3.06&&p[0]<3.1),'all actual staff moved with table');
  assert(routes.plantingFloors.every(y=>Math.abs(y+.021)<.03),'relocated trees have ground support');
  const motion=await page.evaluate(()=>{state.overview=null;player.position=[0,.601,20];player.yaw=0;updateCamera(0,true);render();return player.position.slice();});
  const before=await page.locator('#canvas').screenshot();
  await page.evaluate(()=>{for(let i=0;i<160;i++)advancePlayer(1/120,{forward:true});updateCamera(0,true);render();});
  const after=await page.locator('#canvas').screenshot();assert(!before.equals(after),'canvas changes while walking');
  await page.setViewportSize({width:390,height:844});await view('mobile-right-gallery',[-2.4,1.25,25],[4.0,3.9,12]);
  await view('mobile-entrance',[.3,1.2,1],[4.95,1.2,0]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({routes,motion,status,errors},null,2));
  console.log('PASS six door traversals, brick contact, main/balcony aisles, check-in clearance, moving canvas and desktop/mobile render');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
