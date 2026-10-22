const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const {chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/motion120');fs.mkdirSync(out,{recursive:true});
const glb=fs.readFileSync(path.join(__dirname,'city.glb')),len=glb.readUInt32LE(12),j=JSON.parse(glb.subarray(20,20+len)),bin=glb.subarray(28+len);
const road=j.nodes.find(n=>n.name.includes('far bank continuous road')),p=j.meshes[road.mesh].primitives[0];
const read=(id,n)=>{const a=j.accessors[id],v=j.bufferViews[a.bufferView],start=(v.byteOffset||0)+(a.byteOffset||0);return Array.from({length:a.count},(_,i)=>Array.from({length:n},(_,k)=>bin.readFloatLE(start+i*(v.byteStride||n*4)+k*4)));};
const positions=read(p.attributes.POSITION,3),uv=read(p.attributes.TEXCOORD_0,2),normals=read(p.attributes.NORMAL,3);
const top=positions.map((v,i)=>({v,uv:uv[i],n:normals[i]})).filter(a=>a.n[1]>.9);
assert(top.length>=4);for(const a of top){assert(Math.abs(a.uv[0]-a.v[0]*.32)<.0001);assert(Math.abs(a.uv[1]-a.v[2]*.32)<.0001);}
console.log('PASS far-bank UV scale matches world-space asphalt');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-motion120');
  await page.waitForFunction(()=>window.CityLife111?.snapshot().peopleReady&&window.City106?.snapshot().ready&&window.Ambulance35?.snapshot().status==='ready',null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  async function shot(name,camera,target){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,name+'.png')});}
  await shot('far-bank-road',[-15,.72,-72.5],[-10,-.1,-68]);
  await shot('continuous-pillars',[1.8,1,25],[-3.4,5,-9]);
  await shot('roof-return',[-4.25,5.2,-28],[-3.8,7.5,-30]);
  await shot('pedestrians',[-28.2,.95,3],[-28.2,.3,-4]);
  const crowd=await page.evaluate(()=>{const before=CityLife111.snapshot().people;let max=0;for(let i=0;i<360;i++){const a=CityLife111.snapshot().people;CityLife111.update(1/60);const b=CityLife111.snapshot().people;for(let k=0;k<a.length;k++)max=Math.max(max,Math.abs(Math.atan2(Math.sin(b[k].yaw-a[k].yaw),Math.cos(b[k].yaw-a[k].yaw))));}const after=CityLife111.snapshot().people;return {maxTurn:max,moved:after.filter((a,i)=>a.walked-before[i].walked>.2).length,total:after.length};});
  assert(crowd.maxTurn<=.04001,'runtime facing never snaps');assert(crowd.moved>crowd.total*.5,'most outdoor walkers make progress');
  await page.evaluate(()=>{state.paused=false;state.overview=null;Ambulance35.visit();Ambulance35.enter();});
  await page.waitForFunction(()=>document.querySelector('#ambulanceMap120')?.clientWidth>0);
  assert(await page.locator('#controlsIconBtn').isHidden());
  const first=await page.locator('#ambulanceMap120').screenshot();
  await page.screenshot({path:path.join(out,'ambulance-map-desktop.png')});
  await page.evaluate(()=>{Ambulance35.test.place(69.9,-48,Math.PI);Ambulance35.update(0,Ambulance35.test.state.started+1000);updateCamera(0,true);render();});
  await page.waitForTimeout(100);const second=await page.locator('#ambulanceMap120').screenshot();assert(!first.equals(second),'map follows ambulance location and heading');
  const stats=await sharp(second).stats();assert(stats.channels.some(c=>c.stdev>40),'minimap has visible route and terrain');
  await page.screenshot({path:path.join(out,'ambulance-map-bridge.png')});
  await page.setViewportSize({width:768,height:900});await page.waitForTimeout(100);
  const tablet=await page.locator('#ambulanceMap120').boundingBox();assert(tablet.width===164&&tablet.y+tablet.height<=820,'tablet map clears bottom navigation');
  await page.screenshot({path:path.join(out,'ambulance-map-tablet.png')});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.screenshot({path:path.join(out,'ambulance-map-mobile.png')});
  const bounds=await page.locator('#ambulanceMap120').boundingBox();assert(bounds.x>=0&&bounds.y+ bounds.height<844);
  await page.evaluate(()=>{Ambulance35.exit();Ambulance35.reset();});await page.waitForTimeout(100);
  assert(await page.locator('#ambulanceMap120').isHidden());assert(await page.locator('#controlsIconBtn').isVisible());
  await shot('mobile-pillars',[1.8,1,20],[-3.4,4.5,-9]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({crowd,tablet,bounds,status,errors},null,2));console.log('PASS road/pillar renders, bounded runtime crowd turns, live heading-up route map, mobile/tablet layout and control restoration',{crowd,status});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
