const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),report=JSON.parse(fs.readFileSync(path.join(root,'city106/report.json'))),interior=report.assets130.interior;
const bytes=fs.readFileSync(path.join(root,'city106/city.glb')),j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
const bounds=n=>{
 const ps=j.meshes[n.mesh].primitives.map(p=>j.accessors[p.attributes.POSITION]);
 return {lo:[0,1,2].map(k=>Math.min(...ps.map(a=>a.min[k]))),hi:[0,1,2].map(k=>Math.max(...ps.map(a=>a.max[k])))};
};
assert.equal(interior.fixtures133.length,2);
assert.equal(j.nodes.filter(n=>n.extras?.fixture133==='bottle-fountain').length,1);
assert.equal(j.nodes.filter(n=>n.extras?.fixture133==='fire-extinguisher').length,3);
const doors=bounds(j.nodes.find(n=>n.name==='DeVos130 restroom entrances'));
assert(doors.hi[1]-doors.lo[1]<.92,'restroom assembly fits human scale');
assert(doors.hi[2]-doors.lo[2]<1,'pair of standard-width restroom doors');
assert.equal(interior.boxOffice133.windows.length,6);
assert.equal(report.lighting131.lights.filter(l=>l.alwaysOn).length,6);
assert(interior.boxOffice133.queueClearWidth>.32+.15,'queue wider than player capsule');
assert.equal(interior.drapes,4);assert.equal(interior.hallLetters,3);assert.equal(interior.wasteStations,6);
const busMesh=j.meshes.find(m=>m.name==='school-bus'),busMaterials=busMesh.primitives.map(p=>j.materials[p.material]);
assert(busMesh.extras.triangles>150000,'thin school bus details retained');
assert(busMaterials.some(m=>m.extras?.vehicleSurface114===30),'restrained school bus paint finish');
assert(busMaterials.some(m=>m.extras?.vehicleSurface114===0&&m.pbrMetallicRoughness.roughnessFactor>.7),'matte trim distinct from paint');
assert.equal(report.assets130.riverCorner133.fences.length,4);
console.log('PASS human-scale doors, supplied textured fixtures, six ticket windows, six permanent downlights and queue clearance');
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(__dirname,'../../../work/gallery133');fs.mkdirSync(out,{recursive:true});
async function difference(a,b){const x=await sharp(a).removeAlpha().raw().toBuffer(),y=await sharp(b).removeAlpha().raw().toBuffer();let n=0;for(let i=0;i<x.length;i+=3)if(Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2])>12)n++;return n;}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/WebGL|shader|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-gallery133&time=night');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  assert.equal(await page.evaluate(()=>CityLighting131.snapshot().isDay),false,'preview begins at night');
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.ghost=false;state.speed=1;CityLighting131.test.setTime(900);});
  async function capture(name){await page.evaluate(()=>render());const image=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),image);assert((await sharp(image).stats()).channels.some(c=>c.stdev>12),'nonblank '+name);return image;}
  async function view(name,camera,target){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});return capture(name);}
  async function thirdPerson(name,x,z,yaw,radius=1.65){
   await page.evaluate(({x,z,yaw,radius})=>{state.overview=null;state.firstPerson=false;state.orbitYaw=0;state.pitch=0;state.radius=radius;player.position=[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.002,z];player.yaw=yaw;player.walkAmount=0;AnimatedCharacters.update(.01);updateCamera(0,true);render();},{x,z,yaw,radius});return capture(name);
  }
  await thirdPerson('restrooms-scale',-3.90,12.60,Math.PI/2);
  await view('fountain-detail',[-4.0,.80,13.94],[-4.78,.64,13.64]);
  await view('extinguisher-detail',[-4.05,.79,16.30],[-4.84,.69,16]);
  const lit=await view('box-office',[-1.75,1.08,25.5],[-4.73,1.10,25.5]);
  const daySelected=await page.evaluate(()=>CityLighting131.snapshot().selected);
  assert.equal(daySelected.filter(n=>n.includes('box office downlight')).length,6,'ticket alcove lit at midday');
  await page.evaluate(()=>CityLighting131.test.lights(false));
  const unlit=await capture('box-office-lights-off');
  const lampPixels=await difference(lit,unlit);assert(lampPixels>500,'downlights illuminate actual surfaces');
  await page.evaluate(()=>{CityLighting131.test.lights(true);CityLighting131.test.setTime(2100);});
  await capture('box-office-night');
  assert.equal((await page.evaluate(()=>CityLighting131.snapshot().selected)).filter(n=>n.includes('box office downlight')).length,6);
  await page.evaluate(()=>CityLighting131.test.setTime(900));
  await view('entry-left-alcove',[.4,1.15,31.5],[-4.1,1.15,25.4]);
  await thirdPerson('counter-scale',-4.12,27.40,Math.PI/2,1.05);
  await view('school-bus-rear',[9.4,.85,39.3],[7.3,.6,40.33]);
  await view('school-bus-front',[3.4,1.08,38.9],[5.4,.6,40.33]);
  await view('river-corner',[64.1,.98,-34.65],[65.45,.10,-37.9]);
  await view('river-corner-overhead',[63.3,5,-32.8],[65.1,-.02,-36.5]);
  await page.evaluate(()=>CityLighting131.test.setTime(2100));
  await view('river-corner-night',[64.1,.98,-34.65],[65.45,.1,-37.9]);
  await view('night-preview',[15,1.3,38],[25,2,49]);
  await page.evaluate(()=>CityLighting131.test.setTime(900));
  const routes=await page.evaluate(()=>{
   function walk(x,z,yaw,frames=600){player.position=[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.002,z];player.vy=0;player.grounded=true;player.yaw=yaw;for(let i=0;i<frames;i++)advancePlayer(1/120,{forward:true});return [...player.position];}
   const cornerHeights=[62.8,63.29,63.31,64,65,65.8,66.3].map(x=>({x,h:floorHeightAt(x,-35.6)}));
   return {gallery:walk(0,31,0,11000),reverse:walk(0,-24,Math.PI,11000),itIn:[9.25,-7.3].map(z=>walk(-3.8,z,Math.PI/2)),itOut:[9.25,-7.3].map(z=>walk(-6.05,z,-Math.PI/2)),queue:walk(-3.925,27.5,0,600),counter:walk(-4.1,27.4,Math.PI/2,300),cornerHeights,cornerAcross:walk(62.8,-35.6,-Math.PI/2,600),cornerSouth:walk(65,-30.3,Math.PI,240),fence:walk(64.6,-35.8,0,300)};
  });
  console.log('ROUTES',routes);
  assert(routes.gallery[2]<-20&&routes.reverse[2]>28,'main gallery open in both directions');
  assert(routes.itIn.every(p=>p[0]<-6)&&routes.itOut.every(p=>p[0]>-3.6),'IT entrances remain accessible');
  assert(routes.queue[2]<25,'walk through the queue lane');
  assert(routes.counter[0]>-4.51,'counter collision prevents walking into ticket window');
  assert(routes.cornerHeights.every(p=>Math.abs(p.h+.021)<.0001),'single matched riverwalk surface, no foundation gap');
  assert(routes.cornerAcross[0]>65.7,'riverwalk connects to east sidewalk');
  assert(routes.cornerSouth[2]>-29.2&&Math.abs(routes.cornerSouth[1]-.33151)<.001,'graded join meets east sidewalk');
  assert(routes.fence[2]>-36.5,'extended river fence blocks the edge');
  await page.setViewportSize({width:390,height:844});
  await thirdPerson('mobile-restrooms',-3.88,12.65,Math.PI/2,2.5);
  await view('mobile-box-office',[-.6,1.3,28],[-4.55,1.07,25.7]);
  await view('mobile-river-corner',[64.0,1.6,-33.8],[65.4,.0,-37.4]);
  await page.evaluate(()=>CityLighting131.test.setTime(2100));await view('mobile-night-preview',[15,1.3,38],[25,2,49]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({doors,interior,lampPixels,routes,status,errors},null,2));
  console.log('PASS desktop/mobile pixels, live day/night downlights, gallery and IT traversal, queue, counter collision and no WebGL errors', {lampPixels});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
