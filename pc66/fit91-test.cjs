const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[],out=path.resolve(__dirname,'../../work/pc66');p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=fit91&challenge=pc');await p.waitForFunction(()=>window.PCChallenge66?.snapshot().gpuReady&&window.Network40?.snapshot().ready,null,{timeout:120000});
 await p.evaluate(()=>document.getElementById('controlsPopup')?.classList.add('hidden'));
 const crossing=await p.evaluate(()=>{const s=PCChallenge66.snapshot(),m=transform(s.position,[s.scale,s.scale,s.scale],0,s.rotation),inv=CharacterFitting.invert4(m),h=(PHYSICS.radii[1]+.003)/s.scale,run=(start,delta,n)=>{let pos=tp(m,...start);const step=sub(tp(m,...delta),s.position);for(let i=0;i<n;i++)pos=resolveEllipsoid(pos,step).position;return tp(inv,...pos);};player.position=tp(m,6.8,h,0);return {wall:run([6.8,h,0],[-.04,0,0],45),front:run([0,h,5.8],[0,0,-.04],40),nearOutside:PCChallenge66.snapshot().near,side:s.sideWall};});
 assert(crossing.wall[0]>6.3,'solid glass side');assert(crossing.front[2]<4.4,'front remains open');assert.equal(crossing.nearOutside,false);
 await p.evaluate(()=>{window.oldFitCamera=updateCamera;updateCamera=()=>{const s=PCChallenge66.snapshot(),m=transform(s.position,[s.scale,s.scale,s.scale],0,s.rotation);camera=tp(m,9,2.5,6.3);target=tp(m,1,1.7,0);};});await p.waitForTimeout(500);await p.screenshot({path:path.join(out,'fit91-glass-side.png')});
 assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
 const wall=[];for(const x of [-20,-16,-12,-8]){
  await p.evaluate(x=>{updateCamera=()=>{camera=[x,1.5,-9.4];target=[-11,1.2,-13.0875];};},x);await p.waitForTimeout(200);
  wall.push(await p.evaluate(()=>{render();const pixels=new Uint8Array(10*10*4);gl.readPixels(canvas.width/2-5,canvas.height/2-5,10,10,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return [0,1,2].map(c=>{let sum=0;for(let i=c;i<pixels.length;i+=4)sum+=pixels[i];return sum/100;});}));
 }assert(wall.every(c=>c[0]>c[2]+8),'wall stays warm-colored at every camera angle: '+JSON.stringify(wall));await p.screenshot({path:path.join(out,'fit91-it-wall.png')});
 await p.evaluate(()=>{updateCamera=oldFitCamera;FarmVehicles53.visit();});await p.waitForFunction(()=>window.Farmstead65?.snapshot().ready,null,{timeout:120000});
 await p.waitForTimeout(300);const farm=await p.evaluate(()=>({home:Homestead89.snapshot(),ground:FarmSurface91.snapshot()}));
 assert.equal(farm.home.detailScale,.4);assert.equal(farm.home.surfaceHeight,.14);assert.equal(farm.ground.height,.14);assert(farm.ground.batches<20&&farm.ground.triangles<15000);
 await p.evaluate(()=>{player.position=[-22.2,.14+PHYSICS.radii[1],48.3];state.radius=1.6;state.yaw=0;updateCamera=()=>{camera=[-21.1,1.20,46.9];target=[-23.25,.64,49];};});await p.waitForTimeout(700);await p.screenshot({path:path.join(out,'fit91-character-scale.png')});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:path.join(out,'fit91-farm-mobile.png')});assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
 assert.deepEqual(errors,[]);console.log('PASS single-entry glass booth, stable IT wall at four angles, character-scale farm details, one flush ground level and mobile',crossing,wall,farm);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
