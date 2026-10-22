const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./life111.js'),D=require('./district115.js');
async function units(){
 const {parkPaths,parkBenches}=await import('./district115/park116.mjs');
 const covers=(x,z)=>parkPaths.some(([cx,cz,w,d])=>Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2);
 for(let z=-31;z<=34;z+=.1)assert(covers(-28.2,z),'connected park spine '+z);
 for(const [x,z]of parkBenches)assert(covers(x,z),'bench rests on a paved pad');
 for(const x of[-85,-25,0,20,43,65,76])for(const bank of[-1,1]){
  const z=bank===1?D.river.z1+.3:D.river.z0-.3,p=[x,0,z+bank*-20];D.constrainWalk(p,[x,0,z]);assert(D.safeWalk(p[0],p[2]));assert(Math.abs(p[2]-z)<.5);
 }
 for(const b of D.bridges){let p=[b.x,0,b.start+1];for(let i=0;i<420;i++){const next=[p[0],0,p[2]-.08];D.constrainWalk(next,p);p=next;}assert(p[2]<b.end,'bridge remains traversable');}
 const fallen=[20,-10,-50];D.constrainWalk(fallen,fallen);assert(D.safeWalk(fallen[0],fallen[2]));
 const w={axis:2,start:0,end:30,cross:0,width:.6,offset:.16,obstacles:[]};
 const slow={id:'slow',path:w,s:4,speed:.26,direction:1,x:.16,z:4,yaw:0,moving:true};
 const fast={id:'fast',path:w,s:3.2,speed:.51,direction:1,x:.16,z:3.2,yaw:0,moving:true};
 let closest=Infinity,passes=0;
 for(let i=0;i<1800;i++)for(const a of[slow,fast]){
  const next=C.sampleWalk(w,a.s+.45),p=C.pedestrianStep(a,[slow,fast],1/60,next);a.s+=p.progress;a.x=p.x;a.z=p.z;passes+=p.passing?1:0;
  closest=Math.min(closest,Math.hypot(slow.x-fast.x,slow.z-fast.z));
 }
 assert(closest>=.289,'walkers do not overlap');assert(fast.z>slow.z+1,'fast pedestrian passes instead of following forever');assert(passes>0);
 for(const paused of[false,true]){
  const a={...fast,id:'a',s:5,x:.16,z:5,speed:.5,yaw:0,vx118:0,vz118:0,pass118:null},b={...slow,id:'b',s:7,x:.16,z:7,speed:.3,direction:-1,yaw:Math.PI,moving:!paused};
  for(let i=0;i<1200;i++)for(const p of paused?[a]:[a,b]){const next=C.sampleWalk(w,p.s+p.direction*.45),q=C.pedestrianStep(p,[a,b],1/60,next);p.s+=p.direction*q.progress;p.x=q.x;p.z=q.z;assert(Math.hypot(a.x-b.x,a.z-b.z)>.29);}
  assert(a.z>b.z+1,paused?'pass a stopped walker':'head-on walkers keep separate passing sides');
 }
 const lane={id:'test',axis:2,cross:0,edge:1.8,start:0,end:100,length:100,dir:1,junctions:[],stops:[],signal:'ns'};
 const car=(id,z)=>({id,parked:false,p:[0,-.1275,z],yaw:0,length:1.6,width:.7,lane:'test',s:z,maxSpeed:2,speed:0});
 const cars=[car('vehicle-1',5),car('vehicle-2',9),car('vehicle-3',60)],amb={x:0,z:0,yaw:0,speed:0,active:true};
 for(let i=0;i<15;i++)C.emergencyStep(cars,[lane],.05,amb);
 assert(!cars[2].yielding,'remote traffic ignores the siren');assert(cars[0].reaction118!==undefined);assert.notEqual(!!cars[0].yieldTimer,!!cars[1].yieldTimer,'individual reaction timing');assert(cars.every(v=>!v.offset115),'siren cannot move cars sideways without driving');
 const beside=car('vehicle-8',0),obstacle={...amb,x:1.1};
 for(let i=0;i<100;i++){C.emergencyStep([beside],[lane],.05,obstacle);beside.p[0]=beside.offset115;assert(!C.overlap(beside,C.ambulanceObstacle(obstacle)),'pull-over cannot enter ambulance space');}
 const report=JSON.parse(fs.readFileSync(path.join(__dirname,'report.json'))),life=report.life;
 assert(life.obstacles.length===9);for(const a of life.vehicles)for(const b of life.obstacles)assert(!C.overlap(a,b),'spawn overlaps '+b.id);
 console.log('PASS connected paths, bench pads, river containment, bridge access, pedestrian overtaking, local siren response and bus parking', {closest,passes,vehicles:life.vehicles.length});
}
async function browserTest(){
 const {chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(__dirname,'../../work/walk118');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('crash'));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-walk118');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.CityLife111?.snapshot().peopleReady,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  const ground=await page.evaluate(()=>{
   state.ghost=false;state.speed=1;
   const points=[[-28.2,-19],[-28.2,-25],[-28.2,30],[-26,8],[-5.5,-29.5],[5.5,-29.5],[45,-36.5],[65.4,-33],[0,-32.1],[-6.3,-43],[69.9,-43],[73.71,0]];
   return points.map(([x,z])=>{const support=groundSupport118(x,z);player.position=[x,(support?.point[1]??0)+PHYSICS.radii[1]-.10,z];player.grounded=true;player.vy=0;advancePlayer(1/120,{});return {x,z,surface:support?.object.name,y:support?.point[1],feet:player.position[1]-PHYSICS.radii[1]};});
  });console.log('GROUND',ground);assert(ground.every(p=>p.y!=null&&p.feet>=p.y-.002&&p.feet<p.y+.02));
  const stairs=await page.evaluate(()=>{
   const walk=(x,z,yaw,frames)=>{player.position=[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.001,z];player.yaw=yaw;player.grounded=true;player.vy=0;for(let i=0;i<frames;i++)advancePlayer(1/120,{forward:true});return [...player.position];};
   const up=walk(-2.25,-21.8,0,1800);player.yaw=Math.PI;for(let i=0;i<1800;i++)advancePlayer(1/120,{forward:true});const down=[...player.position];
   const river=walk(43,-38.3,0,600);return {up,down,river};
  });console.log('STAIRS',stairs);assert(stairs.up[2]<-29.1&&stairs.up[1]>3.3,'normal stairs ascend');assert(stairs.down[1]<.7&&stairs.down[2]>-23,'normal stairs descend');assert(stairs.river[2]>-38.55,'river edge stops movement');
  async function view(name,camera,target){await page.evaluate(({camera,target})=>{state.overview={camera,target};updateCamera(0,true);render();},{camera,target});const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,name+'.png')});}
  await view('park-path',[-28.2,.7,-17.2],[-28.2,0,-25]);
  await view('bench-pad',[-28.2,.8,16],[-26.65,.2,16]);
  await view('gallery-stairs',[.5,1.1,-23.2],[-2.25,1.3,-26]);
  await view('rear-steps',[5,.55,-32.2],[0,.1,-31.5]);
  const npc=await page.evaluate(()=>{for(let i=0;i<300;i++)CityLife111.update(.05);return CityLife111.people().map(a=>({id:a.id,y:a.position[1],floor:floorHeightAt(a.x,a.z)}));});assert(npc.every(a=>Math.abs(a.y-a.floor)<.005));
  await page.setViewportSize({width:390,height:844});await view('mobile-park',[-28.2,.7,-17.2],[-28.2,0,-25]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({ground,stairs,npc,status,errors},null,2));console.log('PASS desktop/mobile pixels, ground repair, stair traversal, river boundary and NPC ground');
 }finally{await browser.close();}
}
(async()=>{await units();if(!process.argv.includes('--unit'))await browserTest();})().catch(e=>{console.error(e);process.exitCode=1;});
