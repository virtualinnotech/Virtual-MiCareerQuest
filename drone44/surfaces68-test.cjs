const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=surfaces68&entry=farm');
 await p.waitForFunction(()=>window.FarmVehicles53?.snapshot().ready,null,{timeout:120000});
 const city=await p.evaluate(()=>({stats:floorSurfaces68,plane:(()=>{const m=new NetworkScene40.Mesh([1,1,1,1]).plane([0,.14,0],[2,3]);return {ys:m.v.filter((_,i)=>i%6===1),triangles:m.i.length/3};})()}));
 assert(city.stats.decorations>100,'Imported floor decorations are audited');assert.equal(city.plane.triangles,2);assert(city.plane.ys.every(y=>y===.14));
 assert(city.stats.samples.every(s=>s.y!==null),'Painted top faces remain visible');console.log('City floor samples',city.stats);
 await p.evaluate(()=>{document.getElementById('controlsPopup').classList.add('hidden');FarmVehicles53.visit();});
 await p.waitForFunction(()=>Farmstead65.snapshot().ready,null,{timeout:120000});
 const surfaces=await p.evaluate(()=>{
  const samples=[];for(const [x,z] of [[-71,20],[-44,39],[-64,42],[-22,43],[-119.2,16],[-95,4],[-47,4],[-49,48]]){
   const hit=raycast([x,.3,z],[0,-1,0],.4,o=>o.kind==='floor');samples.push({x,z,y:hit?.point[1]});
  }
  const painted=[];const original=NetworkScene40.Mesh.prototype.plane;NetworkScene40.Mesh.prototype.plane=function(p,s,m){painted.push({p,s});return original.call(this,p,s,m);};window.paintSamples68=painted;
  return samples;
 });
 assert(surfaces.every(s=>Math.abs(s.y-.14)<.00001),'Farm walking surfaces have one consistent height');
 await p.evaluate(()=>{player.position=[-44,.14+PHYSICS.radii[1]+.03,39];player.vy=0;player.grounded=false;for(let i=0;i<120;i++)advancePlayer(.016,{});});
 const feet=await p.evaluate(()=>player.position[1]-PHYSICS.radii[1]);assert(feet>=.14&&feet<.145,'Feet settle onto the tracks, not beneath them');
 await p.evaluate(()=>{updateCamera=()=>{camera=[-43.2,.22,40.3];target=[-44,.31,39];};});await p.waitForTimeout(350);await p.screenshot({path:'../work/surfaces68-low-ground.png'});
 assert(await p.evaluate(()=>{render();const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);const colors=new Set();for(let i=0;i<pixels.length;i+=256)colors.add(pixels.slice(i,i+3).join());return colors.size>80;}),'Farm canvas is nonblank');
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(250);await p.screenshot({path:'../work/surfaces68-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS flat paint geometry, imported city floors, farm heights, standing feet, desktop/mobile rendering',surfaces,feet);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
