const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=scale96&challenge=network');
 await p.waitForFunction(()=>window.Network40?.snapshot().ready&&window.Drone44?.snapshot().ready,null,{timeout:120000});
 await p.waitForFunction(()=>window.AnimatedCharacters?.hasPlayer(),null,{timeout:120000});
 const dimensions=await p.evaluate(()=>{
  document.getElementById('controlsPopup')?.classList.add('hidden');
  const c=Network40.snapshot().computer;places.scale96={p:[c[0]-.65,c[1]+PHYSICS.radii[1]+.015,c[2]+.32],scaledPlayer:true,yaw:-Math.PI/2};teleport('scale96');state.firstPerson=false;state.showStaff=false;state.overview=null;
  window.camera96=updateCamera;updateCamera=()=>{const d=innerWidth<760?1.7:1;camera=add(c,[-1.3*d,.95,.55]);target=add(c,[0,.49,0]);};updateCamera();Network40.update(0);
  const old=drawBatch,parts={};drawBatch=(b,m,...args)=>{if(b.sourceMaterial)parts[b.sourceMaterial]=m;return old(b,m,...args);};try{render();}finally{drawBatch=old;}
  const m=parts.console_auv;return {laptopWidth:len(sub(tp(m,0,0,.693779),tp(m,0,0,-.727303))),towerHeight:len(sub(tp(parts.Cube1_auv,0,5.154388,0),tp(parts.Cube1_auv,0,.002568,0))),rackHeight:6*.215*Network40.snapshot().rackScale,collider:colliders.find(c=>c.name==='Network40 computer')?.hi,playerHeight:PHYSICS.radii[1]*2,atComputer:Network40.snapshot().atComputer};
 });
 assert(dimensions.laptopWidth>.16&&dimensions.laptopWidth<.19,'laptop width corresponds to a 40-47 cm laptop');assert(Math.abs(dimensions.towerHeight-dimensions.rackHeight)<.015,'diagnostic cabinet matches server racks');assert(dimensions.atComputer);assert(dimensions.towerHeight/dimensions.playerHeight<1.3);console.log(dimensions);
 for(const kind of ['network','drone']){
  if(kind==='drone')await p.evaluate(()=>{updateCamera=camera96;Drone44.visit();Network40.update(0);const s=DroneDisplay47.position;player.position=[s[0]-1.1,s[1]+PHYSICS.radii[1]+.015,s[2]-1.7];updateCamera=()=>{const d=innerWidth<760?1.65:1;camera=add(s,[.3,.95,-3.1*d]);target=add(s,[0,.42,-.8]);};});
  for(const [name,width,height]of [['desktop',1440,1000],['mobile',390,844]]){await p.setViewportSize({width,height});await p.waitForTimeout(300);await p.screenshot({path:path.resolve(__dirname,'../../work/'+kind+'-scale96-'+name+'.png')});const stats=await sharp(await p.locator('canvas').first().screenshot()).stats();assert(stats.channels[0].stdev>15,'nonblank '+kind+' '+name);}
 }
 assert(await p.evaluate(()=>{const c=document.createElement('canvas'),q=c.getContext('2d');q.font='bold 40px sans-serif';return q.measureText('DRONE INSPECTION').width<480;}),'drone sign fits texture with side margins');
 assert.deepEqual(errors,[]);console.log('PASS character-relative laptop/tower proportions, matching server racks, reachable diagnostics, readable sign, desktop/mobile canvas');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
