/* Keep the venue's collision-aware route planner; replace only its presentation. */
window.Wayfinder103=(()=>{
 let route=null,markers=[],bursts=[],meshes=null,last=0,previous=null,bearing=0,arrived=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function init(){
  const M=NetworkScene40.Mesh;
  const orb=new M([.14,.68,1,1]),rows=12,cols=20;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const a=j*Math.PI/rows,b=i*Math.PI*2/cols,n=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];orb.v.push(...n,...n);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;orb.i.push(a,a+1,b,a+1,b+1,b);}
  meshes={orb:orb.build({emission:[.02,.16,.30],metal:.25,rough:.18})};
 }
 function set(next){
  route=next;markers=[];bursts=[];previous=null;arrived=false;
  if(!next)return;
  let travelled=0,nextAt=.7;
  for(let i=1;i<next.points.length;i++){
   const a=next.points[i-1],b=next.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   while(travelled+length>=nextAt){const t=(nextAt-travelled)/length;markers.push({x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,popped:false});nextAt+=.85;}
   travelled+=length;
  }
 }
 function segmentDistance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l)):0;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);}
 function draw(){
  const next=HubGuide.snapshot().route;if(next!==route)set(next);
  if(!route||!state.ready||state.overview||window.FarmScene63?.active)return;
  if(!meshes)init();
  const now=performance.now()/1000,dt=Math.min(.1,Math.max(0,now-last));last=now;
  const pos=[player.position[0],player.position[2]],floor=player.position[1]-PHYSICS.radii[1],s=sectorScaleAt(...pos),pulse=reduced?1:1+.10*Math.sin(now*3);
  if(!previous||Math.hypot(pos[0]-previous[0],pos[1]-previous[1])>1.8)previous=pos;
  for(const m of markers)if(!m.popped&&Math.abs(floor-floorHeightAt(m.x,m.z))<.3&&segmentDistance([m.x,m.z],previous,pos)<.23*s){m.popped=true;bursts.push({x:m.x,z:m.z,age:0});}
  previous=pos;
  arrived=Math.hypot(pos[0]-route.goal[0],pos[1]-route.goal[1])<.75;
  if(arrived)return;
  bearing=Math.atan2(route.goal[0]-pos[0],route.goal[1]-pos[1]);
  gl.disable(gl.CULL_FACE);
  for(let i=0;i<markers.length;i++){
   const m=markers[i];if(m.popped||Math.hypot(m.x-pos[0],m.z-pos[1])>14)continue;
   const y=floorHeightAt(m.x,m.z)+(.37+(reduced?0:.035*Math.sin(now*2.5+i*.55)))*s,r=.058*pulse*s;
   drawBatch(meshes.orb,transform([m.x,y,m.z],[r,r,r]));
  }
  bursts=bursts.filter(b=>b.age<.5);
  for(const b of bursts){b.age+=dt;if(reduced)continue;const y=floorHeightAt(b.x,b.z)+.37*s,r=(.065+b.age*.34)*s;for(let i=0;i<6;i++){const angle=i*Math.PI/3,size=.013*(1-b.age/.5)*s;drawBatch(meshes.orb,transform([b.x+Math.cos(angle)*r,y+Math.sin(angle)*r,b.z],[size,size,size]));}}
  gl.enable(gl.CULL_FACE);
 }
 HubGuide.drawRoute=draw;
 return {snapshot:()=>({active:!!route,arrived,bearing,presentation:'spheres-only',markers:markers.map(m=>({...m})),bursts:bursts.length}),clear:()=>set(null)};
})();
