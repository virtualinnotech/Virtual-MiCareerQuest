const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');

async function main(){
 const html=fs.readFileSync(path.join(__dirname,'../venue-frame.html'),'utf8');
 const glb=zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64'));
 const size=glb.readUInt32LE(12),j=JSON.parse(glb.subarray(20,20+size)),bin=glb.subarray(28+size),r=j.extras.gallery105;
 assert.equal(r.version,124);
 const old=j.nodes.filter(n=>/^MiCareerQuest_banner_/.test(n.name)&&n.mesh!==undefined);
 assert.equal(old.length,21);assert(old.every(n=>n.extras.gallery105HideVisual),'old banner, lettering, rods and cables retired');
 const sign=j.nodes.filter(n=>/^Gallery105 124 volunteer wall sign/.test(n.name));
 assert.equal(sign.length,3);assert(sign.every(n=>!n.extras.walktestCollide),'wall sign never blocks visitors');
 const logo=sign.find(n=>n.name.endsWith(' logo')),primitive=j.meshes[logo.mesh].primitives[0];
 const material=j.materials[primitive.material],image=j.images[j.textures[material.pbrMetallicRoughness.baseColorTexture.index].source];
 const view=j.bufferViews[image.bufferView],actual=bin.subarray(view.byteOffset,view.byteOffset+view.byteLength);
 const header=html.match(/<img\b[^>]*\balt="MiCareerQuest"[^>]*>/)[0];
 const supplied=Buffer.from(header.match(/src="data:image\/png;base64,([^"]+)"/)[1],'base64');
 assert(actual.equals(supplied),'exact supplied artwork, not a redrawn approximation');
 const accessor=j.accessors[primitive.attributes.POSITION],lo=accessor.min.map(v=>v*.3),hi=accessor.max.map(v=>v*.3);
 assert(Math.abs((hi[2]-lo[2])/Math.hypot(hi[0]-lo[0],hi[1]-lo[1])-904/178)<1e-5,'unstretched artwork');
 assert(Math.abs((hi[2]+lo[2])/2-24.6)<1e-5,'centered over volunteer tables');
 assert(lo[1]>1.3&&hi[1]<2.8&&lo[2]>20.1&&hi[2]<29,'below balcony and clear of volunteers and doorways');
 const uvAccessor=j.accessors[primitive.attributes.TEXCOORD_0],uvView=j.bufferViews[uvAccessor.bufferView];
 const uvBytes=bin.subarray(uvView.byteOffset+(uvAccessor.byteOffset||0));
 assert.deepEqual(Array.from({length:8},(_,i)=>uvBytes.readFloatLE(i*4)),[0,1,1,1,1,0,0,0],'upright, left-to-right print');
 console.log('PASS authentic logo bytes, original aspect, wall placement, retired hanging hardware and noncolliding sign');
 if(process.argv.includes('--unit'))return;
 const {chromium}=require('playwright'),sharp=require('sharp'),out=path.resolve(__dirname,'../../work/sign124');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('crash'));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261015-sign124');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&characterState.player&&window.walkSurfacesReady118,null,{timeout:180000});
  await page.evaluate(async()=>{await EventFlow22.load();state.paused=true;Crowd.pause(true);state.ghost=false;state.speed=1;});
  async function view(name,camera,target){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();},{camera,target});
   const shot=await page.locator('#canvas').screenshot(),stats=await sharp(shot).stats();assert(stats.channels.some(c=>c.stdev>20),'nonblank '+name);
   await page.screenshot({path:path.join(out,name+'.png')});return shot;
  }
  const front=await view('volunteer-sign',[-2.8,1.55,24.6],[3.7,1.6,24.6]);
  const background=await sharp(await sharp(front).extract({left:350,top:359,width:90,height:12}).toBuffer()).stats();
  assert(background.channels.slice(0,3).every(c=>c.mean>180),'transparent PNG background reveals the white sign');
  await view('volunteer-sign-approach',[-.4,1.35,31],[3.7,1.65,24.6]);
  await view('rear-glass-clear',[0,1.35,-20],[0,5.2,-30.2]);
  const runtime=await page.evaluate(()=>({oldColliders:colliders.filter(c=>/^MiCareerQuest_banner_/.test(c.name)).length,staff:EventFlow22.forInteraction().filter(a=>a.kind==='checkInVolunteer').length}));
  assert.equal(runtime.oldColliders,0);assert.equal(runtime.staff,6);
  await page.evaluate(()=>{state.overview=null;player.position=[0,.601,28];player.yaw=0;updateCamera(0,true);render();});
  const before=await page.locator('#canvas').screenshot();
  await page.evaluate(()=>{for(let i=0;i<160;i++)advancePlayer(1/120,{forward:true});updateCamera(0,true);render();});
  assert(!before.equals(await page.locator('#canvas').screenshot()),'walking still changes the canvas');
  await page.setViewportSize({width:390,height:844});
  await view('mobile-volunteer-sign',[0,1.35,33],[3.7,1.65,25]);
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({runtime,status,errors},null,2));
  console.log('PASS desktop/mobile rendering, clear rear glass, six volunteers, moving canvas and no WebGL/JS errors');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
