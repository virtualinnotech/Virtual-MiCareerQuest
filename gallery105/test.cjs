const {chromium}=require('playwright'),assert=require('node:assert/strict'),sharp=require('sharp'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const html=fs.readFileSync(path.join(__dirname,'../venue-frame.html'),'utf8');
const buffer=zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64'));
const len=buffer.readUInt32LE(12),j=JSON.parse(buffer.subarray(20,20+len)),bin=buffer.subarray(28+len),report=j.extras.gallery105;
assert.equal(crypto.createHash('sha256').update(bin.subarray(0,report.binLength)).digest('hex'),report.sourceGeometrySHA256,'source mesh binary is unchanged');
assert.equal(report.sourceGeometrySHA256,'23436d8f4bf00e64866cd6b5ace76a84c3d5282709855dd18750374feea10bef');
const hidden=j.nodes.slice(0,report.counts.nodes).filter(n=>n.extras?.gallery105HideVisual);
assert(hidden.length===report.hiddenVisuals);
assert(hidden.every(n=>! /Exhibit_Hall|IT_room|booth|doorleaf|stair|V8_|EventV/.test(n.name)),'no exhibit interiors, doors or stair visuals replaced');
for(const n of j.nodes.slice(report.counts.nodes)){
 assert(n.name.startsWith('Gallery105 '));
 if(n.extras.walktestCollide)assert(/steel (contact volume|footing contact)|119 .*contact|122 bay .*solid contact/.test(n.name),'new collisions limited to steel and requested portal/wall repairs');
 const a=j.accessors[j.meshes[n.mesh].primitives[0].attributes.POSITION];
 assert(a.min[0]*.3>-9&&a.max[0]*.3<8,'gallery/entrance width only');
 assert(a.min[2]*.3>=-30.33&&a.max[2]*.3<39,'gallery/entrance length only');
 assert(!/skylight|roof|curtain/i.test(n.name)||!n.extras.walktestCollide,'no roof or window barriers added');
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261012-gallery105');
  await page.waitForFunction(()=>window.Scooter100?.snapshot().ready&&characterState.player,null,{timeout:120000});
  await page.evaluate(()=>{Crowd.pause(true);state.paused=true;state.ghost=false;state.speed=2;});
  const paths=await page.evaluate(()=>{
   function walk(x,z,yaw,steps){player.position=[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.003,z];player.yaw=yaw;player.vy=0;player.grounded=true;for(let i=0;i<steps;i++)advancePlayer(1/90,{forward:true});return{p:player.position.slice(),grounded:player.grounded};}
   return{entry:walk(0,36,0,1100),gallery:walk(0,27,0,4100),hallSouth:walk(2,-18,-Math.PI/2,400),hallCenter:walk(2,0,-Math.PI/2,400),hallNorth:walk(2,18,-Math.PI/2,400),itSouth:walk(-2,-7.3,Math.PI/2,400),itNorth:walk(-2,9.25,Math.PI/2,400)};
  });
  console.log('WALKTHROUGHS',JSON.stringify(paths));
  assert(paths.entry.p[2]<25&&paths.entry.p[1]>.4,'entrance doors and stairs passable');
  assert(paths.gallery.p[2]<-20&&paths.gallery.p[1]>.4,'full gallery remains passable');
  for(const key of['hallSouth','hallCenter','hallNorth'])assert(paths[key].p[0]>5.5,key+' doorway clear');
  for(const key of['itSouth','itNorth'])assert(paths[key].p[0]<-5.5,key+' doorway clear');
  await page.evaluate(()=>{state.overview={camera:[.7,1.6,22],target:[0,4,-10]};updateCamera(0,true);state.paused=false;});
  for(const size of[{width:1440,height:1000},{width:390,height:844}]){
   await page.setViewportSize(size);await page.waitForTimeout(300);
   const shot=await page.locator('#canvas').screenshot(),{data,info}=await sharp(shot).raw().toBuffer({resolveWithObject:true}),colors=new Set();
   for(let i=0;i<data.length;i+=info.channels*47)colors.add(data.slice(i,i+3).toString('hex'));
   assert(colors.size>150,'nonblank, detailed scene at '+size.width);
   await page.screenshot({path:path.resolve(__dirname,'../../work/gallery105-final-'+size.width+'.png')});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>{state.overview={camera:[-11,5.5,46],target:[0,5.3,35]};updateCamera(0,true);});await page.waitForTimeout(300);
  await page.screenshot({path:path.resolve(__dirname,'../../work/gallery105-final-exterior.png')});
  assert.deepEqual(errors,[]);console.log('PASS source geometry preserved, only gallery visuals replaced, 7 walk routes, desktop/mobile canvas, no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
