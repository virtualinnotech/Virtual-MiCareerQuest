import fs from 'node:fs';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {MeshoptSimplifier} from '../../work/browser/node_modules/meshoptimizer/index.js';

// Index-only background meshes reuse the original vertices, textures and UVs.
const dir=new URL('.',import.meta.url),doc=await new NodeIO().read(new URL('city.glb',dir).pathname);
await MeshoptSimplifier.ready;
const meshes=doc.getRoot().listMeshes(),existing=new Set(meshes.map(m=>m.getExtras().farMesh114).filter(Boolean)),records=[],chunks=[];
let offset=0,total=0,reduced=0;
for(const [mesh,m]of meshes.entries()){
 if(m.getExtras().farMesh114||m.getExtras().joint117||existing.has(m.getName()))continue;
 for(const [part,p]of m.listPrimitives().entries()){
  if(p.getMaterial()?.getAlphaMode()!=='OPAQUE'||!p.getIndices())continue;
  const indices=new Uint32Array(p.getIndices().getArray());if(indices.length<1500)continue;
  const pos=p.getAttribute('POSITION').getArray(),normal=p.getAttribute('NORMAL')?.getArray(),uv=p.getAttribute('TEXCOORD_0')?.getArray(),attributes=new Float32Array(pos.length/3*5);
  for(let i=0;i<pos.length/3;i++){for(let k=0;k<3;k++)attributes[i*5+k]=normal?.[i*3+k]||0;for(let k=0;k<2;k++)attributes[i*5+3+k]=uv?.[i*2+k]||0;}
  const [lod,error]=MeshoptSimplifier.simplifyWithAttributes(indices,pos,3,attributes,5,[.3,.3,.3,1,1],null,Math.max(48,Math.floor(indices.length*.16/3)*3),.012,['Permissive']);
  if(lod.length>=indices.length*.9)continue;
  records.push({mesh,part,sourceCount:indices.length,vertices:pos.length/3,signature:Array.from(indices.subarray(0,12)),offset,count:lod.length,error});
  const bytes=Buffer.from(lod.buffer,lod.byteOffset,lod.byteLength);chunks.push(bytes);offset+=bytes.length;total+=indices.length/3;reduced+=lod.length/3;
 }
}
fs.writeFileSync(new URL('detail150.bin',dir),Buffer.concat(chunks));
fs.writeFileSync(new URL('detail150.json',dir),JSON.stringify({version:150,bytes:offset,sourceTriangles:total,distantTriangles:reduced,records})+'\n');
console.log({parts:records.length,bytes:offset,sourceTriangles:total,distantTriangles:reduced});
