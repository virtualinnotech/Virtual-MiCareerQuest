import fs from 'node:fs';
import path from 'node:path';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {copyToDocument,compactPrimitive,prune,dedup} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';
import {repairTowerFacade} from './facade138.mjs';

const dir=new URL('.',import.meta.url).pathname,work=path.resolve(dir,'../../../work/skyline135');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Supplied skyline135'),models=[];
await MeshoptSimplifier.ready;
for(const [id,width,filename,rotateX]of[
 ['modern',7.6,'/Users/mapettiforsd/Desktop/modern_building_002.glb',0],
 ['chase',6.2,path.join(work,'converted/chase.glb'),-Math.PI/2],
 ['skyscraper',7.0,path.join(work,'converted/skyscraper.glb'),0],
 ['beveled',4.1,path.join(work,'converted/beveled.glb'),0]
]){
 const source=await io.read(filename),mapping=copyToDocument(doc,source,source.getRoot().listMaterials()),parts=[],bounds=new T.Box3();
 for(const old of source.getRoot().listMaterials()){
  const m=mapping.get(old),name=old.getName();m.setName('Skyline135 '+id+' '+name).setDoubleSided(true).setEmissiveFactor([0,0,0]).setEmissiveTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null);
  for(const ext of m.listExtensions())m.setExtension(ext.extensionName,null);
  m.setRoughnessFactor(.65).setMetallicFactor(.08);
  const glass=id==='modern'&&name==='GLASS_1'||id==='skyscraper'&&/^Material\.0(14|15|16|22)$/.test(name)||id==='chase'&&['color_2501421','color_2829873','color_4030347','color_4695479'].includes(name);
  if(glass)m.setAlphaMode('OPAQUE').setBaseColorFactor([.09,.14,.17,1]).setRoughnessFactor(.24).setMetallicFactor(.45).setExtras({surfaceType:31});
  if(id==='beveled')m.setBaseColorFactor([.65,.72,.78,1]).setRoughnessFactor(.22).setMetallicFactor(.6).setExtras({surfaceType:32});
  if(id==='skyscraper'&&name==='Material.089')m.setBaseColorFactor([.9,.5,.19,1]).setExtras({surfaceType:28});
  if(id==='skyscraper'&&name==='Material.096')m.setNormalTexture(null);
 }
 for(const node of source.getRoot().listNodes())if(node.getMesh())for(const p of node.getMesh().listPrimitives()){
  if(p.getMode()!==4||id==='modern'&&/^Site/.test(p.getMaterial().getName()))continue;
  const g=new T.BufferGeometry();
  for(const[a,b,s]of[['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]]){const v=p.getAttribute(a);if(v)g.setAttribute(b,new T.BufferAttribute(new Float32Array(v.getArray()),s));}
  g.setIndex(Array.from(p.getIndices()?.getArray()||Array.from({length:g.attributes.position.count},(_,i)=>i)));
  if(!g.attributes.normal)g.computeVertexNormals();
  if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  g.applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix())).rotateX(rotateX);g.computeBoundingBox();bounds.union(g.boundingBox);parts.push({g,m:mapping.get(p.getMaterial()),name:node.getName()});
 }
 const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3()),scale=width/size.x;
 const groups=new Map(),model=doc.createMesh('Skyline135 '+id),total=parts.reduce((s,p)=>s+p.g.index.count/3,0);let triangles=0,facade138;
 for(const p of parts){
  p.g.translate(-center.x,-bounds.min.y,-center.z).scale(scale,scale,scale);
  // Separate the supplied window assemblies from the coplanar wall behind them.
  if(id==='skyscraper'&&/windows/i.test(p.name)){
   p.g.computeBoundingBox();const side=Math.sign(p.g.boundingBox.getCenter(new T.Vector3()).z);
   p.g.translate(0,0,side*.024);
  }
 }
 const repaired=id==='skyscraper'?repairTowerFacade(parts):{parts};facade138=repaired.report;
 for(const p of repaired.parts){if(!groups.has(p.m))groups.set(p.m,[]);groups.get(p.m).push(p);}
 const materialGroups=[...groups].flatMap(([m,gs])=>[false,true].map(preserve=>[m,gs.filter(p=>!!p.preserveTopology138===preserve)]).filter(([,gs])=>gs.length));
 for(const[m,gs]of materialGroups){
  const pos=[],nor=[],uv=[],idx=[];let offset=0;
  for(const {g} of gs){for(const v of g.attributes.position.array)pos.push(v);for(const v of g.attributes.normal.array)nor.push(v);for(const v of g.attributes.uv.array)uv.push(v);for(const i of g.index?.array||Array.from({length:g.attributes.position.count},(_,i)=>i))idx.push(i+offset);offset+=g.attributes.position.count;}
  const vertices=new Float32Array(pos);let indices=new Uint32Array(idx),budget=id==='skyscraper'?160000:100000,target=Math.max(24,Math.floor(indices.length*Math.min(1,budget/total)/3)*3);
  if(target<indices.length&&!gs.some(p=>p.preserveTopology138)){
   const attributes=new Float32Array(vertices.length/3*5);for(let i=0;i<vertices.length/3;i++)attributes.set([...nor.slice(i*3,i*3+3),...uv.slice(i*2,i*2+2)],i*5);
   [indices]=MeshoptSimplifier.simplifyWithAttributes(indices,vertices,3,attributes,5,[.5,.5,.5,2,2],null,target,.003,['Permissive']);
  }
  const a=(values,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(values),p=doc.createPrimitive().setMaterial(m).setAttribute('POSITION',a(vertices,'VEC3')).setAttribute('NORMAL',a(new Float32Array(nor),'VEC3')).setAttribute('TEXCOORD_0',a(new Float32Array(uv),'VEC2')).setIndices(a(indices,'SCALAR'));
  if(gs.some(part=>part.preserveTopology138))p.setExtras({facade138:m.getExtras().surfaceType===33?'panes':'frames'});
  if(id==='chase'){
   const ground=[],body=[];for(let i=0;i<indices.length;i+=3){const face=Array.from(indices.slice(i,i+3));(face.every(k=>vertices[k*3+1]<.10&&nor[k*3+1]>.7)?ground:body).push(...face);}
   if(ground.length){const floor=p.clone().setIndices(a(new Uint32Array(ground),'SCALAR')).setExtras({ground135:true});compactPrimitive(floor);model.addPrimitive(floor);p.setIndices(a(new Uint32Array(body),'SCALAR'));}
  }
  compactPrimitive(p);if(p.getIndices().getCount())model.addPrimitive(p);triangles+=indices.length/3;
 }
 const record={id,name:model.getName(),size:size.multiplyScalar(scale).toArray(),triangles,source:path.basename(filename),...(facade138?{facade138}:{})};models.push(record);model.setExtras(record);scene.addChild(doc.createNode(id).setMesh(model));console.log(record);
}
for(const tex of doc.getRoot().listTextures())if(tex.getImage())tex.setImage(await sharp(tex.getImage()).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).png().toBuffer()).setMimeType('image/png');
// glTF pruning does not know that the runtime uses these UVs without an image texture.
const roomUVs=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).filter(p=>p.getExtras().facade138==='panes').map(p=>[p,new Float32Array(p.getAttribute('TEXCOORD_0').getArray())]);
await doc.transform(prune(),dedup());
for(const [p,uv]of roomUVs)p.setAttribute('TEXCOORD_0',doc.createAccessor().setBuffer(buffer).setType('VEC2').setArray(uv));
for(const a of doc.getRoot().listAccessors())a.setBuffer(buffer);for(const b of doc.getRoot().listBuffers())if(b!==buffer)b.dispose();
doc.getRoot().setExtras({models});await io.write(path.join(dir,'models.glb'),doc);fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(models,null,2)+'\n');
