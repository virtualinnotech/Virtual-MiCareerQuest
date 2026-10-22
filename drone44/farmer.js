/* Preserve the student's avatar while using the farmer role on the farm. */
window.FarmPeople55=(()=>{
 let ready=false,error=null,farmer=null,student=null,active=false,original=null,hat=[],fit=null,head=0;
 function onFarm(){const b=FarmBoundary48.bounds;return player.position[0]>=b.left-1&&player.position[0]<=b.right+1&&player.position[2]>=b.north-1&&player.position[2]<=b.south+1;}
 function update(){if(!ready||!characterState.player)return;const wanted=window.FarmScene63?.active;
  if(active&&(!wanted||characterState.player!==student)){student.outfit=original;active=false;}
  if(wanted&&!active&&!MRI42.inside){
   student=farmer=characterState.player;original=student.outfit;
   const m=student.model,U=(m.hi[1]-m.lo[1])/1.78,b=CharacterFitting.bones(m);head=b.Head.i;
   student.outfit={...original,backpack:false,hat:false,volunteer:false,flags:[0,0,0,-1/U],colors:[.7,.7,.62,.055,.12,.20,.085,.05,.025,.25,.22,.16]};
   for(const part of m.parts)if(/hair/i.test(part.name||''))part.batch.farmHairCut=m.hi[1]-.14*U;
   fit=transform([b.Head.p[0]-.008*U,m.hi[1]-.075*U,b.Head.p[2]+.055*U],[.28*U,.28*U,.29*U],0,Math.PI);active=true;
  }
 }
 function draw(a){if(!active||a!==student||Drone44.active||state.firstPerson||state.overview||smoothRadius<.30)return;const skin=a.textures[0].data.subarray(head*16,head*16+16);DroneAssets44.draw(hat,mm(actorMatrix(a),mm(skin,fit)));}
 async function init(){try{hat=await DroneAssets44.load('farmer-hat');ready=true;update();}catch(e){error=e.message;console.error('FarmPeople55',e);}}
 return {init,update,draw,snapshot:()=>({ready,error,active,model:farmer?.model.id,originalAvatar:true}),test:{get farmer(){return farmer;},get student(){return student;}}};
})();
{
 const update=RobotExhibit20.update,tele=teleport,actor=drawActor;
 drawActor=function(a,p){actor(a,p);FarmPeople55.draw(a);};
 RobotExhibit20.update=function(dt){FarmPeople55.update();update(dt);FarmPeople55.update();};
 teleport=function(...args){const result=tele(...args);FarmPeople55.update();return result;};
 const start=()=>{if(!state.ready||!characterState.player||typeof FarmBoundary48==='undefined'||!FarmBoundary48.snapshot().ready){setTimeout(start,250);return;}FarmPeople55.init();};start();
}
