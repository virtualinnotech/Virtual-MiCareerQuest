(function(root){
 const field={left:-116,right:-74,north:-26,south:35};
 const sprinklers=Array.from({length:15},(_,i)=>({id:i,x:-109+(i%3)*14,z:-19+Math.floor(i/3)*12}));
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const pad={x:-72,z:36};
 const pumps=sprinklers.map(p=>({id:p.id,x:-71,z:p.z+(p.id%3-1)*1.4}));
 function create(fault=7){
  const s={phase:'briefing',fault:clamp(Math.floor(fault),0,14),x:-77,y:5,z:33,vx:0,vz:0,inspected:[],points:0,message:'A soil sensor has reported a dry part of the corn field.'};
  function zone(){const row=Math.floor(s.fault/3);return row<2?'northern':row===2?'central':'southern';}
  function launch(){if(s.phase!=='briefing')return false;s.phase='flying';s.message='Check the '+zone()+' field. Compare water flow beneath the irrigation rigs.';return true;}
  function tick(dt,dx,dz,dy){if(!['flying','returning'].includes(s.phase))return;dt=clamp(dt,0,.08);const length=Math.max(1,Math.hypot(dx,dz));s.vx+=(dx/length*7-s.vx)*(1-Math.exp(-dt*5));s.vz+=(dz/length*7-s.vz)*(1-Math.exp(-dt*5));s.x=clamp(s.x+s.vx*dt,field.left-2,-69);s.z=clamp(s.z+s.vz*dt,field.north-2,field.south+2);const overPad=Math.hypot(s.x-pad.x,s.z-pad.z)<1.2;s.y=clamp(s.y+dy*dt*4,s.phase==='returning'&&overPad?.25:2.4,28);}
  function inspect(id){if(s.phase!=='flying'||!sprinklers[id])return false;const p=sprinklers[id];if(Math.hypot(s.x-p.x,s.z-p.z)>12||s.y>14){s.message='Fly closer and lower to inspect that section. Zoom helps you see, but you must also fly over to it.';return false;}if(!s.inspected.includes(id))s.inspected.push(id);if(id!==s.fault){s.message='Section '+String(id+1).padStart(2,'0')+' is watering normally. Keep checking the nozzles.';return false;}s.phase='found';s.message='No water flow in section '+String(id+1).padStart(2,'0')+'. Report the stopped section to the farmer.';return true;}
  function report(){if(s.phase!=='found')return false;s.phase='returning';s.message='Return to the yellow + helipad at the southeast corner. Lower the drone, stop, then land.';return true;}
  function land(){if(s.phase!=='returning')return false;if(Math.hypot(s.x-pad.x,s.z-pad.z)>1.2||s.y>.6||Math.hypot(s.vx,s.vz)>.8){s.message='Center over the yellow +, lower to the pad, and stop moving before landing.';return false;}s.phase='repair';s.x=pad.x;s.z=pad.z;s.y=.25;s.vx=s.vz=0;s.driven=0;s.arrived=false;s.vehicle=null;s.message='Choose the pickup or UTV at the green-lit garages, then drive to pump section '+(s.fault+1)+'. Park, get out, and reset that section.';return true;}
  function drive(x,z,distance,vehicle='utv'){if(s.phase!=='repair')return;if(s.vehicle!==vehicle){s.vehicle=vehicle;s.message='Drive the '+(vehicle==='truck'?'pickup':'UTV')+' to pump section '+(s.fault+1)+'. Park and get out to reset it.';}s.driven+=Math.max(0,distance);const p=pumps[s.fault];if(s.driven>5&&Math.hypot(x-p.x,z-p.z)<3)s.arrived=true;}
  function repair(id,x,z,mounted){if(s.phase!=='repair')return false;const p=pumps[id];if(!p||mounted||Math.hypot(x-p.x,z-p.z)>1.5)return false;if(id!==s.fault){s.message='This section is working. Check the section number you found with the drone.';return false;}if(!s.arrived){s.message='Bring the pickup or UTV to this pump before resetting it.';return false;}s.phase='complete';s.points=200;s.message='Water is flowing again. You found the fault, landed safely, and restored irrigation. +200 points';return true;}
  return{state:s,zone,launch,tick,inspect,report,land,drive,repair};
 }
 const api={create,field,sprinklers,pad,pumps};root.DroneCore44=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
