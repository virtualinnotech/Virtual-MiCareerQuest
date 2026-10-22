import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {createRequire} from 'node:module';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import * as T from '../pc66/vendor/three/three.core.js';
import {addDistrict} from './district115/build.mjs';
import {createParkPathGeometry,pathTop} from './district115/park116.mjs';

const require=createRequire(import.meta.url),D=require('./district115.js');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const html=fs.readFileSync(new URL('../venue-frame.html',import.meta.url),'utf8');
const original=await io.readBinary(zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64')));
function worldBounds(n){
 const b=new T.Box3(),m=new T.Matrix4().fromArray(n.getWorldMatrix()).premultiply(new T.Matrix4().makeScale(.3,.3,.3));
 for(const p of n.getMesh().listPrimitives()){
  const a=p.getAttribute('POSITION');for(let i=0;i<a.getCount();i++)b.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(m));
 }
 return {lo:b.min.toArray(),hi:b.max.toArray()};
}
function dataOf(g){
 const data=new Float32Array(g.attributes.position.count*6);
 for(let i=0;i<g.attributes.position.count;i++){data.set(g.attributes.position.array.subarray(i*3,i*3+3),i*6);data.set(g.attributes.normal.array.subarray(i*3,i*3+3),i*6+3);}
 return {data,idx:g.index.array,uv:g.attributes.uv?.array};
}
function rayHits(g,origin,direction){
 const ray=new T.Ray(new T.Vector3(...origin),new T.Vector3(...direction)),out=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),p=new T.Vector3();
 for(let i=0;i<g.idx.length;i+=3){a.fromArray(g.data,g.idx[i]*6);b.fromArray(g.data,g.idx[i+1]*6);c.fromArray(g.data,g.idx[i+2]*6);if(ray.intersectTriangle(a,b,c,false,p))out.push(p.clone());}
 return out;
}

const shrubs=original.getRoot().listNodes().filter(n=>n.getName()==='Exterior44_shrub');
const planterSources=original.getRoot().listNodes().filter(n=>n.getName()==='Exterior44_shrub_bed');
assert.equal(shrubs.length,50);assert.equal(planterSources.length,10);
assert(shrubs.every(n=>D.remove(n.getName())));
assert(planterSources.every(n=>!D.remove(n.getName())),'tan planter bodies remain');
for(const n of planterSources){const {lo,hi}=worldBounds(n);assert(Math.abs(hi[0]-lo[0]-3.15)<1e-5);assert(Math.abs(hi[1]-.195)<1e-5);}

let railProbes=0;
for(const z of[-65.8,-62.1,-38.7,-37.29,-36.66,-34.7]){
 const raw=dataOf(new T.BoxGeometry(170,.5,.03).translate(-6,.25,z)),cut=D.geometry('Riverfront_black_railing_top_rail','blueBridgeBankConnection',raw.data,raw.idx,raw.uv);
 for(const b of D.bridges){
  const half=D.width(b,Math.max(b.end,Math.min(b.start,z)))/2;
  for(const side of[-1,0,1]){assert.equal(rayHits(cut,[b.x+side*(half-.2),.25,z+1],[0,0,-1]).length,0,`${b.id} approach clear at ${z}`);railProbes++;}
  for(const side of[-1,1]){assert(rayHits(cut,[b.x+side*(half+.3),.25,z+1],[0,0,-1]).length>0,`${b.id} adjacent bank retained at ${z}`);railProbes++;}
 }
 assert.equal(cut.uv.length,cut.data.length/3);assert([...cut.data,...cut.uv].every(Number.isFinite));
 // UVs interpolate at the new cut edges rather than restarting on each segment.
 for(let i=0;i<cut.data.length/6;i++)if(Math.abs(cut.data[i*6+5])>.99)assert(Math.abs(Math.abs(cut.uv[i*2]-.5)-Math.abs((cut.data[i*6]+6)/170))<1e-5);
}
for(const b of D.bridges){assert(D.safeWalk(b.x,-50));assert(!D.safeWalk(b.x+D.width(b,-50)/2+.3,-50));}
const edge=[0,0,-39.8];D.constrainWalk(edge,[0,0,-38.4]);assert(edge[2]>D.river.z1,'water-bank walking protection remains');
const originalRail=original.getRoot().listNodes().find(n=>n.getName()==='Riverfront_black_railing_top_rail_before_bridge_opening');
const rb=worldBounds(originalRail),rawRail=dataOf(new T.BoxGeometry(rb.hi[0]-rb.lo[0],rb.hi[1]-rb.lo[1],rb.hi[2]-rb.lo[2]).translate(...rb.lo.map((v,i)=>(v+rb.hi[i])/2)));
const trimmed=D.geometry(originalRail.getName(),'blueBridgeBankConnection',rawRail.data,rawRail.idx,rawRail.uv);
assert.equal(rayHits(trimmed,[-6.3,.425,-36],[0,0,-1]).length,0);assert(rayHits(trimmed,[-8,.425,-36],[0,0,-1]).length>0);

