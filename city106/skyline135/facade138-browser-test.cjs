const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'../..'),out=path.resolve(root,'../work/tower138');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {NodeIO}=await import('../../../work/browser/node_modules/@gltf-transform/core/dist/index.js');
 const doc=await new NodeIO().read(path.join(__dirname,'models.glb')),tower=doc.getRoot().listMeshes().find(m=>m.getName()==='Skyline135 skyscraper'),glass=tower.listPrimitives().find(p=>p.getExtras().facade138==='panes');
 const pos=glass.getAttribute('POSITION').getArray(),idx=glass.getIndices().getArray(),points=[];
 for(let i=0;i<idx.length;i+=6){
  const ids=[...new Set(idx.slice(i,i+6))],p=[0,1,2].map(k=>ids.reduce((s,id)=>s+pos[id*3+k]/4,0));
  if(p[2]>1&&Math.abs(p[0])<.8&&p[1]>10.8&&p[1]<11.3)points.push([77.5-p[2],p[1]-.0285,-29.35+p[0]]);
 }
 assert(points.length>=12);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[],checks={};
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/WebGL|shader|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261017-facade138&time=night');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  assert(!(await page.evaluate(()=>CityLighting131.snapshot().isDay)));
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  async function view(name,camera,target){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});
   const image=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),image);
   assert((await sharp(image).stats()).channels.some(c=>c.stdev>12),'nonblank '+name);
  }
  for(const [time,label]of[[2100,'night'],[900,'day']]){
   await page.evaluate(t=>CityLighting131.test.setTime(t),time);
   for(const [name,camera,target]of[
    ['street',[68,1.2,-20],[77.5,12,-29.35]],
    ['front',[67,14,-29.35],[77.5,14,-29.35]],
    ['back',[88,14,-29.35],[77.5,14,-29.35]],
    ['side',[77.5,14,-18],[77.5,14,-29.35]],
    ['river',[67,2,-42],[77.5,14,-29.35]]
   ]){
    const isolated=name==='back'||name==='side';
    if(isolated)await page.evaluate(()=>{window.facadeTestBatches=[...renderBatches];renderBatches.splice(0,renderBatches.length,...renderBatches.filter(b=>b.name==='Skyline135 skyscraper'));});
    try{await view('final-'+(isolated?'isolated-':'')+name+'-'+label,camera,target);}
    finally{if(isolated)await page.evaluate(()=>renderBatches.splice(0,renderBatches.length,...window.facadeTestBatches));}
   }
   checks[label]=await page.evaluate(async points=>{
    const saved=[...renderBatches],shadow=state.sunShadows,samples=[];
    try{
     renderBatches.splice(0,renderBatches.length,...renderBatches.filter(b=>b.name==='Skyline135 skyscraper'));state.sunShadows=false;
     for(let frame=0;frame<32;frame++){
      await new Promise(requestAnimationFrame);
      state.overview={camera:[72,11,-29.75+frame*.025],target:[75.558,11,-29.35]};updateCamera(0,true);render();
      const vp=mm(perspective(canvas.width/canvas.height),lookAt(camera,target));
      samples.push(points.map(p=>{
       const q=[0,1,2,3].map(k=>vp[k]*p[0]+vp[k+4]*p[1]+vp[k+8]*p[2]+vp[k+12]);
       const x=Math.floor((q[0]/q[3]+1)*canvas.width/2),y=Math.floor((q[1]/q[3]+1)*canvas.height/2),pixel=new Uint8Array(4);
       gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);return Array.from(pixel).slice(0,3);
      }));
     }
    }finally{renderBatches.splice(0,renderBatches.length,...saved);state.sunShadows=shadow;}
    const ranges=points.map((_,i)=>[0,1,2].map(k=>Math.max(...samples.map(s=>s[i][k]))-Math.min(...samples.map(s=>s[i][k]))));
    return {frames:samples.length,points:points.length,maxChannelRange:Math.max(...ranges.flat()),ranges};
   },points);
   assert(checks[label].maxChannelRange<=3,'pane illumination remains stable while moving: '+JSON.stringify(checks[label]));
  }
  await page.evaluate(()=>{state.overview=null;state.paused=false;state.ghost=false;player.position=[66.8,floorHeightAt(66.8,-22)+PHYSICS.radii[1]+.002,-22];player.yaw=0;updateCamera(0,true);canvas.focus();});
  const start=await page.evaluate(()=>[...player.position]);await page.keyboard.down('w');await page.waitForTimeout(1200);await page.keyboard.up('w');
  const end=await page.evaluate(()=>{state.paused=true;return [...player.position];});assert(Math.hypot(end[0]-start[0],end[2]-start[2])>.02,'walking remains responsive');
  await page.setViewportSize({width:390,height:844});
  for(const [time,label]of[[2100,'night'],[900,'day']]){
   await page.evaluate(t=>CityLighting131.test.setTime(t),time);
   for(let step=0;step<3;step++)await view('mobile-'+label+'-'+step,[68+step*.1,1.2,-20-step*.2],[77.5,12,-29.35]);
  }
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({checks,walking:{start,end},status,errors},null,2));
  console.log('PASS',JSON.stringify({checks,walkingDistance:Math.hypot(end[0]-start[0],end[2]-start[2]),status,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
