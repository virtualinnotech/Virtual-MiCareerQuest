(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.HibachiCore145=api;})(globalThis,()=>{
 'use strict';
 const targets=Object.freeze({steak:135,chicken:165,shrimp:165});
 const durations={power:1.1,egg:1.8,rice:2.1,steak:1.3,chicken:1.3,shrimp:1.7,flip:1.1,probe:1.2,serve:3.8};
 const fresh=()=>({phase:'off',power:false,grill:70,elapsed:0,egg:0,rice:0,scramble:0,mix:0,
  foods:Object.fromEntries(Object.keys(targets).map(k=>[k,{placed:false,temp:40,flips:0,checked:false}])),
  action:null,flame:0,flameCooldown:0,flourishes:0,served:false,message:'Order 04: hibachi combination',revision:0});
 function create(){
  const state=fresh(),s=state;
  const ready=()=>s.mix>=1&&Object.entries(targets).every(([k,t])=>s.foods[k].placed&&s.foods[k].temp>=t);
  function allowed(id,food){
   if(s.action||s.phase==='complete')return false;
   if(id==='power')return s.phase==='off';
   if(id==='egg')return s.phase==='egg';
   if(id==='rice')return s.phase==='rice';
   if(id==='scramble')return s.phase==='scramble';
   if(id==='mix')return s.phase==='mix';
   if(id in targets)return ['proteins','cooking'].includes(s.phase)&&!s.foods[id].placed;
   if(id==='flip'||id==='probe')return !!s.foods[food]?.placed;
   if(id==='flame')return s.power&&s.grill>=300&&s.flameCooldown<=0;
   return id==='serve'&&ready();
  }
  function act(id,food){
   if(!allowed(id,food))return false;
   if(id==='flame'){s.flame=1.8;s.flameCooldown=6;s.flourishes++;s.revision++;return true;}
   if(id==='scramble'||id==='mix')return true;
   s.action={id,food,time:0,duration:durations[id]};s.revision++;return true;
  }
  function finish(a){
   if(a.id==='power'){s.power=true;s.phase='preheat';s.message='Grill warming';}
   else if(a.id==='egg'){s.egg=1;s.phase='scramble';s.message='Egg on the grill';}
   else if(a.id==='rice'){s.rice=1;s.phase='mix';s.message='Rice and egg';}
   else if(a.id in targets){s.foods[a.id].placed=true;s.phase=Object.values(s.foods).every(f=>f.placed)?'cooking':'proteins';s.message='Cooking to order';}
   else if(a.id==='flip'){s.foods[a.food].flips++;s.message=a.food[0].toUpperCase()+a.food.slice(1)+' turned';}
   else if(a.id==='probe'){s.foods[a.food].checked=true;s.message=a.food[0].toUpperCase()+a.food.slice(1)+': '+Math.round(s.foods[a.food].temp)+' F';}
   else if(a.id==='serve'){s.served=true;s.power=false;s.phase='complete';s.message='Order 04 served';}
   s.action=null;s.revision++;
  }
  function tick(dt,stir=0){
   if(!Number.isFinite(dt)||dt<=0)return;
   dt=Math.min(dt,.1);s.elapsed+=dt;s.flame=Math.max(0,s.flame-dt);s.flameCooldown=Math.max(0,s.flameCooldown-dt);
   if(s.power)s.grill=Math.min(375,s.grill+27*dt);else s.grill=Math.max(70,s.grill-dt*12);
   if(s.phase==='preheat'&&s.grill>=350){s.phase='egg';s.message='Grill ready';s.revision++;}
   if(s.action){s.action.time+=dt;if(s.action.time>=s.action.duration)finish(s.action);}
   if(stir>0&&!s.action&&['scramble','mix'].includes(s.phase)){
    const key=s.phase;s[key]=Math.min(1,s[key]+dt*Math.min(1,stir)/(key==='scramble'?4:6));
    if(s[key]>=1){s.phase=key==='scramble'?'rice':'proteins';s.message=key==='scramble'?'Egg scrambled':'Fried rice ready';s.revision++;}
   }
   if(s.power)for(const [k,f]of Object.entries(s.foods))if(f.placed){
    const before=f.temp;f.temp=Math.min(targets[k],f.temp+Math.max(0,s.grill-f.temp)*dt*(k==='shrimp'?.026:.022));
    if(before<targets[k]&&f.temp>=targets[k])s.revision++;
   }
   if(!s.action&&s.phase==='cooking'&&ready()){s.phase='serve';s.message='All items ready';s.revision++;}
  }
  return {state,allowed,act,tick,ready,reset(){Object.assign(s,fresh());}};
 }
 return {targets,durations,create};
});
