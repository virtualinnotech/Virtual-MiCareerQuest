import assert from 'node:assert/strict';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import * as T from '../pc66/vendor/three/three.core.js';
import C from './core.js';
const io=new NodeIO(),placements=[];
for(const [name,position,scale,yaw] of C.reading153){
 const doc=await io.read(new URL('./assets/'+name+'.glb',import.meta.url).pathname),box=new T.Box3();
 const placement=new T.Matrix4().compose(new T.Vector3(...position),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw),new T.Vector3(scale,scale,scale));
 let triangles=0;
 for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()||[]){
  const matrix=placement.clone().multiply(new T.Matrix4().fromArray(n.getWorldMatrix())),a=p.getAttribute('POSITION');
  for(let i=0;i<a.getCount();i++)box.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(matrix));
  triangles+=p.getIndices().getCount()/3;
 }
 assert(box.min.y>=-.002&&box.max.y<1.50,'furniture is grounded beneath the landing');
 assert(box.min.z>.95&&box.max.z<3.62,'reading area stays behind the central couch and inside rear wall');
 if(name==='victorian-details'){
  assert(Math.abs(box.getCenter(new T.Vector3()).x)<.005,'fireplace centered below rear landing');
  assert(box.min.z>2.65,'fireplace at rear of lobby');
 }
 if(name==='reading-chair'){
  assert(triangles<24000,'bounded chair detail');
  const front=new T.Vector3(0,0,-1).applyAxisAngle(new T.Vector3(0,1,0),yaw);
  const target=new T.Vector3(-position[0],0,3-position[2]).normalize();
  assert(front.dot(target)>.97,'chairs face the fireplace');
 }
 if(name.startsWith('reading-'))assert(doc.getRoot().listMaterials().filter(m=>m.getBaseColorTexture()).length>=2,'original furniture textures retained');
 if(name==='coffee-table')assert(doc.getRoot().listMaterials().every(m=>m.getBaseColorFactor()[3]===1&&m.getAlphaMode()==='OPAQUE'),'antique table is opaque and visible');
 placements.push({name,box});
}
for(let i=0;i<placements.length;i++)for(let j=i+1;j<placements.length;j++)assert(!placements[i].box.intersectsBox(placements[j].box),'furniture does not overlap');
const stairs=await io.read(new URL('./assets/wooden-stairs.glb',import.meta.url).pathname);
const stairMatrix=new T.Matrix4().compose(new T.Vector3(...C.stairs.position),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),C.stairs.yaw),new T.Vector3(...C.stairs.scale));
for(const node of stairs.getRoot().listNodes())for(const p of node.getMesh()?.listPrimitives()||[]){
 const matrix=stairMatrix.clone().multiply(new T.Matrix4().fromArray(node.getWorldMatrix())),a=p.getAttribute('POSITION'),indices=p.getIndices().getArray();
 for(const {name,box} of placements){
  const interior=box.clone().expandByScalar(-.015);let hits=0;
  for(let i=0;i<indices.length;i+=3){
   const triangle=new T.Triangle(...Array.from(indices.subarray(i,i+3),index=>new T.Vector3(...a.getElement(index,[])).applyMatrix4(matrix)));
   if(interior.intersectsTriangle(triangle))hits++;
  }
  assert.equal(hits,0,name+' clears the curved stairs');
 }
}
const lobby=await io.read(new URL('./assets/lobby.glb',import.meta.url).pathname),entry=C.door151;
const contacts=lobby.getRoot().getExtras().hotel146.contacts;
const sidelights=contacts.filter(c=>c.name==='Fixed entrance sidelight');
assert.equal(sidelights.length,2);
assert(sidelights.every(c=>c.lo[2]<entry.front&&c.hi[2]>entry.front));
assert(sidelights.every(c=>c.hi[0]<=-entry.infillInner+.001||c.lo[0]>=entry.infillInner-.001),'side infills leave the center passage open');
assert(Math.abs(Math.hypot(entry.infillInner,entry.front-entry.z)-.435)<.01,'side infills meet the supplied curved glass');
assert(contacts.some(c=>c.name==='Fitted door header'&&c.lo[1]>1));
console.log('PASS centered rear fireplace, textured chairs facing hearth, separated reading furniture, bookcases and fitted entrance infills');
