const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[],downloads=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/(?:farmhouse65|farm-truck65|maintenance-barn65)\.glb/.test(r.url()))downloads.push(r.url());});
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=farm65&entry=farm');
 await p.waitForFunction(()=>window.FarmVehicles53?.snapshot().ready,null,{timeout:120000});assert.equal(downloads.length,0,'Farmstead assets stay unloaded in the city');
 await p.evaluate(()=>{document.getElementById('controlsPopup').classList.add('hidden');FarmVehicles53.visit();});
 await p.waitForFunction(()=>Farmstead65.snapshot().ready,null,{timeout:120000});assert.equal(downloads.length,3);
 await p.evaluate(()=>{window.originalCamera65=updateCamera;player.position=[-49,.14+PHYSICS.radii[1],39];updateCamera=()=>{camera=[-34,12,29];target=[-46,1,47];};});
 await p.waitForTimeout(400);await p.screenshot({path:'../work/farm65/workshop.png'});
 await p.evaluate(()=>{updateCamera=()=>{camera=[-25,3.3,38];target=[-17,1.7,49];};});await p.waitForTimeout(250);await p.screenshot({path:'../work/farm65/house-preview.png'});
 await p.evaluate(()=>{updateCamera=()=>{camera=[-52.5,1.5,43];target=[-49,1.3,55];};});await p.waitForTimeout(250);await p.screenshot({path:'../work/farm65/interior.png'});
 // Drive both machines through separate workshop bays using their real physics.
 const drive=async(name,x)=>p.evaluate(({name,x})=>{Farming36.test.place(name,x,38,0);Farming36.visit(name);Farming36.enter(name);Farming36.test.controls.add('w');for(let i=0;i<250;i++)Farming36.update(.016);Farming36.test.controls.clear();const result={...Farming36.snapshot().vehicles[name]};Farming36.exit(true);return result;},{name,x});
 for(const [name,x]of [['combine',-52.55],['tractor',-45.45]]){const v=await drive(name,x);console.log(name,v);assert(v.z>44&&v.z<55,'Machinery enters its maintenance bay');}
 await p.evaluate(()=>{FarmVehicles53.test.place(-59,39.5,Math.PI/2);FarmVehicles53.visit();FarmVehicles53.enter();for(let i=0;i<120;i++)FarmVehicles53.update(.016);FarmVehicles53.test.held.add('w');for(let i=0;i<200;i++)FarmVehicles53.update(.016);FarmVehicles53.test.held.clear();});
 const car=await p.evaluate(()=>FarmVehicles53.snapshot());assert(car.x>-53&&car.health===100,'UTV passes the paddock without impact');
 await p.evaluate(()=>{FarmVehicles53.exit(true);updateCamera=()=>{camera=[-34,12,29];target=[-46,1,47];};});await p.setViewportSize({width:390,height:844});await p.waitForTimeout(250);await p.screenshot({path:'../work/farm65/mobile.png'});
 assert(await p.evaluate(()=>{render();const data=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,data);const colors=new Set();for(let i=0;i<data.length;i+=256)colors.add(data.slice(i,i+3).join());return colors.size>100;}));
 await p.evaluate(()=>{updateCamera=originalCamera65;FarmScene63.back();});assert(await p.evaluate(()=>!FarmScene63.active&&colliders.every(c=>!c.name.startsWith('Farm65'))));
 await p.evaluate(()=>FarmVehicles53.visit());await p.waitForTimeout(250);assert.equal(downloads.length,3);assert.deepEqual(errors,[]);console.log('PASS farmstead, lazy assets, machinery bays, UTV lane, mobile rendering, city separation');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
