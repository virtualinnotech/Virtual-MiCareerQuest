export const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export function hull(points){
 const sorted=[...new Map(points.map(p=>[p.map(v=>v.toFixed(4)).join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const half=ps=>{const h=[];for(const p of ps){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p);}return h;};
 return [...half(sorted).slice(0,-1),...half([...sorted].reverse()).slice(0,-1)];
}
export function segmentDistance(p,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));
 return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
}
export function clearance(p,poly){
 if(poly.every((a,i)=>cross(a,poly[(i+1)%poly.length],p)>=-1e-7))return 0;
 return Math.min(...poly.map((a,i)=>segmentDistance(p,a,poly[(i+1)%poly.length])));
}
export const rectPoly=r=>[[r.lo[0],r.lo[2]],[r.hi[0],r.lo[2]],[r.hi[0],r.hi[2]],[r.lo[0],r.hi[2]]];
export const inside=(p,r,pad=0)=>p[0]>=r.lo[0]+pad&&p[0]<=r.hi[0]-pad&&p[1]>=r.lo[2]+pad&&p[1]<=r.hi[2]-pad;
export function overlaps(a,b,pad=0){
 for(const poly of[a,b])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],length=Math.hypot(q[0]-p[0],q[1]-p[1]),axis=[(q[1]-p[1])/length,(p[0]-q[0])/length];
  const aa=a.map(p=>p[0]*axis[0]+p[1]*axis[1]),bb=b.map(p=>p[0]*axis[0]+p[1]*axis[1]);
  if(Math.max(...aa)+pad<Math.min(...bb)||Math.max(...bb)+pad<Math.min(...aa))return false;
 }
 return true;
}
export function segmentClear(a,b,clear,r=.6){
 const steps=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.2);
 for(let i=0;i<=steps;i++)if(!clear([a[0]+(b[0]-a[0])*i/(steps||1),a[1]+(b[1]-a[1])*i/(steps||1)],r))return false;
 return true;
}
export function planPlaza(lot,roads,clear){
 const step=.6,cells=[],grid=new Map();
 for(let x=lot.lo[0]+.5,ix=0;x<=lot.hi[0]-.5;x+=step,ix++)for(let z=lot.lo[2]+.5,iz=0;z<=lot.hi[2]-.5;z+=step,iz++)if(clear([x,z],.55)){
  const cell={p:[x,z],ix,iz};grid.set(ix+','+iz,cells.length);cells.push(cell);
 }
 if(cells.length<25)return null;
 const entries=[];
 for(const road of roads){
  const along=road.hi[0]-road.lo[0]>road.hi[2]-road.lo[2]?0:1,crossAxis=1-along,k=crossAxis*2,side=(lot.lo[k]+lot.hi[k])/2>(road.lo[k]+road.hi[k])/2?1:-1;
  for(let i=0;i<cells.length;i++){
   const p=cells[i].p,q=[...p];q[crossAxis]=(side>0?road.hi[k]:road.lo[k])+side*.85;
   const d=Math.hypot(p[0]-q[0],p[1]-q[1]);
   if(d>5||p[along]<road.lo[along*2]+1||p[along]>road.hi[along*2]-1)continue;
   if(segmentClear(p,q,clear,.52))entries.push({i,p:q,d,side,along});
  }
 }
 entries.sort((a,b)=>a.d-b.d);if(!entries.length)return null;
 const entry=entries[0],queue=[entry.i],previous=new Map([[entry.i,null]]);
 for(let i=0;i<queue.length;i++){
  const c=cells[queue[i]];
  for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const next=grid.get((c.ix+dx)+','+(c.iz+dz));if(next===undefined||previous.has(next)||!segmentClear(c.p,cells[next].p,clear,.52))continue;previous.set(next,queue[i]);queue.push(next);}
 }
 if(queue.length<25)return null;
 const route=[];let i=queue.at(-1);while(i!==null){route.push(cells[i].p);i=previous.get(i);}route.push(entry.p);route.reverse();
 return {entry:entry.p,route,cells:queue.map(i=>cells[i].p),area:queue.length*step*step};
}
