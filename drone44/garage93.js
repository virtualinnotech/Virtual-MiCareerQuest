/* Vehicle-sized, hollow garage. Door visuals and both physics systems share one state. */
window.Garage93=(()=>{
 const floor=.14,front=47,sections=4;
 const bays=[
  {id:'double',x:-31.55,z:front,width:3.7,depth:4.4,opening:3.15,height:1.42,eave:1.78,ridge:2.55},
  {id:'single',x:-28.65,z:front,width:2.1,depth:3.8,opening:1.65,height:1.30,eave:1.58,ridge:2.16}
 ];
 let fixed=[],built=false,glowTime=0;
 function build(obstacle){
  if(built)return;built=true;
  const M=NetworkScene40.Mesh,materials=[];
  const material=(color,props={})=>{const mesh=new M([...color,1]);materials.push([mesh,props]);return mesh;};
  const siding=material([.73,.75,.69],{surfaceType:2}),trim=material([.89,.90,.85]),roof=material([.105,.145,.15],{metal:.35,rough:.56}),steel=material([.16,.18,.19],{metal:.65,rough:.3}),glass=material([.10,.21,.27],{metal:.4,rough:.22}),warm=material([.93,.82,.61],{emission:[.24,.19,.10]});
  function wall(name,p,d){siding.box(p,d);obstacle('home garage '+name,p[0],p[2],d[0],d[2],d[1]);}
  function face(mesh,ps,n){const k=mesh.v.length/6;for(const p of ps)mesh.v.push(...p,...n);mesh.i.push(k,k+1,k+2,k,k+2,k+3);}
  for(const [index,b]of bays.entries()){
   const {x,z,width:w,depth:d,height:h,eave:e,ridge:r}=b,back=z+d,wallH=e-floor;
   FarmSurface91.plane([x,floor,z+d/2],[w,d],[.59,.61,.59,1],{surfaceType:1});
   FarmSurface91.plane([x,floor,z-.38],[w+.22,.76],[.59,.61,.59,1],{surfaceType:1});
   wall(b.id+' back',[x,floor+wallH/2,back],[w,wallH,.10]);
   if(!index)wall('left',[x-w/2,floor+wallH/2,z+d/2],[.10,wallH,d]);
   else wall('right',[x+w/2,floor+wallH/2,z+d/2],[.10,wallH,d]);
   // The partition has an interior walk-through between the two garages.
   if(!index)for(const [cz,depth]of [[z+.85,1.7],[z+3.55,1.7]])wall('partition',[x+w/2,floor+wallH/2,cz],[.10,wallH,depth]);
   const pier=(w-b.opening)/2;
   for(const side of [-1,1]){
    wall(b.id+' jamb',[x+side*(w/2-pier/2),floor+wallH/2,z],[pier,wallH,.12]);
    trim.box([x+side*(b.opening/2+.025),floor+h/2,z-.07],[.045,h,.035]);
    trim.box([x+side*w/2,floor+wallH/2,z-.065],[.06,wallH,.04]);
    face(roof,[[x,r+.025,z-.16],[x+side*(w/2+.12),e,z-.16],[x+side*(w/2+.12),e,back+.15],[x,r+.025,back+.15]],norm([side*(r-e)/(w/2),1,0]));
    for(let zz=z-.16;zz<back+.15;zz+=.14)roof.line([x,r+.04,zz],[x+side*(w/2+.12),e+.014,zz],.009);
    trim.line([x,r+.035,z-.17],[x+side*(w/2+.12),e,z-.17],.045);
    steel.line([x+side*(w/2+.10),e,z-.15],[x+side*(w/2+.10),e,back+.14],.025);
   }
   siding.box([x,(floor+h+e)/2,z],[b.opening,e-floor-h,.10]);
   trim.box([x,floor+h+.025,z-.07],[b.opening+.09,.05,.035]);
   for(const zz of [z,back]){const k=siding.v.length/6,n=[0,0,zz===z?-1:1];siding.v.push(x-w/2,e,zz,...n,x+w/2,e,zz,...n,x,r,zz,...n);siding.i.push(k,k+1,k+2);}
   for(const side of [-1,1])if((index===0&&side===-1)||(index===1&&side===1)){
    for(let zz=z+.1;zz<back;zz+=.13)trim.box([x+side*(w/2+.057),floor+wallH/2,zz],[.022,wallH-.05,.013]);
    for(const zz of [z+1.15,z+2.65]){trim.box([x+side*(w/2+.075),1.13,zz],[.035,.46,.63]);glass.box([x+side*(w/2+.099),1.13,zz],[.012,.39,.55]);trim.box([x+side*(w/2+.111),1.13,zz],[.013,.39,.021]);}
    steel.line([x+side*(w/2+.10),e,back],[x+side*(w/2+.10),floor+.05,back],.022);
   }
   // Visible rails follow the same bend as the articulated sectional door.
   for(const side of [-1,1]){
    const points=[];for(let i=0;i<=30;i++){const pose=track(b,i*(h+.95)/30);points.push([x+side*(b.opening/2+.025),pose.y,pose.z]);}steel.tube(points,.009);
   }
   steel.line([x,floor+h+.26,z+.1],[x,floor+h+.26,z+2.2],.018);steel.box([x,floor+h+.32,z+2.1],[.20,.12,.28]);
   warm.box([x,e-.045,z+2.8],[.48,.02,.08]);
   for(const dx of [-w*.36,w*.36]){steel.box([x+dx,e+.035,z-.09],[.14,.07,.13]);warm.box([x+dx,e,z-.13],[.11,.012,.10]);}
   const opening=b.opening,ph=h/sections;
   b.panels=[];
   for(let row=0;row<sections;row++){
    const skin=new M([.13,.20,.19,1]),detail=new M([.29,.35,.33,1]),windowMesh=new M([.10,.21,.27,1]);
    skin.box([0,0,0],[opening-.035,ph-.009,.035]);
    const columns=index?3:6;
    for(let col=0;col<columns;col++){const cx=(col-(columns-1)/2)*opening/columns,cw=opening/columns-.065;
     detail.box([cx,0,-.022],[cw,ph-.065,.016]);
     if(row===sections-1)windowMesh.box([cx,.018,-.033],[cw-.03,ph*.50,.012]);
    }
    if(row===0)detail.box([0,0,-.046],[.13,.025,.025]);
    b.panels.push([skin.build({surfaceType:13}),detail.build({rough:.5}),...(row===sections-1?[windowMesh.build({metal:.45,rough:.20})]:[])]);
   }
   b.amount=0;b.hold=0;b.blocked=false;b.bodies=[];setBlocked(b,true);
   b.highlight=false;
   const marker=new M([.08,.88,.20,1]);
   for(const side of [-1,1])marker.box([x+side*(opening/2+.045),floor+h/2,z-.10],[.022,h+.06,.012]);
   marker.box([x,floor+h+.047,z-.10],[opening+.11,.022,.012]);
   b.marker=marker.build({emission:[.08,1.15,.18]});
   b.label=NetworkScene40.label(index?'UTV':'PICKUP');
  }
  fixed=materials.map(([m,p])=>m.build(p));
 }
 function track(b,s){
  const radius=.19;
  if(s<=b.height)return {y:floor+s,z:b.z,angle:0};
  const a=Math.min(Math.PI/2,(s-b.height)/radius),extra=Math.max(0,s-b.height-Math.PI*radius/2);
  return {y:floor+b.height+radius*Math.sin(a),z:b.z+radius*(1-Math.cos(a))+extra,angle:a};
 }
 function setBlocked(b,value){
  if(b.blocked===value)return;b.blocked=value;
  if(b.collider){baselineColliders=baselineColliders.filter(c=>c!==b.collider);const i=colliders.indexOf(b.collider);if(i>=0)colliders.splice(i,1);b.collider=null;}
  if(value){const m=new NetworkScene40.Mesh([1,1,1,1]);m.box([b.x,floor+b.height/2,b.z],[b.opening,b.height,.06]);const v=[];for(let i=0;i<m.v.length;i+=6)v.push(...m.v.slice(i,i+3));registerCollider('Farm93 '+b.id+' garage door','solidCollider',new Float32Array(v),new Uint32Array(m.i),false,{});b.collider=colliders.at(-1);baselineColliders.push(b.collider);}
  for(const body of b.bodies)body.collisionFilter.mask=value?0xffffffff:0;
  refreshShipments();
 }
 function attachPhysics(simulations){
  for(const b of bays)for(const sim of simulations){const body=Matter.Bodies.rectangle(b.x*100,b.z*100,b.opening*100,6,{isStatic:true,label:'Farm93 '+b.id+' garage door'});body.collisionFilter.mask=b.blocked?0xffffffff:0;Matter.Composite.add(sim.engine.world,body);b.bodies.push(body);}
 }
 function footprint(v,w,l){return {x:v.x,z:v.z,ex:(Math.abs(Math.cos(v.yaw))*w+Math.abs(Math.sin(v.yaw))*l)/2,ez:(Math.abs(Math.sin(v.yaw))*w+Math.abs(Math.cos(v.yaw))*l)/2,mounted:v.mounted};}
 function update(dt){
  if(!built||!window.FarmScene63?.active||state.paused||document.hidden)return;
  dt=Math.min(dt,.08);
  glowTime+=dt;
  const mission=window.Drone44?.snapshot(),choosing=mission?.mission&&mission.phase==='repair'&&!mission.vehicle;
  const vehicles=[[window.FarmTruck67,.95,2.65],[window.FarmVehicles53,.67,1.28]].filter(([v])=>v?.snapshot().ready).map(([v,w,l])=>footprint(v.snapshot(),w,l));
  const driving=vehicles.find(v=>v.mounted),walking=!driving&&!window.Farming36?.mounted&&!window.Drone44?.active;
  for(const b of bays){
   const vehicle=(b.id==='double'?window.FarmTruck67:window.FarmVehicles53)?.snapshot();
   b.highlight=!!(choosing&&vehicle?.ready&&!vehicle.mounted&&Math.abs(vehicle.x-b.x)<b.width/2&&vehicle.z>b.z&&vehicle.z<b.z+b.depth);
   const strength=b.highlight?.65+.16*Math.sin(glowTime*2.2):0;
   for(const row of b.panels)for(const batch of row.slice(0,2))batch.emission=[strength*.06,strength,strength*.12];
   const pedestrian=walking&&Math.abs(player.position[0]-b.x)<b.opening/2+1.0&&player.position[2]>b.z-1.6&&player.position[2]<b.z+b.depth+.35;
   const approach=driving&&Math.abs(driving.x-b.x)<b.opening/2+driving.ex+.4&&driving.z>b.z-4.8-driving.ez&&driving.z<b.z+b.depth+driving.ez;
   const obstructed=vehicles.some(v=>Math.abs(v.x-b.x)<b.opening/2+v.ex+.10&&Math.abs(v.z-b.z)<v.ez+.20);
   if(pedestrian||approach||obstructed)b.hold=2;
   else b.hold=Math.max(0,b.hold-dt);
   const target=b.hold>0?1:0;
   b.amount=Math.max(0,Math.min(1,b.amount+(target?1:-1)*dt*1.6));
   // No invisible wall remains beneath a fully raised door.
   setBlocked(b,b.amount<.98);
  }
 }
 function draw(planes){
  if(!built||!sphereVisible([-30.5,1.3,49.2],5,planes))return;
  for(const batch of fixed)drawBatch(batch);
  for(const b of bays){if(b.highlight)drawBatch(b.marker);drawBatch(b.label,transform([b.x,b.eave+.15,b.z-.065],[b.id==='double'?.85:.6,.13,1],0,Math.PI));}
  for(const b of bays)for(let row=0;row<sections;row++){
   const p=track(b,(row+.5)*b.height/sections+b.amount*(b.height+.20));
   const matrix=transform([b.x,p.y,p.z],[1,1,1],p.angle);
   for(const batch of b.panels[row])drawBatch(batch,matrix);
  }
 }
 return {build,draw,update,attachPhysics,snapshot:()=>({floor,bays:bays.map(({id,x,z,width,depth,opening,height,amount,blocked,highlight})=>({id,x,z,width,depth,opening,height,amount,blocked,highlight})),batches:fixed.length+bays.reduce((n,b)=>n+(b.panels?.flat().length||0)+2,0)})};
})();
