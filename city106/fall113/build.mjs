import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import * as T from '../../../work/pc66/tools/node_modules/three/build/three.module.js';
import {FBXLoader} from '../../../work/pc66/tools/node_modules/three/examples/jsm/loaders/FBXLoader.js';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {weld,compactPrimitive,prune,dedup} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/meshopt_simplifier.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
const src=new URL('../../../work/city113/source-maples/',import.meta.url),out=new URL('./',import.meta.url);
globalThis.window={URL:globalThis.URL};T.TextureLoader.prototype.load=()=>new T.Texture();
const bytes=fs.readFileSync(new URL('source/Tree For Sketchfab.fbx',src));
const root=new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');root.updateMatrixWorld(true);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Optimized supplied autumn maples');
const barkImage=await sharp(fileURLToPath(new URL('textures/Blender4k_BaseColor.png',src))).resize(512,512).jpeg({quality:82}).toBuffer();
const leafColor=await sharp(fileURLToPath(new URL('textures/Blender 4k_BaseColor.png',src))).resize(1024,1024).removeAlpha().raw().toBuffer();
const alpha=await sharp(fileURLToPath(new URL('textures/Mask_With_Transparency.png',src))).resize(1024,1024).removeAlpha().greyscale().raw().toBuffer();
const leafImage=await sharp(leafColor,{raw:{width:1024,height:1024,channels:3}}).joinChannel(alpha,{raw:{width:1024,height:1024,channels:1}}).png({palette:true,quality:90}).toBuffer();
const tex=(name,data,mime)=>doc.createTexture(name).setImage(data).setMimeType(mime);
const mats=[doc.createMaterial('Fall113 supplied bark').setBaseColorTexture(tex('Maple bark',barkImage,'image/jpeg')).setRoughnessFactor(.9).setMetallicFactor(0),doc.createMaterial('Fall113 supplied maple leaves').setBaseColorTexture(tex('Autumn leaf atlas',leafImage,'image/png')).setAlphaMode('MASK').setAlphaCutoff(.42).setDoubleSided(true).setRoughnessFactor(.9).setMetallicFactor(0)];
const report=[];let index=0;
root.traverse(n=>{if(!n.isMesh)return;const g=n.geometry,b=new T.Box3().setFromObject(n),height=b.max.y-b.min.y,scale=2.8/height,c=b.getCenter(new T.Vector3()),normalMatrix=new T.Matrix3().getNormalMatrix(n.matrixWorld),mesh=doc.createMesh('Fall113 maple '+index);
 for(let material=0;material<2;material++){
  const pos=[],norm=[],uv=[],idx=[];
  for(const group of g.groups.filter(q=>q.materialIndex===material))for(let i=group.start;i<group.start+group.count;i++){
   const k=g.index?g.index.array[i]:i,p=new T.Vector3().fromBufferAttribute(g.attributes.position,k).applyMatrix4(n.matrixWorld),nn=new T.Vector3().fromBufferAttribute(g.attributes.normal,k).applyNormalMatrix(normalMatrix);
   pos.push((p.x-c.x)*scale*.72,(p.y-b.min.y)*scale,(p.z-c.z)*scale*.72);norm.push(nn.x/.72,nn.y,nn.z/.72);uv.push(g.attributes.uv.getX(k),1-g.attributes.uv.getY(k));idx.push(idx.length);
  }
  const a=(data,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(data);
  mesh.addPrimitive(doc.createPrimitive().setAttribute('POSITION',a(new Float32Array(pos),'VEC3')).setAttribute('NORMAL',a(new Float32Array(norm),'VEC3')).setAttribute('TEXCOORD_0',a(new Float32Array(uv),'VEC2')).setIndices(a(new Uint32Array(idx),'SCALAR')).setMaterial(mats[material]));
 }
 scene.addChild(doc.createNode('Fall113 source tree '+index).setMesh(mesh));report.push({source:n.name,originalTriangles:g.attributes.position.count/3});index++;
});
await MeshoptSimplifier.ready;await doc.transform(weld());
for(const m of doc.getRoot().listMeshes())for(const [i,p]of m.listPrimitives().entries()){
 const positions=p.getAttribute('POSITION').getArray(),normals=p.getAttribute('NORMAL').getArray(),uv=p.getAttribute('TEXCOORD_0').getArray(),attrs=new Float32Array(positions.length/3*5);
 for(let v=0;v<positions.length/3;v++){
  const n=new T.Vector3(...normals.subarray(v*3,v*3+3)).normalize();normals.set(n.toArray(),v*3);
  attrs.set([...n.toArray(),...uv.subarray(v*2,v*2+2)],v*5);
 }
 const [indices]=MeshoptSimplifier.simplifyWithAttributes(p.getIndices().getArray(),positions,3,attrs,5,[.03,.03,.03,.15,.15],null,(i===0?700:2200)*3,.06,['Permissive']);
 p.getIndices().setArray(indices);compactPrimitive(p);
}
await doc.transform(dedup(),prune());
doc.getRoot().listMeshes().forEach((m,i)=>{report[i].triangles=m.listPrimitives().reduce((s,p)=>s+p.getIndices().getCount()/3,0);});
const optimized=await new NodeIO().writeBinary(doc);fs.writeFileSync(new URL('maples.glb',out),optimized);fs.writeFileSync(new URL('report.json',out),JSON.stringify({source:'User supplied fall-maple-trees-geometry-nodes.zip',bytes:optimized.length,trees:report,textures:[512,1024]},null,2)+'\n');console.log({bytes:optimized.length,trees:report});
