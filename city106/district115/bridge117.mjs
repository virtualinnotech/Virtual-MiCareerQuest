import * as T from '../../pc66/vendor/three/three.core.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';

export function restoreBlueBridge({doc,original,geo,surface,b,D}){
 const nodes=original.getRoot().listNodes().filter(n=>n.getMesh()&&/^Blue_Bridge_(span_|main_|stone_pier_|pier_)/.test(n.getName())&&!/collider/.test(n.getName()));
 const mats=[...new Set(nodes.flatMap(n=>n.getMesh().listPrimitives().map(p=>p.getMaterial())))],copied=copyToDocument(doc,original,mats);
 // Original bank bearings define its diagonal axis; retain the four original spans.
 const start=[42,-38.7],end=[-19.2,-62.1],length=Math.hypot(end[0]-start[0],end[1]-start[1]),a=[(end[0]-start[0])/length,(end[1]-start[1])/length],cross=[-a[1],a[0]],groups=new Map();
 const near=-37.3,far=-63.3,across=b.width/4.2;
 const station=p=>((p[0]-start[0])*a[0]+(p[2]-start[1])*a[1])/length;
 function clip(poly,edge,sign){const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],u=(station(p)-edge)*sign,v=(station(q)-edge)*sign;if(u>=0)out.push(p);if((u>=0)!==(v>=0))out.push(p.map((x,k)=>x+(q[k]-x)*u/(u-v)));}return out;}
 for(const n of nodes){
  const name=n.getName(),pier=/pier/.test(name),key=pier?'pier '+name.match(/pier_(\d+)/)[1]:name.match(/span_(\d+)/)?.[0]||'handrails';
  if(!groups.has(key))groups.set(key,[]);
  const world=new T.Matrix4().fromArray(n.getWorldMatrix()),v=new T.Vector3();
  for(const p of n.getMesh().listPrimitives()){
   const src=p.getAttribute('POSITION'),uv=p.getAttribute('TEXCOORD_0'),vertices=[];let indices=Array.from(p.getIndices().getArray());
   for(let i=0;i<src.getCount();i++){v.fromArray(src.getArray(),i*3).applyMatrix4(world).multiplyScalar(.3);vertices.push([v.x,v.y,v.z,...(uv?uv.getElement(i,[]):[0,0])]);}
   let mapped=vertices;
   // The original continuous handrails need extra vertices to follow the new camber.
   if(/main_.*guard/.test(name)){
    mapped=[];for(let i=0;i<indices.length;i+=3){const tri=indices.slice(i,i+3).map(j=>vertices[j]);for(let q=0;q<128;q++){const poly=clip(clip(tri,q/128,1),(q+1)/128,-1);for(let j=1;j+1<poly.length;j++)mapped.push(poly[0],poly[j],poly[j+1]);}}
    indices=mapped.map((_,i)=>i);
   }
   const pos=[],tex=[];
   for(const p of mapped){const dx=p[0]-start[0],dz=p[2]-start[1],z=near+(far-near)*station(p),y=D.elevation(b,z);pos.push(b.x+(dx*cross[0]+dz*cross[1])*across,pier?-2+(p[1]+1.56)/3.96*(y+2):y+(p[1]-2.4)*across,z);tex.push(p[3],p[4]);}
   const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(indices);g.setAttribute('uv',new T.Float32BufferAttribute(tex,2));
   g.computeVertexNormals();groups.get(key).push(geo(g,copied.get(p.getMaterial())));
  }
 }
 for(const [key,parts]of groups)surface('original blue bridge '+key,parts);
 return nodes.length;
}
