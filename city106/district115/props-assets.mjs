import fs from 'node:fs';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';

const io=new NodeIO(),source=await io.read(new URL('../../../work/city115/converted/props.glb',import.meta.url).pathname);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Selected supplied city props');
const selected=['ParkBenchLong','ParkBenchShort','TrashCanCap','PostBox','FireHydrant','ParkingMeter','Dumpster','Utility'];
const images=fs.readdirSync(new URL('../../../work/city115/source/props/',import.meta.url));
await MeshoptSimplifier.ready;
const manifest=[];
for(const name of selected){
 const nodes=source.getRoot().listNodes().filter(n=>n.getName()===name||(name==='Dumpster'&&/^Lid/.test(n.getName()))),records=[],bounds=new T.Box3();
 for(const n of nodes)for(const p of n.getMesh().listPrimitives()){
  const matrix=new T.Matrix4().fromArray(n.getWorldMatrix()),normal=new T.Matrix3().getNormalMatrix(matrix),pos=Float32Array.from(p.getAttribute('POSITION').getArray()),nor=Float32Array.from(p.getAttribute('NORMAL').getArray()),v=new T.Vector3();
  for(let i=0;i<pos.length;i+=3){v.fromArray(pos,i).applyMatrix4(matrix).toArray(pos,i);bounds.expandByPoint(v);v.fromArray(nor,i).applyNormalMatrix(normal).toArray(nor,i);}
  records.push({p,pos,nor});
 }
 const center=bounds.getCenter(new T.Vector3()),model=doc.createMesh('District115 supplied '+name),materials=new Map();let triangles=0;
 for(const {p,pos,nor} of records){
  for(let i=0;i<pos.length;i+=3){pos[i]=(pos[i]-center.x)*.3;pos[i+1]=(pos[i+1]-bounds.min.y)*.3;pos[i+2]=(pos[i+2]-center.z)*.3;}
  const matName=p.getMaterial().getName();let mat=materials.get(matName);
  if(!mat){
   mat=doc.createMaterial('District115 supplied '+matName).setRoughnessFactor(.68).setDoubleSided(true);
   const file=images.find(f=>f.endsWith('_'+matName+'_Diffuse.png'));
   if(file){const bytes=await sharp(new URL('../../../work/city115/source/props/'+file,import.meta.url).pathname).resize({width:512,height:512,fit:'inside'}).jpeg({quality:82}).toBuffer();mat.setBaseColorTexture(doc.createTexture(name+' diffuse').setImage(bytes).setMimeType('image/jpeg'));}
   materials.set(matName,mat);
  }
  let idx=Uint32Array.from(p.getIndices().getArray());idx=MeshoptSimplifier.simplify(idx,pos,3,Math.max(180,Math.floor(idx.length*.55/3)*3),.005,['Permissive','Prune'])[0];
  const [remap,count]=MeshoptSimplifier.compactMesh(idx),compact=(source,stride)=>{const out=new Float32Array(count*stride);for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff)out.set(source.subarray(i*stride,(i+1)*stride),remap[i]*stride);return out;};
  const a=(type,array)=>doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
  model.addPrimitive(doc.createPrimitive().setAttribute('POSITION',a('VEC3',compact(pos,3))).setAttribute('NORMAL',a('VEC3',compact(nor,3))).setAttribute('TEXCOORD_0',a('VEC2',compact(p.getAttribute('TEXCOORD_0').getArray(),2))).setIndices(a('SCALAR',idx)).setMaterial(mat));triangles+=idx.length/3;
 }
 model.setExtras({propBounds115:{size:bounds.getSize(new T.Vector3()).toArray().map(x=>x*.3)}});scene.addChild(doc.createNode(name).setMesh(model));manifest.push({name,triangles});
}
await io.write(new URL('./props.glb',import.meta.url).pathname,doc);
fs.writeFileSync(new URL('./props.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(manifest);
