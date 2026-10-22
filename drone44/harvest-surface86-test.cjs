const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=collection86&entry=farm');
 await p.waitForFunction(()=>window.Farming36?.snapshot().status==='ready'&&typeof FarmBoundary48!=='undefined'&&FarmBoundary48.snapshot().ready,null,{timeout:120000});
 await p.evaluate(()=>{document.getElementById('controlsPopup')?.classList.add('hidden');FarmScene63.enter();player.position=[-80,.52,40];state.showStaff=false;state.overview=null;window.surfaceCamera={position:[-65,2,15],target:[-65,.14,10]};updateCamera=()=>{camera=[...surfaceCamera.position];target=[...surfaceCamera.target];};});
 const samples=[];
 for(let i=0;i<12;i++){
  await p.evaluate(i=>{const a=i*Math.PI/6,height=[.55,1.4,4,9][i%4];surfaceCamera.position=[-65+Math.sin(a)*4,height,-1+10+Math.cos(a)*4];surfaceCamera.target=[-65,.14,9];},i);
  await p.waitForTimeout(160);
  samples.push(await p.evaluate(()=>{render();const a=new Uint8Array(12*12*4);gl.readPixels(Math.floor(canvas.width/2)-6,Math.floor(canvas.height/2)-6,12,12,gl.RGBA,gl.UNSIGNED_BYTE,a);let brown=0,green=0;for(let i=0;i<a.length;i+=4){if(a[i]>a[i+1]*1.06&&a[i+1]>a[i+2]*1.05)brown++;if(a[i+1]>a[i]*1.06)green++;}return {brown,green};}));
  if(i%3===0)await p.screenshot({path:path.resolve(__dirname,'../../work/pc66/harvest86-angle-'+i+'.png')});
 }
 assert(samples.every(s=>s.brown>110&&s.green===0),'soil remains brown at every camera pitch and yaw: '+JSON.stringify(samples));
 const heights=await p.evaluate(()=>[[-65,9],[-47,4],[-27,0],[-95,4]].map(([x,z])=>raycast([x,.3,z],[0,-1,0],.4,c=>c.kind==='floor')?.point[1]));
 assert(heights.every(y=>Math.abs(y-.14)<.00001));
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(250);await p.screenshot({path:path.resolve(__dirname,'../../work/pc66/harvest86-mobile.png')});
 assert.deepEqual(errors,[]);console.log('PASS soil stays brown across 12 angles, no green z-fighting, unchanged flat driving height, mobile',samples,heights);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
