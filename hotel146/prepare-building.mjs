import fs from 'node:fs';
import assimp from '../../work/browser/node_modules/assimpjs/dist/assimpjs.js';
import {io,bake} from '../rivian147/prepare.mjs';
import * as T from '../pc66/vendor/three/three.core.js';
import {prune,dedup,weld} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import C from './core.js';
import {facadeFinishes,finish,projectUV} from './finishes149.mjs';

// Assimp resolves all 3DS keyframe instances, including the repeated hotel floors.
const a=await assimp(),files=new a.FileList();
files.AddFile('hotel.3ds',fs.readFileSync(new URL('../../work/hotel146/source/supplied-3ds/3d-model.3ds',import.meta.url)));
const result=a.ConvertFileList(files,'glb2');
if(!result.IsSuccess()||!result.FileCount())throw Error(result.GetErrorCode());
const doc=await io.readBinary(result.GetFile(0).GetContent());
const textures=await facadeFinishes(doc);
const streetImage=textures.brick.getImage();
// Assign finishes before merging so originally white window and wall materials
// do not collapse into one indistinguishable material.
for(const m of doc.getRoot().listMaterials()){
 const name=m.getName();m.setDoubleSided(true).setAlphaMode('OPAQUE');
 if(/Window.*(?:_001|_002)|Skylight_001/.test(name))m.setBaseColorFactor([.13,.22,.27,1]).setMetallicFactor(.35).setRoughnessFactor(.25).setExtras({finish149:'glass'});
 else if(/Fire Escape|Layer0_03[489]|Layer0_04[012]|Lantern/.test(name))m.setBaseColorFactor([.12,.115,.10,1]).setMetallicFactor(.65).setRoughnessFactor(.44).setExtras({finish149:'metal'});
 else if(/Layer0_0(?:02|03|04|07|08|10|11|12|13|15|20)|Half|Floor Typica|HERRING/.test(name))finish(m,textures.brick).setExtras({finish149:'brick'});
 else finish(m,textures.trim,[.87,.84,.77,1]).setExtras({finish149:'trim'});
}
const bounds=new T.Box3();
for(const node of doc.getRoot().listNodes())for(const p of node.getMesh()?.listPrimitives()||[]){const v=p.getAttribute('POSITION');bounds.union(new T.Box3(new T.Vector3(...v.getMin([])),new T.Vector3(...v.getMax([]))).applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix())));}
const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
const envelope=C.envelope151;
const matrix=new T.Matrix4().makeScale((envelope.hi[0]-envelope.lo[0])/size.x,envelope.hi[1]/size.y,(envelope.hi[2]-envelope.lo[2])/size.z).multiply(new T.Matrix4().makeTranslation(-center.x,-bounds.min.y,-center.z));
const report=await bake(doc,()=>({group:'supplied-hotel',matrix}));
// Keep the supplied upper stories, but replace the entire lower envelope.
// Hollowing only its center left the original projecting vestibule on the sidewalk.
const cuts=[{lo:[-20,-.1,-20],hi:[20,5.71,20]}];
function split(poly,axis,value,sign){const inside=[],outside=[];for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length],da=(a[axis]-value)*sign,db=(b[axis]-value)*sign;(da>=0?inside:outside).push(a);if((da>=0)!==(db>=0)){const t=da/(da-db),p=a.map((v,i)=>v+(b[i]-v)*t);inside.push(p);outside.push(p);}}return[inside,outside];}
const buffer=doc.getRoot().listBuffers()[0],acc=(v,t)=>doc.createAccessor().setType(t).setArray(new Float32Array(v)).setBuffer(buffer);
const streetBrick=doc.createTexture('Street-level brick').setImage(streetImage).setMimeType('image/png');
const lowerBrick=finish(doc.createMaterial('Street-level brick'),streetBrick,[1,1,1,1]).setDoubleSided(true).setExtras({finish149:'brick'});
for(const mesh of doc.getRoot().listMeshes())for(const pr of mesh.listPrimitives()){
 const p=pr.getAttribute('POSITION'),n=pr.getAttribute('NORMAL'),uv=pr.getAttribute('TEXCOORD_0'),idx=pr.getIndices().getArray();let polygons=[];
 for(let i=0;i<idx.length;i+=3)polygons.push(Array.from(idx.slice(i,i+3),k=>[...p.getElement(k,[]),...n.getElement(k,[]),...(uv?.getElement(k,[])||[0,0])]));
 for(const cut of cuts){const kept=[];for(let poly of polygons){for(let axis=0;axis<3&&poly.length;axis++)for(const [value,sign]of [[cut.lo[axis],1],[cut.hi[axis],-1]]){const pieces=split(poly,axis,value,sign);if(pieces[1].length>=3)kept.push(pieces[1]);poly=pieces[0];}}polygons=kept;}
 if(pr.getMaterial().getBaseColorTexture()){
  const upper=[],lp=[],ln=[];for(const poly of polygons){const parts=split(poly,1,5.71,1);if(parts[0].length>=3)upper.push(parts[0]);for(let k=1;k+1<parts[1].length;k++)for(const v of[parts[1][0],parts[1][k],parts[1][k+1]]){lp.push(...v.slice(0,3));ln.push(...v.slice(3,6));}}
  if(lp.length)mesh.addPrimitive(doc.createPrimitive().setAttribute('POSITION',acc(lp,'VEC3')).setAttribute('NORMAL',acc(ln,'VEC3')).setAttribute('TEXCOORD_0',acc(projectUV(lp,ln,.78),'VEC2')).setIndices(doc.createAccessor().setType('SCALAR').setArray(Uint32Array.from({length:lp.length/3},(_,i)=>i)).setBuffer(buffer)).setMaterial(lowerBrick));polygons=upper;
 }
 const positions=[],normals=[],tex=[];for(const poly of polygons)for(let i=1;i<poly.length-1;i++)for(const v of [poly[0],poly[i],poly[i+1]]){positions.push(...v.slice(0,3));normals.push(...v.slice(3,6));tex.push(...v.slice(6));}
 const projected=pr.getMaterial().getBaseColorTexture()?projectUV(positions,normals,pr.getMaterial().getExtras().finish149==='brick'?.78:.7):tex;
 pr.setAttribute('POSITION',acc(positions,'VEC3')).setAttribute('NORMAL',acc(normals,'VEC3')).setAttribute('TEXCOORD_0',acc(projected,'VEC2')).setAttribute('COLOR_0',null).setAttribute('TEXCOORD_1',null).setIndices(doc.createAccessor().setType('SCALAR').setArray(Uint32Array.from({length:positions.length/3},(_,i)=>i)).setBuffer(buffer));
}
await doc.transform(prune(),dedup(),weld());
await io.write(new URL('./assets/building.glb',import.meta.url).pathname,doc);
fs.writeFileSync(new URL('./assets/building-report.json',import.meta.url),JSON.stringify({source:'3d-model.3ds.zip',sourceBounds:bounds,targetBounds:envelope,...report},null,2));
console.log('Supplied hotel building',report);

