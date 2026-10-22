import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import * as T from '../pc66/vendor/three/three.core.js';

const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=await io.read(new URL('./city.glb',import.meta.url).pathname);
const html=fs.readFileSync(new URL('../venue-frame.html',import.meta.url),'utf8');
const original=await io.readBinary(zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64')));
function bounds(n,scale=1){
 const b=new T.Box3(),m=new T.Matrix4().fromArray(n.getWorldMatrix()).premultiply(new T.Matrix4().makeScale(scale,scale,scale));
 for(const pr of n.getMesh().listPrimitives()){
  const a=pr.getAttribute('POSITION');for(let i=0;i<a.getCount();i++)b.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(m));
 }
 return b;
}
const hospital=bounds(original.getRoot().listNodes().find(n=>n.getName()==='City_Riverbank_100_Building-Medium-01'),.3).expandByScalar(.12);
const trees=doc.getRoot().listNodes().filter(n=>n.getExtras().tree||n.getExtras().detail111==='trees'),moved=trees.filter(n=>n.getExtras().relocated122),nodes=doc.getRoot().listNodes();
assert.equal(moved.length,2,'both overlapping frontage trees relocated');
for(const n of trees){const p=n.getTranslation();if(Math.hypot(p[0]+24,p[2]+77)<15)assert(!hospital.intersectsBox(bounds(n)),n.getName()+' canopy clears hospital');}
const buildings=original.getRoot().listNodes().filter(n=>n.getMesh()&&/wall|building|column/i.test(n.getName())&&!/Gallery105|tree|distant|curtain/i.test(n.getName())).map(n=>({name:n.getName(),b:bounds(n,.3)}));
for(const tree of moved){
 const p=tree.getTranslation(),b=bounds(tree),from=tree.getExtras().relocated122.from;
 assert(!hospital.intersectsBox(b));assert.equal(p[2],-31.35);assert(tree.getExtras().collider107,'trunk collision travels with tree');
 const bed=nodes.find(n=>n.getExtras().soilBed115?.tree===tree.getName());assert(bed);
 const pit=bed.getExtras().treePit137;
 if(pit){assert.equal(pit.tree,tree.getName());assert(Math.hypot(bed.getTranslation()[0]-p[0],bed.getTranslation()[2]-p[2])<.35,'grate fits the relocated trunk cluster');}
 else{assert.equal(bed.getTranslation()[0],p[0]);assert.equal(bed.getTranslation()[2],p[2]);}
 assert(nodes.some(n=>/^District115 fallen leaves /.test(n.getName())&&Math.hypot(n.getTranslation()[0]-p[0],n.getTranslation()[2]-p[2])<.001));
 assert(!nodes.some(n=>/^District115 fallen leaves /.test(n.getName())&&Math.hypot(n.getTranslation()[0]-from[0],n.getTranslation()[2]-from[2])<.001),'no abandoned leaf patch at hospital');
 assert(!buildings.some(o=>o.b.intersectsBox(b)),tree.getName()+' relocation clears building geometry');
 assert(trees.every(n=>n===tree||Math.hypot(n.getTranslation()[0]-p[0],n.getTranslation()[2]-p[2])>2.5),'new planting has room around its crown');
}
console.log('PASS hospital canopy clearance, two relocations, trunk contacts, matching soil/leaf patches, new-site building and planting clearance');
