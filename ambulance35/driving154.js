/* Shared visual vehicle dynamics. Matter remains authoritative for movement. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.Driving154=api;})(globalThis,()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),angle=v=>Math.atan2(Math.sin(v),Math.cos(v));
 function create({heavy=false}={}){
  const s={yaw:0,followYaw:0,previousYaw:0,previousSpeed:0,roll:0,rollVelocity:0,pitch:0,pitchVelocity:0,ready:false};
  function reset(yaw,speed=0){Object.assign(s,{yaw,followYaw:yaw,previousYaw:yaw,previousSpeed:speed,roll:0,rollVelocity:0,pitch:0,pitchVelocity:0,ready:true});}
  function snap(yaw){s.followYaw=yaw;}
  function step(dt,yaw,speed){
   if(!s.ready){reset(yaw,speed);return s;}if(!(dt>0))return s;
   dt=Math.min(dt,.1);
   const rate=clamp(angle(yaw-s.previousYaw)/dt,-3,3),acceleration=clamp((speed-s.previousSpeed)/dt/.4,-16,12);
   const rollTarget=clamp(speed*rate/.4*(heavy?.010:.008),-.085,.085),pitchTarget=clamp(-acceleration*(heavy?.0035:.0028),-.045,.055);
   const count=Math.ceil(dt*120),h=dt/count,stiffness=heavy?65:90,damping=heavy?11:13;
   for(let i=0;i<count;i++)for(const [key,target] of [['roll',rollTarget],['pitch',pitchTarget]]){
    const velocity=key+'Velocity';s[velocity]+=(stiffness*(target-s[key])-damping*s[velocity])*h;s[key]+=s[velocity]*h;
   }
   // Keep the heading briefly behind during turns, then settle without a snap.
   const lag=angle(yaw-s.followYaw),bounded=clamp(lag,-.68,.68);
   s.followYaw=yaw-bounded+bounded*(1-Math.exp(-dt/(heavy?.34:.30)));
   s.previousYaw=s.yaw=yaw;s.previousSpeed=speed;return s;
  }
  return {state:s,reset,snap,step};
 }
 const mounted=()=>!!(globalThis.Rivian147?.mounted||globalThis.Ambulance35?.mounted);
 return {create,angle,mounted};
});
