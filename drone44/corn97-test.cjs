const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],cornRequests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.url().endsWith('/corn.glb'))cornRequests.push(r.url());});
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=20261012-corn97&challenge=drone');await p.waitForFunction(()=>window.Drone44?.snapshot().ready,null,{timeout:120000});
 await p.evaluate(()=>{document.getElementById('controlsPopup')?.classList.add('hidden');state.showStaff=false;window.camera97=updateCamera;const s=DroneDisplay47.position;updateCamera=()=>{const fit=innerWidth<760?2.3:1;camera=add(s,[.3,1.05,-3.1*fit]);target=add(s,[0,.65,-.6]);};});
 for(const [name,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
  await p.setViewportSize({width,height});await p.waitForTimeout(300);
  const result=await p.evaluate(()=>{
   const old=DroneAssets44.instances;let captured,skip=false;
   DroneAssets44.instances=(parts,matrices)=>{if(matrices.length===11){captured=matrices;if(skip)return;}return old(parts,matrices);};
   const read=()=>{render();const data=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
   try{const a=read();skip=true;const b=read();let changed=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>25)changed++;return {changed,stalks:captured.map(m=>m.slice(12,15)),drones:DroneDisplay47.poses(0),base:DroneDisplay47.position};}finally{DroneAssets44.instances=old;}
  });
  assert.equal(result.stalks.length,11);assert(result.changed>500,'corn renders into '+name+' canvas');assert(result.stalks.every(s=>Math.abs(s[1]-result.base[1]-.49)<1e-6&&s[2]>Math.max(...result.drones.map(d=>d.position[2]))),'stalks rooted in tabletop planter behind every drone');
  await p.waitForTimeout(100);await p.screenshot({path:path.resolve(__dirname,'../../work/corn97-'+name+'.png')});
 }
 assert.equal(cornRequests.length,1,'existing corn download is reused');
 const motion=await p.evaluate(()=>DroneDisplay47.poses(0).every((p,i)=>p.position[1]!==DroneDisplay47.poses(2)[i].position[1]));assert(motion,'all seven drones still hover');
 await p.evaluate(()=>{updateCamera=camera97;Drone44.enter();});await p.getByRole('button',{name:'Launch drone',exact:true}).click();assert(await p.evaluate(()=>Drone44.active&&Drone44.snapshot().plants===5984));await p.evaluate(()=>Drone44.exit());
 assert.deepEqual(errors,[]);console.log('PASS 11 corn stalks behind 7 hovering drones, desktop/mobile pixel checks, shared asset download, challenge entry/exit');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
