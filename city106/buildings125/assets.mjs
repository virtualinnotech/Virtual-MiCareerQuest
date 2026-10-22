import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {dedup,prune} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';

const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../../../work/buildings125');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),out=new Document(),buffer=out.createBuffer(),scene=out.createScene('Supplied building library 125');
const sources=[
 ['london','london.glb',n=>!/^Flare|Sidewalk/.test(n)],
 ['chicago','chicago.glb',n=>n!=='Sidewalks'],
 ['nyc','source/city-nyc-buildings/source/Untitled.glb',()=>true],
 ['scene','source/city-scene/source/Untitled.glb',n=>!['Building_12.001_Color3_0.002','Building_12.001_Color3_0.010','Building_12.001_Color3_0.011','Building_12.001_Color3_0.012','Building_12.001_Color3_0.013','Building_12.001_Color3_0.014','Building_12.001_Color3_0.020'].includes(n)],
 ['pbr','source/realistic-lowpoly-gameready-building-4k-pbr/source/Untitled4.glb',()=>true],
 ['procedural','source/procedural-city-3/source/Terrain Remaked.glb',n=>n==='CityGen Buildings.001']
];
await MeshoptSimplifier.ready;
const report=[],textures=new Map(),materials=new Map();
const accessor=(type,a)=>out.createAccessor().setBuffer(buffer).setType(type).setArray(a);
function simplify(idx,pos,nor,uv,target,error){
 const attributes=new Float32Array(pos.length/3*5);
 for(let i=0;i<pos.length/3;i++)attributes.set([nor[i*3],nor[i*3+1],nor[i*3+2],uv[i*2],uv[i*2+1]],i*5);
 return MeshoptSimplifier.simplifyWithAttributes(idx,pos,3,attributes,5,[.5,.5,.5,2,2],null,Math.min(idx.length,target),error,['Permissive'])[0];
}
async function map(source,texture,override,normal=false){
 if(!texture&&!override)return null;
 const key=source+':'+(override||texture.getName())+':'+normal;
 if(textures.has(key))return textures.get(key);
 const bytes=override?fs.readFileSync(path.join(root,override)):texture.getImage();if(!bytes)return null;
 const opaque=(await sharp(bytes).stats()).isOpaque,size=normal?512:1024;
 const image=sharp(bytes).resize(size,size,{fit:'inside',withoutEnlargement:true}),png=normal||!opaque;
 const data=png?await image.png().toBuffer():await image.jpeg({quality:90}).toBuffer();
 const t=out.createTexture(key).setImage(data).setMimeType(png?'image/png':'image/jpeg');textures.set(key,t);return t;
}
async function material(source,m){
 const key=source+':'+(m?.getName()||'unassigned');if(materials.has(key))return materials.get(key);
 const name=m?.getName()||'',glass=/glass/i.test(name);
 const masonry={Color1:[.28,.125,.07,1],'Color1.001':[.17,.14,.11,1],Color2:[.33,.37,.39,1],'Color2.001':[.10,.12,.13,1],Color4:[.38,.39,.37,1],'Color4.001':[.095,.105,.10,1],'Color3.001':[.13,.12,.10,1]};
 const color=(source==='scene'&&masonry[name])||m?.getBaseColorFactor()||[.6,.58,.54,1];
 const result=out.createMaterial('Building125 '+key).setBaseColorFactor(color).setMetallicFactor(glass?.18:Math.min(.35,m?.getMetallicFactor()||0)).setRoughnessFactor(glass?.12:Math.max(.55,m?.getRoughnessFactor()??.8)).setDoubleSided(true);
 let override;
 if(source==='chicago')override={'BLACK BUILD':'black build.jpeg',Building:'cool pair..jpeg',Bricks:'bricks.png',Bulbs:'bulbs.png'}[name];
 if(override)override='source/realistic-chicago-buildings/textures/'+override;
 if(source==='london'&&glass)override='source/free-london-skyscraper/textures/Glass_Diffuse.png';
 const base=await map(source,m?.getBaseColorTexture(),override),normal=await map(source,m?.getNormalTexture(),null,true);
 if(base){result.setBaseColorTexture(base);if(override)result.setBaseColorFactor([1,1,1,1]);}
 if(normal)result.setNormalTexture(normal);
 if(glass){result.setBaseColorFactor(base?[.65,.73,.78,1]:[.09,.15,.18,1]);result.setAlphaMode('OPAQUE').setExtras({surfaceType:4,reflectiveWindow125:true});}
 else if(m?.getAlphaMode()!=='OPAQUE'&&base)result.setAlphaMode('MASK').setAlphaCutoff(.35);
 materials.set(key,result);return result;
}

