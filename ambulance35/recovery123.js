/* Short, curvature-limited paths return displaced traffic to its lane. */
globalThis.TrafficRecovery123=(()=>{
 const angle=x=>Math.atan2(Math.sin(x),Math.cos(x));
 const laneYaw=l=>l.axis===0?l.dir*Math.PI/2:l.dir>0?0:Math.PI;
 const lanePose=(l,s)=>{const q=l.dir>0?l.start+s:l.end-s;return {x:l.axis===0?q:l.cross,z:l.axis===0?l.cross:q,yaw:laneYaw(l),s,lane:l.id};};
 function curve(start,end,gear,wheelbase){
  const distance=Math.hypot(end.x-start.x,end.z-start.z),handle=Math.max(wheelbase,distance*.44);
  const a=[start.x,start.z],b=[a[0]+Math.sin(start.yaw)*handle*gear,a[1]+Math.cos(start.yaw)*handle*gear];
  const d=[end.x,end.z],c=[d[0]-Math.sin(end.yaw)*handle*gear,d[1]-Math.cos(end.yaw)*handle*gear];
  const samples=[],count=Math.max(40,Math.ceil((distance+handle*2)/.06));let length=0;
  for(let i=0;i<=count;i++){
   const t=i/count,u=1-t,p=a.map((v,k)=>u*u*u*v+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*d[k]);
   const v=a.map((v,k)=>3*u*u*(b[k]-v)+6*u*t*(c[k]-b[k])+3*t*t*(d[k]-c[k]));
   const acc=a.map((v,k)=>6*u*(c[k]-2*b[k]+v)+6*t*(d[k]-2*c[k]+b[k]));
   const speed=Math.hypot(...v),curvature=(v[1]*acc[0]-v[0]*acc[1])/Math.max(1e-9,speed**3);
   if(speed<.05||Math.abs(curvature)>Math.tan(.60)/wheelbase)return null;
   if(i)length+=Math.hypot(p[0]-samples.at(-1).x,p[1]-samples.at(-1).z);
   samples.push({x:p[0],z:p[1],yaw:Math.atan2(v[0]*gear,v[1]*gear),steer:Math.atan(curvature*wheelbase*gear),distance:length});
  }
  return {samples,length,gear,end};
 }
 function sample(path,distance){
  const ps=path.samples;let lo=0,hi=ps.length-1;
  while(lo+1<hi){const m=(lo+hi)>>1;if(ps[m].distance<distance)lo=m;else hi=m;}
  const a=ps[lo],b=ps[hi],t=Math.max(0,Math.min(1,(distance-a.distance)/Math.max(1e-9,b.distance-a.distance)));
  return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+angle(b.yaw-a.yaw)*t,steer:a.steer+(b.steer-a.steer)*t};
 }
 function paths(v,lane){
  const start={x:v.p[0],z:v.p[2],yaw:v.yaw},wheelbase=Math.max(.55,v.length*.58);
  const q=v.p[lane.axis===0?0:2],s=lane.dir>0?q-lane.start:lane.end-q,paths=[];
  for(const gear of[1,-1])for(const run of[2,4,7,11,16]){
   const target=s+gear*Math.max(run,wheelbase*1.7),margin=v.length/2+.5;
   if(target<margin||target>lane.length-margin)continue;
   const end=lanePose(lane,target),p=curve(start,end,gear,wheelbase);if(p)paths.push(p);
  }
  return paths.sort((a,b)=>a.length+(a.gear<0?5:0)-b.length-(b.gear<0?5:0));
 }
 return {angle,laneYaw,lanePose,curve,sample,paths};
})();
if(typeof module!=='undefined')module.exports=globalThis.TrafficRecovery123;
