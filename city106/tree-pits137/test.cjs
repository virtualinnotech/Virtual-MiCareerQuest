const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),core=require('./core.js');
const root=path.resolve(__dirname,'../..'),out=path.resolve(root,'../work/tree-pits137');
fs.mkdirSync(out,{recursive:true});
function floor(y=0){return {data:new Float32Array([-1,y,-1,0,1,0,1,y,-1,0,1,0,1,y,1,0,1,0,-1,y,1,0,1,0]),idx:new Uint32Array([0,2,1,0,3,2]),uv:new Float32Array([0,0,1,0,1,1,0,1])};}
function area(g){let sum=0;for(let i=0;i<g.idx.length;i+=3){const[a,b,c]=Array.from(g.idx.slice(i,i+3),k=>Array.from(g.data.slice(k*6,k*6+3)));sum+=Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))/2;}return sum;}
const pits=[{x0:-.3,x1:.3,z0:-.3,z1:.3,y:0},{x0:.5,x1:.8,z0:.5,z1:.8,y:0}],g=floor(),cut=core.cut(g.data,g.idx,g.uv,pits);
assert(Math.abs(area(cut)-(4-.36-.09))<1e-6,'subtract exact pit areas, including split triangles');
assert.equal(cut.uv.length,cut.data.length/3);assert([...cut.data,...cut.uv].every(Number.isFinite));
for(const i of new Set(cut.idx)){assert(Math.abs(cut.uv[i*2]-(cut.data[i*6]+1)/2)<1e-6);assert(Math.abs(cut.uv[i*2+1]-(cut.data[i*6+2]+1)/2)<1e-6);}
const deep=floor(-.1);assert.strictEqual(core.cut(deep.data,deep.idx,deep.uv,pits).data,deep.data,'deeper foundations remain');
const vertical={...floor(),data:new Float32Array([-1,-1,0,0,0,1,1,-1,0,0,0,1,1,1,0,0,0,1,-1,1,0,0,0,1])};assert.strictEqual(core.cut(vertical.data,vertical.idx,vertical.uv,pits).data,vertical.data,'vertical curb faces remain');
const buffer=fs.readFileSync(path.join(root,'city106/city.glb')),j=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12))),report=j.extras.assets130.treePits137;
assert(report.pits.length>500);assert.equal(report.removedLegacyGrates,6);assert(j.extras.hidden.includes('Exterior44_curb_tree_grate'));
for(const p of report.pits){
 const bed=j.nodes.find(n=>n.extras?.treePit137?.tree===p.tree),tree=j.nodes.find(n=>n.name===p.tree);assert(bed&&tree);
 assert(Math.abs((p.x0+p.x1)/2-(p.rootBounds.lo[0]+p.rootBounds.hi[0])/2)<1e-6);assert(Math.abs((p.z0+p.z1)/2-(p.rootBounds.lo[2]+p.rootBounds.hi[2])/2)<1e-6);
 assert.equal(bed.translation[1],p.y);assert(!bed.extras.collider107);assert(j.meshes[bed.mesh].name.startsWith('Tree137 slotted grate'));
 assert(p.opening.hx>=(p.rootBounds.hi[0]-p.rootBounds.lo[0])/2+.005&&p.opening.hz>=(p.rootBounds.hi[2]-p.rootBounds.lo[2])/2+.005,'all trunks clear the grate opening');
 assert(p.x1-p.x0>=.239&&p.z1-p.z0>=.239);assert(p.x1-p.x0<=.841&&p.z1-p.z0<=.841);
 if(p.tree.startsWith('Exterior44_street_tree_'))assert(p.z1<=39.56501,'original curbside grate stays behind the curb');
 const materials=j.meshes[bed.mesh].primitives.map(pr=>j.materials[pr.material]);assert(materials.some(m=>m.name==='Tree137 dark soil and bark mulch'&&m.normalTexture));assert(materials.every(m=>!m.emissiveFactor||m.emissiveFactor.every(v=>v===0)));
}
console.log('PASS exact recess clipping, UV continuity, retained curbs/foundations, fitted grates, soil normals and non-emissive materials',report.pits.length,'pits');
const border=j.extras.assets130.parkBorder137;assert(border&&border.plants>=30);assert.equal(border.beds.length,3);
assert(border.base.bottom<-.0765&&border.base.top>.24,'skirt overlaps ground and wall');
assert(border.beds.every(b=>b.z1< -13.2),'planting stays outside the room entrance');
const slab=border.colliders.find(c=>c.name.endsWith('solid foundation'));assert(slab.p[1]+slab.size[1]/2<.24,'original interior floor remains visible');
for(const n of j.nodes.filter(n=>n.extras?.parkBorder137))assert(n.translation?.every(Number.isFinite));
for(const n of j.nodes.filter(n=>n.name.startsWith('Park137 planted room border'))){
 const soil=j.meshes[n.mesh].primitives.find(p=>j.materials[p.material].name==='Tree137 dark soil and bark mulch'),a=j.accessors[soil.attributes.POSITION],size=n.extras.collider107.size;
 assert(a.max[0]-a.min[0]<size[0]-.10&&a.max[2]-a.min[2]<size[2]-.10,'soil stays inside the stone edging without coplanar faces');
}
console.log('PASS solid annex base, three planted exterior borders and preserved interior/entrance');
if(process.argv.includes('--unit'))process.exit(0);
const {chromium}=require('playwright'),sharp=require('sharp');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261017-treepits137&time=night');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.AnimatedCharacters?.snapshot().status==='ready'&&window.Network40?.snapshot().ready,null,{timeout:180000});
  assert(!(await page.evaluate(()=>CityLighting131.snapshot().isDay)));
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  const samples=[['front',report.pits.find(p=>p.tree==='Exterior44_street_tree_0_detailed')],['avenue',report.pits.find(p=>p.x0>64&&p.x1<67&&p.z0>0&&p.z1<24)],['riverwalk',report.pits.find(p=>p.z0< -30&&p.z1> -37&&p.x0>10&&p.x1<50)]];
  assert(samples.every(s=>s[1]),'representative locations exist');
  for(const [name,p]of samples)for(const time of[900,2100]){
   const x=(p.x0+p.x1)/2,z=(p.z0+p.z1)/2;
   await page.evaluate(({x,y,z,time,name})=>{CityLighting131.test.setTime(time);state.overview={camera:[x+(name==='avenue'?-.75:.9),y+.85,z+1.05],target:[x,y+.03,z]};updateCamera(0,true);render();},{x,y:p.y,z,time,name});
   const image=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'-'+time+'.png'),image);assert((await sharp(image).stats()).channels.some(c=>c.stdev>10));
   if(name==='front'&&time===900){
    for(let i=1;i<=3;i++){await page.evaluate(i=>{state.overview.camera[0]+=.025;updateCamera(0,true);render();},i);await page.locator('#canvas').screenshot({path:path.join(out,'front-motion-'+i+'.png')});}
   }
  }
  for(const time of[900,2100])for(const[name,camera,target]of[
   ['room-border',[-23,.85,-22],[-18,.4,-17]],
   ['room-low',[-18,.065,-21],[-18,.15,-18.8]],
   ['room-side',[-23,.16,-16],[-20.8,.22,-16]],
   ['room-interior',[-18,1.12,-12.35],[-18,.7,-16]]
  ]){
   await page.evaluate(({time,camera,target})=>{CityLighting131.test.setTime(time);state.overview={camera,target};updateCamera(0,true);render();},{time,camera,target});
   const image=await page.locator('#canvas').screenshot();fs.writeFileSync(path.join(out,name+'-'+time+'.png'),image);assert((await sharp(image).stats()).channels.some(c=>c.stdev>10));
  }
  await page.setViewportSize({width:390,height:844});
  const p=samples[0][1],x=(p.x0+p.x1)/2,z=(p.z0+p.z1)/2;
  for(const time of[900,2100]){
   await page.evaluate(({x,y,z,time})=>{CityLighting131.test.setTime(time);state.overview={camera:[x+.75,y+.9,z+1.15],target:[x,y+.04,z]};updateCamera(0,true);render();},{x,y:p.y,z,time});
   await page.locator('#canvas').screenshot({path:path.join(out,'mobile-'+time+'.png')});
  }
  await page.evaluate(()=>{CityLighting131.test.setTime(2100);state.overview={camera:[-23,1.05,-23.5],target:[-18,.35,-17]};updateCamera(0,true);render();});await page.locator('#canvas').screenshot({path:path.join(out,'mobile-room-night.png')});
  const status=await page.evaluate(()=>({gl:gl.getError(),lost:gl.isContextLost(),overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(status.gl,0);assert(!status.lost&&!status.overflow);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({pits:report.pits.length,samples,status,errors},null,2));console.log('PASS night/day desktop/mobile tree pits, camera movement, clean WebGL',status);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
