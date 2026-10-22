/* Rural buildings are prepared at startup and reused on countryside visits. */
window.Farmstead65=(()=>{
 const house=[-17,.14,49],truck=[-31.55,.14,49.3],barn=[-49,.14,49],batches=[],obstacles=[];
 let started=false,ready=false,error=null,models;
 const parkedTrucks=[];
 function obstacle(name,x,z,width,depth,height=3){
  const m=new NetworkScene40.Mesh([1,1,1,1]);m.box([x,.14+height/2,z],[width,height,depth]);const v=[];
  for(let i=0;i<m.v.length;i+=6)v.push(...m.v.slice(i,i+3));
  registerCollider('Farm65 '+name,'solidCollider',new Float32Array(v),new Uint32Array(m.i),false,{});baselineColliders.push(colliders.at(-1));
  obstacles.push({name,x,z,width,depth});
 }
 function build(){
  Homestead89.build(obstacle);
  obstacle('farmhouse',house[0],house[2],7.2,4.15,3.7);
  obstacle('workshop back',-49,55.95,16,.14,3.2);
  for(const x of [-56.95,-41.05])obstacle('workshop side',x,49,.14,14,3.2);
  for(const x of [-56.1,-49,-41.9])obstacle('workshop pier',x,42.05,1.8,.14,3.2);
  for(const x of [-52.6,-45.4])obstacle('workbench',x,55.4,3.4,.9,.65);
  // Separate Matter bodies per world; sharing one body between engines is unsafe.
  for(const sim of [...Object.values(Farming36.test.physics),FarmVehicles53.test.physics])
   for(const c of obstacles)Matter.Composite.add(sim.engine.world,Matter.Bodies.rectangle(c.x*100,c.z*100,c.width*100,c.depth*100,{isStatic:true,label:'Farm65 '+c.name}));
  refreshShipments();if(!FarmScene63.active)Ambulance35.refreshWorld();
 }
 async function init(preload=false){
  if(started||(!preload&&!window.FarmScene63?.active)||!FarmVehicles53.snapshot().ready)return;
  started=true;
  try{const h=await DroneAssets44.load('farmhouse65'),t=await DroneAssets44.load('farm-truck65'),b=await DroneAssets44.load('maintenance-barn65');models=[h,t,b];build();
   const r=await fetch('./drone44/truck67-wheels.json');if(!r.ok)throw Error('Truck wheel pivots could not load');
   window.FarmTruck67=createFarmVehicle53({parts:t,wheels:await r.json(),spawn:{x:truck[0],z:truck[2],yaw:Math.PI,speed:0},width:.95,length:2.65,height:.95,wheelbase:1.657,track:.706,wheelRadius:.1784,driverSeat:[.18,.48,.15],steeringCenter:[.18,.60,.45],obstacles});await FarmTruck67.init();
   if(FarmTruck67.snapshot().error)throw Error(FarmTruck67.snapshot().error);
   Garage93.attachPhysics([...Object.values(Farming36.test.physics),FarmVehicles53.test.physics,FarmTruck67.test.physics]);
   for(const sim of [...Object.values(Farming36.test.physics),FarmVehicles53.test.physics]){const body=Matter.Bodies.rectangle(truck[0]*100,truck[2]*100,95,265,{isStatic:true,label:'Farm67 GMC'});Matter.Composite.add(sim.engine.world,body);parkedTrucks.push(body);}
   ready=true;}
  catch(e){error=e.message;console.error('Farmstead:',e);toast('The farm buildings could not load. Return to the venue and try again.');started=false;}
 }
 function draw(planes){if(!ready)return;Homestead89.draw(planes);for(const b of batches)drawBatch(b);
  for(const [parts,p,r,yaw] of [[models[0],house,5,Math.PI],[models[2],barn,12,Math.PI]])
   if(sphereVisible([p[0],p[1]+2,p[2]],r,planes))DroneAssets44.draw(parts,transform(p,[1,1,1],0,yaw));
  FarmTruck67.draw(planes);
 }
 function update(dt){if(!ready)return;Garage93.update(dt);FarmTruck67.update(dt);const v=FarmTruck67.snapshot();for(const body of parkedTrucks){Matter.Body.setPosition(body,{x:v.x*100,y:v.z*100});Matter.Body.setAngle(body,-v.yaw);}}
 return {init,draw,update,snapshot:()=>({ready,error,house,truck,barn,laneWidth:5,bays:[{x:-52.55,z:48,width:5.3,depth:12.5,height:2.9},{x:-45.45,z:48,width:5.3,depth:12.5,height:2.9}],obstacles:obstacles.length})};
})();
