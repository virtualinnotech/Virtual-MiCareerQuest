import assert from 'node:assert/strict';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import * as T from '../pc66/vendor/three/three.core.js';
import C from './core.js';
const doc=await new NodeIO().read(new URL('./assets/revolving-door.glb',import.meta.url).pathname),box=new T.Box3(),nodes=doc.getRoot().listNodes();
assert.deepEqual(nodes.map(n=>n.getName()).sort(),['door-frame','door-mat','door-rotor']);
let triangles=0;
for(const node of nodes)for(const p of node.getMesh().listPrimitives()){
 const a=p.getAttribute('POSITION');box.union(new T.Box3(new T.Vector3(...a.getMin([])),new T.Vector3(...a.getMax([]))).applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix())));
 triangles+=p.getIndices().getCount()/3;
}
assert(Math.abs(box.max.y-C.door151.height)<.0001);
assert(box.max.y<1.3*.8&&box.max.x-box.min.x<1.28*.8,'meaningfully smaller than the previous door');
assert(C.door151.z+box.min.z<C.door151.front,'the drum projects forward of the facade');
assert(C.door151.z+box.min.z> -4.32,'the projected drum clears the pedestrian route');
assert(box.max.x<C.door151.openingWidth/2&&box.max.y<C.door151.openingHeight,'entrance surround fits the model');
const rotor=nodes.find(n=>n.getName()==='door-rotor');
assert(rotor.getMesh().listPrimitives().some(p=>p.getMaterial().getAlphaMode()==='BLEND'));
const glass=doc.getRoot().listMaterials().find(m=>m.getName()==='Clear entrance glass'),gold=doc.getRoot().listMaterials().find(m=>m.getName()==='Brushed gold frame');
assert(glass.getBaseColorFactor()[3]<.2&&glass.getAlphaMode()==='BLEND');
assert(gold.getMetallicFactor()>.7&&gold.getBaseColorFactor()[0]>gold.getBaseColorFactor()[1]&&gold.getBaseColorFactor()[1]>gold.getBaseColorFactor()[2]);
// The fixed drum must not seal the approach or the exit at body/head height.
const frame=new T.Group();
for(const p of nodes.find(n=>n.getName()==='door-frame').getMesh().listPrimitives()){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p.getAttribute('POSITION').getArray(),3));g.setIndex(new T.BufferAttribute(p.getIndices().getArray(),1));frame.add(new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide})));
}
frame.updateMatrixWorld(true);
for(const y of [.12,.36,.72,.75])for(const x of [-.16,0,.16])assert.equal(new T.Raycaster(new T.Vector3(x,y,-.7),new T.Vector3(0,0,1),0,1.4).intersectObject(frame,true).length,0,'clear character passage through fixed drum');
assert(triangles<4000,'small asset, no duplicate LODs');
console.log('PASS supplied door, reduced scale, gold/clear-glass materials, independent rotor, sidewalk and body/head clearance',triangles,'triangles');
