import assert from 'node:assert/strict';
import fs from 'node:fs';
import C from './core.js';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import * as T from '../pc66/vendor/three/three.core.js';
const report=JSON.parse(fs.readFileSync(new URL('./assets/building-report.json',import.meta.url))),io=new NodeIO();
assert.equal(report.source,'3d-model.3ds.zip');assert(report.sourceParts>6000,'3DS floor and window instances retained');
for(let axis=0;axis<3;axis++){
 if(axis===1)continue;
 assert(C.bounds.lo[axis]-C.origin[axis]<=report.targetBounds.lo[axis],'supplied hotel stays within the sidewalk setback');
 assert(C.bounds.hi[axis]-C.origin[axis]>=report.targetBounds.hi[axis],'supplied hotel stays within its lot');
}
const stairs=await io.read(new URL('./assets/wooden-stairs.glb',import.meta.url).pathname),box=new T.Box3();
const placement=new T.Matrix4().compose(new T.Vector3(...C.stairs.position),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),C.stairs.yaw),new T.Vector3(...C.stairs.scale));
for(const n of stairs.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()||[]){const a=p.getAttribute('POSITION');box.union(new T.Box3(new T.Vector3(...a.getMin([])),new T.Vector3(...a.getMax([]))).applyMatrix4(placement.clone().multiply(new T.Matrix4().fromArray(n.getWorldMatrix()))));}
assert(box.min.x> -3.3&&box.max.x<3.3);assert(box.min.z> -3.8&&box.max.z<3.7);assert(box.max.y<4.4);
assert(Math.abs(2.016*C.stairs.scale[1]-2.1)<.001,'stair landing meets the gallery');
console.log('PASS supplied 3DS instances, hotel within lot envelope, supplied wooden stairs inside lobby, landing height');
const building=await io.read(new URL('./assets/building.glb',import.meta.url).pathname),lobby=await io.read(new URL('./assets/lobby.glb',import.meta.url).pathname),windows=await io.read(new URL('./assets/window.glb',import.meta.url).pathname),couch=await io.read(new URL('./assets/couch.glb',import.meta.url).pathname);
assert(building.getRoot().listMaterials().some(m=>m.getExtras().finish149==='brick'&&m.getBaseColorTexture()));
assert(building.getRoot().listMaterials().some(m=>m.getExtras().finish149==='trim'&&m.getBaseColorTexture()));
assert(windows.getRoot().listMaterials().some(m=>m.getAlphaMode()==='BLEND'&&m.getBaseColorFactor()[3]<.2));
assert(windows.getRoot().listMaterials().filter(m=>m.getAlphaMode()==='OPAQUE').every(m=>m.getBaseColorTexture()));
assert(couch.getRoot().listMaterials().every(m=>m.getBaseColorTexture()));
assert.equal(C.reception.yaw,Math.PI);assert(C.reception.scale[2]>=1.6);assert(C.kioskDesk.scale[2]>=1.8);
const architecture=new T.Group();
for(const d of [building,lobby])for(const node of d.getRoot().listNodes())for(const p of node.getMesh()?.listPrimitives()||[]){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p.getAttribute('POSITION').getArray(),3));g.setIndex(new T.BufferAttribute(p.getIndices().getArray(),1));const mesh=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));mesh.applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix()));architecture.add(mesh);}
architecture.updateMatrixWorld(true);
assert.equal(C.windows.length,33,'wraparound windows on both lobby levels');
for(const w of C.windows){
 const sign=Math.sign(w.wall),p=[0,w.y+w.height*.5,0],d=[0,0,0];p[w.axis]=w.wall+sign*.65;p[2-w.axis]=w.along;d[w.axis]=-sign;
 const ray=new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,.85);
 assert.equal(ray.intersectObject(architecture,true).length,0,'clear facade opening '+JSON.stringify(w));
}
for(const d of [building,lobby])for(const n of d.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()||[]){
 const a=p.getAttribute('POSITION'),b=new T.Box3(new T.Vector3(...a.getMin([])),new T.Vector3(...a.getMax([]))).applyMatrix4(new T.Matrix4().fromArray(n.getWorldMatrix()));
 for(const k of ['x','z']){const axis=k==='x'?0:2;
  if(k==='z'&&d===lobby&&n.getName()==='Honey marble'){
   for(let i=0;i<a.getCount();i++){const v=a.getElement(i,[]);if(v[2]<C.bounds.lo[2]-C.origin[2]-.002)assert(Math.abs(v[0])<=C.door151.openingWidth/2+.001&&v[1]<.004&&v[2]>=C.door151.z-.526,'only the low door threshold projects beyond the lot');}
  }else assert(b.min[k]>=C.bounds.lo[axis]-C.origin[axis]-.002,'no wall projects over the sidewalk');
  assert(b.max[k]<=C.bounds.hi[axis]-C.origin[axis]+.002,'geometry stays on its lot');
 }
 if(d===building)assert(b.min.y>=5.709,'old ground-floor frontage is removed');
}
assert(C.door151.z-C.door151.radius> -4.32,'revolving entrance clears sidewalk walking lanes');
console.log('PASS 33 clear window openings, no projecting walls, bounded revolving entrance, masonry and upholstery');
