import fs from 'node:fs';
import {io,bake,compactTextures} from '../rivian147/prepare.mjs';
import * as T from '../pc66/vendor/three/three.core.js';
import {simplify,weld} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../work/browser/node_modules/meshoptimizer/index.js';

function bounds(node){
 const box=new T.Box3(),matrix=new T.Matrix4().fromArray(node.getWorldMatrix());
 for(const p of node.getMesh().listPrimitives()){
  const a=p.getAttribute('POSITION');
  box.union(new T.Box3(new T.Vector3(...a.getMin([])),new T.Vector3(...a.getMax([]))).applyMatrix4(matrix));
 }
 return box;
}
// Extract one complete chair and one furnished bookcase, not the entire room.
for(const [asset,name,height,yaw] of [['reading-chair','chair',.62,0],['reading-bookcase','cabinett',1.38,Math.PI/2]]){
 const doc=await io.read(new URL('../../work/hotel146/victorian-prepared.glb',import.meta.url).pathname);
 const source=doc.getRoot().listNodes().find(n=>n.getName()===name),box=bounds(source),center=box.getCenter(new T.Vector3()),scale=height/(box.max.y-box.min.y);
 const matrix=new T.Matrix4().makeRotationY(yaw).multiply(new T.Matrix4().makeScale(scale,scale,scale)).multiply(new T.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
 const report=await bake(doc,n=>{
  const books=asset==='reading-bookcase'&&n.getName().startsWith('prop_books_')&&box.containsBox(bounds(n));
  return n===source||books?{group:asset,matrix}:null;
 });
 if(asset==='reading-chair'){
  await MeshoptSimplifier.ready;
  await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.12,error:.002}));
 }
 await compactTextures(doc,1024);
 report.triangles=doc.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0),0);
 const output=new URL('./assets/'+asset+'.glb',import.meta.url).pathname;
 await io.write(output,doc);console.log(asset,{...report,bytes:fs.statSync(output).size});
}
// These opaque OBJ furniture materials imported with a zero opacity factor.
for(const asset of ['coffee-table','sofa']){
 const output=new URL('./assets/'+asset+'.glb',import.meta.url).pathname,doc=await io.read(output);
 for(const material of doc.getRoot().listMaterials())material.setBaseColorFactor([...material.getBaseColorFactor().slice(0,3),1]).setAlphaMode('OPAQUE');
 await io.write(output,doc);
}
