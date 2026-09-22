/* DEV20: five robot dogs, with an independent Manufacturing-only navigation grid.
 * Pure CPU module. The containment limit applies to dogs, never the player's collider.
 * Clearance covers the dog's entire animated XZ footprint, not only its root.
 */
const ManufacturingDogNav20=(()=>{
 'use strict';
 const BOUNDS=[9,-24.6,32.4,-3.6], RADIUS=.30, STEP=.16;
 const DIRS=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
 const random=seed=>{let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};};
 const point=(g,i)=>[g.x0+(i%g.nx)*g.step,g.z0+Math.floor(i/g.nx)*g.step];
 function cell(g,x,z){const ix=Math.round((x-g.x0)/g.step),iz=Math.round((z-g.z0)/g.step);return ix<0||iz<0||ix>=g.nx||iz>=g.nz?-1:iz*g.nx+ix;}
 function allowed(g,x,z){const b=g.bounds,m=g.margin;if(x<b[0]+m||x>b[2]-m||z<b[1]+m||z>b[3]-m)return false;const c=cell(g,x,z);return c>=0&&!g.blocked[c];}
 function polyHit(x,z,p,r){let inside=false,d=Infinity;for(let i=0,j=p.length-1;i<p.length;j=i++){
  const a=p[j],b=p[i];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));d=Math.min(d,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
 }return inside||d<r;}
 function neighbor(g,i,dx,dz){const x=i%g.nx,z=Math.floor(i/g.nx),xx=x+dx,zz=z+dz;if(xx<0||xx>=g.nx||zz<0||zz>=g.nz)return -1;const q=zz*g.nx+xx;if(g.blocked[q]||(dx&&dz&&(g.blocked[z*g.nx+xx]||g.blocked[zz*g.nx+x])))return -1;return q;}
 function freeSegment(g,x,z,xx,zz){if(!allowed(g,x,z)||!allowed(g,xx,zz))return false;const n=Math.max(1,Math.ceil(Math.hypot(xx-x,zz-z)/(g.step*.2)));let prev=cell(g,x,z);for(let k=1;k<=n;k++){const p=cell(g,x+(xx-x)*k/n,z+(zz-z)*k/n);if(p<0||g.blocked[p])return false;const px=prev%g.nx,pz=Math.floor(prev/g.nx),cx=p%g.nx,cz=Math.floor(p/g.nx);if(cx!==px&&cz!==pz&&(g.blocked[pz*g.nx+cx]||g.blocked[cz*g.nx+px]))return false;prev=p;}return true;}
 function build({rectangles=[],polygons=[],gateReservations=[],bounds=BOUNDS,radius=RADIUS,step=STEP}={}){
  const margin=radius+.07,x0=bounds[0],z0=bounds[1],nx=Math.ceil((bounds[2]-x0)/step)+1,nz=Math.ceil((bounds[3]-z0)/step)+1;
  const g={x0,z0,nx,nz,step,bounds:[...bounds],radius,margin,blocked:new Uint8Array(nx*nz),valid:[],sourceObstacleCount:rectangles.length+polygons.length};
  const inflate=radius+Math.SQRT2*step/2+.025;
  function area(box,check){const x1=Math.max(0,Math.floor((box[0]-inflate-x0)/step)),x2=Math.min(nx-1,Math.ceil((box[2]+inflate-x0)/step)),z1=Math.max(0,Math.floor((box[1]-inflate-z0)/step)),z2=Math.min(nz-1,Math.ceil((box[3]+inflate-z0)/step));for(let z=z1;z<=z2;z++)for(let x=x1;x<=x2;x++)if(check(x0+x*step,z0+z*step))g.blocked[z*nx+x]=1;}
  for(let i=0;i<g.blocked.length;i++){const [x,z]=point(g,i);if(x<bounds[0]+margin||x>bounds[2]-margin||z<bounds[1]+margin||z>bounds[3]-margin)g.blocked[i]=1;}
  for(const r of rectangles)area(r,(x,z)=>x>=r[0]-inflate&&x<=r[2]+inflate&&z>=r[1]-inflate&&z<=r[3]+inflate);
  for(const p of polygons){const box=[Math.min(...p.map(a=>a[0])),Math.min(...p.map(a=>a[1])),Math.max(...p.map(a=>a[0])),Math.max(...p.map(a=>a[1]))];area(box,(x,z)=>polyHit(x,z,p,inflate));}
  // No lounging or path segments through student entrance/exit landing zones.
  for(const r of gateReservations)area(r,(x,z)=>x>=r[0]-.06&&x<=r[2]+.06&&z>=r[1]-.06&&z<=r[3]+.06);
  const seen=new Uint8Array(nx*nz),queue=new Int32Array(nx*nz);let largest=[];
  for(let first=0;first<g.blocked.length;first++){if(g.blocked[first]||seen[first])continue;let h=0,t=1;queue[0]=first;seen[first]=1;while(h<t){const i=queue[h++];for(const [dx,dz]of DIRS){const n=neighbor(g,i,dx,dz);if(n>=0&&!seen[n]){seen[n]=1;queue[t++]=n;}}}if(t>largest.length)largest=Array.from(queue.subarray(0,t));}
  if(largest.length<40)throw Error('Not enough connected clear floor inside Manufacturing for the robot dogs. Move a booth away from a walkway and retry.');
  const member=new Uint8Array(nx*nz);for(const i of largest)member[i]=1;for(let i=0;i<member.length;i++)if(!member[i])g.blocked[i]=1;g.valid=largest;return g;
 }
 function nearest(g,x,z){let best=-1,d=Infinity;for(const i of g.valid){const p=point(g,i),dd=(x-p[0])**2+(z-p[1])**2;if(dd<d){d=dd;best=i;}}return best;}
 function plan(g,start,end){const prev=new Int32Array(g.blocked.length).fill(-1),q=new Int32Array(g.valid.length);let h=0,t=1;q[0]=start;prev[start]=start;
  while(h<t&&prev[end]<0){const i=q[h++];for(const [dx,dz]of DIRS){const n=neighbor(g,i,dx,dz);if(n>=0&&prev[n]<0){prev[n]=i;q[t++]=n;}}}
  if(prev[end]<0)return [];const ids=[];for(let i=end;;i=prev[i]){ids.push(i);if(i===start)break;}ids.reverse();const raw=ids.map(i=>point(g,i)),path=[raw[0]];let k=0;
  while(k<raw.length-1){let far=Math.min(raw.length-1,k+20);for(;far>k+1;far--)if(freeSegment(g,...raw[k],...raw[far]))break;path.push(raw[far]);k=far;}return path;
 }
 function make(g,seed=9172005){const desired=[[12,-10],[15,-22],[29,-21],[29,-7],[19,-6]],sim={grid:g,time:0,agents:[],relocations:0,blockedMoves:0,boundaryViolations:0};for(let id=0;id<5;id++){
  const rng=random(seed+id*7907);let p=point(g,nearest(g,...desired[id]));if(sim.agents.some(a=>Math.hypot(a.x-p[0],a.z-p[1])<.8)){for(let k=0;k<60;k++){const pp=point(g,g.valid[Math.floor(rng()*g.valid.length)]);if(sim.agents.every(a=>Math.hypot(a.x-pp[0],a.z-pp[1])>1.4)){p=pp;break;}}}
  sim.agents.push({id,x:p[0],z:p[1],px:p[0],pz:p[1],yaw:rng()*Math.PI*2,speed:.145+rng()*.060,pause:id*.35,path:[],target:null,moving:false,walkClock:rng()*1.152,idleClock:rng()*4,rng,distance:0,stuck:0});
 }return sim;}
 function regrid(sim,g){sim.grid=g;for(const a of sim.agents){if(!allowed(g,a.x,a.z)){[a.x,a.z]=point(g,nearest(g,a.x,a.z));sim.relocations++;}a.px=a.x;a.pz=a.z;a.path=[];a.target=null;a.pause=.2;a.moving=false;}}
 function newPath(sim,a){const g=sim.grid,s=nearest(g,a.x,a.z);let dest=s;for(let k=0;k<40;k++){const id=g.valid[Math.floor(a.rng()*g.valid.length)],p=point(g,id),d=Math.hypot(a.x-p[0],a.z-p[1]);if(d>3&&d<12){dest=id;break;}}
  if(dest===s)dest=g.valid[Math.floor(a.rng()*g.valid.length)];a.path=plan(g,s,dest);a.target=point(g,dest);if(a.path.length&&Math.hypot(a.path[0][0]-a.x,a.path[0][1]-a.z)<.13)a.path.shift();
 }
 function tick(sim,dt,people=[]){const g=sim.grid;dt=Math.max(0,Math.min(.08,dt));sim.time+=dt;
  for(const a of sim.agents){a.px=a.x;a.pz=a.z;a.moving=false;a.idleClock+=dt;
   if(!allowed(g,a.x,a.z)){[a.x,a.z]=point(g,nearest(g,a.x,a.z));a.path=[];sim.relocations++;}
   if(a.pause>0){a.pause-=dt;continue;}if(!a.path.length)newPath(sim,a);if(!a.path.length){a.pause=2;continue;}
   let p=a.path[0],d=Math.hypot(p[0]-a.x,p[1]-a.z);if(d<.08){a.path.shift();if(!a.path.length){a.pause=2+a.rng()*5;a.target=null;continue;}p=a.path[0];d=Math.hypot(p[0]-a.x,p[1]-a.z);}
   let dx=(p[0]-a.x)/(d||1),dz=(p[1]-a.z)/(d||1),yielding=false;
   for(const q of people){const x=q[0]-a.x,z=q[1]-a.z;if(x*x+z*z<.55*.55&&x*dx+z*dz>-.04){yielding=true;break;}}
   for(const b of sim.agents){if(a===b)continue;const x=b.x-a.x,z=b.z-a.z,dist=Math.hypot(x,z);if(dist<.8&&x*dx+z*dz>0){const turn=(a.id%2?1:-1)*.85;dx+=-z/(dist||1)*turn;dz+=x/(dist||1)*turn;if(dist<.40&&a.id>b.id)yielding=true;}}
   if(yielding){a.stuck+=dt;if(a.stuck>5){a.path=[];a.pause=.6;a.stuck=0;}continue;}
   const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const wanted=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(wanted-a.yaw),Math.cos(wanted-a.yaw));a.yaw+=Math.max(-3*dt,Math.min(3*dt,diff));const pace=Math.max(0,Math.cos(diff))*a.speed,dist=Math.min(d,pace*dt),x=a.x+dx*dist,z=a.z+dz*dist;
   if(freeSegment(g,a.x,a.z,x,z)){a.x=x;a.z=z;a.distance+=dist;a.moving=dist>1e-5;a.walkClock+=dt*(pace/(.278*.4));a.stuck=0;}else{sim.blockedMoves++;a.stuck+=dt;if(a.stuck>.65){a.path=[];a.pause=.2;a.stuck=0;}}
   if(a.x<g.bounds[0]+g.radius||a.x>g.bounds[2]-g.radius||a.z<g.bounds[1]+g.radius||a.z>g.bounds[3]-g.radius)sim.boundaryViolations++;
  }
 }
 function snapshot(sim){return{count:sim.agents.length,sector:'Manufacturing',time:sim.time,walkableCells:sim.grid.valid.length,relocations:sim.relocations,blockedMoves:sim.blockedMoves,boundaryViolations:sim.boundaryViolations,outside:sim.agents.filter(a=>!allowed(sim.grid,a.x,a.z)).length,dogs:sim.agents.map(a=>({id:a.id+1,x:a.x,z:a.z,yaw:a.yaw,moving:a.moving,distance:a.distance,target:a.target,clip:a.moving?'Walk':'Idle'}))};}
 return{build,make,regrid,tick,plan,point,cell,allowed,freeSegment,nearest,snapshot,BOUNDS,RADIUS};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ManufacturingDogNav20;
