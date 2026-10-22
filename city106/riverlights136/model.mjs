import fs from 'node:fs';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument,prune} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';

const io=new NodeIO(),source=await io.read(new URL('../../../work/riverlights136/lamp.glb',import.meta.url).pathname);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Riverwalk supplied lamps'),copied=copyToDocument(doc,source,source.getRoot().listMaterials());
const model=doc.createMesh('River136 supplied ornamental street lamp'),bounds=new T.Box3(),parts=[];
for(const node of source.getRoot().listNodes())if(node.getMesh())for(const p of node.getMesh().listPrimitives()){
 const g=new T.BufferGeometry();
 for(const[a,b,s]of[['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]])g.setAttribute(b,new T.BufferAttribute(new Float32Array(p.getAttribute(a).getArray()),s));
 g.setIndex(Array.from(p.getIndices().getArray()));g.applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix()));g.computeBoundingBox();bounds.union(g.boundingBox);
 parts.push({g,lens:node.getName()==='pCylinder14',m:copied.get(p.getMaterial())});
}
const height=2.1,scale=height/(bounds.max.y-bounds.min.y),headBox=new T.Box3();let triangles=0;
const lens=doc.createMaterial('River136 supplied lamp warm glass').setBaseColorFactor([.82,.76,.60,1]).setMetallicFactor(0).setRoughnessFactor(.35).setExtras({surfaceType:28});
for(const p of parts){
 p.g.translate(0,-bounds.min.y,0).scale(scale,scale,scale);p.g.computeBoundingBox();
 if(p.lens)headBox.union(p.g.boundingBox);
 const m=p.lens?lens:p.m;m.setDoubleSided(true);if(!p.lens)m.setName('River136 supplied dark cast metal').setMetallicFactor(.4).setRoughnessFactor(.6);
 const a=(v,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(v);
 model.addPrimitive(doc.createPrimitive().setMaterial(m).setAttribute('POSITION',a(p.g.attributes.position.array,'VEC3')).setAttribute('NORMAL',a(p.g.attributes.normal.array,'VEC3')).setAttribute('TEXCOORD_0',a(p.g.attributes.uv.array,'VEC2')).setIndices(a(new Uint32Array(p.g.index.array),'SCALAR')));
 triangles+=p.g.index.count/3;
}
for(const t of doc.getRoot().listTextures())if(t.getImage())t.setImage(await sharp(t.getImage()).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).png().toBuffer()).setMimeType('image/png');
const data={archive:'street-lamp.zip',height,head:headBox.getCenter(new T.Vector3()).toArray(),triangles};
scene.addChild(doc.createNode('lamp').setMesh(model));doc.getRoot().setExtras(data);await doc.transform(prune());
await io.write(new URL('./lamp.glb',import.meta.url).pathname,doc);fs.writeFileSync(new URL('./model.json',import.meta.url),JSON.stringify(data,null,2));console.log(data);
