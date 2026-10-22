const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/hotel151');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261019-hotel151&time=day&challenge=hotel');
 await page.waitForFunction(()=>window.Hotel146?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady);
 await page.evaluate(()=>{applyStudentMode();Crowd.pause(true);state.paused=true;CityLighting131.test.setTime(900);});
 async function shot(name,eye,at){
  await page.evaluate(async({eye,at})=>{state.overview={camera:HotelScene146.at(eye),target:HotelScene146.at(at)};player.position=HotelScene146.at([0,.4,-6]);updateCamera(0,true);await new Promise(requestAnimationFrame);render();},{eye,at});
  const gpu=await page.evaluate(()=>{const pixels=new Uint8Array(64*64*4);gl.readPixels(Math.floor(canvas.width/2)-32,Math.floor(canvas.height/2)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return {lost:gl.isContextLost(),error:gl.getError(),colors:new Set(Array.from({length:4096},(_,i)=>pixels.slice(i*4,i*4+3).join(','))).size};});
  assert(!gpu.lost&&gpu.error===0&&gpu.colors>12,'healthy nonblank framebuffer: '+name);
  const png=await page.screenshot();assert((await sharp(png).stats()).channels.some(c=>c.stdev>10));fs.writeFileSync(path.join(out,name+'.png'),png);
 }
 await shot('front',[0,1.25,-8.5],[0,1.8,-3.8]);
 await shot('left-side',[-5.2,1.0,-5.4],[-3.2,1.2,1.5]);
 await shot('right-side',[5.4,1.05,-5.8],[3.2,1.2,1.4]);
 await shot('through-glass',[1.41,.9,-4.6],[.5,1.0,0]);
 const walk=await page.evaluate(async()=>{
  state.overview=null;state.paused=true;player.position=HotelScene146.at([0,PHYSICS.radii[1]+.012,-6.2]);
  const b=HotelCore146.bounds,initial=CityLife111.snapshot().people.filter(p=>p.id.startsWith('shops-block0')),intrusions=[];
  for(let i=0;i<900;i++){
   CityLife111.update(.05);
   for(const p of CityLife111.snapshot().people.filter(p=>p.id.startsWith('shops-block0')))if(p.x>b.lo[0]-.14&&p.x<b.hi[0]+.14&&p.z>b.lo[2]-.14&&p.z<b.hi[2]+.14)intrusions.push(p);
   if(i%30===0)await new Promise(requestAnimationFrame);
  }
  const final=CityLife111.snapshot().people.filter(p=>p.id.startsWith('shops-block0'));
  const paths=[];state.speed=2;
  for(const z of [-4.8,-4.5]){player.position=HotelScene146.at([-3.5,PHYSICS.radii[1]+.012,z]);player.yaw=-Math.PI/2;player.vy=0;player.grounded=true;for(let i=0;i<400;i++)advancePlayer(1/60,{forward:true});paths.push(player.position.map((v,k)=>v-HotelCore146.origin[k]));}
  return {intrusions,initial,final,paths};
 });
 fs.writeFileSync(path.join(out,'walk.json'),JSON.stringify(walk,null,2));
 assert.equal(walk.intrusions.length,0,'pedestrians never enter the facade');
 assert(walk.final.every((p,i)=>p.walked-walk.initial[i].walked>2),'each nearby pedestrian makes progress');
 assert(walk.paths.every(p=>p[0]>2.8),'both sidewalk strips are walkable past the entire entrance: '+JSON.stringify(walk.paths));
 await page.setViewportSize({width:390,height:844});await shot('mobile-front',[0,1.1,-9.2],[0,1.6,-3.8]);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const status=await page.evaluate(()=>({lost:gl.isContextLost(),error:gl.getError(),hotel:Hotel146.snapshot().error}));
 assert.deepEqual(status,{lost:false,error:0,hotel:null});assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({walk,status,errors},null,2));
 console.log('PASS front/side glass, street-to-lobby view, 45 seconds of clear NPC movement, sidewalk walking, desktop/mobile canvas');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
