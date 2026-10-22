const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),report=JSON.parse(fs.readFileSync(path.join(root,'city106/report.json'))),models=require('./manifest.json'),placements=report.assets130.skyline135.placements;
const bytes=fs.readFileSync(path.join(root,'city106/city.glb')),j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
assert.equal(placements.length,4);
const overlaps=(a,b)=>a.lo[0]<b.hi[0]&&a.hi[0]>b.lo[0]&&a.lo[2]<b.hi[2]&&a.hi[2]>b.lo[2];
for(const p of placements){
 assert.equal(j.nodes.filter(n=>n.extras?.skyline135===p.id).length,1,'one copy of '+p.id);
 assert(report.assets130.retired131.includes(p.replaces));
 assert(!report.buildings.placements.some(b=>b.name===p.replaces));
 assert(report.buildings.placements.every(b=>b.name===p.name||!overlaps(p.bounds,b.bounds)),'neighbor clearance '+p.id);
 assert(j.nodes.find(n=>n.name===p.name).extras.collider107);
}
assert.deepEqual(placements.filter(p=>p.id!=='beveled').map(p=>p.road).sort(),['east','front','west']);
const bevel=placements.find(p=>p.id==='beveled');assert(bevel.bounds.hi[2]<-72&&bevel.bounds.lo[0]>-19.6&&bevel.bounds.hi[0]<-14,'beside hospital on far bank');
const plaza=j.nodes.find(n=>n.name==='Skyline135 chase flush plaza');assert(plaza?.extras.surface115);
assert(j.meshes[plaza.mesh].primitives.every(p=>j.materials[p.material].name==='City106 paving'));
assert(!j.nodes.some(n=>n.extras?.detail109==='shopfronts'&&Math.abs(n.translation[0]-18.0237)<.1&&n.translation[2]>47&&n.translation[2]<57),'retired modern-lot storefronts removed');
console.log('PASS four unique supplied buildings, front/west/east road placement, hospital neighbor, grounded plaza, collision clearance');
if(process.argv.includes('--unit'))process.exit(0);
const{chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(root,'../work/skyline135');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/WebGL|shader|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-skyline135&time=night');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  assert(!(await page.evaluate(()=>CityLighting131.snapshot().isDay)));
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  async function view(name,camera,target){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});
   const image=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),image);assert((await sharp(image).stats()).channels.some(c=>c.stdev>12),'nonblank '+name);return image;
  }
  for(const [time,label]of[[2100,'night'],[900,'day']]){
   await page.evaluate(t=>CityLighting131.test.setTime(t),time);
   for(const p of placements){
    const[x,,z]=p.p,h=p.size[1],d=h*1.35;
    const eye=p.id==='beveled'?[x+11,h*.6,z+d]:p.road==='front'?[32,14,39.8]:p.road==='west'?[-28,11,16]:[69,20,-12];
    await view(p.id+'-'+label,eye,[x,h*.45,z]);
   }
   await view('park-transition-'+label,[-29,1.3,14],[-25,.1,10]);
   await view('entrance-transition-'+label,[-1.5,1.4,38.4],[0,.1,34]);
   await view('riverwalk-transition-'+label,[64.5,1.5,-31],[67,-.02,-36.5]);
   await view('sculpture-transition-'+label,[-21.5,1.25,39.5],[-25.2,.15,34.8]);
   await view('gallery-transition-'+label,[-1.2,1.1,29],[0,.25,22]);
  }
  const collision=await page.evaluate(names=>names.map(name=>({name,new:colliders.filter(c=>c.name===name).length})),placements.map(p=>p.name));
  assert(collision.every(c=>c.new===1));
  // Isolate incident lighting on equal grey floor samples with different elevations.
  const floorSamples=await page.evaluate(()=>{
   const saved=[...renderBatches],sun=state.sunShadows,overview=state.overview,samples=[];
   const geom=(x,y,z)=>{const p=[x-.14,y,z-.14,0,1,0,x+.14,y,z-.14,0,1,0,x+.14,y,z+.14,0,1,0,x-.14,y,z+.14,0,1,0];return uploadBatch(new Float32Array(p),new Uint32Array([0,2,1,0,3,2]),{color:[.35,.35,.35,1],metal:0,rough:1,surfaceType:0});};
   try{
    renderBatches.length=0;state.sunShadows=false;CityLighting131.test.lights(false);CityMaterials129.setEnabled(false);
    for(const t of[900,2100])for(const z of[34.5,34.9,35.1,35.3,35.7]){
     CityLighting131.test.setTime(t);const values=[];
     for(const y of[-.0285,0,.24]){
      renderBatches.length=0;renderBatches.push(geom(0,y,z));state.overview={camera:[0,y+1,z+.01],target:[0,y,z]};updateCamera(0,true);render();
      const pixel=new Uint8Array(4);gl.readPixels(Math.floor(canvas.width/2),Math.floor(canvas.height/2),1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);values.push(Array.from(pixel));
     }samples.push({t,z,values});
    }
   }finally{renderBatches.splice(0,renderBatches.length,...saved);state.sunShadows=sun;state.overview=overview;CityLighting131.test.lights(true);CityMaterials129.setEnabled(true);}
   return samples;
  });
  for(const s of floorSamples)for(let c=0;c<3;c++)assert(Math.max(...s.values.map(v=>v[c]))-Math.min(...s.values.map(v=>v[c]))<=3,'floor elevation has same incident light '+JSON.stringify(s));
  const before=await page.evaluate(()=>{state.overview=null;state.ghost=false;player.position=[18,floorHeightAt(18,38.5)+PHYSICS.radii[1]+.002,38.5];player.yaw=0;state.paused=false;return [...player.position];});
  await page.keyboard.down('w');await page.waitForTimeout(1400);await page.keyboard.up('w');
  const after=await page.evaluate(()=>{state.paused=true;return [...player.position];});assert(Math.hypot(after[0]-before[0],after[2]-before[2])>.005,'walking remains interactive');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>CityLighting131.test.setTime(2100));
  await view('mobile-beveled-night',[-5,12,-55],[-20,8,-77]);
  await view('mobile-front-night',[32,14,39.8],[18,7,50]);
  await page.evaluate(()=>CityLighting131.test.setTime(900));await view('mobile-front-day',[32,14,39.8],[18,7,50]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({placements,collision,floorSamples,status,errors},null,2));console.log('PASS supplied building views, day/night ground transitions, floor-height lighting consistency, collision, desktop/mobile');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
