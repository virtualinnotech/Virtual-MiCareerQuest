const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),out=path.resolve(root,'../work/riverlights136');
const report=JSON.parse(fs.readFileSync(path.join(root,'city106/report.json'))).assets130.riverlights136;
assert.equal(report.archive,'street-lamp.zip');assert(report.lamps.length>=30);assert.equal(report.bridge.length,15);assert.equal(report.uplights.length,17);
assert(report.uplights.every(l=>l.direction[1]>.9&&l.color[0]>l.color[1]&&l.color[1]>l.color[2]));
assert(report.lamps.every(l=>l.p[1]>1.5&&l.p[1]<1.8));
if(process.argv.includes('--unit')){console.log('PASS supplied lamps, bridge fixtures, upward warm-white facade coverage');process.exit(0);}
const {chromium}=require('playwright'),sharp=require('sharp');
async function difference(a,b){const x=await sharp(a).removeAlpha().raw().toBuffer(),y=await sharp(b).removeAlpha().raw().toBuffer();let count=0;for(let i=0;i<x.length;i+=3)if(Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2])>15)count++;return count;}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[],checks={};
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/WebGL|shader|GL_INVALID/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-riverlights136&time=night');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready'&&window.Scooter100?.snapshot().ready,null,{timeout:180000});
  assert(!(await page.evaluate(()=>CityLighting131.snapshot().isDay)));
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);CityLighting131.test.setTime(2100);});
  async function capture(name){assert(!(await page.evaluate(()=>gl.isContextLost())),'live graphics context '+name);await page.evaluate(()=>render());const image=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'.png'),image);assert((await sharp(image).stats()).channels.some(c=>c.stdev>12),'nonblank '+name);return image;}
  async function view(name,camera,target){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});return capture(name);}
  for(const[name,camera,target]of[
   ['bridge',[-9,1.15,-34.8],[-6.3,1.1,-46]],
   ['bridge-deck',[-6.3,1.05,-40],[-6.3,.75,-51]],
   ['rear-facade',[26,2,-36.3],[34,4.5,-27.6]],
   ['rear-gallery',[-6,1.4,-36],[0,4,-30]],
   ['riverwalk',[44,1.05,-35.4],[20,.8,-36.4]]
  ]){
   const lit=await view(name+'-night',camera,target);
   checks[name+'-selected']=await page.evaluate(()=>CityLighting131.snapshot().selected);
   await page.evaluate(()=>CityLighting131.test.lights(false));const dark=await capture(name+'-without-lights');await page.evaluate(()=>CityLighting131.test.lights(true));
   checks[name+'-litPixels']=await difference(lit,dark);assert(checks[name+'-litPixels']>12000,'lights reach '+name);
   await page.evaluate(()=>CityLighting131.test.setTime(900));await capture(name+'-day');await page.evaluate(()=>CityLighting131.test.setTime(2100));
  }
  for(const kind of['police','police-suv']){
   const v=await page.evaluate(kind=>{const v=CityLife111.trafficBodies().find(v=>v.kind===kind&&v.lane==='front-east');return {p:v.p,yaw:v.yaw};},kind);
   const[x,y,z]=v.p;await view(kind+'-night',[x+1.6,y+.85,z+1.8],[x,y+.35,z]);
   await page.evaluate(()=>CityLighting131.test.setTime(900));await capture(kind+'-day');await page.evaluate(()=>CityLighting131.test.setTime(2100));
  }
  for(const day of[2100,900]){
   await page.evaluate(day=>CityLighting131.test.setTime(day),day);
   for(const dx of[0,.08,.16])await view('tower-'+day+'-'+dx,[51+dx,2.4,-35.4],[77.5,13,-29.35]);
  }
  await page.evaluate(()=>{CityLighting131.test.setTime(2100);StudentProgress99.completeForTesting();StudentRewards100.claim();StudentRewards100.close();});
  const ids=await page.evaluate(()=>['scooter',Object.keys(Scooter100.snapshot().rides).find(id=>id.includes('bike'))]);
  for(const id of ids){
   const mounted=await page.evaluate(id=>{
    Scooter100.dismount(true);state.overview=null;state.paused=false;state.ghost=false;
    const p=Scooter100.snapshot().rides[id].parked;player.position=[p.x-.25,floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.002,p.z];updateCamera(0,true);
    const ok=Scooter100.mount(id);state.paused=true;
    player.position=[16,floorHeightAt(16,-35.5)+PHYSICS.radii[1]+.002,-35.5];player.yaw=-Math.PI/2;state.radius=1.7;state.pitch=.28;state.orbitYaw=0;updateCamera(0,true);render();return ok;
   },id);assert(mounted,'mounted '+id);
   const lit=await capture(id+'-headlight');
   const light=await page.evaluate(()=>Scooter100.headlights136()[0]);assert(light.direction[0]>.9);assert(light.p[0]>16&&light.p[1]>.3);
   assert((await page.evaluate(()=>CityLighting131.snapshot().selected)).includes(light.id),'mounted beam gets a reserved light slot');
   await page.evaluate(()=>{window.headlight136Saved=Scooter100.headlights136;Scooter100.headlights136=()=>[];});
   const dark=await capture(id+'-without-headlight');await page.evaluate(()=>Scooter100.headlights136=window.headlight136Saved);
   checks[id+'-beamPixels']=await difference(lit,dark);assert(checks[id+'-beamPixels']>500,'beam illuminates the path '+id);
   const motion=await page.evaluate(()=>{
    const samples=[];for(let i=0;i<15;i++){player.position[0]+=.012;player.yaw+=.006;updateCamera(0,true);samples.push(Scooter100.headlights136()[0]);}return samples;
   });assert(motion.every(l=>l.p.every(Number.isFinite)));assert(motion.slice(1).every((l,i)=>Math.hypot(...l.p.map((v,k)=>v-motion[i].p[k]))<.03),'headlight smoothly follows its ride');
   await page.evaluate(()=>Scooter100.dismount(true));
  }
  await page.setViewportSize({width:390,height:844});
  await view('mobile-bridge-night',[-9,1.15,-34.8],[-6.3,1.1,-46]);
  await view('mobile-rear-night',[26,2,-36.3],[34,4.5,-27.6]);
  await page.evaluate(()=>CityLighting131.test.setTime(900));await capture('mobile-rear-day');
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth,lights:CityLighting131.snapshot()}));
  assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({checks,status,errors},null,2));
  console.log('PASS night/day desktop/mobile scenes, physical light coverage, bike/scooter beams and smooth transforms, clean WebGL',checks);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
