const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),report=JSON.parse(fs.readFileSync(path.join(root,'city106/report.json'))),manifest=require('./manifest.json');
const bytes=fs.readFileSync(path.join(root,'city106/city.glb')),j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
for(const kind of['police','police-suv']){
 assert(report.life.vehicles.filter(v=>v.kind===kind).length>5,'both police variants used throughout traffic');
 const m=manifest.find(m=>m.id===kind);assert.equal(m.wheels.length,4);
 assert(m.wheels.every(w=>Math.abs(w.radius-.154)<.004),'all wheels have consistent physical scale');
 assert(m.wheels.every(w=>Math.abs(w.offset[1]-w.radius)<.005),'tires touch pavement');
}
for(const v of report.life.vehicles)assert(j.nodes.some(n=>n.extras?.life111?.id===v.id&&n.extras.life111.role==='headlight'),'headlamps on '+v.id);
const hotel=report.assets130.downtown134.hotel;
assert(hotel.bounds.hi[0]<-36.3&&hotel.bounds.lo[2]>-38.7,'hotel clear of west road and river');
assert(report.assets130.retired131.includes(hotel.replaced));
assert(!report.buildings.placements.some(b=>b.name===hotel.replaced));
assert(report.assets130.downtown134.lights.length>=30);
assert(!fs.readFileSync(path.join(root,'venue-frame.html'),'utf8').includes('vPosition.x< -24.4||'),'no old rectangular day/night boundary');
console.log('PASS two supplied police SUVs, four grounded wheels each, every vehicle has headlights, riverside hotel placement, warm facade lights');
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(root,'../work/downtown134');
async function difference(a,b){const x=await sharp(a).removeAlpha().raw().toBuffer(),y=await sharp(b).removeAlpha().raw().toBuffer();let n=0;for(let i=0;i<x.length;i+=3)if(Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2])>15)n++;return n;}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/WebGL|shader|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-downtown134&time=night');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  assert(!(await page.evaluate(()=>CityLighting131.snapshot().isDay)));
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);CityLighting131.test.setTime(2100);});
  async function capture(name){await page.evaluate(()=>render());const image=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),image);assert((await sharp(image).stats()).channels.some(c=>c.stdev>12),'nonblank '+name);return image;}
  async function view(name,camera,target){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});return capture(name);}
  const front=await view('entrance-night',[-2.5,1.25,40],[0,1.4,34]);
  await page.evaluate(()=>CityLighting131.test.lights(false));const dark=await capture('entrance-without-local-lights');
  const litPixels=await difference(front,dark);assert(litPixels>20000,'warm lights illuminate facade and sidewalk');
  await page.evaluate(()=>CityLighting131.test.lights(true));
  await view('front-panorama-night',[10,6,44.2],[25,3.5,34]);
  const nightPaving=await view('sculpture-sidewalk-night',[-21.5,1.25,39.5],[-25.2,.15,34.8]);
  await view('hotel-night',[-21,15,-48],[-41.7,10,-31.5]);
  await view('hotel-riverfront-night',[-26.3,1.2,-36.8],[-41.7,8,-31.5]);
  const lamps=await page.evaluate(()=>{
   const vs=CityLife111.trafficBodies(),moving=vs.filter(v=>!v.parked),head=City106.batches.filter(b=>b.vehicle114?.role==='headlight');
   return {moving:moving.length,lights:moving.filter(v=>v.light134).length,lit:head.filter(b=>b.emission[0]>1).length,hotelCollider:colliders.some(c=>c.name==='Downtown134 The H riverside hotel'),oldCollider:colliders.filter(c=>c.name.startsWith('City_West_070_Building-Medium-01')).length};
  });assert.equal(lamps.moving,lamps.lights);assert(lamps.lit>=lamps.moving);assert(lamps.hotelCollider);assert.equal(lamps.oldCollider,0);
  for(const kind of['police','police-suv']){
   const v=await page.evaluate(kind=>{const v=CityLife111.trafficBodies().find(v=>v.kind===kind&&v.lane==='front-east');return {p:v.p,yaw:v.yaw};},kind);
   const [x,y,z]=v.p;await view(kind+'-night',[x+1.9,y+1.2,z+2.5],[x,y+.4,z]);
   await page.evaluate(()=>CityLighting131.test.setTime(900));await capture(kind+'-day');await page.evaluate(()=>CityLighting131.test.setTime(2100));
  }
  const v=await page.evaluate(()=>{const v=CityLife111.trafficBodies().find(v=>v.kind==='sedan'&&v.lane==='front-east');return {p:v.p,id:v.id};});
  await view('traffic-headlights',[v.p[0]+3.4,1.1,v.p[2]+1.9],[v.p[0]+.8,.15,v.p[2]]);
  const motion=await page.evaluate(id=>{
   const v=CityLife111.trafficBodies().find(v=>v.id===id),before=[...v.p],light=[...v.light134.p];
   for(let i=0;i<45;i++){CityLife111.update(1/90);CityLife111.present();}
   return {before,after:[...v.p],lightBefore:light,lightAfter:[...v.light134.p],offset:Math.hypot(v.light134.p[0]-v.p[0],v.light134.p[2]-v.p[2])};
  },v.id);assert(motion.after.every(Number.isFinite)&&motion.lightAfter.every(Number.isFinite));assert(motion.offset<3);
  await page.evaluate(()=>CityLighting131.test.setTime(900));
  const dayPaving=await view('sculpture-sidewalk-day',[-21.5,1.25,39.5],[-25.2,.15,34.8]);assert(await difference(dayPaving,nightPaving)>20000);
  await view('hotel-day',[-21,15,-48],[-41.7,10,-31.5]);
  await view('entrance-day',[-2.5,1.25,40],[0,1.4,34]);
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>CityLighting131.test.setTime(2100));await view('mobile-night',[-2.5,1.25,40],[0,1.4,34]);
  await view('mobile-hotel',[-21,15,-48],[-41.7,10,-31.5]);
  await page.evaluate(()=>CityLighting131.test.setTime(900));await view('mobile-day',[-2.5,1.25,40],[0,1.4,34]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({litPixels,hotel,lamps,motion,status,errors},null,2));console.log('PASS daytime/nighttime desktop/mobile rendering, lit surfaces, traffic headlamp transforms, hotel collision', {litPixels,lamps});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
