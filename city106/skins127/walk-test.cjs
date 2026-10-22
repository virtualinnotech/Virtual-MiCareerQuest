const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
async function main(){
 const {blocks}=require('../report.json'),browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-skins127');
  await page.waitForFunction(()=>City106.snapshot().ready&&characterState.player&&window.walkSurfacesReady118,null,{timeout:180000});
  const results=await page.evaluate(plazas=>{
   state.paused=true;Crowd.pause(true);state.ghost=false;state.overview=null;state.speed=1;
   return plazas.map(plaza=>{
    const start=plaza.route[0];player.position=[start[0],floorHeightAt(...start)+PHYSICS.radii[1]+.002,start[1]];player.vy=0;player.grounded=true;
    for(const target of plaza.route.slice(1)){
     const limit=Math.ceil(Math.hypot(target[0]-player.position[0],target[1]-player.position[2])/(1.5*PLAYER_SCALE)*120)+180;
     let i=0;for(;i<limit;i++){const dx=target[0]-player.position[0],dz=target[1]-player.position[2];if(Math.hypot(dx,dz)<.09)break;player.yaw=Math.atan2(-dx,-dz);advancePlayer(1/120,{forward:true});}
     if(i===limit)return {id:plaza.id,blocked:true,target,position:[...player.position],near:colliders.filter(c=>c.lo[0]<player.position[0]+.6&&c.hi[0]>player.position[0]-.6&&c.lo[2]<player.position[2]+.6&&c.hi[2]>player.position[2]-.6).map(c=>c.name)};
    }
    return {id:plaza.id,blocked:false};
   });
  },blocks.plazas);
  fs.writeFileSync(path.resolve(__dirname,'../../../work/skins127/walking.json'),JSON.stringify(results,null,2));
  assert(results.every(r=>!r.blocked),JSON.stringify(results.filter(r=>r.blocked)));
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>gl.getError()),0);
  console.log('PASS '+results.length+' retained landscape routes with original building collisions');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
