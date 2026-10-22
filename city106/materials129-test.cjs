const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/materials129');
fs.mkdirSync(out,{recursive:true});
async function changedPixels(a,b){
 const x=await sharp(a).removeAlpha().raw().toBuffer(),y=await sharp(b).removeAlpha().raw().toBuffer();
 let changed=0;for(let i=0;i<x.length;i+=3)if(Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2])>15)changed++;
 return changed;
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('page crash'));
  page.on('console',m=>{if(m.type()==='error'&&/WebGL|shader|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1','{"seen":true}');});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261016-materials129');
  await page.waitForFunction(()=>window.Scooter100?.snapshot().ready&&window.StreetProps128?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready',null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.overview=null;state.firstPerson=false;player.position=[5,floorHeightAt(5,-36)+PHYSICS.radii[1]+.002,-36];player.yaw=0;player.grounded=true;state.orbitYaw=-.8;state.pitch=.55;state.radius=2;AnimatedCharacters.update(.01);updateCamera(0,true);CityMaterials129.configure({reflections:false});render();});
  const canvas=page.locator('#canvas');
  async function shot(name){await page.waitForTimeout(220);await page.evaluate(()=>render());const b=await canvas.screenshot();assert((await sharp(b).stats()).channels.some(c=>c.stdev>20),'nonblank '+name);fs.writeFileSync(path.join(out,name+'.png'),b);return b;}
  const shadowed=await shot('sun-shadow');
  await page.evaluate(()=>{CityMaterials129.configure({movingShadows:false,reflections:false});render();});
  const noMoving=await shot('without-moving-shadow'),shadowPixels=await changedPixels(shadowed,noMoving);
  assert(shadowPixels>300,'moving player shadow must affect rendered pixels');
  const oldVP=await page.evaluate(()=>CityMaterials129.snapshot().movingVP);
  await page.evaluate(()=>{player.position[0]+=1;AnimatedCharacters.update(.01);CityMaterials129.configure();updateCamera(0,true);render();});
  await page.waitForTimeout(220);
  await page.evaluate(()=>render());
  assert.notDeepEqual(await page.evaluate(()=>CityMaterials129.snapshot().movingVP),oldVP,'near shadow follows the player');
  console.log('PASS skinned player casts moving sun shadow ('+shadowPixels+' changed pixels)');
  async function view(name,camera,target,position){await page.evaluate(v=>{if(v.position)player.position=v.position;state.overview={camera:v.camera,target:v.target};updateCamera(0,true);render();},{camera,target,position});return shot(name);}
  await view('pavement-detail',[16.2,1.3,39],[15.8,0,37.5],[16,.3,38]);
  await view('facade-detail',[33,1.4,47],[29,3.5,53],[33,.3,47]);
  const reflected=await view('wet-street',[-36.9,1.6,6.95],[-38,.1,8],[-38,.3,8]);
  await page.evaluate(()=>{CityMaterials129.configure({reflections:false});render();});
  const noReflection=await shot('without-scene-reflection'),reflectionPixels=await changedPixels(reflected,noReflection);
  assert(reflectionPixels>500,'wet pavement must reflect scene geometry, not only sky');
  await page.evaluate(()=>CityMaterials129.configure());
  console.log('PASS wet street scene reflections ('+reflectionPixels+' changed pixels)');
  await page.addScriptTag({path:path.join(__dirname,'materials129-probe.js')});
  const rider=await page.evaluate(()=>{mountProbe129();return {fit:fitProbe129(),pose:Scooter100.snapshot().poseError};});
  assert(rider.pose.filter(p=>p.limb==='arm').every(p=>p.error<.001),'hands reach handlebar grip targets');
  for(const name of['palmL','palmR']){assert(rider.fit[name].count>100);assert(rider.fit[name].lo[1]>1.270&&rider.fit[name].lo[1]<1.281,'palms touch the top of the grips');}
  assert(rider.pose.filter(p=>p.limb==='leg').every(p=>p.hip[1]>1.07),'hips raised above the saddle');
  await shot('rider-side-final');
  await page.evaluate(()=>{state.orbitYaw=Math.PI;state.pitch=-.05;state.radius=.9;updateCamera(0,true);render();});
  await shot('rider-front-final');
  console.log('PASS saddle clearance and both skinned palms at handlebar surface');
  await page.setViewportSize({width:390,height:844});
  await view('mobile-materials',[5,1.3,-35],[10,.3,-37],[5,.3,-36]);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  const runtime=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),lighting:CityMaterials129.snapshot(),utility:City106.batches.filter(b=>/supplied Utility/.test(b.name)).length}));
  assert.equal(runtime.utility,0);assert.equal(runtime.gl,0);assert(!runtime.lost);assert(runtime.lighting.frames>2&&runtime.lighting.reflectionFrames>2);assert.equal(runtime.lighting.error,null);
  assert(!missing.some(u=>/city106|scooter|ambulance/.test(u)));assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({shadowPixels,reflectionPixels,rider,runtime,errors,missing},null,2));
  console.log('PASS desktop/mobile canvas, removed road cabinets, no JS/WebGL errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
