import assert from 'node:assert/strict';
import fs from 'node:fs';
import C from './core.js';
import {io} from '../rivian147/prepare.mjs';
import * as T from '../pc66/vendor/three/three.core.js';
assert.equal(C.name,'Grand Plaza Hotel');
const boxes=[];
for(const [name,p,scale,yaw] of C.waiting154){
 const d=await io.read(new URL('./assets/'+name+'.glb',import.meta.url).pathname),box=new T.Box3();
 const placement=new T.Matrix4().compose(new T.Vector3(...p),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw),new T.Vector3(scale,scale,scale));
 for(const n of d.getRoot().listNodes())for(const pr of n.getMesh()?.listPrimitives()||[]){
  const a=pr.getAttribute('POSITION');box.union(new T.Box3(new T.Vector3(...a.getMin([])),new T.Vector3(...a.getMax([]))).applyMatrix4(placement.clone().multiply(new T.Matrix4().fromArray(n.getWorldMatrix()))));
 }
 assert(box.min.x>.75&&box.max.x<3.38&&box.min.z> -3.97,'waiting furniture remains off the aisle and inside walls');
 if(name==='sofa'){
  const forward=new T.Vector3(1,0,0).applyAxisAngle(new T.Vector3(0,1,0),yaw),inward=new T.Vector3(-p[0],0,-p[2]);
  assert(forward.dot(inward)>0,'every sofa faces inward');
 }
 for(const other of boxes)assert(!box.intersectsBox(other),'waiting furniture does not intersect');
 boxes.push(box);
}
for(const name of ['doorman-idle','staff-idle']){
 const d=await io.read(new URL('./assets/'+name+'.glb',import.meta.url).pathname);
 assert.equal(d.getRoot().listSkins().length,1);assert(d.getRoot().listAnimations().some(a=>a.getName()==='Idle'));
 const triangles=d.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0),0);assert(triangles<=20000);
 for(const m of d.getRoot().listMaterials())assert(m.getBaseColorTexture(),'supplied character textures retained');
}
const scene=fs.readFileSync(new URL('./scene.js',import.meta.url),'utf8'),build=fs.readFileSync(new URL('./build.mjs',import.meta.url),'utf8');
assert(!/AMWAY|hotel146-flowers|\['couch'/.test(scene));assert(!/circular sofa|teal/.test(build));
console.log('PASS new branding, no centerpiece, inward seating, separated waiting furniture, optimized textured idle staff');
