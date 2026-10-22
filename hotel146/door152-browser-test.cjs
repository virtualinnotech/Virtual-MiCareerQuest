const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work/hotel152');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.setDefaultTimeout(180000);page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261019-hotel152&time=day&challenge=hotel');
 await page.waitForFunction(()=>window.Hotel146?.snapshot().ready);
 await page.evaluate(()=>{applyStudentMode();Crowd.pause(true);state.paused=true;CityLighting131.test.setTime(900);});
 async function shot(name,eye,at){
  await page.evaluate(async({eye,at})=>{state.overview={camera:HotelScene146.at(eye),target:HotelScene146.at(at)};updateCamera(0,true);await new Promise(requestAnimationFrame);render();},{eye,at});
  const gpu=await page.evaluate(()=>{const data=new Uint8Array(64*64*4);gl.readPixels(canvas.width/2-32|0,canvas.height/2-32|0,64,64,gl.RGBA,gl.UNSIGNED_BYTE,data);return {lost:gl.isContextLost(),error:gl.getError(),colors:new Set(Array.from({length:4096},(_,i)=>data.slice(i*4,i*4+3).join(','))).size};});
  assert(!gpu.lost&&gpu.error===0&&gpu.colors>12,'healthy framebuffer '+name);await page.screenshot({path:path.join(out,name+'.png')});
 }
 await page.evaluate(()=>{player.position=HotelScene146.at([-.65,PHYSICS.radii[1]+.012,-2.55]);player.yaw=0;AnimatedCharacters.update(.02);});
 await shot('door-with-character',[1.65,1.0,-1.55],[0,.52,-3.43]);
 const motion=await page.evaluate(async()=>{
  const parts=HotelScene146.models['revolving-door'],sample=()=>{
   const matrices=[],old=drawBatch;drawBatch=function(b,m,...args){const p=parts.find(p=>p.batch===b);if(p)matrices.push({name:p.name,matrix:Array.from(m)});return old(b,m,...args);};try{render();}finally{drawBatch=old;}return matrices;
  };
  await new Promise(requestAnimationFrame);const before=sample(),angle=HotelScene146.snapshot().door;
  state.paused=false;for(let i=0;i<30;i++)HotelScene146.update(1/30);state.paused=true;await new Promise(requestAnimationFrame);const after=sample();
  player.position=HotelScene146.at([0,.4,0]);const stopped=HotelScene146.snapshot().door;state.paused=false;HotelScene146.update(.05);state.paused=true;
  return {before,after,angle,turned:stopped,far:HotelScene146.snapshot().door};
 });
 assert(motion.turned>motion.angle&&motion.far===motion.turned,'approach starts rotation; walking away stops it');
 for(let i=0;i<motion.before.length;i++){
  const a=motion.before[i],b=motion.after[i];assert.equal(a.name,b.name);
  if(a.name==='door-rotor')assert.notDeepEqual(a.matrix,b.matrix);else assert.deepEqual(a.matrix,b.matrix,'fixed frame and mat do not rotate');
 }
 assert.equal(motion.before.length,5,'five supplied parts replace the procedural bars and panes');
 await shot('street-door',[.9,.78,-5.6],[0,.5,-3.43]);
 await page.setViewportSize({width:390,height:844});await shot('mobile-door',[.7,.8,-5.8],[0,.5,-3.43]);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({motion,errors},null,2));
 console.log('PASS character-scale door, rotating source leaves, fixed frame, proximity activation, desktop/mobile pixels');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
