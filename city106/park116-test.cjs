const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');

(async()=>{
 const {createParkPathGeometry,parkPaths,pathTop,paverRepeat}=await import('./district115/park116.mjs');
 const g=createParkPathGeometry(),pos=g.attributes.position.array,nor=g.attributes.normal.array,uv=g.attributes.uv.array,idx=g.index.array,triangles=[];
 for(let i=0;i<idx.length;i+=3){const ids=Array.from(idx.subarray(i,i+3));if(ids.every(v=>nor[v*3+1]>.99))triangles.push(ids.map(v=>[pos[v*3],pos[v*3+2]]));}
 const covers=(t,x,z)=>{const [a,b,c]=t,d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]),u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(z-c[1]))/d,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(z-c[1]))/d;return u>=0&&v>=0&&u+v<=1;};
 for(const [x,z,w,d]of parkPaths)for(let i=0;i<600;i++){
  const xx=x-w/2+w*((i*.61803398875+.037)%1),zz=z-d/2+d*((i*.41421356237+.053)%1);
  assert.equal(triangles.filter(t=>covers(t,xx,zz)).length,1,'exactly one path surface at '+xx+','+zz);
 }
 for(let i=0;i<pos.length/3;i++){
  assert(Math.abs(uv[i*2]-pos[i*3]/paverRepeat)<.00002);
  assert(Math.abs(uv[i*2+1]-pos[i*3+2]/paverRepeat)<.00002);
  if(nor[i*3+1]>.99)assert(Math.abs(pos[i*3+1]-pathTop)<1e-7);
 }
 const bytes=fs.readFileSync(path.join(__dirname,'city.glb')),j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),paths=j.nodes.filter(n=>/District115 park path/.test(n.name));
 assert.equal(paths.length,1,'no old overlapping path boxes remain');assert(paths[0].extras.surface115);
 const m=j.materials.find(m=>m.name==='Park116 staggered stone pavers');assert(m.pbrMetallicRoughness.baseColorTexture&&m.normalTexture);
 console.log('PASS '+(parkPaths.length*600)+' single-surface samples, continuous paver UV scale, collision mesh and embedded textures');
 if(process.argv.includes('--unit'))return;
 const {chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(__dirname,'../../work/park116');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('crash'));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261014-park116');
  await page.waitForFunction(()=>City106.snapshot().ready&&CityLife111.snapshot().peopleReady,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);player.position=[-28.2,.34,26];});
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,view={camera:[-28.2+Math.cos(a)*2.2,i%2?.33:1.1,24+Math.sin(a)*2.2],target:[-28.2,-.021,24]};
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},view);
   const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,'angle-'+i+'.png')});
  }
  const walk=await page.evaluate(()=>{
   state.ghost=false;state.speed=1;player.position=[-28.2,-.021+PHYSICS.radii[1]+.001,26];player.yaw=0;player.grounded=true;player.vy=0;
   for(let i=0;i<720;i++)advancePlayer(1/120,{forward:true});const along=[...player.position];
   player.position=[-29.4,-.021+PHYSICS.radii[1]+.001,24];player.yaw=-Math.PI/2;player.grounded=true;player.vy=0;
   for(let i=0;i<600;i++)advancePlayer(1/120,{forward:true});
   const samples=[[-28.2,24],[-28.2,-5],[-20,-25]].map(([x,z])=>{const h=raycast([x,.3,z],[0,-1,0],.5);return h&&{name:h.object.name,y:h.point[1]};});return {along,across:[...player.position],samples};
  });assert(walk.along[2]<23&&walk.across[0]>-27,'crossing remains walkable in both directions');assert(walk.samples.every(s=>s?.name.includes('park path joined pavers')&&Math.abs(s.y-pathTop)<.001));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{state.overview={camera:[-26,1.1,24],target:[-28.2,-.021,24]};updateCamera(0,true);render();});
  assert((await sharp(await page.locator('#canvas').screenshot()).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,'mobile.png')});
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({walk,status,errors},null,2));console.log('PASS eight viewing angles, low-angle and mobile pixels, crossing traversal and WebGL status',walk);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
