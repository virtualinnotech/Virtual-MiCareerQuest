import fs from 'node:fs';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import * as T from '../../pc66/vendor/three/three.core.js';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
for(const file of process.argv.slice(2)){
 const doc=await io.read(file),nodes=[];
 for(const n of doc.getRoot().listNodes())if(n.getMesh()){
  const box=new T.Box3(),matrix=new T.Matrix4().fromArray(n.getWorldMatrix());let triangles=0;
  for(const p of n.getMesh().listPrimitives()){
   const a=p.getAttribute('POSITION');triangles+=(p.getIndices()?.getCount()||a.getCount())/3;
   for(let i=0;i<a.getCount();i++)box.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(matrix));
  }
  nodes.push({name:n.getName(),mesh:n.getMesh().getName(),triangles,bounds:[box.min.toArray(),box.max.toArray()],materials:n.getMesh().listPrimitives().map(p=>p.getMaterial()?.getName())});
 }
 const report={file,nodes,materials:doc.getRoot().listMaterials().map(m=>({name:m.getName(),color:m.getBaseColorFactor(),map:m.getBaseColorTexture()?.getName(),normal:m.getNormalTexture()?.getName()}))};
 fs.writeFileSync(file+'.inventory.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
