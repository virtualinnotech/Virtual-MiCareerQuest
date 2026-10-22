import fs from 'node:fs';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {copyToDocument,compactPrimitive,prune,dedup} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import * as T from '../../pc66/vendor/three/three.core.js';

const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),source=await io.read(new URL('../../../work/assets130/converted/city-street-light-3.glb',import.meta.url).pathname);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Supplied streetlight'),copied=copyToDocument(doc,source,source.getRoot().listMaterials());
const groups=new Map(),bounds=new T.Box3(),baseBounds=new T.Box3(),lensBounds=new T.Box3();
const lens=doc.createMaterial('City131 streetlight glass lens').setBaseColorFactor([.78,.81,.76,1]).setRoughnessFactor(.25).setDoubleSided(true).setExtras({surfaceType:28,lampLens131:true});
await MeshoptSimplifier.ready;
for(const n of source.getRoot().listNodes())if(n.getMesh()&&n.getName()!=='group_51'){
 const matrix=new T.Matrix4().makeRotationY(Math.PI/2).multiply(new T.Matrix4().fromArray(n.getWorldMatrix())),normal=new T.Matrix3().getNormalMatrix(matrix);
 for(const p of n.getMesh().listPrimitives()){
  if(p.getMode()!==4||!p.getAttribute('POSITION'))continue;
  const old=p.getMaterial(),isGlass=/Glass/.test(old?.getName()),m=isGlass?lens:copied.get(old);
  if(!m)continue;
  if(!isGlass)m.setName('City131 '+old.getName()).setDoubleSided(true).setAlphaMode('OPAQUE').setBaseColorFactor([...m.getBaseColorFactor().slice(0,3),1]).setEmissiveFactor([0,0,0]).setMetallicFactor(.65).setRoughnessFactor(.4);
  let g=groups.get(m);if(!g){g={pos:[],nor:[],uv:[],idx:[]};groups.set(m,g);}
  const positions=p.getAttribute('POSITION'),normals=p.getAttribute('NORMAL'),uv=p.getAttribute('TEXCOORD_0'),offset=g.pos.length/3;
  for(let i=0;i<positions.getCount();i++){
   const v=new T.Vector3(...positions.getElement(i,[])).applyMatrix4(matrix);g.pos.push(...v.toArray());bounds.expandByPoint(v);
   if(n.getName()==='group_50.001')baseBounds.expandByPoint(v);
   if(n.getName()==='group_1')lensBounds.expandByPoint(v);
   g.nor.push(...new T.Vector3(...(normals?.getElement(i,[])||[0,1,0])).applyNormalMatrix(normal).toArray());g.uv.push(...(uv?.getElement(i,[])||[0,0]));
  }
  g.idx.push(...Array.from(p.getIndices().getArray(),i=>i+offset));
 }
}
const origin=baseBounds.getCenter(new T.Vector3());origin.y=bounds.min.y;
const scale=3.2/(bounds.max.y-bounds.min.y),model=doc.createMesh('City131 supplied streetlight');let triangles=0;
for(const [material,g]of groups){
 for(let i=0;i<g.pos.length;i++)g.pos[i]=(g.pos[i]-origin.getComponent(i%3))*scale;
 const pos=new Float32Array(g.pos),idx=MeshoptSimplifier.simplify(new Uint32Array(g.idx),pos,3,Math.min(g.idx.length,Math.max(12,Math.floor(g.idx.length*.16/3)*3)),.004,['Permissive','Prune'])[0];
 const a=(v,type)=>doc.createAccessor().setType(type).setArray(v).setBuffer(buffer);
 const p=doc.createPrimitive().setMaterial(material).setAttribute('POSITION',a(pos,'VEC3')).setAttribute('NORMAL',a(new Float32Array(g.nor),'VEC3')).setAttribute('TEXCOORD_0',a(new Float32Array(g.uv),'VEC2')).setIndices(a(idx,'SCALAR'));compactPrimitive(p);model.addPrimitive(p);triangles+=idx.length/3;
}
const head=lensBounds.getCenter(new T.Vector3()).sub(origin).multiplyScalar(scale).toArray(),metadata={archive:'city-street-light-3.zip',height:3.2,head,triangles};
model.setExtras(metadata);scene.addChild(doc.createNode('City131 supplied streetlight').setMesh(model));doc.getRoot().setExtras(metadata);
await doc.transform(dedup(),prune());await io.write(new URL('./light.glb',import.meta.url).pathname,doc);fs.writeFileSync(new URL('./model.json',import.meta.url),JSON.stringify(metadata,null,2));console.log(metadata);
