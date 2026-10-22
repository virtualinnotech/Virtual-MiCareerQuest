import fs from 'node:fs';
import path from 'node:path';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {compactPrimitive} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';

const dir=new URL('./',import.meta.url).pathname,work=path.resolve(dir,'../../../work/assets130');
const io=new NodeIO(),doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Gallery133 supplied fixtures'),manifest=[];
await MeshoptSimplifier.ready;
async function texture(id,name){
 const bytes=await sharp(path.join(work,'source',id,'textures',name)).resize({width:2048,height:2048,fit:'inside',withoutEnlargement:true}).png().toBuffer();
 return doc.createTexture(name).setImage(bytes).setMimeType('image/png');
}
for(const [id,name,height,color,normal,rough,metal] of [
 ['drinking-fountain-with-bottle-filling-station','bottle-fountain',.524,'DF1_Col.png',null,.30,.62],
 ['neglected-fire-extinguisher','fire-extinguisher',.235,'Extinguisher_COL.png','Extinguisher_NRM.png',.52,.23],
]){
 const source=await io.read(path.join(work,'converted',id+'.glb')),parts=[],bounds=new T.Box3();
 for(const node of source.getRoot().listNodes())if(node.getMesh())for(const p of node.getMesh().listPrimitives()){
  const g=new T.BufferGeometry();
  for(const [attribute,key,size]of[['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]]){
   const a=p.getAttribute(attribute);if(a)g.setAttribute(key,new T.BufferAttribute(new Float32Array(a.getArray()),size));
  }
  g.setIndex(Array.from(p.getIndices().getArray()));g.applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix()));
  g.computeBoundingBox();bounds.union(g.boundingBox);parts.push({g,glass:/Glass/i.test(p.getMaterial()?.getName())});
 }
 const size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=height/size.y;
 const mat=doc.createMaterial('Gallery133 supplied '+name).setBaseColorFactor([1,1,1,1]).setBaseColorTexture(await texture(id,color)).setRoughnessFactor(rough).setMetallicFactor(metal).setDoubleSided(true);
 if(normal)mat.setNormalTexture(await texture(id,normal));
 const glass=doc.createMaterial('Gallery133 extinguisher gauge glass').setBaseColorFactor([.55,.67,.66,.17]).setAlphaMode('BLEND').setRoughnessFactor(.16).setDoubleSided(true);
 const model=doc.createMesh(name);let triangles=0;
 for(const {g,glass:isGlass}of parts){
  g.translate(-center.x,-bounds.min.y,-center.z).scale(scale,scale,scale);
  let indices=new Uint32Array(g.index.array);
  if(indices.length>60000)[indices]=MeshoptSimplifier.simplify(indices,g.attributes.position.array,3,60000,.002,['LockBorder']);
  const a=(values,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(values);
  const p=doc.createPrimitive().setMaterial(isGlass?glass:mat).setAttribute('POSITION',a(g.attributes.position.array,'VEC3')).setAttribute('NORMAL',a(g.attributes.normal.array,'VEC3')).setAttribute('TEXCOORD_0',a(g.attributes.uv.array,'VEC2')).setIndices(a(indices,'SCALAR'));
  compactPrimitive(p);model.addPrimitive(p);triangles+=indices.length/3;
 }
 const record={name,archive:id+'.zip',size:size.multiplyScalar(scale).toArray(),triangles};
 model.setExtras(record);scene.addChild(doc.createNode(name).setMesh(model));manifest.push(record);
}
doc.getRoot().setExtras({manifest});
await io.write(path.join(dir,'fixtures.glb'),doc);
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(manifest);
