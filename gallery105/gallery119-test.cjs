const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
async function main(){
 const {itDoors119,doorWidth119,floorEdges119}=await import('./gallery119.mjs');
 const html=fs.readFileSync(path.join(__dirname,'../venue-frame.html'),'utf8');
 const glb=zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64'));
 const j=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12))),r=j.extras.gallery105;
 assert(r.version>=119);
 const added=j.nodes.slice(r.counts.nodes),bounds=n=>{const a=j.accessors[j.meshes[n.mesh].primitives[0].attributes.POSITION];return [a.min.map(v=>v*.3),a.max.map(v=>v*.3)];};
 for(const z of [-9.6,6.6]){const n=added.find(n=>n.name==='Gallery105 Gallery boomerang steel contact volume '+z);assert(n);const [lo,hi]=bounds(n);assert(lo[1]<.26&&hi[1]>2.5);assert(lo[0]>-3.81,'pillar clears balcony edge');assert(lo[0]-(-4.935)>1.2,'walk-behind aisle is wider than three characters');}
 for(let z=-30.3;z<=31.5;z+=.02){const e=floorEdges119(z);assert.equal(e[0],-5.1);assert.equal(e.at(-1),5.1);assert(e.every((x,i)=>!i||x>e[i-1]),'bands never overlap');}
 assert.equal(added.filter(n=>/119 seamless terrazzo floor/.test(n.name)).length,10);
 assert.equal(added.filter(n=>/permanently open leaf/.test(n.name)&&!n.extras.walktestCollide).length,4);
 for(const d of itDoors119){assert(d.z-doorWidth119/2>d.old[0]);assert(d.z+doorWidth119/2<d.old[1]);}
 console.log('PASS full-height steel, balcony clearance, four fixed open leaves, ordered floor bands, contained portal edits');
 if(process.argv.includes('--unit'))return;
 const {chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(__dirname,'../../work/gallery119');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('crash'));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-gallery119');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady&&characterState.player,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.ghost=false;state.speed=1;});
  const routes=await page.evaluate(doors=>{
   function walk(x,z,yaw,frames=600){player.position=[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.002,z];player.vy=0;player.grounded=true;player.yaw=yaw;for(let i=0;i<frames;i++)advancePlayer(1/120,{forward:true});return [...player.position];}
   return {doorIn:doors.map(d=>walk(-3.8,d.z,Math.PI/2,600)),doorOut:doors.map(d=>walk(-6.05,d.z,-Math.PI/2,600)),behind:walk(-4.15,25,0,10000),behindReverse:walk(-4.15,-19,Math.PI,10000),sealed:[28.9,29.3,29.8,30.05].map(z=>walk(4.2,z,-Math.PI/2,240)),oldPillars:colliders.filter(o=>/^Gallery_west_column_/.test(o.name)).length,steelHits:[-9.6,6.6].map(z=>walk(-2.2,z,Math.PI/2,240))};
  },itDoors119);
  console.log('ROUTES',routes);
  assert(routes.doorIn.every(p=>p[0]<-6),'both IT entrances walk inward');assert(routes.doorOut.every(p=>p[0]>-3.6),'both IT entrances walk outward');
  assert(routes.behind[2]<-19,'full gallery walk behind pillars');assert(routes.behindReverse[2]>24,'reverse walk behind pillars');
  assert(routes.sealed.every(p=>p[0]<4.9&&p[1]>.58),'closed entrance wall blocks fall-through');assert.equal(routes.oldPillars,0);
  assert(routes.steelHits.every(p=>p[0]>-3.1),'new full-height supports have collision');
  async function view(name,camera,target){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});const shot=await page.locator('#canvas').screenshot();const s=await sharp(shot).stats();assert(s.channels.some(c=>c.stdev>20),'nonblank '+name);await page.screenshot({path:path.join(out,name+'.png')});}
  await view('entry-wall',[1.8,1.1,31.1],[5,1.4,28.8]);
  await view('it-door-a',[-2.3,1,-7.3],[-5.15,.95,-7.3]);
  await view('it-door-b',[-2.3,1,9.25],[-5.15,.95,9.25]);
  await view('pillar-aisle',[-4.2,1.1,20],[-3.4,3,-8]);
  await view('gallery',[2.4,1.2,26],[-1,2,-5]);
  await view('floor',[3,1.5,8],[-1,.24,-5]);
  await view('floor-low',[2.5,.5,12],[-1,.24,-4]);
  const moving=await page.evaluate(()=>{state.overview=null;player.position=[0,.6,22];player.yaw=0;const before=player.position.slice();for(let i=0;i<300;i++)advancePlayer(1/120,{forward:true});updateCamera(0,true);render();return {before,after:[...player.position]};});assert(moving.after[2]<moving.before[2]-1);
  await page.setViewportSize({width:390,height:844});await view('mobile-gallery',[2.4,1.2,14],[-1,2,-5]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({routes,moving,status,errors},null,2));console.log('PASS both doorways, wall containment, behind-pillar routes, motion, desktop/mobile canvas and no GL errors');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
