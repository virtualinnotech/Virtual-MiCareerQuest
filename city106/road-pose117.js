/* Axle contact fitting and the articulated bus's shared hitch. Positive pitch is nose-up. */
const RoadPose117=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function frame(p,yaw,pitch=0){const c=Math.cos(yaw),s=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);return {p,yaw,pitch,right:[c,0,-s],up:[-s*sp,cp,-c*sp],forward:[s*cp,sp,c*cp]};}
 function point(f,o){return f.p.map((p,k)=>p+f.right[k]*o[0]+f.up[k]*o[1]+f.forward[k]*o[2]);}
 function matrix(f,o=[0,0,0],spin=0,steer=0,scale=[1,1,1],out=new Array(16)){
  const c=Math.cos(steer),s=Math.sin(steer),cx=Math.cos(spin),sx=Math.sin(spin);
  for(let k=0;k<3;k++){
   const x=f.right[k]*c-f.forward[k]*s,z=f.right[k]*s+f.forward[k]*c,y=f.up[k];
   out[k]=x*scale[0];out[4+k]=(y*cx+z*sx)*scale[1];out[8+k]=(z*cx-y*sx)*scale[2];
   out[12+k]=f.p[k]+f.right[k]*o[0]+f.up[k]*o[1]+f.forward[k]*o[2];
  }
  out[3]=out[7]=out[11]=0;out[15]=1;return out;
 }
 function axles(wheels){const groups=[];for(const w of wheels){let a=groups.find(a=>Math.abs(a.z-w.offset[2])<.06);if(!a){a={z:w.offset[2],y:0,radius:0,n:0};groups.push(a);}a.y+=w.offset[1];a.radius+=w.radius;a.n++;}return groups.map(a=>({z:a.z,y:a.y/a.n,radius:a.radius/a.n})).sort((a,b)=>a.z-b.z);}
 function rigid(p,yaw,axles,height){
  const back=axles[0],front=axles.at(-1);let pitch=0,f=frame([...p],yaw);
  for(let i=0;i<7;i++){
   const a=point(f,[0,back.y,back.z]),b=point(f,[0,front.y,front.z]),dy=height(b[0],b[2])+front.radius-height(a[0],a[2])-back.radius;
   const previous=pitch;pitch=Math.asin(clamp((dy-Math.cos(pitch)*(front.y-back.y))/(front.z-back.z),-.45,.45));f=frame([...p],yaw,pitch);
   const q=point(f,[0,back.y,back.z]);f.p[1]+=height(q[0],q[2])+back.radius-q[1];
   if(Math.abs(pitch-previous)<1e-10)break;
  }return f;
 }
 function vehicle(v,height){
  const ax=v.axles117||[{z:-v.wheelbase/2,y:v.radius,radius:v.radius},{z:v.wheelbase/2,y:v.radius,radius:v.radius}],art=v.articulation117;
  const front=rigid(v.p,v.yaw,art?ax.slice(1):ax,height);
  if(!art)return {front,rear:front};
  const hitch=[0,art.hingeY,art.hingeZ],pin=point(front,hitch),old=v.trailer117;
  let yaw=v.yaw;
  if(old&&Math.hypot(pin[0]-old.pin[0],pin[2]-old.pin[2])<v.length){
   const angle=Math.atan2(pin[0]-old.axle[0],pin[2]-old.axle[2]),delta=Math.atan2(Math.sin(angle-v.yaw),Math.cos(angle-v.yaw));yaw=v.yaw+clamp(delta,-.7,.7);
  }
  const axle=ax[0];
  function rearAt(pitch){const f=frame([0,0,0],yaw,pitch),q=point(f,hitch);f.p=pin.map((p,k)=>p-q[k]);return f;}
  let lo=-.45,hi=.45;
  for(let i=0;i<18;i++){const mid=(lo+hi)/2,f=rearAt(mid),q=point(f,[0,axle.y,axle.z]);if(q[1]-axle.radius>height(q[0],q[2]))lo=mid;else hi=mid;}
  const rear=rearAt((lo+hi)/2);v.trailer117={pin,axle:point(rear,[0,axle.y,axle.z])};
  return {front,rear,pin,bend:yaw-v.yaw};
 }
 return {frame,point,matrix,axles,rigid,vehicle};
})();
if(typeof module!=='undefined')module.exports=RoadPose117;
if(typeof window!=='undefined')window.RoadPose117=RoadPose117;
