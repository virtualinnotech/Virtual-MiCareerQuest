/* Deterministic command interpreter shared by the station and its tests. */
(function(root){
 'use strict';
 const commands={pickup:'Move to conveyor',down1:'Lower arm',grip:'Grip component',up1:'Lift arm',tray:'Move to empty slot',down2:'Lower arm',release:'Release component',up2:'Lift arm'};
 const initial=['pickup','down1','grip','up1','tray','release','down2','up2'];
 const solution=['pickup','down1','grip','up1','tray','down2','release','up2'];
 const pickup=[-1.35,1.03,-.55],slot=i=>[1.15,1.03,-.1+i*.42];
 function create(){
  const s={program:[...initial],phase:'editing',mode:'test',index:-1,elapsed:0,completed:0,points:0,held:false,closed:false,tcp:[0,1.9,.55],part:[...pickup],drop:null,message:'Troubleshoot the sequence. Test the robot, observe the error, and rearrange the commands.',tested:false};
  let from,to,action,dropTime=0;
  function move(i,d){if(['running','dropping'].includes(s.phase)||s.phase==='complete')return false;const j=i+d;if(j<0||j>=s.program.length)return false;[s.program[i],s.program[j]]=[s.program[j],s.program[i]];s.tested=false;s.phase='editing';s.message='Program changed. Test your sequence.';return true;}
  function begin(){
   action=s.program[s.index];from=[...s.tcp];to=[...from];s.elapsed=0;
   if(action==='pickup'){to[0]=pickup[0];to[2]=pickup[2];}
   if(action==='tray'){const p=slot(s.completed);to[0]=p[0];to[2]=p[2];}
   if(action.startsWith('down'))to[1]=1.03;
   if(action.startsWith('up'))to[1]=1.9;
  }
  function fail(message){s.phase='failed';s.message='Test failed. '+message+' Try again.';s.tested=false;}
  function start(mode){
   if(['running','dropping'].includes(s.phase)||s.phase==='complete')return false;
   if(mode==='production'&&!s.tested){s.message='Pass a test cycle before running production.';return false;}
   Object.assign(s,{phase:'running',mode,index:0,completed:0,points:0,held:false,closed:false,tcp:[0,1.9,.55],part:[...pickup],drop:null,message:mode==='production'?'Production running':'Test cycle running'});begin();return true;
  }
  function stop(){if(['running','dropping'].includes(s.phase)){s.phase='stopped';s.message='Emergency stop. Cell stopped. Test again when ready.';s.tested=false;}}
  function reset(){Object.assign(s,{program:[...initial],phase:'editing',index:-1,completed:0,points:0,held:false,closed:false,tcp:[0,1.9,.55],part:[...pickup],drop:null,tested:false,message:'Troubleshoot the sequence. Test the robot, observe the error, and rearrange the commands.'});}
  function tick(dt,speed=1){
   if(s.phase==='dropping'){
    dropTime+=dt;s.part[1]=Math.max(.10,s.drop[1]-4.9*dropTime*dropTime);s.part[0]=s.drop[0]+1.4*Math.min(dropTime,1);s.part[2]=s.drop[2]+.45*Math.min(dropTime,1);
    if(s.part[1]<=.10)fail('The component fell to the floor. Check the release height and position.');return;
   }
   if(s.phase!=='running')return;
   s.elapsed+=dt*speed;const t=Math.min(1,s.elapsed/.85),ease=t*t*(3-2*t);
   s.tcp=from.map((v,i)=>v+(to[i]-v)*ease);if(s.held)s.part=[...s.tcp];
   if(t<1)return;
   if(action==='grip'){
    s.closed=true;
    if(Math.hypot(...s.tcp.map((v,i)=>v-s.part[i]))>.12){fail('The gripper closed without a component. Check its position and height.');return;}
    s.held=true;
   }
   if(action==='release'){
    s.closed=false;
    if(!s.held){fail('There was no component in the gripper.');return;}
    s.held=false;
    if(Math.hypot(...s.tcp.map((v,i)=>v-slot(s.completed)[i]))>.12){s.phase='dropping';s.drop=[...s.part];dropTime=0;s.message='Component released outside its seat';return;}
    s.part=slot(s.completed);s.completed++;
   }
   s.index++;
   if(s.index<s.program.length){begin();return;}
   if(s.held||s.completed===0){fail('The cycle ended without placing a component.');return;}
   if(s.mode==='test'){s.phase='passed';s.tested=true;s.message='Test passed. The component is seated. Ready for production.';return;}
   if(s.completed===3){s.phase='complete';s.points=200;s.message='Challenge complete! Three components seated correctly. +200 points';return;}
   s.index=0;s.part=[...pickup];s.closed=false;begin();
  }
  return {state:s,move,start,stop,reset,tick};
 }
 const api={create,commands,initial,solution,pickup,slot};root.RobotCore37=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
