/* Suspend indoor people during drives without changing saved crowd settings. */
(()=>{
 const driving=()=>Driving154.mounted();
 const updateCrowd=Crowd.update,updateCharacters=AnimatedCharacters.update,drawCharacters=AnimatedCharacters.draw,drawCrowd=CrowdGraphics.draw,updateStaff=EventFlow22.update;
 const outdoor=a=>a.kind==='cityPedestrian'||EventFlow22.officers.includes(a);
 Crowd.update=function(dt){if(!driving())updateCrowd(dt);};
 AnimatedCharacters.update=function(dt){
  if(!driving())return updateCharacters(dt);
  characterState.time+=Math.max(0,Math.min(dt,.1));
  if($('staffPrompt'))$('staffPrompt').hidden=true;
 };
 AnimatedCharacters.draw=function(planes){if(!driving())drawCharacters(planes);};
 CrowdGraphics.draw=function(agents,staff,planes,time,detail){
  return driving()?drawCrowd(agents.filter(outdoor),staff.filter(outdoor),planes,time,detail):drawCrowd(agents,staff,planes,time,detail);
 };
 EventFlow22.update=function(dt){
  if(!driving())return updateStaff(dt);
  for(const a of EventFlow22.officers)a.clock+=Math.max(0,Math.min(dt,.1));
 };
 window.IndoorPerformance154={visible:a=>!driving()||outdoor(a),snapshot:()=>({suspended:driving(),preservesCrowdSettings:true})};
})();
