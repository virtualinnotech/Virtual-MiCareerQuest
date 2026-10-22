import fs from 'node:fs';
import {io,bake,compactTextures} from '../rivian147/prepare.mjs';
import * as T from '../pc66/vendor/three/three.core.js';

// Reuse the supplied carved architectural modules inside the existing hotel footprint.
for(const [id,select]of [
 ['opulent',node=>{
  const name=node.getName(),b=new T.Box3();for(const pr of node.getMesh().listPrimitives()){const a=pr.getAttribute('POSITION');b.union(new T.Box3(new T.Vector3(...a.getMin([])),new T.Vector3(...a.getMax([]))).applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix())));}
  if(b.min.x< -24.9||b.max.x> -8.7||b.min.z< -16.5||b.max.z>3.5)return null;
  if(/Wooden_Ceiling_ugypfhzdw/.test(name))return {group:'carved-vault',matrix:new T.Matrix4().makeScale(.406,.13,.38).multiply(new T.Matrix4().makeTranslation(16.77,-17.11,6.55)),deform:p=>{p.y+=4.47+1.08*Math.cos(p.x*Math.PI/6.6);},normal:(n,p)=>{n.x+=1.08*Math.PI/6.6*Math.sin(p.x*Math.PI/6.6)*n.y;}};
  if(!/Wooden_Ceiling_Trim_Kit/.test(name))return null;
  return {group:'carved-cornice',matrix:new T.Matrix4().makeScale(.406,.278,.38).multiply(new T.Matrix4().makeTranslation(16.77,-1.2,6.55))};
 }],
 ['victorian',node=>{
  if(!/S_Fireplace_/.test(node.getName()))return null;
  // Original fireplace faces -X; turn it toward the lobby from the right wall.
  return {group:'fireplace',matrix:new T.Matrix4().makeTranslation(3.20,0,.65).multiply(new T.Matrix4().makeScale(.30,.30,.30)).multiply(new T.Matrix4().makeTranslation(6.24,-1.16,1.305))};
 }]
]){
 const doc=await io.read(new URL('../../work/hotel146/'+id+'-prepared.glb',import.meta.url).pathname),report=await bake(doc,select);await compactTextures(doc,1024);
 const output=new URL('./assets/'+id+'-details.glb',import.meta.url).pathname;await io.write(output,doc);console.log(id,{...report,bytes:fs.statSync(output).size});
}
for(const [id,name,matrix]of [
 ['wall-panel','S_Modular_Interior_Wall_ugymbhrdw_lod3_Var1',new T.Matrix4().makeScale(.4,.31,.4).multiply(new T.Matrix4().makeTranslation(8.615,-1.194,9.80))],
 ['heritage-window','S_Modular_Wooden_Ceiling_ugyrfh1dw_lod3_Var1',new T.Matrix4().makeRotationY(Math.PI/2).multiply(new T.Matrix4().makeScale(.28,.28,.28)).multiply(new T.Matrix4().makeTranslation(7,-2.2,5.82))]
]){
 const doc=await io.read(new URL('../../work/hotel146/victorian-prepared.glb',import.meta.url).pathname);const report=await bake(doc,n=>n.getName()===name?{group:id,matrix}:null);await compactTextures(doc,1024);await io.write(new URL('./assets/'+id+'.glb',import.meta.url).pathname,doc);console.log(id,report);
}
