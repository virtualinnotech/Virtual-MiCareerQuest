import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';

export async function loadFleet(doc){
 const source=await new NodeIO().read(new URL('./fleet.glb',import.meta.url).pathname);
 const meshes=source.getRoot().listMeshes(),copied=copyToDocument(doc,source,meshes),result={};
 const find=name=>copied.get(meshes.find(m=>m.getName()===name));
 for(const spec of source.getRoot().getExtras().models){
  result[spec.id]={...spec,body:find(spec.body),rear:spec.rear?find(spec.rear):null,joint:spec.joint?find(spec.joint):null,brake:spec.brake?find(spec.brake):null,headlight:spec.headlight?find(spec.headlight):null,wheels:spec.wheels.map(w=>({...w,mesh:find(spec.id+' '+w.role)}))};
 }
 return result;
}
