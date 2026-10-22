import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {dedup,prune} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';
const dir=path.dirname(fileURLToPath(import.meta.url)),src=path.resolve(dir,'../../../work/city115');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),out=new Document(),buffer=out.createBuffer(),scene=out.createScene('District115 shared landscape');
await MeshoptSimplifier.ready;
const report=[];
for(const name of ['tree','yellow tree','bridge']){
 const input=await io.read(path.join(src,'converted',name+'.glb')),records=[],bb=new T.Box3();
 for(const n of input.getRoot().listNodes())if(n.getMesh())for(const p of n.getMesh().listPrimitives()){
  const pos=Float32Array.from(p.getAttribute('POSITION').getArray()),nor=Float32Array.from(p.getAttribute('NORMAL').getArray()),uv=Float32Array.from(p.getAttribute('TEXCOORD_0')?.getArray()||new Float32Array(pos.length/3*2)),m=new T.Matrix4().fromArray(n.getWorldMatrix()),nm=new T.Matrix3().getNormalMatrix(m),v=new T.Vector3();
  for(let i=0;i<pos.length;i+=3){v.fromArray(pos,i).applyMatrix4(m).toArray(pos,i);bb.expandByPoint(v);v.fromArray(nor,i).applyNormalMatrix(nm).toArray(nor,i);}
  records.push({pos,nor,uv,idx:Uint32Array.from(p.getIndices().getArray()),mat:p.getMaterial()});
 }
 const sourceTriangles=records.reduce((s,r)=>s+r.idx.length/3,0),size=bb.getSize(new T.Vector3()),center=bb.getCenter(new T.Vector3()),scale=2.65/size.y,model=out.createMesh('District115 '+name),far=out.createMesh('District115 '+name+' far');
 model.setExtras({farMesh114:far.getName()});
 const mats=new Map(),textures=new Map();let total=0;
 for(const r of records){
  for(let i=0;i<r.pos.length;i+=3){
   if(name==='bridge'){
    const x=r.pos[i],z=r.pos[i+2],nx=r.nor[i],nz=r.nor[i+2];
    r.pos[i]=(z-center.z)/size.z*6.6;r.pos[i+1]=(r.pos[i+1]-bb.max.y)/size.y*2.2;r.pos[i+2]=(x-center.x)/size.x*31;
    r.nor[i]=nz;r.nor[i+2]=nx;
   }else{r.pos[i]=(r.pos[i]-center.x)*scale;r.pos[i+1]=(r.pos[i+1]-bb.min.y)*scale;r.pos[i+2]=(r.pos[i+2]-center.z)*scale;}
  }
  if(name==='bridge')for(let i=0;i<r.idx.length;i+=3)[r.idx[i+1],r.idx[i+2]]=[r.idx[i+2],r.idx[i+1]];
  // Remesh dense disconnected foliage as leaf sprays at its original canopy
  // positions. Global decimation otherwise discards entire outer branches.
  if(name!=='bridge'&&/leaf|leaves/i.test(r.mat.getName())&&!/stalk/i.test(r.mat.getName())){
   const totalLeaves=records.filter(q=>/leaf|leaves/i.test(q.mat.getName())&&!/stalk/i.test(q.mat.getName())).reduce((s,q)=>s+q.idx.length,0),count=Math.max(24,Math.round(1900*r.idx.length/totalLeaves)),pos=[],nor=[],uv=[],idx=[];
   let seed=115;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
   for(let i=0;i<count;i++){
    const j=r.idx[Math.floor(random()*r.idx.length)]*3,n=new T.Vector3(r.nor[j],r.nor[j+1],r.nor[j+2]).normalize(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),n),w=.075+random()*.065,h=w*(name==='tree'?1:.65),k=pos.length/3;
    for(const [x,y,u,v]of[[-w,-h,0,0],[w,-h,1,0],[-w,h,0,1],[w,h,1,1]]){const p=new T.Vector3(x,y,0).applyQuaternion(q);pos.push(r.pos[j]+p.x,r.pos[j+1]+p.y,r.pos[j+2]+p.z);nor.push(...n.toArray());uv.push(u,v);}idx.push(k,k+1,k+2,k+2,k+1,k+3);
   }r.pos=new Float32Array(pos);r.nor=new Float32Array(nor);r.uv=new Float32Array(uv);r.idx=new Uint32Array(idx);r.foliage=true;
  }
  let mat=mats.get(r.mat);
  if(!mat){
   const mn=r.mat.getName(),leaf=/leaf|leaves|stalk/i.test(mn),color=name==='bridge'?[.40,.44,.44,1]:[1,1,1,1];
   mat=out.createMaterial(name+' '+mn).setBaseColorFactor(color).setRoughnessFactor(.86).setDoubleSided(true);mats.set(r.mat,mat);
   let bytes=r.mat.getBaseColorTexture()?.getImage();
   if(name==='tree'){
    const file=/leaf3/.test(mn)?'Momiji_leaf3.jpeg':leaf?'Momiji_leaf1.jpeg':/Bark/.test(mn)?'Aodamo_Bark.jpeg':'not.jpeg';
    bytes=fs.readFileSync(path.join(src,'source/tree/textures',file));
   }
   if(bytes&&name!=='bridge'){
    const key=name+':'+(name==='tree'?(/leaf3/.test(mn)?'leaf3':leaf?'leaf1':'bark'):mn);
    if(!textures.has(key)){
     let image=sharp(bytes).resize(384,384,{fit:'inside'}).ensureAlpha();
     if(name==='tree'&&leaf){
      const {data,info}=await image.raw().toBuffer({resolveWithObject:true});
      for(let i=0;i<data.length;i+=4)if(data[i]>105&&data[i+1]<30&&data[i+2]<35)data[i+3]=0;
      image=sharp(data,{raw:info});
     }
     if(name==='yellow tree'&&leaf&&!/stalk/i.test(mn)){
      const folder=path.join(src,'source/yellow tree/source/Jacaranda mimosifolia HD_Wild fall mat 100/zzz_LODs/LOD3'),mask=fs.readdirSync(folder).find(n=>n.endsWith('Transparency.png'));
      const {data,info}=await image.modulate({hue:-20,brightness:1.2}).raw().toBuffer({resolveWithObject:true}),alpha=await sharp(path.join(folder,mask)).resize(info.width,info.height).removeAlpha().greyscale().raw().toBuffer();
      for(let i=0;i<alpha.length;i++)data[i*4+3]=alpha[i];image=sharp(data,{raw:info});
     }
     textures.set(key,out.createTexture(key).setImage(await image.png().toBuffer()).setMimeType('image/png'));
    }
    mat.setBaseColorTexture(textures.get(key));
   }
   if(leaf)mat.setAlphaMode('MASK').setAlphaCutoff(.42);
  }
  const budget=name==='bridge'?9000:name==='tree'?11500:10000,raw=records.reduce((s,r)=>s+r.idx.length,0),target=Math.max(36,Math.floor(r.idx.length*Math.min(1,budget*3/raw)/3)*3);
  let idx=r.idx;
  if(!r.foliage&&idx.length>target)idx=MeshoptSimplifier.simplify(idx,r.pos,3,target,.045,['Permissive','Prune'])[0];
  const [remap,count]=MeshoptSimplifier.compactMesh(idx),pos=new Float32Array(count*3),nor=new Float32Array(count*3),uv=new Float32Array(count*2);
  for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff){pos.set(r.pos.subarray(i*3,i*3+3),remap[i]*3);nor.set(r.nor.subarray(i*3,i*3+3),remap[i]*3);uv.set(r.uv.subarray(i*2,i*2+2),remap[i]*2);}
  const a=(type,data)=>out.createAccessor().setBuffer(buffer).setType(type).setArray(data),p=out.createPrimitive().setAttribute('POSITION',a('VEC3',pos)).setAttribute('NORMAL',a('VEC3',nor)).setAttribute('TEXCOORD_0',a('VEC2',uv)).setIndices(a('SCALAR',idx)).setMaterial(mat);
  const low=r.foliage?new Uint32Array(Array.from(idx).filter((_,i)=>Math.floor(i/6)%3===0)):MeshoptSimplifier.simplify(idx,pos,3,Math.max(12,Math.floor(idx.length*.2/3)*3),.09,['Permissive','Prune'])[0];
  model.addPrimitive(p);far.addPrimitive(p.clone().setIndices(a('SCALAR',low)));total+=idx.length/3;
 }
 scene.addChild(out.createNode(name).setMesh(model));scene.addChild(out.createNode(name+' far').setMesh(far));report.push({name,sourceTriangles,triangles:total,bounds:[bb.min.toArray(),bb.max.toArray()]});
}
await out.transform(dedup(),prune());await io.write(path.join(dir,'landscape.glb'),out);
fs.writeFileSync(path.join(dir,'assets.json'),JSON.stringify(report,null,2));console.log(report);
