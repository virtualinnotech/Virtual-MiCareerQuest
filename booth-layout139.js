(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.BoothLayout139=api;})(globalThis,()=>{
 'use strict';
 const revision='challenge-clearance-139',gap=.60,margin=.40,nominal=[2.88,2.08];
 // Include working space and walk-up controls, not only the equipment's collider.
 // These reservations exist before asynchronous challenge assets finish loading.
 const reservations=[
  ['Manufacturing','Robotics cell and controller',[9.03,-24.56,12.10,-20.65]],
  ['Manufacturing','Welding cell and practice bench',[27.95,-24.56,32.37,-19.25]],
  ['Health Science','MRI suite and entrance',[34.90,-24.56,38.45,-19.15]],
  ['Health Science','Ambulance display and approach',[54.75,-24.55,58.15,-20.90]],
  ['Agribusiness','Tractor display and harvest entry',[9.05,3.65,12.70,7.10]],
  ['Agribusiness','Drone display and controls',[9.05,21.75,12.45,24.55]],
  ['Construction','Forklift practice and delivery area',[52.85,3.70,58.15,10.40]],
  ['Construction','Crane display and approach',[55.70,21.85,58.17,24.57]],
  ['Information Technology','PC Arena and entrance',[-21.80,7.75,-16.55,13.10]],
  ['Information Technology','Network room approach',[-19.50,-12.65,-16.50,-10.20]],
  ['Information Technology','Gallery entrance',[-9.20,-1.50,-6.20,1.50]],
  ['Hospitality','Escalator opening and landings',[-15.35,-15.65,-6.10,-13.35]],
  ['Hospitality','Hibachi grill and chef approach',[-8.35,-29.55,-5.95,-27.15]],
  ['Hospitality','Hotel reception and guest approach',[-7.3,-24.65,-5.15,-22.35]]
 ].map(([industry,name,bounds])=>({industry,name,bounds}));
 function rect([x,z,X,Z]){return [[x,z],[X,z],[X,Z],[x,Z]];}
 function polygon(p,w,d){const c=Math.cos(p.yaw),s=Math.sin(p.yaw);return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([x,z])=>[p.x+x*c+z*s,p.z-x*s+z*c]);}
 function bounds(poly){return [Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];}
 function segment(p,a,b){const x=b[0]-a[0],z=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*z)/(x*x+z*z||1)));return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*z);}
 function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 function overlap(a,b){for(const p of [a,b])for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length],axis=[r[1]-q[1],q[0]-r[0]],aa=a.map(v=>v[0]*axis[0]+v[1]*axis[1]),bb=b.map(v=>v[0]*axis[0]+v[1]*axis[1]);if(Math.max(...aa)<Math.min(...bb)||Math.max(...bb)<Math.min(...aa))return false;}return true;}
 function distance(a,b){const A=bounds(a),B=bounds(b);const lower=Math.hypot(Math.max(0,A[0]-B[2],B[0]-A[2]),Math.max(0,A[1]-B[3],B[1]-A[3]));if(lower>gap)return lower;if(overlap(a,b))return 0;let d=Infinity;for(const [one,two]of [[a,b],[b,a]])for(const p of one)for(let i=0;i<two.length;i++)d=Math.min(d,segment(p,two[i],two[(i+1)%two.length]));return d;}
 function pointDistance(p,poly){return inside(p,poly)?0:Math.min(...poly.map((a,i)=>segment(p,a,poly[(i+1)%poly.length])));}
 function challengeProblem(industry,poly){for(const r of reservations)if(r.industry===industry&&distance(poly,rect(r.bounds))<.20)return 'Keep '+r.name+' clear.';return null;}
 function front(p,d,offset=.34){return [p.x+Math.sin(p.yaw)*(d/2+offset),p.z+Math.cos(p.yaw)*(d/2+offset)];}
 function pack(sector,gates,count,scale,obstacles=[]){
  const w=nominal[0]*scale/.4,d=nominal[1]*scale/.4,slots=[],taken=[],fronts=[];
  const reserved=[...reservations.filter(r=>r.industry===sector.industry).map(r=>({poly:rect(r.bounds),pad:.20})),...gates.filter(g=>g.industry===sector.industry).map(g=>({poly:rect(g.keepClear),pad:.20})),...obstacles.map(o=>({poly:rect(o),pad:.16}))];
  function put(p){
   const poly=polygon(p,w,d),b=bounds(poly),f=front(p,d);
   if(b[0]<sector.min[0]+margin||b[1]<sector.min[1]+margin||b[2]>sector.max[0]-margin||b[3]>sector.max[1]-margin)return false;
   if(f[0]<sector.min[0]+.20||f[0]>sector.max[0]-.20||f[1]<sector.min[1]+.20||f[1]>sector.max[1]-.20)return false;
   if(reserved.some(o=>distance(poly,o.poly)<o.pad||pointDistance(f,o.poly)<.22))return false;
   if(sector.pods.some(p=>pointDistance([p.x,p.z],poly)<p.reserveRadius+.08||Math.hypot(f[0]-p.x,f[1]-p.z)<p.reserveRadius+.22))return false;
   if(taken.some((other,i)=>distance(poly,other)<gap-.0001||pointDistance(f,other)<.25||pointDistance(fronts[i],poly)<.25))return false;
   slots.push({...p,scale});taken.push(poly);fronts.push(f);return true;
  }
  for(const p of sector.slots){if(slots.length>=count)break;put(p);}
  // Deterministic gap filling retains the authored pod arrangement and avoids
  // burying a booth behind equipment when a formerly valid anchor is occupied.
  for(let z=sector.min[1]+margin+d/2;z<=sector.max[1]-margin-d/2&&slots.length<count;z+=.36){
   for(let x=sector.min[0]+margin+d/2;x<=sector.max[0]-margin-d/2&&slots.length<count;x+=.36){
    const angles=[0,Math.PI/2,Math.PI,-Math.PI/2].sort((a,b)=>{
     const score=y=>Math.sin(y)*(sector.center[0]-x)+Math.cos(y)*(sector.center[1]-z);return score(b)-score(a);
    });
    for(const yaw of angles)if(put({x,z,yaw,group:'perimeter',anchorId:'discovery-'+sector.industry.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-fit139-'+slots.length})){break;}
   }
  }
  return {slots,scale,overflow:Math.max(0,count-slots.length)};
 }
 function generate(sector,gates,count,obstacles=[]){
  let best;
  for(const scale of [.40,.38,.36,.34,.32,.30,.28,.26,.24,.22,.20]){best=pack(sector,gates,count,scale,obstacles);if(!best.overflow)return best;}
  // At organizer-expanded capacity, an all-row arrangement can recover gaps
  // left by the original widely spaced rings without reducing the aisle width.
  const dense=pack({...sector,slots:[]},gates,count,.20,obstacles);
  return dense.slots.length>best.slots.length?dense:best;
 }
 function fitScale(lo,hi,slotScale,requested=.4){return Math.min(requested,nominal[0]*(slotScale/.4)/(hi[0]-lo[0]),nominal[1]*(slotScale/.4)/(hi[2]-lo[2]));}
 return {revision,gap,nominal,reservations,rect,polygon,bounds,distance,pointDistance,front,pack,generate,challengeProblem,fitScale};
});
