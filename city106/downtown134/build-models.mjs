import fs from 'node:fs';
import path from 'node:path';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {copyToDocument,compactPrimitive,prune,dedup} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';

const dir=new URL('.',import.meta.url).pathname,work=path.resolve(dir,'../../../work/downtown134');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Downtown134 supplied models'),models=[];
await MeshoptSimplifier.ready;
// The nested archive references Sketchfab-packed image names absent from its folder.
const suvFolder=path.join(work,'source/police-car-suv'),gltf=JSON.parse(fs.readFileSync(path.join(suvFolder,'source/ford interceptor low poly.gltf')));
const images=fs.readdirSync(path.join(suvFolder,'textures'));
gltf.images.forEach((image,i)=>{const name=images.find(n=>new RegExp('_'+i+'(?:@|\\.)').test(n));if(!name)throw Error('Missing SUV image '+i);image.uri='../textures/'+encodeURIComponent(name);});
fs.writeFileSync(path.join(suvFolder,'source/prepared.gltf'),JSON.stringify(gltf));

function geometry(p,node){
 const g=new T.BufferGeometry();
 for(const [a,b,s]of[['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]]){const v=p.getAttribute(a);if(v)g.setAttribute(b,new T.BufferAttribute(new Float32Array(v.getArray()),s));}
 g.setIndex(Array.from(p.getIndices()?.getArray()||Array.from({length:g.attributes.position.count},(_,i)=>i)));
 if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
 return g.applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix()));
}
function emit(name,parts,budget=45000){
 const groups=new Map(),model=doc.createMesh(name),total=parts.reduce((s,p)=>s+p.g.index.count/3,0);let triangles=0;
 for(const p of parts){if(!groups.has(p.m))groups.set(p.m,[]);groups.get(p.m).push(p.g);}
 for(const [m,gs]of groups){
  const positions=[],normals=[],uvs=[],ids=[];let offset=0;
  for(const g of gs){for(const v of g.attributes.position.array)positions.push(v);for(const v of g.attributes.normal.array)normals.push(v);for(const v of g.attributes.uv.array)uvs.push(v);for(const i of g.index.array)ids.push(i+offset);offset+=g.attributes.position.count;}
  const pos=new Float32Array(positions);let indices=new Uint32Array(ids),target=Math.max(24,Math.floor(indices.length*Math.min(1,budget/total)/3)*3);
  if(target<indices.length)[indices]=MeshoptSimplifier.simplify(indices,pos,3,target,.0015,['LockBorder']);
  const a=(values,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(values);
  const p=doc.createPrimitive().setMaterial(m).setAttribute('POSITION',a(pos,'VEC3')).setAttribute('NORMAL',a(new Float32Array(normals),'VEC3')).setAttribute('TEXCOORD_0',a(new Float32Array(uvs),'VEC2')).setIndices(a(indices,'SCALAR'));compactPrimitive(p);model.addPrimitive(p);triangles+=indices.length/3;
 }
 model.setExtras({triangles});return model;
}
const marking=doc.createMaterial('Grand Rapids POLICE reflective door lettering').setBaseColorTexture(doc.createTexture('Grand Rapids POLICE').setImage(await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="320"><rect width="1024" height="320" fill="#eef0ef"/><path d="M0 16h1024M0 304h1024" stroke="#1c344b" stroke-width="22"/><text x="512" y="115" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="89" fill="#1c344b">Grand Rapids</text><text x="512" y="263" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="158" fill="#152d46">POLICE</text></svg>')).png().toBuffer()).setMimeType('image/png')).setMetallicFactor(0).setRoughnessFactor(.5).setDoubleSided(false);
for(const [id,archive,filename]of[
 ['police','ford-police-interceptor-utility-2020',path.join(work,'converted/ford-police-interceptor-utility-2020.glb')],
 ['police-suv','police-car-suv',path.join(suvFolder,'source/prepared.gltf')],
 ['hotel','the-h',path.join(work,'converted/the-h.glb')]
]){
 const source=await io.read(filename),mapping=copyToDocument(doc,source,source.getRoot().listMaterials()),parts=[],bounds=new T.Box3(),isHotel=id==='hotel',isFord=id==='police';
 for(const old of source.getRoot().listMaterials()){
  const m=mapping.get(old),name=old.getName();m.setName(id+' '+name).setDoubleSided(true).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null).setEmissiveFactor([0,0,0]);
  for(const ext of m.listExtensions())m.setExtension(ext.extensionName,null);
  if(isHotel){
   if(/light/i.test(name))m.setBaseColorFactor([.8,.64,.40,1]).setExtras({surfaceType:28});
   else if(name==='try')m.setBaseColorFactor([.15,.23,.25,1]).setMetallicFactor(.45).setRoughnessFactor(.28).setExtras({surfaceType:31});
   else if(name==='METAL GREEN')m.setBaseColorFactor([.12,.20,.16,1]);
  }else{
   const surface=/window|transparent material/i.test(name)?22:/chrome|galv/i.test(name)?23:/car paint|^body$|^decal$/.test(name.toLowerCase())?30:0;
   m.setExtras({vehicleSurface114:surface}).setRoughnessFactor(surface===0?.72:.32).setMetallicFactor(surface===23?.8:surface===30?.2:0);
   if(surface===22)m.setBaseColorFactor([.035,.055,.064,1]).setAlphaMode('OPAQUE').setBaseColorTexture(null);
   if(isFord&&name==='Car Paint')m.setBaseColorFactor([.045,.055,.065,1]);
   if(!isFord&&name==='body')m.setBaseColorTexture(null).setBaseColorFactor([.028,.036,.045,1]);
   if(!isFord&&name==='decal')m.setBaseColorTexture(null).setBaseColorFactor([.70,.73,.73,1]).setMetallicFactor(.05).setRoughnessFactor(.42);
   if(!isFord&&name==='tire material')m.setRoughnessFactor(.92).setMetallicFactor(0);
   if(/white|lightbulb/i.test(name))m.setBaseColorFactor([.9,.91,.84,1]).setEmissiveFactor([1.5,1.4,1.15]).setAlphaMode('OPAQUE');
   if(name==='Plastic_Clear_Rainbow_')m.setBaseColorFactor([.7,.8,.86,.16]).setAlphaMode('BLEND');
   if(/Red|Blue/.test(name))m.setEmissiveFactor([0,0,0]);
  }
 }
 for(const node of source.getRoot().listNodes())if(node.getMesh())for(const p of node.getMesh().listPrimitives()){
  if(p.getMode()!==4||!p.getAttribute('POSITION'))continue;
  const old=p.getMaterial(),name=old?.getName()||'';
  if(/Hidden_Source_Lights|Lamp_Glow|Emergency_Glow/.test(name)||(!isFord&&!isHotel&&name==='logo'))continue;
  const g=geometry(p,node);
  // The loose Sketchfab maps are flipped relative to the nested source glTF.
  if(!isFord&&!isHotel)for(let i=0;i<g.attributes.uv.count;i++)g.attributes.uv.setY(i,1-g.attributes.uv.getY(i));
  g.computeBoundingBox();if(g.boundingBox.getSize(new T.Vector3()).length()<.0001)continue;
  const wheel=!isHotel&&(isFord?/^Mesh_13[234](\.|$)/.test(node.getName()):/Cylinder|tire/i.test(node.getName()));
  parts.push({g,m:mapping.get(old),wheel});bounds.union(g.boundingBox);
 }
 const originalSize=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=(isHotel?10:2.03)/(isHotel?originalSize.x:originalSize.z);
 const size=originalSize.clone().multiplyScalar(scale).toArray();
 for(const p of parts){p.g.translate(-center.x,-bounds.min.y,-center.z).scale(scale,scale,scale);p.g.computeBoundingBox();const c=p.g.boundingBox.getCenter(new T.Vector3());p.wheelKey=Math.sign(c.x)+','+Math.sign(c.z);}
 const bodyParts=parts.filter(p=>!p.wheel),wheels=[],groupNode=doc.createNode(id);scene.addChild(groupNode);
 if(!isHotel){
  for(const sx of[-1,1])for(const sz of[-1,1]){
   const group=parts.filter(p=>p.wheel&&p.wheelKey===sx+','+sz),b=new T.Box3();group.forEach(p=>b.union(p.g.boundingBox));
   if(!group.length)throw Error('Missing wheel '+id+' '+sx+' '+sz);
   const offset=b.getCenter(new T.Vector3()).toArray(),role='wheel-'+sx+'-'+sz;
   group.forEach(p=>p.g.translate(...offset.map(x=>-x)));const wheel=emit(id+' '+role,group,3500);groupNode.addChild(doc.createNode(id+' '+role).setMesh(wheel).setTranslation(offset));
   wheels.push({role,offset,radius:(b.max.y-b.min.y)/2,front:sz>0});
  }
  // Fit both labels to the actual door skin, keeping a small depth offset.
  const surfaces=bodyParts.filter(p=>/Car Paint| body$| decal$/.test(p.m.getName())).map(p=>new T.Mesh(p.g,new T.MeshBasicMaterial({side:T.DoubleSide}))),ray=new T.Raycaster();
  for(const side of[-1,1]){
   const g=new T.PlaneGeometry(.58,.19,24,8);for(let i=0;i<g.attributes.uv.count;i++)g.attributes.uv.setY(i,1-g.attributes.uv.getY(i));g.rotateY(side*Math.PI/2);g.translate(side*size[0]/2,.35,-.02);
   const pos=g.attributes.position;
   for(let i=0;i<pos.count;i++){
    ray.set(new T.Vector3(side*(size[0]+1),pos.getY(i),pos.getZ(i)),new T.Vector3(-side,0,0));
    const hit=ray.intersectObjects(surfaces,false)[0];if(hit)pos.setX(i,hit.point.x+side*.0025);
   }
   g.computeVertexNormals();bodyParts.push({g,m:marking});
  }
 }
 const body=emit(id+' body',bodyParts,isHotel?80000:55000);groupNode.addChild(doc.createNode(id+' body').setMesh(body));
 const record={id,archive:archive+'.zip',body:body.getName(),width:size[0],height:size[1],length:size[2],frontZ:size[2]/2,rearZ:-size[2]/2,wheels,triangles:body.getExtras().triangles};models.push(record);console.log(record);
}
for(const tex of doc.getRoot().listTextures())if(tex.getImage()){
 const alpha=doc.getRoot().listMaterials().some(m=>m.getBaseColorTexture()===tex&&m.getAlphaMode()!=='OPAQUE');
 const image=sharp(tex.getImage()).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true});tex.setImage(await(alpha?image.png():image.removeAlpha().jpeg({quality:94,chromaSubsampling:'4:4:4'})).toBuffer()).setMimeType(alpha?'image/png':'image/jpeg');
}
await doc.transform(prune(),dedup());for(const a of doc.getRoot().listAccessors())a.setBuffer(buffer);for(const b of doc.getRoot().listBuffers())if(b!==buffer)b.dispose();
doc.getRoot().setExtras({models});await io.write(path.join(dir,'models.glb'),doc);fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(models,null,2)+'\n');
