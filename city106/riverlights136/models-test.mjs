import assert from 'node:assert/strict';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
const io=new NodeIO();
const source=await io.read(new URL('../../../work/downtown134/source/police-car-suv/source/prepared.gltf',import.meta.url).pathname);
const models=await io.read(new URL('../downtown134/models.glb',import.meta.url).pathname);
const key=(u,v)=>Math.round(u*1e5)+','+Math.round(v*1e5),uvs=new Set();
for(const m of source.getRoot().listMeshes())for(const p of m.listPrimitives())if(p.getMaterial().getName()==='tire material'){
 const a=p.getAttribute('TEXCOORD_0');for(let i=0;i<a.getCount();i++){const[u,v]=a.getElement(i,[]);uvs.add(key(u,1-v));}
}
let tested=0;
for(const m of models.getRoot().listMeshes())if(m.getName().startsWith('police-suv wheel'))for(const p of m.listPrimitives()){
 assert(p.getMaterial().getRoughnessFactor()>=.9);assert.equal(p.getMaterial().getMetallicFactor(),0);
 const a=p.getAttribute('TEXCOORD_0');for(let i=0;i<a.getCount();i++){assert(uvs.has(key(...a.getElement(i,[]))),'correct atlas orientation on every tire vertex');tested++;}
}
assert(tested>1000);
assert(models.getRoot().listMeshes().find(m=>m.getName()==='police-suv body').listPrimitives().some(p=>p.getMaterial().getName()==='police-suv decal'),'restored source side panels');
const skyline=await io.read(new URL('../skyline135/models.glb',import.meta.url).pathname),tower=skyline.getRoot().listMeshes().find(m=>m.getName()==='Skyline135 skyscraper');
const wall=tower.listPrimitives().find(p=>p.getMaterial().getName().endsWith('Material.031')).getAttribute('POSITION');
const windows=tower.listPrimitives().find(p=>p.getExtras().facade138==='panes').getAttribute('POSITION');
assert(windows.getMax([])[2]-wall.getMax([])[2]>.02,'front facade layers separated');
assert(wall.getMin([])[2]-windows.getMin([])[2]>.02,'rear facade layers separated');
console.log('PASS',tested,'corrected tire UVs, matte rubber, intact SUV side panels, noncoplanar front/rear skyscraper windows');
