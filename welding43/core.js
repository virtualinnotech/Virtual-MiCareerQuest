(function(root){
 function create(){
  const s={phase:'ready',helmet:false,checks:[false,false,false],x:0,error:0,trigger:false,speed:0,heat:0,coverage:0,quality:0,bins:Array(60).fill(0),burn:Array(60).fill(0),marks:[],onTime:0,offTime:0,exposures:0,unsafeHeld:false,message:'Check your safety gear, then lower the helmet.',points:0};
  function helmet(){if(!s.checks.every(Boolean)){s.message='Check all three safety items first.';return false;}s.helmet=!s.helmet;s.trigger=false;s.message=s.helmet?'Hold the trigger and follow the joint from left to right.':'Helmet raised. The torch is off.';return true;}
  function tick(dt,x=s.x,error=0,trigger=false){dt=Math.min(.05,Math.max(0,dt));if(!dt||s.phase==='complete')return;
   if(trigger&&!s.helmet&&!s.unsafeHeld){s.exposures++;s.message='Eye injury is real. Lower your welding helmet before using the torch.';}s.unsafeHeld=trigger&&!s.helmet;
   const last=s.x,lastError=s.error;s.x=Math.max(0,Math.min(1,x));s.error=Math.max(-.23,Math.min(.16,error));s.speed=Math.hypot((s.x-last)*1.36,s.error-lastError)/dt/1.36;s.trigger=trigger&&s.helmet&&s.checks.every(Boolean);s.heat=Math.max(0,Math.min(1,s.heat+(s.trigger?.65:-1.5)*dt));if(s.trigger){s.phase='welding';const accurate=Math.abs(s.error)<.010;if(accurate)s.onTime+=dt;else s.offTime+=dt;
    const steps=Math.max(1,Math.min(30,Math.ceil(Math.hypot((s.x-last)*1.36,s.error-lastError)/.006)));for(let k=1;k<=steps;k++){const t=k/steps;s.marks.push({x:last+(s.x-last)*t,error:lastError+(s.error-lastError)*t});}if(s.marks.length>2400)s.marks.splice(0,s.marks.length-2400);
    if(accurate&&s.speed<.30){const start=Math.floor(Math.min(last,s.x)*59),end=Math.floor(Math.max(last,s.x)*59);for(let i=start;i<=end;i++){s.bins[i]+=dt/(end-start+1);if(s.speed<.02)s.burn[i]+=dt;}}s.message=!accurate?'Your weld is off the crease. Bring the pin back to the corner.':s.speed>.22?'Slow down. Leave a continuous line.':s.speed<.02?'Keep moving so one spot does not overheat.':'Steady movement. Keep following the joint.';}
   const filled=s.bins.filter(v=>v>=.035).length,good=s.bins.filter((v,i)=>v>=.035&&s.burn[i]<.8).length,precision=s.onTime/Math.max(.001,s.onTime+s.offTime);s.coverage=Math.round(filled/60*100);s.quality=filled?Math.round(good/filled*precision*100):0;
  }
  function inspect(){s.trigger=false;if(s.coverage<95){s.message='There are gaps. Continue the line before checking again.';return false;}if(s.quality<90){s.phase='failed';s.message='The weld wandered off the crease or overheated. Try fresh metal and keep a straight, steady line.';return false;}s.phase='complete';s.points=200;s.message='Joint complete! A continuous line with steady movement. +200 points';return true;}
  function reset(){Object.assign(s,{phase:'ready',trigger:false,x:0,error:0,speed:0,heat:0,coverage:0,quality:0,bins:Array(60).fill(0),burn:Array(60).fill(0),marks:[],onTime:0,offTime:0,unsafeHeld:false,points:0,message:'Fresh metal. Start at the left end of the joint.'});}
  return{state:s,helmet,tick,inspect,reset};
 }
 const api={create};root.WeldCore43=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
