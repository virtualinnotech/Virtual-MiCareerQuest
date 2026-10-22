const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.resolve(root,'../work/city106');
const runtime=fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8');
const digest=v=>crypto.createHash('sha256').update(v).digest('hex');
const relevant=n=>/^(Exterior_street_apron|Front_continuous_sidewalk|East_continuous_sidewalk|Front_curb_edge|East_curb_edge|City_sidewalk_)/.test(n);

async function geometryTest(){
 const {NodeIO}=await import('../../work/browser/node_modules/@gltf-transform/core/dist/index.js');
 const html=fs.readFileSync(path.join(root,'venue-frame.html'),'utf8');
 const bin=zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([\s\S]*?)<\/script>/)[1].trim(),'base64'));
 const doc=await new NodeIO().readBinary(bin),context={window:{},document:{currentScript:{src:'http://localhost/city106/runtime.js'}},location:{search:''},URL,URLSearchParams};
 vm.runInNewContext(runtime,context);const fix=context.window.City106.curbGeometry,records=[];
 for(const n of doc.getRoot().listNodes()){
  if(!relevant(n.getName())||!n.getMesh())continue;
  const m=n.getWorldMatrix();
  for(const pr of n.getMesh().listPrimitives()){
   const pos=pr.getAttribute('POSITION').getArray(),idx=pr.getIndices()?.getArray()||Uint32Array.from({length:pos.length/3},(_,i)=>i),data=new Float32Array(pos.length*2),uv=pr.getAttribute('TEXCOORD_0')?.getArray()||null;
   for(let i=0;i<pos.length/3;i++)for(let k=0;k<3;k++)data[i*6+k]=.3*(m[k]*pos[i*3]+m[4+k]*pos[i*3+1]+m[8+k]*pos[i*3+2]+m[12+k]);
   const before=digest(Buffer.from(data.buffer))+digest(Buffer.from(idx.buffer));
   const after=fix(n.getName(),n.getExtras().kind||'',data,idx,uv);
   assert.equal(digest(Buffer.from(data.buffer))+digest(Buffer.from(idx.buffer)),before,'collision/source buffers immutable');
   assert(Array.from(after.idx).every(i=>i<after.data.length/6));
   assert(Array.from(after.data).every(Number.isFinite));
   if(after.uv)assert.equal(after.uv.length,after.data.length/3);
   if(/curb_edge$/.test(n.getName()))assert.equal(after.idx,idx,'authoritative curb unchanged');
   records.push({name:n.getName(),before:{data,idx},after});
  }
 }
 function covering(mesh,axis,plane,u,x,y){
  const {data,idx}=mesh;
  for(let i=0;i<idx.length;i+=3){
   const p=[idx[i],idx[i+1],idx[i+2]].map(v=>data.subarray(v*6,v*6+3));
   if(!p.every(v=>Math.abs(v[axis]-plane)<1e-5))continue;
   const [a,b,c]=p,den=(b[1]-c[1])*(a[u]-c[u])+(c[u]-b[u])*(a[1]-c[1]);
   if(Math.abs(den)<1e-12)continue;
   const s=((b[1]-c[1])*(x-c[u])+(c[u]-b[u])*(y-c[1]))/den,t=((c[1]-a[1])*(x-c[u])+(a[u]-c[u])*(y-c[1]))/den;
   if(s>=0&&t>=0&&s+t<=1)return true;
  }return false;
 }
 let samples=0;
 for(const [axis,plane,u,lo,hi]of[[2,39.6,0,-31.5,61.05],[0,66.6,2,-36.9,34.05]]){
  for(let x=lo+.0137;x<hi;x+=.417)for(const y of[-.12,-.102,-.065,-.031]){
   const before=records.filter(r=>covering(r.before,axis,plane,u,x,y)).length,after=records.filter(r=>covering(r.after,axis,plane,u,x,y)).length;
   assert(before>=2,'fixture reproduces overlapping curb faces');assert.equal(after,1,`one curb face at ${axis}/${x}/${y}`);samples++;
  }
  for(const x of[lo-.08,hi+.08])for(const y of[-.12,-.102])assert.equal(records.filter(r=>covering(r.before,axis,plane,u,x,y)).length,records.filter(r=>covering(r.after,axis,plane,u,x,y)).length,'exposed sidewalk ends preserved');
 }
 assert.equal(records.find(r=>r.name==='Exterior_street_apron').after.idx.length,0);
 console.log('GEOMETRY',samples,'curb samples now have exactly one visible face; exposed ends and source buffers preserved');
}

(async()=>{
 await geometryTest();fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  let originalColliders;
  for(const baseline of[true,false]){
   const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
   if(baseline)await page.route('**/city106/runtime.js?*',route=>route.fulfill({contentType:'application/javascript',body:runtime+'\nCity106.curbGeometry=(name,kind,data,idx,uv)=>({data,idx,uv});'}));
   await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261013-curb110');
   await page.waitForFunction(()=>City106.snapshot().ready&&characterState.player&&Crowd.snapshot().status==='ready',null,{timeout:180000});
   await page.evaluate(()=>{state.paused=true;Crowd.pause(true);City106.setTrafficTime(5);});
   const collisionHash=digest(await page.evaluate(()=>{
    const names=new Set(venueSceneJSON.nodes.map(n=>n.name));
    return JSON.stringify(colliders.filter(c=>names.has(c.name)||c.kind==='cityFurniture').map(c=>({name:c.name,lo:c.lo,hi:c.hi,triangles:c.triangles})).sort((a,b)=>a.name.localeCompare(b.name)));
   }));
   if(baseline)originalColliders=collisionHash;else assert.equal(collisionHash,originalColliders,'authored venue and city prop collision triangles unchanged');
   const label=baseline?'before':'after',views={front:{camera:[-5,.32,40.1],target:[5,-.03,39.5]},east:{camera:[67.1,.32,8],target:[66.5,-.03,-2]},corner:{camera:[62,.35,40.4],target:[60,-.06,39.6]}};
   for(const [name,v]of Object.entries(views)){
    let first;
    for(let step=0;step<(baseline?1:8);step++){
     const delta=step*.2,axis=name==='east'?2:0,camera=[...v.camera],target=[...v.target];camera[axis]+=delta;target[axis]+=delta;
     await page.evaluate(v=>{state.overview=v;updateCamera(0,true);render();}, {camera,target});
     const shot=await page.locator('#canvas').screenshot();assert((await sharp(shot).stats()).channels.some(c=>c.stdev>10),'nonblank '+name);
     if(step===0){first=digest(shot);await page.screenshot({path:path.join(out,`curb110-${label}-${name}.png`)});}
     if(step===7){assert.notEqual(digest(shot),first,'camera movement renders new pixels');await page.screenshot({path:path.join(out,`curb110-${label}-${name}-moving.png`)});}
    }
   }
   if(!baseline){
    await page.setViewportSize({width:390,height:844});
    for(let step=0;step<4;step++){
     await page.evaluate(step=>{state.overview={camera:[-5+step*.2,.32,40.1],target:[5+step*.2,-.03,39.5]};updateCamera(0,true);render();},step);
     assert((await sharp(await page.locator('#canvas').screenshot()).stats()).channels.some(c=>c.stdev>10),'nonblank mobile');
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.join(out,'curb110-mobile.png')});
    assert.equal(await page.evaluate(()=>gl.getError()),0);
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS desktop/mobile moving curb views, canvas pixels, unchanged collisions and no browser/WebGL errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