const path=dataOf(createParkPathGeometry()),corner=D.parkCorner;
for(let x=corner.x0+.13;x<corner.x1;x+=.37)for(let z=corner.z0+.11;z<corner.z1;z+=.23){
 const hits=rayHits(path,[x,1,z],[0,-1,0]);assert.equal(hits.length,1);assert(Math.abs(hits[0].y-pathTop)<1e-6);
}
for(const name of['Riverfront_sidewalk_promenade','Riverfront_building_apron']){
 const n=original.getRoot().listNodes().find(n=>n.getName()===name),{lo,hi}=worldBounds(n),g=dataOf(new T.BoxGeometry(...hi.map((v,i)=>v-lo[i])).translate(...lo.map((v,i)=>(v+hi[i])/2)));
 const cut=D.geometry(name,'',g.data,g.idx,g.uv);
 assert.equal(rayHits(cut,[-25,1,-31.5],[0,-1,0]).length,0,`${name} removed beneath corner`);
 assert(rayHits(cut,[10,1,-31.5],[0,-1,0]).length>0,`${name} preserved outside corner`);
}

// Reuse the existing pre-district scene as a fixture; the build stays in memory.
// No city assets or reports are written by this test.
const doc=await io.read(new URL('./city.glb',import.meta.url).pathname),scene=doc.getRoot().listScenes()[0];
const avenueMenu=worldBounds(scene.listChildren().find(n=>n.getName()==='City111 menus 36'));
const avenuePlanter=worldBounds(scene.listChildren().find(n=>n.getName()==='City107 planters 39'));
assert((avenueMenu.lo[0]-avenuePlanter.hi[0])/.3>.32,'avenue menu leaves a character-width route around the curb planter');
for(const n of [...scene.listChildren()])if(n.getName().startsWith('District115 '))n.dispose();
const existingTrees=scene.listChildren().filter(n=>n.getExtras().tree||n.getExtras().detail111==='trees');
// A rebuilt fixture already has the old grates removed. Keep one regression
// fixture so this check still exercises removal after the parent rebuilds.
if(!scene.listChildren().some(n=>n.getExtras().detail109==='treeGrates'))scene.addChild(doc.createNode('City109 treeGrates regression fixture').setMesh(doc.getRoot().listMeshes().find(m=>m.getName()==='City109 cast iron tree grate')).setTranslation(existingTrees[0].getTranslation()).setExtras({detail109:'treeGrates'}));
const existingGrates=scene.listChildren().filter(n=>n.getExtras().detail109==='treeGrates').length;
const buffer=doc.createBuffer('landscaping test');
const geo=(g,m)=>({g,m});
const box=(p,size,m)=>geo(new T.BoxGeometry(...size).translate(...p),m);
function rod(a,b,r0,r1,m,sides=7){
 const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av),g=new T.CylinderGeometry(r1,r0,d.length(),sides);
 g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());return geo(g,m);
}
function mesh(name,parts){
 const out=doc.createMesh(name),groups=new Map();
 for(const {g,m} of parts){if(!groups.has(m))groups.set(m,[]);groups.get(m).push(g);}
 for(const [m,gs] of groups){
  const arrays={position:[],normal:[],uv:[]},indices=[];let offset=0;
  for(const g of gs){for(const k of Object.keys(arrays))arrays[k].push(...g.attributes[k].array);for(const i of g.index?.array||Array.from({length:g.attributes.position.count},(_,i)=>i))indices.push(i+offset);offset+=g.attributes.position.count;}
  const a=(type,array)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(array);
  out.addPrimitive(doc.createPrimitive().setMaterial(m).setAttribute('POSITION',a('VEC3',new Float32Array(arrays.position))).setAttribute('NORMAL',a('VEC3',new Float32Array(arrays.normal))).setAttribute('TEXCOORD_0',a('VEC2',new Float32Array(arrays.uv))).setIndices(a('SCALAR',new Uint32Array(indices))));
 }
 return out;
}
const texture=async(name,bytes)=>doc.createTexture(name).setImage(bytes).setMimeType('image/png');
function material(name,color,tex=null,metal=0,rough=.8){const m=doc.createMaterial(name).setBaseColorFactor(color).setMetallicFactor(metal).setRoughnessFactor(rough).setDoubleSided(true);if(tex)m.setBaseColorTexture(tex);return m;}
const district=await addDistrict({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture});
assert.equal(district.counts.replacedShrubs,50);assert.equal(district.counts.refreshedPlanters,10);
const replacements=scene.listChildren().filter(n=>n.getExtras().planterShrub115);
assert.equal(replacements.length,50);
assert(replacements.every(n=>n.getMesh().getName()==='City107 branching leafy shrub'&&n.getMesh().listPrimitives().some(p=>p.getMaterial().getAlphaMode()==='MASK'&&p.getMaterial().getBaseColorTexture())));
const trees=scene.listChildren().filter(n=>n.getExtras().tree||n.getExtras().detail111==='trees'),beds=scene.listChildren().filter(n=>n.getExtras().soilBed115);
assert.equal(beds.length,trees.length);assert.equal(beds.length,district.counts.treeBeds);
assert(existingGrates>0);assert.equal(district.counts.replacedTreeGrates,existingGrates);
assert(!scene.listChildren().some(n=>n.getExtras().detail109==='treeGrates'),'square tree grates no longer cover circular soil');
for(const tree of trees){
 const matches=beds.filter(b=>b.getExtras().soilBed115.tree===tree.getName());assert.equal(matches.length,1,tree.getName());
 const bed=matches[0],p=tree.getTranslation(),q=bed.getTranslation();assert.equal(q[0],p[0]);assert.equal(q[2],p[2]);assert(q[1]>=p[1]);assert.equal(bed.getScale()[0],bed.getScale()[2]);assert(!bed.getExtras().collider107,'soil does not add a walking obstacle');
 if(tree.getExtras().detail111==='trees'){assert(bed.getExtras().soilBed115.radius<=.175001);assert(q[1]>.195,'City111 soil visible above raised planter');}
 if(tree.getName().startsWith('Exterior44_river_new_tree_'))assert(q[1]>.282,'original planter tree soil is not buried');
}
assert.equal(existingTrees.filter(n=>n.getExtras().detail111==='trees').length,5);
const red=scene.listChildren().filter(n=>n.getExtras().riverwalkTree115);
assert(red.length>=5);assert.equal(red.length,district.counts.redRiverwalkTrees);
assert(red.every(n=>n.getMesh().getName()==='District115 tree'&&n.getTranslation()[2]===-31.35&&!D.bridgeAt(n.getTranslation()[0],n.getTranslation()[2])));
assert(red.every(n=>Math.abs(n.getTranslation()[2]+34.2)>1.15+.16+.35),'new trees and beds leave the river movement band clear');
for(const b of D.bridges.filter(b=>!b.foot)){
 const span=D.railingSpan(b),rails=scene.listChildren().filter(n=>n.getName().startsWith('District115 '+b.id+' guardrail'));
 assert(rails.length>40);for(const n of rails){const z=n.getTranslation()[2],half=n.getExtras().collider107.size[2]/2;assert(z+half<=span.start+1e-9&&z-half>=span.end-1e-9);}
 assert(span.start>D.river.z1&&span.end<D.river.z0,'bank-side protection extends onto dry land');
}
assert(district.counts.restoredBridgeMembers>500,'original pedestrian bridge structure restored');
assert(scene.listChildren().some(n=>/riverwalk guardrail/.test(n.getName())));
console.log('PASS landscaping source and in-memory build',JSON.stringify({railProbes,originalTrees:existingTrees.length,city111Trees:5,...district.counts}));

