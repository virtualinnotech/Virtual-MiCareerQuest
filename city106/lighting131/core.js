(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CityClock131=api;})(globalThis,()=>{
 'use strict';
 const DAY_SECONDS=1800,NIGHT_SECONDS=600,CYCLE_SECONDS=DAY_SECONDS+NIGHT_SECONDS;
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
 function sample(seconds){
  const cycle=((seconds%CYCLE_SECONDS)+CYCLE_SECONDS)%CYCLE_SECONDS,isDay=cycle<DAY_SECONDS;
  const fraction=isDay?cycle/DAY_SECONDS:(cycle-DAY_SECONDS)/NIGHT_SECONDS;
  const angle=(isDay?0:Math.PI)+fraction*Math.PI,hour=((isDay?6:18)+fraction*12)%24;
  const direction=[Math.cos(angle)*.9,Math.sin(angle)*.78,-Math.sin(angle)*.43-Math.cos(angle)*.25],length=Math.hypot(...direction),sun=direction.map(x=>x/length);
  const daylight=smooth(-.09,.20,sun[1]),night=1-smooth(-.025,.12,sun[1]),power=smooth(-.015,.20,sun[1]),warm=1-smooth(.08,.65,sun[1]);
  return {cycle,hour,isDay,daylight,night,power,sun,color:[1.34+.16*warm,1.29-.41*warm,1.16-.72*warm],daySeconds:DAY_SECONDS,nightSeconds:NIGHT_SECONDS};
 }
 return {DAY_SECONDS,NIGHT_SECONDS,CYCLE_SECONDS,sample};
});
