import assert from 'node:assert/strict';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import * as T from '../../pc66/vendor/three/three.core.js';
const doc=await new NodeIO().read(new URL('./models.glb',import.meta.url).pathname);
const mesh=doc.getRoot().listMeshes().find(m=>m.getName()==='Skyline135 skyscraper');
assert.deepEqual(mesh.getExtras().facade138,{panes:5952,windows:496,coreInset:.045});
const glass=mesh.listPrimitives().find(p=>p.getExtras().facade138==='panes');
assert(glass);assert.equal(glass.getAttribute('POSITION').getCount(),5952*4);assert.equal(glass.getIndices().getCount(),5952*6);
assert.equal(glass.getMaterial().getExtras().surfaceType,33);
const uv=glass.getAttribute('TEXCOORD_0').getArray(),rooms=new Set();
const a=glass.getAttribute('POSITION').getArray(),normals=glass.getAttribute('NORMAL').getArray(),idx=glass.getIndices().getArray();
const bins=new Map(),bin=(x,y)=>Math.floor(x/.2)+','+Math.floor(y/.3);
// Index front-facing frame triangles in 2D, then test the interior of every pane.
for(const p of mesh.listPrimitives().filter(p=>p.getExtras().facade138==='frames')){
 const positions=p.getAttribute('POSITION').getArray(),indices=p.getIndices().getArray();
 for(let i=0;i<indices.length;i+=3){
  const v=Array.from(indices.slice(i,i+3),k=>Array.from(positions.slice(k*3,k*3+3)));
  const z=(v[0][2]+v[1][2]+v[2][2])/3,side=Math.sign(z);
  if(v.some(p=>Math.abs(p[2]-z)>.00001))continue;
  const lo=[0,1].map(k=>Math.min(...v.map(p=>p[k]))),hi=[0,1].map(k=>Math.max(...v.map(p=>p[k])));
  for(let x=Math.floor(lo[0]/.2);x<=Math.floor(hi[0]/.2);x++)for(let y=Math.floor(lo[1]/.3);y<=Math.floor(hi[1]/.3);y++){
   const key=side+':'+x+','+y;if(!bins.has(key))bins.set(key,[]);bins.get(key).push({v,z});
  }
 }
}
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
let probes=0;
for(let i=0;i<idx.length;i+=6){
 const ids=[...new Set(idx.slice(i,i+6))];assert.equal(ids.length,4);
 const x0=Math.min(...ids.map(k=>a[k*3])),y0=Math.min(...ids.map(k=>a[k*3+1])),z=a[ids[0]*3+2],x1=Math.max(...ids.map(k=>a[k*3])),y1=Math.max(...ids.map(k=>a[k*3+1])),side=Math.sign(z);
 assert(x1>x0&&y1>y0);
 for(const k of ids){assert.equal(a[k*3+2],z);assert.equal(normals[k*3+2],side);}
 const cells=ids.map(k=>Math.floor(uv[k*2])+','+Math.floor(uv[k*2+1]));assert.equal(new Set(cells).size,1,'each pane has a fixed room lighting cell');rooms.add(cells[0]);
 for(let k=0;k<6;k+=3){const v=Array.from(idx.slice(i+k,i+k+3),j=>[a[j*3],a[j*3+1]]);assert(cross(v[0],v[1],v[2])*side>0,'consistent outward winding');}
 for(const [u,t]of[[.5,.5],[.15,.15],[.85,.15],[.85,.85],[.15,.85]]){
  const point=[x0+(x1-x0)*u,y0+(y1-y0)*t];
  for(const face of bins.get(side+':'+bin(...point))||[]){
   if((face.z-z)*side<0)continue;
   const c=face.v.map((v,k)=>cross(v,face.v[(k+1)%3],point));
   assert(!(c.every(v=>v>1e-10)||c.every(v=>v< -1e-10)),'frame must never cover a glass opening');
  }
  probes++;
 }
}
const towerBounds=mesh.listPrimitives().map(p=>({p,lo:p.getAttribute('POSITION').getMin([]),hi:p.getAttribute('POSITION').getMax([])}));
assert.equal(rooms.size,496);
assert(towerBounds.filter(b=>b.p.getExtras().facade138).every(b=>b.lo[2]<-2.50||b.hi[2]>1.94));
const surfaces=new T.Group();
for(const p of mesh.listPrimitives()){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p.getAttribute('POSITION').getArray(),3));g.setIndex(new T.BufferAttribute(p.getIndices().getArray(),1));
 const object=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));object.name=p.getMaterial().getName();surfaces.add(object);
}
surfaces.updateMatrixWorld(true);
for(const [origin,direction]of[[[0,10,4],[0,0,-1]],[[0,10,-4],[0,0,1]],[[-5,10,0],[1,0,0]],[[5,10,0],[-1,0,0]]]){
 const hits=new T.Raycaster(new T.Vector3(...origin),new T.Vector3(...direction)).intersectObject(surfaces);
 const cladding=hits.find(h=>h.object.name.endsWith('Material.031')),backing=hits.find(h=>h.object.name.endsWith(' A'));
 assert(cladding&&backing&&backing.distance-cladding.distance>.04,'backing is recessed behind all four facades');
}
console.log('PASS 496 preserved windows, 5952 flat panes, fixed room lighting, four-sided backing clearance,',probes,'unobstructed frame/glass probes');