for(const [source,file,include]of sources){
 const input=await io.read(path.join(root,file)),records=[],all=new T.Box3();
 for(const n of input.getRoot().listNodes())if(n.getMesh()&&include(n.getName()))for(const p of n.getMesh().listPrimitives()){
  const pos=Float32Array.from(p.getAttribute('POSITION').getArray()),uv=Float32Array.from(p.getAttribute('TEXCOORD_0')?.getArray()||new Float32Array(pos.length/3*2));
  const idx=Uint32Array.from(p.getIndices()?.getArray()||Array.from({length:pos.length/3},(_,i)=>i));
  const transform=p.getMaterial()?.getBaseColorTextureInfo()?.getExtension('KHR_texture_transform');
  if(transform){const scale=transform.getScale(),offset=transform.getOffset(),rotation=transform.getRotation(),c=Math.cos(rotation),s=Math.sin(rotation);for(let i=0;i<uv.length;i+=2){const x=uv[i]*scale[0],y=uv[i+1]*scale[1];uv[i]=c*x-s*y+offset[0];uv[i+1]=s*x+c*y+offset[1];}}
  let nor=p.getAttribute('NORMAL')?.getArray();
  if(!nor){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setIndex(new T.BufferAttribute(idx,1));g.computeVertexNormals();nor=g.attributes.normal.array;}
  nor=Float32Array.from(nor);
  const matrix=new T.Matrix4().fromArray(n.getWorldMatrix()),nm=new T.Matrix3().getNormalMatrix(matrix),v=new T.Vector3();
  if(matrix.determinant()<0)for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];
  for(let i=0;i<pos.length;i+=3){v.fromArray(pos,i).applyMatrix4(matrix).toArray(pos,i);all.expandByPoint(v);v.fromArray(nor,i).applyNormalMatrix(nm).toArray(nor,i);}
  const name=n.getName(),cx=pos.filter((_,i)=>i%3===0).reduce((a,b)=>a+b,0)/(pos.length/3);
  const group=source==='chicago'?(name==='Building'?1:0):source==='nyc'?(/^geo1/.test(name)?(/\.\d+$/.test(name)?1:0):(cx<-44?2:3)):null;
  records.push({pos,nor,uv,idx,mat:p.getMaterial(),name,group});
 }
 // Split supplied city scenes into complete building footprints, not individual windows.
 const cell=source==='chicago'?1.5:.65,cells=new Set(),key=(x,z)=>x+','+z;
 if(!['london','pbr'].includes(source))for(const r of records)for(let i=0;i<r.idx.length;i+=3){
  const ids=[r.idx[i],r.idx[i+1],r.idx[i+2]],ys=ids.map(v=>r.pos[v*3+1]);if(Math.max(...ys)<all.min.y+5)continue;
  const xs=ids.map(v=>r.pos[v*3]),zs=ids.map(v=>r.pos[v*3+2]);
  for(let x=Math.floor(Math.min(...xs)/cell);x<=Math.floor(Math.max(...xs)/cell);x++)for(let z=Math.floor(Math.min(...zs)/cell);z<=Math.floor(Math.max(...zs)/cell);z++)cells.add(key(x,z));
 }
 const clusters=[];
 while(cells.size){const first=cells.values().next().value,queue=[first];cells.delete(first);let x0=Infinity,z0=Infinity,x1=-Infinity,z1=-Infinity;
  for(let i=0;i<queue.length;i++){const [x,z]=queue[i].split(',').map(Number);x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);
   for(const [xx,zz]of[[x-1,z],[x+1,z],[x,z-1],[x,z+1]]){const k=key(xx,zz);if(cells.delete(k))queue.push(k);}
  }
  if((x1-x0)*cell>3&&(z1-z0)*cell>3)clusters.push({x0:x0*cell-.25,x1:(x1+1)*cell+.25,z0:z0*cell-.25,z1:(z1+1)*cell+.25});
 }
 if(['london','pbr'].includes(source))clusters.push({x0:all.min.x-1,x1:all.max.x+1,z0:all.min.z-1,z1:all.max.z+1});
 if(['chicago','nyc'].includes(source)){clusters.length=0;for(const group of [...new Set(records.map(r=>r.group))])clusters.push({group});}
 clusters.sort((a,b)=>a.x0-b.x0||a.z0-b.z0);
 for(let ci=0;ci<clusters.length;ci++){
  const c=clusters[ci],parts=[],bounds=new T.Box3();
  for(const r of records){if(c.group!==undefined&&r.group!==c.group)continue;const ids=[];for(let i=0;i<r.idx.length;i+=3){const vs=[r.idx[i],r.idx[i+1],r.idx[i+2]],x=vs.reduce((s,v)=>s+r.pos[v*3],0)/3,z=vs.reduce((s,v)=>s+r.pos[v*3+2],0)/3;
   if(c.group!==undefined||(x>=c.x0&&x<=c.x1&&z>=c.z0&&z<=c.z1)){ids.push(...vs);for(const v of vs)bounds.expandByPoint(new T.Vector3().fromArray(r.pos,v*3));}
  }if(ids.length)parts.push({...r,idx:new Uint32Array(ids)});}
  const size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  if(!parts.length||size.y<3||size.x/size.z>6||size.z/size.x>6)continue;
  const name=source+'-'+ci,total=parts.reduce((s,p)=>s+p.idx.length,0),model=out.createMesh(name),far=out.createMesh(name+' far');
  model.setExtras({building125:true,source,farMesh114:far.getName(),size:size.toArray()});
  const merged=new Map();
  for(const p of parts){const mat=await material(source,p.mat);if(!merged.has(mat))merged.set(mat,{pos:[],nor:[],uv:[],idx:[]});const g=merged.get(mat),offset=g.pos.length/3;
   const budget=source==='london'?24000:18000,target=Math.max(96,Math.floor(p.idx.length*Math.min(1,budget*3/total)/3)*3);
   let indices=p.idx;if(indices.length>target&&!/glass/i.test(mat.getName()))indices=simplify(indices,p.pos,p.nor,p.uv,target,.005);
   const [remap,count]=MeshoptSimplifier.compactMesh(indices),pos=new Float32Array(count*3),nor=new Float32Array(count*3),uv=new Float32Array(count*2);
   for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff){const v=remap[i];pos.set([p.pos[i*3]-center.x,p.pos[i*3+1]-bounds.min.y,p.pos[i*3+2]-center.z],v*3);nor.set(p.nor.subarray(i*3,i*3+3),v*3);uv.set(p.uv.subarray(i*2,i*2+2),v*2);}
   for(const a of pos)g.pos.push(a);for(const a of nor)g.nor.push(a);for(const a of uv)g.uv.push(a);for(const a of indices)g.idx.push(a+offset);
  }
  let triangles=0;
  for(const [mat,g]of merged){const pos=new Float32Array(g.pos),idx=new Uint32Array(g.idx),p=out.createPrimitive().setAttribute('POSITION',accessor('VEC3',pos)).setAttribute('NORMAL',accessor('VEC3',new Float32Array(g.nor))).setAttribute('TEXCOORD_0',accessor('VEC2',new Float32Array(g.uv))).setIndices(accessor('SCALAR',idx)).setMaterial(mat);
   model.addPrimitive(p);const low=source!=='nyc'||/glass/i.test(mat.getName())?idx:simplify(idx,pos,new Float32Array(g.nor),new Float32Array(g.uv),Math.max(24,Math.floor(idx.length*.4/3)*3),.004);far.addPrimitive(p.clone().setIndices(accessor('SCALAR',low)));triangles+=idx.length/3;
  }
  scene.addChild(out.createNode(name).setMesh(model));scene.addChild(out.createNode(name+' far').setMesh(far));
  report.push({name,source,size:size.toArray(),bounds:[bounds.min.toArray(),bounds.max.toArray()],sourceTriangles:total/3,triangles,materials:merged.size});
 }
 console.log(source,report.filter(r=>r.source===source).map(r=>({name:r.name,size:r.size.map(v=>+v.toFixed(1)),triangles:r.triangles})));
}
await out.transform(dedup(),prune());await io.write(path.join(dir,'buildings.glb'),out);
fs.writeFileSync(path.join(dir,'assets.json'),JSON.stringify(report,null,2)+'\n');
