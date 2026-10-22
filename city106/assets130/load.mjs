import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {loadFleet} from '../vehicles114/fleet.mjs';

export async function loadAssets130(doc){
 const source=await new NodeIO().read(new URL('./library.glb',import.meta.url).pathname),meshes=source.getRoot().listMeshes(),copied=copyToDocument(doc,source,meshes);
 const assets=Object.fromEntries(meshes.map(m=>[m.getName(),copied.get(m)])),fleet=await loadFleet(doc),bus=assets['city-bus'],buffer=doc.getRoot().listBuffers()[0];
 const body=doc.createMesh('Supplied RoAZ city bus body'),wheels=[];
 for(const p of bus.listPrimitives()){
  if(!/BusWheel/.test(p.getMaterial().getName())){body.addPrimitive(p.clone());continue;}
  const pos=p.getAttribute('POSITION').getArray(),indices=p.getIndices().getArray();
  for(const sx of[-1,1])for(const sz of[-1,1]){
   const ids=[];for(let i=0;i<indices.length;i+=3){const t=Array.from(indices.slice(i,i+3)),x=t.reduce((s,k)=>s+pos[k*3],0)/3,z=t.reduce((s,k)=>s+pos[k*3+2],0)/3;if(x*sx>0&&z*sz>0)ids.push(...t);}
   const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const i of ids)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],pos[i*3+k]);hi[k]=Math.max(hi[k],pos[i*3+k]);}
   const offset=lo.map((v,k)=>(v+hi[k])/2),vertices=new Float32Array(pos);for(let i=0;i<vertices.length;i++)vertices[i]-=offset[i%3];
   const wheel=doc.createMesh('Supplied RoAZ wheel '+sx+' '+sz),a=(data,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(data);
   wheel.addPrimitive(p.clone().setAttribute('POSITION',a(vertices,'VEC3')).setIndices(a(new Uint32Array(ids),'SCALAR')));
   wheels.push({mesh:wheel,role:'wheel-'+sx+'-'+sz,offset,radius:(hi[1]-lo[1])/2,front:sz>0});
  }
 }
 const [width,height,length]=bus.getExtras().size;
 fleet.bus={id:'bus',body,wheels,width,height,length,rearZ:-length/2,frontZ:length/2};
 return {assets,fleet,manifest:source.getRoot().getExtras().manifest};
}