// Reuse one of the hotel's own arched windows for the remodeled lobby facade.
const windowDoc=await io.readBinary(result.GetFile(0).GetContent()),node=windowDoc.getRoot().listNodes().find(n=>n.getName()==='Window Arc'),wb=new T.Box3();
for(const p of node.getMesh().listPrimitives()){const v=p.getAttribute('POSITION');wb.union(new T.Box3(new T.Vector3(...v.getMin([])),new T.Vector3(...v.getMax([]))).applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix())));}
const wc=wb.getCenter(new T.Vector3()),factor=1.5/(wb.max.y-wb.min.y),wm=new T.Matrix4().makeScale(factor,factor,factor).multiply(new T.Matrix4().makeRotationY(Math.PI/2)).multiply(new T.Matrix4().makeTranslation(-wc.x,-wb.min.y,-wc.z));
await bake(windowDoc,n=>n===node?{group:'native-arched-window',matrix:wm}:null);
for(const m of windowDoc.getRoot().listMaterials()){m.setMetallicFactor(0).setRoughnessFactor(.55).setBaseColorFactor(/Window#1/.test(m.getName())?[.12,.22,.28,1]:[.58,.53,.42,1]);}
await windowDoc.transform(dedup());await bake(windowDoc,()=>({group:'native-arched-window'}));
await io.write(new URL('./assets/facade-window.glb',import.meta.url).pathname,windowDoc);
