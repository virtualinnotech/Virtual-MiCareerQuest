const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),sharp=require('sharp');
const report=require('../report.json'),out=path.resolve(__dirname,'../../../work/blocks126');fs.mkdirSync(out,{recursive:true});
async function main(){
 const {clearance,overlaps,rectPoly,segmentDistance,segmentClear}=await import('./layout.mjs');
 const {blocks,buildings}=report,placements=buildings.placements,props=blocks.plazas.flatMap(p=>p.props);
 assert(blocks.counts.addedBuildings>=15&&blocks.counts.addedBuildings<=30,'modest density increase');assert(blocks.counts.tallerBuildings>=35);
 assert.equal(placements.length,395+blocks.counts.addedBuildings);
 for(const p of blocks.upgraded)assert(p.after>p.before*1.3&&p.after<p.before*2.05);
 for(const p of placements){assert(p.footprint126.length>=3);assert(p.size.every(Number.isFinite));}
 for(const p of placements.filter(p=>p.infill126))for(const q of placements)if(p!==q)assert(!overlaps(p.footprint126,q.footprint126,.15),'infill intersects '+q.name);
 assert(blocks.plazas.length>=20);for(const type of['shop','bench','bin','planter','tree'])assert(props.filter(p=>p.type===type).length>=3,'missing '+type);
 for(const plaza of blocks.plazas){
  assert(plaza.route.length>2);for(const p of props)for(let i=1;i<plaza.route.length;i++)assert(segmentDistance(p.p,plaza.route[i-1],plaza.route[i])>(p.type==='tree'?.12:p.radius)+.50,'blocked walkway '+p.name+' / '+plaza.id);
  for(const prop of plaza.props)for(const b of placements)assert(clearance(prop.p,b.footprint126)>prop.radius+.1,'prop inside building '+prop.name);
 }
 console.log('PASS',blocks.counts,'uniform model proportions, collision silhouettes and clear pedestrian routes');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1','{"seen":true}');});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-blocks126');
  await page.waitForFunction(()=>City106.snapshot().ready&&characterState.player&&window.walkSurfacesReady118,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);state.ghost=false;state.overview=null;state.speed=1;});
  const contacts=await page.evaluate(retired=>({retired:colliders.filter(c=>retired.includes(c.name)).map(c=>c.name),newCount:colliders.filter(c=>c.name.endsWith(' footprint126')).length,blocks:City106.snapshot().blocks}),blocks.retiredColliders);
  assert.deepEqual(contacts.retired,[]);assert.equal(contacts.newCount,placements.length);
  const walkResults=await page.evaluate(plazas=>{
   const result=[];
   for(const plaza of plazas){
    state.overview=null;const start=plaza.route[0];player.position=[start[0],floorHeightAt(start[0],start[1])+PHYSICS.radii[1]+.002,start[1]];player.vy=0;player.grounded=true;
    let blocked=null;
    for(const target of plaza.route.slice(1)){
     const limit=Math.ceil(Math.hypot(target[0]-player.position[0],target[1]-player.position[2])/(1.5*PLAYER_SCALE)*120)+180;
     let i=0;for(;i<limit;i++){const dx=target[0]-player.position[0],dz=target[1]-player.position[2];if(Math.hypot(dx,dz)<.09)break;player.yaw=Math.atan2(-dx,-dz);advancePlayer(1/120,{forward:true});}
     if(i===limit){blocked={target,position:[...player.position],near:colliders.filter(c=>c.lo[0]<player.position[0]+.6&&c.hi[0]>player.position[0]-.6&&c.lo[2]<player.position[2]+.6&&c.hi[2]>player.position[2]-.6).map(c=>c.name)};break;}
    }result.push({id:plaza.id,blocked,position:[...player.position]});
   }return result;
  },blocks.plazas);
  fs.writeFileSync(path.join(out,'walking.json'),JSON.stringify(walkResults,null,2));
  assert(walkResults.every(r=>!r.blocked),'walkway collision: '+JSON.stringify(walkResults.filter(r=>r.blocked)));
  console.log('PASS all '+walkResults.length+' courtyard routes traversed using player collision physics');
  const edges=placements.flatMap(b=>b.footprint126.map((a,i)=>{const z=b.footprint126[(i+1)%b.footprint126.length],dx=z[0]-a[0],dz=z[1]-a[1],length=Math.hypot(dx,dz),mid=[(a[0]+z[0])/2,(a[1]+z[1])/2],normal=[dz/length,-dx/length];return {mid,normal,length,diagonal:Math.abs(dx)>.3&&Math.abs(dz)>.3};})).filter(e=>e.diagonal&&e.length>2&&placements.every(b=>clearance([e.mid[0]+e.normal[0]*.65,e.mid[1]+e.normal[1]*.65],b.footprint126)>.5)).slice(0,8);
  const walls=await page.evaluate(edges=>edges.map(e=>{const start=[e.mid[0]+e.normal[0]*.65,e.mid[1]+e.normal[1]*.65];player.position=[start[0],floorHeightAt(...start)+PHYSICS.radii[1]+.002,start[1]];player.vy=0;player.grounded=true;player.yaw=Math.atan2(e.normal[0],e.normal[1]);for(let i=0;i<300;i++)advancePlayer(1/120,{forward:true,fast:true});return (player.position[0]-e.mid[0])*e.normal[0]+(player.position[2]-e.mid[1])*e.normal[1];}),edges);
  assert(walls.length>=4&&walls.every(d=>d>.1),'diagonal building walls remain solid');
  const selected=blocks.plazas.filter(p=>p.props.some(q=>q.type==='shop')).slice(0,3);
  function shopCamera(p){const shop=p.props.find(q=>q.type==='shop'),s=shop.p;
   const options=p.cells.filter(q=>{const d=Math.hypot(q[0]-s[0],q[1]-s[1]),front=(q[0]-s[0])*Math.sin(shop.yaw)+(q[1]-s[1])*Math.cos(shop.yaw);return d>2.3&&d<6&&front>d*.4&&segmentClear(q,s,(v,r)=>placements.every(b=>clearance(v,b.footprint126)>r),.08);}).sort((a,b)=>Math.abs(Math.hypot(a[0]-s[0],a[1]-s[1])-3.6)-Math.abs(Math.hypot(b[0]-s[0],b[1]-s[1])-3.6));
   assert(options.length,'shop has an unobstructed street-level view');return [options[0][0],1.25,options[0][1]];
  }
  async function view(name,camera,target){await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});const png=await page.locator('#canvas').screenshot(),s=await sharp(png).stats();assert(s.channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,name+'.png')});}
  for(const p of selected){const shop=p.props.find(q=>q.type==='shop'),s=shop.p;await view('plaza-'+p.id,shopCamera(p),[s[0],.7,s[1]]);}
  await view('river-skyline',[5,1.3,-35],[12,5,-76]);
  const p=selected[0],s=p.props.find(q=>q.type==='shop');await view('plaza-aerial',[s.p[0]+4,14,s.p[1]+8],[s.p[0],0,s.p[1]]);
  const before=await page.locator('#canvas').screenshot();await page.evaluate(()=>{state.overview.camera[0]+=1;updateCamera(0,true);render();});assert(!before.equals(await page.locator('#canvas').screenshot()));
  await page.setViewportSize({width:390,height:844});await view('mobile-plaza',shopCamera(p),[s.p[0],.8,s.p[1]]);assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>gl.getError()),0);assert(!await page.evaluate(()=>gl.isContextLost()));
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({counts:blocks.counts,contacts,walkResults,walls,errors},null,2));
  console.log('PASS desktop/mobile screenshots, moving canvas, collision updates and no JS/WebGL errors');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
