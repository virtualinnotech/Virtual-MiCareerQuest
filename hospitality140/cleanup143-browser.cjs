const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/hospitality143');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/GL_INVALID|shader.*ERROR/.test(m.text()))errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261019-hospitality143&time=night&sector=escalators');
 await page.waitForFunction(()=>state.ready&&Hospitality140.snapshot().ready&&Network40.snapshot().ready&&AnimatedCharacters.hasPlayer(),null,{timeout:180000});
 await page.evaluate(async()=>{await venueLayoutReady;state.paused=true;Crowd.pause(true);applyStudentMode();CityLighting131.test.setTime(2100);});
 const cleanup=await page.evaluate(()=>{
  const C=HospitalityCore140,fixtures=City106.batches.filter(b=>C.fixtureOffset(b.name));
  const remaining=City106.batches.filter(b=>C.removeOriginal(b.name)||(/plant|bush|recycl|\bbins?\b/i.test(b.name)&&C.inside(b.center[0],b.center[2],.2)));
  const path=City106.batches.find(b=>/park path joined pavers/.test(b.name)),paving=City106.surface('Front_continuous_sidewalk','citySidewalk',new Float32Array([0,0,0,0,1,0]));
  const crossing=[-25.8,-20.4,-17.5].map(z=>({z,end:resolveEllipsoid([-5.7,C.floor+PHYSICS.radii[1]+.002,z],[1.35,0,0]).position}));
  return {fixtures:fixtures.map(b=>({name:b.name,p:Array.from(b.modelMatrix.slice(12,15))})),remaining:remaining.map(b=>b.name),foundation:City106.batches.some(b=>/Park137 server room solid foundation/.test(b.name)),paving:{type:path?.surfaceType,color:path?.color,sameBase:path?.baseTexture===paving.baseTexture,sameNormal:path?.normalTexture===paving.normalTexture},crossing,glass:colliders.filter(c=>/^Gallery_side_clerestory_band_/.test(c.name)&&c.lo[2]<-13.351).map(c=>c.name),guard:colliders.some(c=>/Hospitality140 Glass guard panel/.test(c.name)),clock:CityLighting131.snapshot()};
 });
 console.log('CLEANUP',JSON.stringify(cleanup));fs.writeFileSync(path.join(out,'cleanup.json'),JSON.stringify(cleanup,null,2));
 assert(cleanup.fixtures.length>=3&&cleanup.fixtures.every(b=>Math.abs(b.p[2]+12.45)<.001));assert.deepEqual(cleanup.remaining,[]);assert(cleanup.foundation);
 assert.equal(cleanup.paving.type,19);assert(cleanup.paving.sameBase&&cleanup.paving.sameNormal);assert.deepEqual(cleanup.glass,[]);assert(cleanup.guard);assert(cleanup.crossing.every(p=>p.end[0]>-4.5));
 const alarm=await page.evaluate(()=>{
  const original=drawBatch,originalInstances=drawBuildingInstances,s=Network40.test.game.state,time=s.time,extent=Network40.snapshot().extent;let beams=0,escaped=0;
  try{drawBuildingInstances=()=>{};drawBatch=(b,m)=>{if(!b.unlit||Math.abs(b.color[3]-.07)>.0001)return;beams++;
   for(const x of [-.15,.15])for(const z of [0,2.3]){const p=tp(m,x,0,z);if(p[0]<extent[0]+.0799||p[0]>extent[2]-.0799||p[2]<extent[1]+.0799||p[2]>extent[3]-.0799)escaped++;}
  };for(let i=0;i<120;i++){s.time=i/10;Network40.draw([]);}}
  finally{drawBatch=original;drawBuildingInstances=originalInstances;s.time=time;render();}return {beams,escaped};
 });
 console.log('ALARM BOUNDS',alarm);assert(alarm.beams>200);assert.equal(alarm.escaped,0);
 async function shot(name,eye,target,time=2100){
  await page.evaluate(({eye,target,time})=>{CityLighting131.test.setTime(time);state.overview={camera:eye,target};updateCamera(0,true);render();},{eye,target,time});
  const png=await page.screenshot();fs.writeFileSync(path.join(out,name+'.png'),png);
  const stats=await sharp(png).extract({left:220,top:200,width:1000,height:500}).stats();assert(stats.channels.some(c=>c.stdev>9));assert.equal(await page.evaluate(()=>gl.getError()),0);
 }
 await shot('escalators-night',[-4.2,1.45,-14.8],[-10,1.7,-14.5]);
 await shot('safety-wall',[-3.3,1.15,-14.1],[-4.95,.7,-12.45]);
 await shot('lower-room-night',[-11,1.55,-23],[-19,1.3,-17]);
 await shot('upper-open-gallery',[-9,4.1,-24],[-1.5,4.5,-22]);
 await shot('riverwalk-day',[-28,1.6,5],[-28,.05,-1],900);
 await shot('riverwalk-night',[-28,1.6,5],[-28,.05,-1]);
 await shot('addition-side-day',[-28,1.6,-32.5],[-18,0,-32.5],900);
 await shot('addition-side-night',[-28,1.6,-32.5],[-18,0,-32.5]);
 // Render fixed probes through the production shader while changing ONLY the
 // camera used by the outdoor-light selector. Indoor RGB must stay identical.
 const probes=await page.evaluate(()=>{
  const cube=createCube(),results=[],savedCamera=[...camera],savedTarget=[...target];
  for(const p of [[-24,.24,-24],[-24,HospitalityCore140.floor,-24],[-10,HospitalityCore140.floor,-20]]){
   const colors=[],selections=[];
   for(const time of [2100,900])for(const selector of [[-8,2,-14],[-30,5,-29],[50,2,40]]){
    CityLighting131.test.setTime(time);render();camera=selector;CityLighting131.bind();selections.push(CityLighting131.snapshot().selected);
    const eye=[p[0]+.1,p[1]+1.6,p[2]+.1];camera=eye;
    gl.viewport(0,0,32,32);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.depthMask(true);
    gl.uniformMatrix4fv(uniforms.uVP,false,new Float32Array(mm(perspective(1),lookAt(eye,p))));gl.uniform3fv(uniforms.uCamera,eye);
    drawBatch({...cube,color:[.28,.28,.28,1],rough:1,metal:0},transform(p,[1,.02,1]));
    const pixel=new Uint8Array(4);gl.readPixels(16,16,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);colors.push(Array.from(pixel));
   }
   results.push({p,colors,selectionChanged:JSON.stringify(selections[0])!==JSON.stringify(selections[2])});
  }
  camera=savedCamera;target=savedTarget;CityLighting131.test.setTime(2100);render();return results;
 });
 console.log('LIGHT PROBES',JSON.stringify(probes));fs.writeFileSync(path.join(out,'lighting-probes.json'),JSON.stringify(probes,null,2));
 for(const probe of probes){assert(probe.selectionChanged);assert(probe.colors[0][0]>40&&probe.colors[0][0]<250);for(const pixel of probe.colors)assert.deepEqual(pixel,probe.colors[0]);}
 // Inspect during movement, including both former pop-in zones from the recording.
 await page.evaluate(()=>{state.overview=null;state.ghost=false;player.position=[-23,HospitalityCore140.floor+PHYSICS.radii[1]+.002,-22];player.yaw=-Math.PI/2;state.radius=2.5;state.pitch=.15;});
 for(let i=0;i<3;i++){await page.evaluate(()=>{for(let j=0;j<180;j++)advancePlayer(1/90,{forward:true});updateCamera(0,true);render();});await page.screenshot({path:path.join(out,'walking-night-'+i+'.png')});}
 await page.setViewportSize({width:1280,height:800});await shot('laptop-night',[-24,4.4,-24],[-12,4.1,-14]);
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>gl.getError()),0);
 console.log('PASS: cleanup, large paver materials, open upstairs passages, stable indoor RGB across day/night and camera selection, moving desktop/laptop views.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