if(process.argv.includes('--browser')){
 const {chromium}=await import('../../work/browser/node_modules/playwright/index.mjs');
 const sharp=(await import('../../work/browser/node_modules/sharp/dist/index.cjs')).default;
 // Route only this test page to the in-memory scene, leaving the parent's assets intact.
 doc.getRoot().setExtras({...doc.getRoot().getExtras(),district115:district});
 for(const a of doc.getRoot().listAccessors())a.setBuffer(buffer);
 for(const b of doc.getRoot().listBuffers())if(b!==buffer)b.dispose();
 const bytes=await io.writeBinary(doc),gzip=zlib.gzipSync(bytes),browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/city106/city.glb*',route=>route.fulfill({status:200,contentType:'application/octet-stream',body:route.request().url().includes('.gz')?gzip:Buffer.from(bytes)}));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto(process.env.LANDSCAPE_TEST_URL||'http://127.0.0.1:8014/venue-frame.html');
  await page.waitForFunction(()=>window.City106?.snapshot().ready&&window.walkSurfacesReady118,null,{timeout:180000});
  await page.evaluate(()=>{state.paused=true;Crowd.pause(true);});
  const output=process.env.LANDSCAPE_TEST_OUTPUT||'/tmp/landscaping121';fs.mkdirSync(output,{recursive:true});
  for(const [name,camera,target]of[
   ['planters',[18,1.7,-33],[20.4,.45,-29.7]],
   ['corner',[-31,7,-36],[-19,0,-30]],
   ['park-junction',[-32,3.4,-28],[-28,-.021,-25]],
   ['riverwalk',[40,4,-36],[25,1,-31.35]],
   ['city111',[65,1.3,-23.7],[63.15,.2,-24.9]],
   ['original-soil',[-20,1.5,-33],[-18.6,.25,-31.35]],
   ['road-bridge',[65,4,-32],[69.9,.2,-43]]
  ]){
   await page.evaluate(({camera,target})=>{state.overview={camera,target};updateCamera(0,true);render();},{camera,target});
   const pixels=await page.locator('#canvas').screenshot();assert((await sharp(pixels).stats()).channels.some(c=>c.stdev>20));fs.writeFileSync(output+'/'+name+'.png',pixels);
  }
  const surfaces=await page.evaluate(()=>({corner:[[-28.2,-31.4],[-25,-32.3],[-14,-32.3],[-28,-25],[-30.5,-25]].map(([x,z])=>{const h=raycast([x,.6,z],[0,-1,0],1,o=>!o.boundary);return {x,z,name:h?.object?.name,y:h?.point[1]};}),blockedApproaches:District115.bridges.flatMap(b=>[-1,0,1].flatMap(side=>[b.start,b.end].map(z=>{
   const x=b.x+side*(District115.width(b,z)/2-.3),near=z===b.start,hit=raycast([x,b.base+.45,z+(near?.2:-.2)],[0,0,near?-1:1],5,o=>/river.*rail|^Riverfront_concrete_retaining_wall/i.test(o.name));return hit?.object?.name;
  }))).filter(Boolean),gl:gl.getError()}));
  assert(surfaces.corner.every(h=>/park path joined pavers/.test(h.name)&&Math.abs(h.y+.021)<.001),JSON.stringify(surfaces));assert.equal(surfaces.gl,0);
  assert.deepEqual(surfaces.blockedApproaches,[],'original rails leave the bridge approaches clear');
  const turning=await page.evaluate(()=>District115.bridges.filter(b=>!b.foot).flatMap(b=>[-1,1].map(side=>raycast([b.x+side*(b.width/2+1),.2,-36],[-side,0,0],b.width+2,o=>/District115 (west|east) guardrail/.test(o.name))?.object?.name)).filter(Boolean));
  assert.deepEqual(turning,[],'road bridge side rails do not obstruct the near-bank cross street');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{state.overview={camera:[-31,7,-36],target:[-19,0,-30]};updateCamera(0,true);render();});
  const mobile=await page.locator('#canvas').screenshot();assert((await sharp(mobile).stats()).channels.some(c=>c.stdev>20));fs.writeFileSync(output+'/mobile.png',mobile);
  assert.deepEqual(errors,[]);console.log('PASS desktop/mobile pixels, corner floor heights and WebGL',JSON.stringify({output,surfaces}));
 }finally{await browser.close();}
}
