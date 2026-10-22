/* Animated welding display replaces the large double-gear sculpture. */
const Welding37=(()=>{
 const center=[30.2,0,-23.07],scale=.65,assets=RobotExhibit20.animatedAsset;
 let actor=null,status='loading',error=null,time=0,accumulator=0,draws=0;
 const bounds=[center[0]-2.145,center[2]-1.4625,center[0]+2.145,center[2]+1.4625];
 function obstacle(){
  const lo=[bounds[0],center[1],bounds[1]],hi=[bounds[2],center[1]+1.6,bounds[3]],v=[];
  for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]])for(const x of [lo[0],hi[0]])v.push(x,y,z);
  registerCollider('Welding37 workcell','solidCollider',new Float32Array(v),new Uint32Array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]),false,{});
  baselineColliders.push(colliders.at(-1));refreshShipments();Crowd.invalidate();RobotExhibit20.invalidate();
 }
 async function init(){
  try{
   const model=await assets.loadModel('./robotics37/welding.glb','Welding workcell');
   model.clips.forEach((c,i)=>{c.name=c.name||'Welding cycle '+(i+1);});
   center[1]=floorHeightAt(center[0],center[2])+.008;
   actor=assets.actor(model,{position:[center[0]-2.3*scale,center[1]+.025*scale,center[2]-.05*scale],scale,yaw:0});
   assets.pose(actor,model.clips[0].name,0,1);obstacle();status='ready';
   if(new URLSearchParams(location.search).get('exhibit')==='welding')visit();
  }catch(e){status='error';error=e.message;console.error('Welding display:',e);}
 }
 function update(dt){
  if(!actor||document.hidden||state.paused||state.animateSculptures===false)return;
  time+=Math.min(Math.max(dt,0),.1);accumulator+=dt;
  // Pose evaluation is capped at 30 Hz and skipped while the exhibit is out of view.
  if(accumulator<1/30||len(sub(camera,center))>=22)return;
  const planes=frustumPlanes(mm(perspective(canvas.clientWidth/canvas.clientHeight),lookAt(camera,target)));
  if(sphereVisible(add(center,[0,.8,0]),3.5,planes)){
   assets.pose(actor,actor.model.clips[0].name,time,accumulator);accumulator=0;
  }
 }
 function draw(planes){draws=0;if(actor&&sphereVisible(add(center,[0,.8,0]),3.5,planes)){assets.drawOne(actor);draws=actor.model.parts.length;}}
 function visit(){if(!actor)return;places.welding37={label:'Manufacturing: welding workcell',p:[center[0],center[1]+PHYSICS.radii[1]+.02,center[2]+2.3],scaledPlayer:true,yaw:0};teleport('welding37');state.radius=2.6;state.pitch=.15;updateCamera(0,true);}
 function crowdObstacles(){return actor?[[[bounds[0],bounds[1]],[bounds[2],bounds[1]],[bounds[2],bounds[3]],[bounds[0],bounds[3]]]]:[];}
 return {init,update,draw,visit,crowdObstacles,snapshot:()=>({status,error,time,duration:actor?.model.clips[0].duration,triangles:actor?.model.triangles,draws,bounds,center,pose:actor?.world.map(m=>Array.from(m))})};
})();
window.Welding37=Welding37;
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,grid=CrowdCore.buildGrid;
 RobotExhibit20.draw=function(planes){draw(planes);Welding37.draw(planes);};
 RobotExhibit20.update=function(dt){update(dt);Welding37.update(dt);};
 CrowdCore.buildGrid=function(base,polygons=[],staff=[]){return grid(base,[...polygons,...Welding37.crowdObstacles()],staff);};
 const start=()=>{if(!state.ready){setTimeout(start,250);return;}Welding37.init();};start();
}
