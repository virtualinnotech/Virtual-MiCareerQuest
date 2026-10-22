import fs from 'node:fs';
import path from 'node:path';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {copyToDocument,prune,dedup,compactPrimitive} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';
const utils=fs.readFileSync(new URL('../../pc66/vendor/three/addons/utils/BufferGeometryUtils.js',import.meta.url),'utf8').replace("from 'three'",`from '${new URL('../../pc66/vendor/three/three.core.js',import.meta.url).href}'`);
const {mergeGeometries}=await import('data:text/javascript;base64,'+Buffer.from(utils).toString('base64'));

const dir=new URL('./',import.meta.url).pathname,work=path.resolve(dir,'../../../work/assets130');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Supplied city assets');
const manifest=[],cache=new Map(),textures=new Map();
await MeshoptSimplifier.ready;
const file=(id,name)=>path.join(work,'source',id,'textures',name);
async function tex(id,name,alpha){
 const key=id+'/'+name+(alpha||'');if(textures.has(key))return textures.get(key);
 let image=sharp(file(id,name)).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true});
 if(alpha){const {data,info}=await image.removeAlpha().raw().toBuffer({resolveWithObject:true});const mask=await sharp(file(id,alpha)).resize(info.width,info.height).greyscale().raw().toBuffer();image=sharp(data,{raw:info}).joinChannel(mask,{raw:{width:info.width,height:info.height,channels:1}});}
 const t=doc.createTexture(key).setImage(await image.png().toBuffer()).setMimeType('image/png');textures.set(key,t);return t;
}
async function source(id){
 if(cache.has(id))return cache.get(id);
 const d=await io.read(path.join(work,'converted',id+'.glb'));
 const copied=copyToDocument(doc,d,d.getRoot().listMaterials()),materials=new Map();
 for(const m of d.getRoot().listMaterials()){
  const n=copied.get(m),name=m.getName();materials.set(m,n);n.setName(id+' '+name).setDoubleSided(true);
  n.setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null).setEmissiveFactor([0,0,0]);
  const maps=async(base,normal,alpha)=>{n.setBaseColorFactor([1,1,1,1]).setBaseColorTexture(await tex(id,base,alpha));if(normal)n.setNormalTexture(await tex(id,normal));if(alpha)n.setAlphaMode('MASK').setAlphaCutoff(.42);};
  if(id==='metro-bench-model')await maps('Bench_L_standardSurface1_BaseColor.tga.png','Bench_L_standardSurface1_Normal.tga.png','Bench_L_standardSurface1_Opacity.tga.png');
  if(id==='polara-crosswalk-with-scanned-texture')await maps('Polara Crosswalk.jpeg','Polara Crosswalk_normal.jpeg');
  if(id==='sidewalks')await maps('SidewalkMat_albedo.jpg','SidewalkMat_normal.png');
  if(id==='grass'){const stem=(name.match(/Grass[123]?/)||['Grass'])[0];await maps(stem+'.png',stem+'_Normal.png',stem+'_Opacity.png');n.setRoughnessFactor(.94);}
  if(id==='trash-can-recycle-bin-16mb-4part')await maps({'01':'R_BaseColor.png','02':'B_BaseColor.png','03':'G_BaseColor.png','04':'01_DefaultMaterial_BaseColor.png'}[name],'Normal.png');
  if(id==='city-bus-rigged-5236'){
   if(name==='RoAZ_5236')await maps('RoAZ_5236_TEXTURE.png');
   else if(/Interior|IntDoors/.test(name))await maps('Interior_Day.png');
   else if(name==='BusWheel')await maps('BusWheel.png');
   n.setRoughnessFactor(.25).setMetallicFactor(.3).setExtras({vehicleSurface114:name==='Mirrors'?23:21});
  }
  if(id==='sinowatcher-malaysia-traffic-signal-set-2'){
   const meta=JSON.parse(fs.readFileSync(path.join(work,'converted',id+'.json'))).materials.find(x=>x.name===name);
   const image=meta?.textures?.find(t=>fs.existsSync(file(id,path.basename(t.file))));
   if(image)await maps(path.basename(image.file));
   n.setRoughnessFactor(.43).setMetallicFactor(.45);
  }
  if(id==='flower-stand-filled'){
   const suffix=Number(name.split('.').at(-1))||0,stem=['FlowerStandTexture','Flower3Texture','Flower2Texture','Flower4Texture','FlowerTexture'][suffix];
   await maps(stem+'.png',null,fs.existsSync(file(id,stem+'OM.png'))?stem+'OM.png':null);
  }
  if(id==='soviet-bench-2'){n.setBaseColorFactor([1,1,1,1]);n.setNormalTexture(null);}
  if(id==='school-bus-conversion'){
   n.setAlphaMode('OPAQUE').setBaseColorFactor([...n.getBaseColorFactor().slice(0,3),1]);
   const c=n.getBaseColorFactor(),dark=Math.max(...c.slice(0,3))<.25;
   const surface=/glass|window/i.test(name)?22:/Mirror|Metal_Aluminum|Corrugated/i.test(name)?23:dark?0:30;
   n.setRoughnessFactor(dark?.82:.32).setMetallicFactor(dark?0:.16).setExtras({vehicleSurface114:surface});
  }
 }
 const out={d,materials};cache.set(id,out);return out;
}
function geometry(p,m,skin){
 const g=new T.BufferGeometry();for(const [a,b,s]of[['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]]){const v=p.getAttribute(a);if(v)g.setAttribute(b,new T.BufferAttribute(new Float32Array(v.getArray()),s));}
 g.setIndex(Array.from(p.getIndices()?.getArray()||Array.from({length:g.attributes.position.count},(_,i)=>i)));
 if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
 if(skin&&p.getAttribute('JOINTS_0')){
  const joints=skin.listJoints(),ib=skin.getInverseBindMatrices(),matrices=joints.map((j,i)=>new T.Matrix4().fromArray(j.getWorldMatrix()).multiply(new T.Matrix4().fromArray(ib.getElement(i,[])))),weights=p.getAttribute('WEIGHTS_0'),ids=p.getAttribute('JOINTS_0');
  for(let i=0;i<g.attributes.position.count;i++){
   const js=ids.getElement(i,[]),ws=weights.getElement(i,[]),blend=new T.Matrix4();blend.elements.fill(0);
   for(let k=0;k<4;k++)if(ws[k])for(let c=0;c<16;c++)blend.elements[c]+=matrices[js[k]].elements[c]*ws[k];
   const v=new T.Vector3().fromBufferAttribute(g.attributes.position,i).applyMatrix4(blend),n=new T.Vector3().fromBufferAttribute(g.attributes.normal,i).applyNormalMatrix(new T.Matrix3().getNormalMatrix(blend));
   g.attributes.position.setXYZ(i,...v.toArray());g.attributes.normal.setXYZ(i,...n.toArray());
  }
  return g;
 }
 return g.applyMatrix4(m);
}
async function model(name,id,{select=()=>true,height,width,length,rx=0,ry=0,maxTriangles=12000,origin='center'}={}){
 const {d,materials}=await source(id),parts=[];
 const busInk=id==='school-bus-conversion'?doc.createMaterial('School bus original lettering').setBaseColorFactor([.008,.009,.01,1]).setRoughnessFactor(.8).setExtras({vehicleSurface114:0}):null;
 for(const n of d.getRoot().listNodes())if(n.getMesh()&&select(n))for(const p of n.getMesh().listPrimitives()){
  if(p.getMode()!==4||!p.getAttribute('POSITION'))continue;
  const g=geometry(p,new T.Matrix4().fromArray(n.getWorldMatrix()),n.getSkin());g.rotateX(rx);g.rotateY(ry);
  let mat=materials.get(p.getMaterial());if(!mat){mat=doc.createMaterial(id+' default').setDoubleSided(true);materials.set(null,mat);if(id.startsWith('polara'))mat.setBaseColorTexture(await tex(id,'Polara Crosswalk.jpeg')).setNormalTexture(await tex(id,'Polara Crosswalk_normal.jpeg'));}
  // The source has overlapping rear letters, and both complete word meshes
  // sit partly inside the curved body skin. Keep one word per end, outside it.
  if(busInk&&/^instance_5\.(017|026)$/.test(n.getName())){g.translate(0,0,n.getName().endsWith('017')?.04:-.04);mat=busInk;}
  parts.push({g,m:mat});
 }
 if(!parts.length)throw Error('Empty '+name);
 if(id==='school-bus-conversion'){
  const flat=[...new Set(parts.map(p=>p.m).filter(m=>!m.getBaseColorTexture()))],pixels=Buffer.alloc(256*4);
  flat.forEach((m,i)=>{const c=m.getBaseColorFactor();for(let k=0;k<3;k++)pixels[i*4+k]=Math.round(new T.Color().setRGB(c[0],c[1],c[2]).convertLinearToSRGB().toArray()[k]*255);pixels[i*4+3]=255;});
  const paletteTexture=doc.createTexture('School bus source palette').setImage(await sharp(pixels,{raw:{width:256,height:1,channels:4}}).png().toBuffer()).setMimeType('image/png'),palettes=new Map();
  for(const p of parts){
   const i=flat.indexOf(p.m);if(i<0)continue;
   const surface=p.m.getExtras().vehicleSurface114;
   if(!palettes.has(surface))palettes.set(surface,doc.createMaterial('Supplied school bus '+({0:'matte rubber and trim',22:'window glass',23:'bright metal',30:'enamel paint'}[surface])).setBaseColorTexture(paletteTexture).setMetallicFactor(surface===0?0:surface===23?.8:.16).setRoughnessFactor(surface===0?.82:.32).setDoubleSided(true).setExtras({vehicleSurface114:surface}));
   for(let k=0;k<p.g.attributes.uv.count;k++)p.g.attributes.uv.setXY(k,(i+.5)/256,.5);p.m=palettes.get(surface);
  }
 }
 const bounds=new T.Box3();for(const p of parts){p.g.computeBoundingBox();bounds.union(p.g.boundingBox);}
 const size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=height?height/size.y:width?width/size.x:length?length/size.z:1;
 const groups=new Map();for(const p of parts){p.g.translate(-center.x,-bounds.min.y,-center.z).scale(scale,scale,scale);if(!groups.has(p.m))groups.set(p.m,[]);groups.get(p.m).push(p.g);}
 const mesh=doc.createMesh(name),total=parts.reduce((s,p)=>s+p.g.index.count/3,0);let triangles=0;
 for(const [m,gs]of groups){
  const g=mergeGeometries(gs),a=(v,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(v);
  let indices=new Uint32Array(g.index.array);const target=Math.max(12,Math.floor(indices.length*Math.min(1,maxTriangles/total)/3)*3);
  if(target<indices.length)try{[indices]=MeshoptSimplifier.simplify(indices,g.attributes.position.array,3,target,.015,['LockBorder']);}catch{}
  triangles+=indices.length/3;
  mesh.addPrimitive(doc.createPrimitive().setMaterial(m).setAttribute('POSITION',a(g.attributes.position.array,'VEC3')).setAttribute('NORMAL',a(g.attributes.normal.array,'VEC3')).setAttribute('TEXCOORD_0',a(g.attributes.uv.array,'VEC2')).setIndices(a(indices,'SCALAR')));
 }
 const spec={name,archive:id+'.zip',size:size.multiplyScalar(scale).toArray(),triangles};mesh.setExtras(spec);scene.addChild(doc.createNode(name).setMesh(mesh));manifest.push(spec);console.log(spec);return mesh;
}
await model('bench-metro','metro-bench-model',{width:1.08});
await model('bench-soviet','soviet-bench-2',{width:1.08});
await model('bench-002','bench-002',{width:.94});
await model('polara','polara-crosswalk-with-scanned-texture',{height:.19,rx:Math.PI/2,maxTriangles:4500});
await model('signal-american','traffic-light',{height:3.25});
await model('signal-sinowatcher','sinowatcher-malaysia-traffic-signal-set-2',{select:n=>n.getName()==='mast arm.006',height:3.25});
await model('flowers','flower-stand-filled',{width:1.05});
await model('grass-tuft','grass',{select:n=>n.getName()==='Grass1',height:.16,maxTriangles:2400});
await model('grass-small','grass',{select:n=>n.getName()==='GrassAutumn3',height:.075,maxTriangles:1500});
for(const [name,object,height]of[['dumpster','metal street props low poly.006',.48],['street-bin','metal street props low poly.007',.44],['street-signal','metal street props low poly.005',1.44]])await model(name,'street-and-city-props-dumpster-traffic-light',{select:n=>n.getName()===object,height});
for(const [name,object,height]of[['waste-station','Bin2',.46],['wood-bin','Bin1',.44]])await model(name,'waste-bins',{select:n=>n.getName()===object,height});
for(const [name,mat]of[['recycle-blue','02'],['recycle-green','03'],['waste-grey','04']])await model(name,'trash-can-recycle-bin-16mb-4part',{select:n=>n.getMesh()?.listPrimitives().some(p=>p.getMaterial()?.getName()===mat),height:.47});
// This archive also includes camper cabinetry coplanar with the bus exterior.
// Retain the authored bus shell, trim, lights and wheels, not the conversion fit-out.
const camperParts=/^(?:0\.|Pillow|Cube|Plane$|Vooraadkast|Fridge)|^(?:group_39\.00[89]|group_50\.001|instance_5\.(?:009|01[0-6]))$/;
// Preserve thin source lettering and trim: simplifying this merged SketchUp mesh
// collapses adjacent coplanar color boundaries into broken letters and stripes.
await model('school-bus','school-bus-conversion',{select:n=>!camperParts.test(n.getName()),length:4.5,maxTriangles:Infinity});
await model('city-bus','city-bus-rigged-5236',{select:n=>n.getName()!=='ShadowPlane',length:4.9});
// The source sidewalk modules retain their authored UVs for small plaza approaches.
await model('sidewalk-module','sidewalks',{select:n=>n.getName()==='Sidewwalk_Long',width:2.4});
for(const t of doc.getRoot().listTextures()){
 if(!t.getImage())continue;
 const alpha=doc.getRoot().listMaterials().some(m=>m.getBaseColorTexture()===t&&m.getAlphaMode()!=='OPAQUE');
 try{const image=sharp(t.getImage()).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true});t.setImage(await (alpha?image.png():image.removeAlpha().jpeg({quality:93,chromaSubsampling:'4:4:4'})).toBuffer()).setMimeType(alpha?'image/png':'image/jpeg');}catch{}
}
for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives())compactPrimitive(p);
await doc.transform(dedup(),prune());
doc.getRoot().setExtras({manifest});for(const a of doc.getRoot().listAccessors())a.setBuffer(buffer);for(const b of doc.getRoot().listBuffers())if(b!==buffer)b.dispose();
await io.write(path.join(dir,'library.glb'),doc);fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
