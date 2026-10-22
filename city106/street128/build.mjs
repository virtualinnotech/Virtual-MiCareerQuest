import {createRequire} from 'node:module';
const D=createRequire(import.meta.url)('../district115.js');

export function addBreakawayRailings({doc,scene,original,worldBounds,mesh,box,material}){
 const sources=original.getRoot().listNodes().filter(n=>/^Riverfront_black_railing_/.test(n.getName())&&n.getMesh()&&n.getExtras().walktestCollide!==false);
 const pieces=sources.map(n=>({name:n.getName(),...worldBounds(n)}));
 const iron=material('Street128 riverwalk black railing',[.10,.13,.14,1],null,.7,.4);
 const posts=pieces.filter(p=>/_post_/.test(p.name)).sort((a,b)=>a.lo[0]-b.lo[0]);
 // Bound the whole railing into independently recoverable post-and-rail bays.
 // Cuts through an opening are also retained, so no panel spans a bridge road.
 const bayCuts=new Set([Math.min(...pieces.map(p=>p.lo[0])),Math.max(...pieces.map(p=>p.hi[0]))]);
 for(let i=1;i<posts.length;i++)bayCuts.add((posts[i-1].hi[0]+posts[i].lo[0])/2);
 for(const p of pieces)for(const b of D.bridges){const z=(p.lo[2]+p.hi[2])/2;if(z>=b.end-.15&&z<=b.start+.15){const w=D.width(b,z)/2+.15;bayCuts.add(b.x-w);bayCuts.add(b.x+w);}}
 const edges=[...bayCuts].sort((a,b)=>a-b);let count=0;
 for(let i=1;i<edges.length;i++){
  const x0=edges[i-1],x1=edges[i],parts=[],lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(const p of pieces){
   const a=[...p.lo],b=[...p.hi];a[0]=Math.max(x0,a[0]);b[0]=Math.min(x1,b[0]);if(b[0]-a[0]<.0001)continue;
   const c=a.map((v,k)=>(v+b[k])/2);
   if(D.bridges.some(bridge=>c[2]>=bridge.end-.15&&c[2]<=bridge.start+.15&&Math.abs(c[0]-bridge.x)<D.width(bridge,c[2])/2+.15))continue;
   parts.push(box(c,b.map((v,k)=>v-a[k]),iron));for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],a[k]);hi[k]=Math.max(hi[k],b[k]);}
  }
  if(!parts.length)continue;
  const name='Street128 riverwalk railing bay '+count++;
  scene.addChild(doc.createNode(name).setMesh(mesh(name,parts)).setExtras({cityProp:true,street128:'railing',collider107:{center:lo.map((v,k)=>(v+hi[k])/2),size:lo.map((v,k)=>hi[k]-v)}}));
 }
 return {railBays:count};
}
