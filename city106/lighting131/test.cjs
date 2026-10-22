const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const clock=require('./core.js');
assert.equal(clock.DAY_SECONDS,1800);assert.equal(clock.NIGHT_SECONDS,600);
for(const [seconds,hour]of[[0,6],[450,9],[900,12],[1350,15],[1800,18],[1950,21],[2100,0],[2250,3],[2400,6]])assert(Math.abs(clock.sample(seconds).hour-hour)<1e-8);
assert.equal(clock.sample(1799.99).isDay,true);assert.equal(clock.sample(1800).isDay,false);assert.equal(clock.sample(2399.99).isDay,false);assert.equal(clock.sample(2400).isDay,true);
for(const boundary of[0,1800,2400]){const a=clock.sample(boundary-.001),b=clock.sample(boundary+.001);assert(Math.hypot(...a.sun.map((v,i)=>v-b.sun[i]))<.0001);assert(Math.abs(a.night-b.night)<.0001);}
assert(clock.sample(900).power>.99);assert.equal(clock.sample(2100).night,1);assert.equal(clock.sample(2100).daylight,0);
console.log('PASS exact 30-minute day / 10-minute night, solar movement and continuous dawn/dusk');
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../../work/lighting131');fs.mkdirSync(out,{recursive:true});
async function difference(a,b){const x=await sharp(a).removeAlpha().raw().toBuffer(),y=await sharp(b).removeAlpha().raw().toBuffer();let n=0;for(let i=0;i<x.length;i+=3)if(Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2])>20)n++;return n;}
(async()=>{
 const report=JSON.parse(fs.readFileSync(path.join(__dirname,'../report.json'))).lighting131;assert(report.roads>100);assert(report.replaced===54);assert(report.park>=5);assert(report.buriedFootings>0);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGL|GL_INVALID/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-lighting131');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.StreetProps128?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  const running=await page.evaluate(()=>{state.paused=false;CityLighting131.test.resume();render();return CityLighting131.snapshot().cycle;});await page.waitForTimeout(300);
  assert(await page.evaluate(()=>CityLighting131.snapshot().cycle)>running,'clock advances in gameplay');
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.firstPerson=false;});
  async function view(name,seconds,eye=[17,1.4,38],at=[27,2.3,49]){
   await page.evaluate(({seconds,eye,at})=>{CityLighting131.test.setTime(seconds);player.position=[eye[0],floorHeightAt(eye[0],eye[2])+PHYSICS.radii[1]+.002,eye[2]];state.overview={camera:eye,target:at};AnimatedCharacters.update(.01);updateCamera(0,true);render();},{seconds,eye,at});
   await page.waitForTimeout(120);await page.evaluate(()=>render());const b=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),b);assert((await sharp(b).stats()).channels.some(c=>c.stdev>12),'nonblank '+name);return b;
  }
  const day=await view('day',900),morningVP=await page.evaluate(()=>Array.from(sunLightVP));
  await view('late-afternoon',1530);assert.notDeepEqual(await page.evaluate(()=>Array.from(sunLightVP)),morningVP,'architectural shadows follow sun');
  await view('sunset',1785);
  const night=await view('night',2100);assert(await difference(day,night)>300000,'night changes scene lighting');
  await page.evaluate(()=>CityLighting131.test.lights(false));const dark=await view('night-without-local-lights',2100);const lampPixels=await difference(night,dark);assert(lampPixels>1000,'street lamps illuminate visible pavement and props');await page.evaluate(()=>CityLighting131.test.lights(true));
  await view('park-day',900,[-29.1,1.3,17],[-27.6,.1,10]);
  const parkReflection=await view('park-puddle',900,[-27.8,.38,11.5],[-27.7,-.02,9.7]);
  await page.evaluate(()=>CityMaterials129.configure({reflections:false}));
  const parkSky=await view('park-puddle-sky-only',900,[-27.8,.38,11.5],[-27.7,-.02,9.7]);
  const parkReflectionPixels=await difference(parkReflection,parkSky);assert(parkReflectionPixels>50,'park puddles reflect scene geometry');
  await page.evaluate(()=>CityMaterials129.configure());
  const park=await view('park-night',2100,[-29.1,1.3,17],[-27.6,.1,10]);
  await view('riverwalk-night',2100,[8,1.3,-36],[20,.8,-37]);
  await view('entrance-night',2100,[1,1.2,39],[0,1.7,32]);
  await view('gallery-night',2100,[-1.7,1.8,22],[4.2,3.2,18]);
  await view('shelter-road-side',900,[-10.5,.8,40.4],[-11.2,.4,39.04]);
  await view('shelter-sidewalk-side',900,[-11.9,.8,37.2],[-11.2,.5,39.04]);
  await view('street-signs',900,[-8,2.2,37.6],[-8.8,3.05,39.3]);
  await view('square-corner',900,[62,5,42],[65,0,36]);
  await view('side-buses',900,[65.6,1.2,37.5],[67.3,.7,28]);
  const layout=await page.evaluate(()=>({
   floors:[[62,38],[64,38],[66,38]].map(([x,z])=>{const h=raycast([x,.5,z],[0,-1,0],1,c=>!c.boundary);return {name:h?.object?.name,y:h?.point[1]};}),
   retired:colliders.filter(c=>/School_bus_.*_body_collider|Front_east_corner_curb|Front_east_rounded_sidewalk/.test(c.name)).map(c=>c.name),
   buses:colliders.filter(c=>c.name.startsWith('Supplied130 School_bus')).map(c=>({name:c.name,lo:c.lo,hi:c.hi}))
  }));assert.equal(layout.retired.length,0);assert.equal(layout.buses.length,9);assert(layout.floors.every(f=>f.name==='City131 square sidewalk corner'&&Math.abs(f.y+.0285)<.001));
  const fallen=await page.evaluate(()=>{
   const r=[...StreetProps128.test.records.values()].find(r=>r.id.startsWith('City131 roads'));
   CityLighting131.test.setTime(2100);state.overview={camera:[r.lo[0],1.5,r.lo[2]+2],target:r.prop.origin};updateCamera(0,true);render();
   const active=CityLighting131.snapshot().selected.includes(r.id);StreetProps128.test.hit(r.id,{mass:2800,x:8,z:0},r.prop.origin);StreetProps128.test.advance(.6);render();const broken=CityLighting131.snapshot().selected.includes(r.id),finite=r.prop.body.position.toArray().every(Number.isFinite);
   StreetProps128.test.advance(30);render();const restored=CityLighting131.snapshot().selected.includes(r.id);return {active,broken,restored,finite};
  });assert.deepEqual(fallen,{active:true,broken:false,restored:true,finite:true});
  const animation=await page.evaluate(()=>{CityLighting131.test.setTime(2100);const before=CityLighting131.snapshot();CityLighting131.test.advance(60);return {before,after:CityLighting131.snapshot()};});assert(Math.abs(animation.after.hour-1.2)<1e-8);
  await page.setViewportSize({width:390,height:844});await view('mobile-night',2100);await view('mobile-day',900);
  const status=await page.evaluate(()=>({lighting:CityLighting131.snapshot(),reflections:CityMaterials129.snapshot(),gl:gl.getError(),lost:gl.isContextLost(),geometry:City106.batches.filter(b=>b.name.startsWith('City131')).length}));
  assert(status.geometry>100);assert.equal(status.gl,0);assert(!status.lost);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({report,lampPixels,parkReflectionPixels,fallen,animation,layout,status,errors},null,2));console.log('PASS supplied lamps, day/night pixels, moving shadows, light pools, broken-lamp reset, park, gallery, bus stops, corner collisions, desktop/mobile');console.log({lamps:report.lights.length,lampPixels,parkReflectionPixels});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
