import fs from 'node:fs';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {prune,dedup} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../pc66/vendor/three/three.core.js';

export const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
// Bake static node transforms and merge only parts sharing material and motion.
export async function bake(doc,select=()=>({group:'body'})){
 const root=doc.getRoot(),groups=new Map(),oldNodes=root.listNodes(),oldMeshes=root.listMeshes(),oldAccessors=root.listAccessors();
 let triangles=0,sourceParts=0;
 for(const node of oldNodes){if(!node.getMesh())continue;const selection=select(node);if(!selection)continue;
  const matrix=new T.Matrix4().fromArray(node.getWorldMatrix());if(selection.matrix)matrix.premultiply(selection.matrix);
  const normalMatrix=new T.Matrix3().getNormalMatrix(matrix),v=new T.Vector3();
  for(const pr of node.getMesh().listPrimitives()){
   const material=pr.getMaterial(),key=selection.group+'|'+root.listMaterials().indexOf(material);
   if(!groups.has(key))groups.set(key,{name:key,group:selection.group,material,p:[],n:[],uv:[],normalUV:[],color:[],idx:[]});
   const g=groups.get(key),p=pr.getAttribute('POSITION'),n=pr.getAttribute('NORMAL'),info=material?.getBaseColorTextureInfo(),uv=pr.getAttribute('TEXCOORD_'+(info?.getTexCoord()||0)),offset=g.p.length/3;
   const tx=info?.getExtension('KHR_texture_transform'),s=tx?.getScale()||[1,1],o=tx?.getOffset()||[0,0],a=tx?.getRotation()||0;
   const color=pr.getAttribute('COLOR_0'),normalUV=pr.getAttribute('TEXCOORD_'+(material?.getNormalTextureInfo()?.getTexCoord()||0));
   for(let i=0;i<p.getCount();i++){
    v.fromArray(p.getElement(i,[])).applyMatrix4(matrix);const position=v.clone();if(selection.deform)selection.deform(position);g.p.push(...position.toArray());
    v.fromArray(n?.getElement(i,[])||[0,1,0]).applyMatrix3(normalMatrix).normalize();if(selection.normal)selection.normal(v,position);g.n.push(...v.normalize().toArray());
    const u=uv?.getElement(i,[])||[0,0],x=u[0]*s[0],y=u[1]*s[1];g.uv.push(o[0]+Math.cos(a)*x-Math.sin(a)*y,o[1]+Math.sin(a)*x+Math.cos(a)*y);
    const c=color?.getElement(i,[])||[1,1,1,1];g.color.push(c[0],c[1],c[2],c[3]??1);g.normalUV.push(...(normalUV?.getElement(i,[])||u));
   }
   const idx=pr.getIndices()?.getArray()||Array.from({length:p.getCount()},(_,i)=>i);for(const i of idx)g.idx.push(i+offset);triangles+=idx.length/3;sourceParts++;
  }
 }
 for(const n of oldNodes)n.dispose();for(const m of oldMeshes)m.dispose();for(const a of oldAccessors)a.dispose();
 const buffer=root.listBuffers()[0]||doc.createBuffer(),scene=root.getDefaultScene()||root.listScenes()[0];
 const acc=(values,type,kind=Float32Array)=>doc.createAccessor().setType(type).setArray(new kind(values)).setBuffer(buffer);
 for(const g of groups.values()){
  const p=doc.createPrimitive().setAttribute('POSITION',acc(g.p,'VEC3')).setAttribute('NORMAL',acc(g.n,'VEC3')).setAttribute('COLOR_0',acc(g.color,'VEC4')).setAttribute('TEXCOORD_0',acc(g.uv,'VEC2')).setAttribute('TEXCOORD_1',acc(g.normalUV,'VEC2')).setIndices(acc(g.idx,'SCALAR',Uint32Array)).setMaterial(g.material);
  scene.addChild(doc.createNode(g.name).setExtras({motion:g.group}).setMesh(doc.createMesh(g.name).addPrimitive(p)));
 }
 for(const m of root.listMaterials()){for(const info of [m.getBaseColorTextureInfo(),m.getNormalTextureInfo(),m.getEmissiveTextureInfo()])if(info){info.setTexCoord(info===m.getNormalTextureInfo()?1:0);const tx=info.getExtension('KHR_texture_transform');if(tx)info.setExtension('KHR_texture_transform',null);}}
 await doc.transform(prune(),dedup());return {triangles,sourceParts,batches:groups.size};
}
export async function compactTextures(doc,max=1024){
 const alpha=new Set(),root=doc.getRoot();for(const m of root.listMaterials())if(m.getAlphaMode()!=='OPAQUE'&&m.getBaseColorTexture())alpha.add(m.getBaseColorTexture());
 for(const t of root.listTextures()){
  const image=sharp(t.getImage()).resize({width:max,height:max,fit:'inside',withoutEnlargement:true}),transparent=alpha.has(t);
  t.setImage(await(transparent?image.png({palette:false}):image.removeAlpha().jpeg({quality:89,chromaSubsampling:'4:4:4'})).toBuffer()).setMimeType(transparent?'image/png':'image/jpeg');
 }
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const doc=await io.read(new URL('../../work/rivian147/Rivian_R1S_2022_FH5_All_Panels.glb',import.meta.url).pathname);
 const report=await bake(doc,node=>{const name=node.getName();let group='body';
  const wheel=name.match(/^(?:rim_|tyre_)(LF|RF|LR|RR)/i)||name.match(/^riv_rotor(lf|rf|lr|rr)/i),caliper=name.match(/^riv_caliper(lf|rf|lr|rr)/i);
  if(wheel)group='wheel-'+wheel[1].toUpperCase();else if(caliper)group='caliper-'+caliper[1].toUpperCase();else if(/^steeringWheel/i.test(name))group='steering';
  return {group};
 });
 await compactTextures(doc,2048);fs.mkdirSync(new URL('./assets',import.meta.url),{recursive:true});const path=new URL('./assets/rivian.glb',import.meta.url).pathname;await io.write(path,doc);
 report.bytes=fs.statSync(path).size;report.geometry='All source triangles retained';fs.writeFileSync(new URL('./assets/report.json',import.meta.url),JSON.stringify(report,null,2));console.log(report);
}
