const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=ground95&challenge=drone');
 await p.waitForFunction(()=>window.Drone44?.snapshot().ready,null,{timeout:120000});
 await p.evaluate(()=>{document.getElementById('controlsPopup')?.classList.add('hidden');Drone44.enter();Drone44.test.game.launch();document.getElementById('dronePanel44').hidden=true;state.showStaff=false;window.original95=updateCamera;window.crops95=Drone44.test.plants.splice(0);window.surface95={camera:[-112,4,6],target:[-112,.14,4]};updateCamera=()=>{camera=surface95.camera;target=surface95.target;};});
 const samples=[];
 for(let i=0;i<24;i++){
  await p.evaluate(i=>{const a=i*Math.PI/4,h=[.5,1.4,4,9][i%4],x=[-112,-94,-77][Math.floor(i/8)],z=4;surface95.camera=[x+Math.sin(a)*2,h,z+Math.cos(a)*2];surface95.target=[x,.14,z];},i);
  await p.waitForTimeout(100);
  samples.push(await p.evaluate(()=>{render();const pixels=new Uint8Array(8*8*4);gl.readPixels(Math.floor(canvas.width/2)-4,Math.floor(canvas.height/2)-4,8,8,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let brown=0,green=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i]>pixels[i+1]*1.02&&pixels[i+1]>pixels[i+2]*1.04)brown++;if(pixels[i+1]>pixels[i]*1.06)green++;}return {brown,green};}));
 }
 assert(samples.every(s=>s.brown>=60&&s.green===0),'flat soil stays brown at all 24 views: '+JSON.stringify(samples));
 const floor=await p.evaluate(()=>[-112,-94,-77].map(x=>raycast([x,.3,4],[0,-1,0],.4,c=>c.kind==='floor')?.point[1]));assert(floor.every(y=>Math.abs(y-.14)<.00001));
 await p.evaluate(()=>{Drone44.test.plants.push(...crops95);updateCamera=original95;Object.assign(Drone44.test.game.state,{x:-96,z:5,y:3});Drone44.view();});
 for(const [name,width,height]of [['desktop',1440,950],['mobile',390,844]]){
  await p.setViewportSize({width,height});await p.waitForTimeout(300);await p.screenshot({path:path.resolve(__dirname,'../../work/farm65/ground95-'+name+'.png')});
  const stats=await sharp(await p.locator('canvas').first().screenshot()).stats();assert(stats.channels[0].stdev>15,'nonblank crop and irrigation scene');
 }
 assert.deepEqual(errors,[]);console.log('PASS drone soil: 24 camera views, zero green bleed, flush .14 ground, restored crops and irrigation, desktop/mobile rendering');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
