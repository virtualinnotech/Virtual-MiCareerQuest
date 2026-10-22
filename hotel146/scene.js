window.HotelScene146=(()=>{
 const C=HotelCore146,origin=C.origin,kiosk=C.kiosk,models={},contacts=[],objects=[],glazing=[];
 let cube,sphere,logo,monitor,guest,dog,doorman,staff,ready=false,time=0,door=0,screenKey='',shellDrawn150=false;
 const at=p=>add(origin,p),desk=C.reception.position,guestPoint=C.reception.guest;
 async function load(name){
  const response=await fetch('./hotel146/assets/'+name+'.glb?v=154');if(!response.ok)throw Error('Missing hotel asset: '+name);
  const {json:j,bin}=parseGLB(await response.arrayBuffer()),world=[],parents=new Map(),textures=new Map(),parts=[];
  j.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)));function visit(i){world[i]=mm(world[parents.get(i)]||IDENTITY,trs(j.nodes[i]));for(const c of j.nodes[i].children||[])visit(c);}for(const i of j.scenes[j.scene||0].nodes)visit(i);
  for(let i=0;i<j.nodes.length;i++){const n=j.nodes[i];if(n.mesh==null)continue;for(const p of j.meshes[n.mesh].primitives){const v=accessor(j,bin,p.attributes.POSITION),idx=accessor(j,bin,p.indices),normal=p.attributes.NORMAL==null?geometryNormals(v,idx):accessor(j,bin,p.attributes.NORMAL),data=new Float32Array(v.length*2);
   for(let k=0;k<v.length;k+=3)data.set([...v.subarray(k,k+3),...normal.subarray(k,k+3)],k*2);
   const material=j.materials[p.material]||{},pbr=material.pbrMetallicRoughness||{},ti=pbr.baseColorTexture?.index;if(ti!=null&&!textures.has(ti))textures.set(ti,await embeddedGLBTexture(j,bin,ti));
   const ni=material.normalTexture?.index;if(ni!=null&&!textures.has(ni))textures.set(ni,await embeddedGLBTexture(j,bin,ni));
   const batch=uploadBatch(data,new Uint32Array(idx),{color:pbr.baseColorFactor||[1,1,1,1],rough:pbr.roughnessFactor??.65,metal:pbr.metallicFactor??0,baseTexture:textures.get(ti),normalTexture:textures.get(ni),normalScale:.5,uv:p.attributes.TEXCOORD_0==null?null:accessor(j,bin,p.attributes.TEXCOORD_0),doubleSided:true,alphaCutoff:.02,sharedKey:'hotel146-'+name+'-'+parts.length});
   parts.push({name:n.name,matrix:world[i],batch,positions:v,indices:idx,transparent:material.alphaMode==='BLEND'});
  }}models[name]=parts;if(j.extras?.hotel146)contacts.push(...j.extras.hotel146.contacts);gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);
 }
 function model(name,p,scale=1,yaw=0,base=origin,opaque=true){const s=Array.isArray(scale)?scale:[scale,scale,scale];for(const part of models[name]||[]){const matrix=mm(transform(add(base,p),s,0,yaw),part.matrix);if(part.transparent)glazing.push({batch:part.batch,matrix});else if(opaque)drawBatch(part.batch,matrix);}}
 function drawShell150(){
  shellDrawn150=false;if(!ready||!C.insideLobby150(camera))return;
  // Establish the nearby opaque walls before shading the city behind them.
  // Glass remains in the normal late transparent pass, so openings stay clear.
  gl.disable(gl.CULL_FACE);
  for(const name of ['building','lobby'])for(const part of models[name])if(!part.transparent)drawBatch(part.batch,mm(transform(origin,[1,1,1]),part.matrix));
  shellDrawn150=true;
 }
 function box(p,size,color,yaw=0){drawBatch(cube,transform(at(p),size,0,yaw),false,color);}
 function ball(p,size,color){drawBatch(sphere,transform(at(p),size),false,color);}
 function rod(a,b,width,color){const d=sub(b,a),y=norm(d),x=norm(cross(Math.abs(y[1])>.9?[1,0,0]:[0,1,0],y)),z=cross(x,y);drawBatch(cube,new Float32Array([...mul(x,width),0,...mul(y,len(d)),0,...mul(z,width),0,...at(mul(add(a,b),.5)),1]),false,color);}
 function branding(q,c){
  q.clearRect(0,0,c.width,c.height);q.save();q.scale(c.width/1024,c.height/190);
  q.fillStyle='#dfbb52';q.strokeStyle='#dfbb52';q.lineWidth=4;
  for(const side of [-1,1]){
   q.save();q.translate(side<0?74:950,105);q.scale(-side,1);
   q.beginPath();q.moveTo(0,36);q.bezierCurveTo(-2,8,-11,-20,-27,-43);q.stroke();
   for(const [x,y,a] of [[-7,-10,-.55],[9,7,.65]]){
    q.save();q.translate(x,y);q.rotate(a);q.beginPath();q.moveTo(0,13);q.bezierCurveTo(-29,-2,-24,-25,0,-46);q.bezierCurveTo(24,-25,29,-2,0,13);
    q.moveTo(0,6);q.bezierCurveTo(14,-8,14,-21,0,-33);q.bezierCurveTo(-14,-21,-14,-8,0,6);q.fill('evenodd');q.restore();
   }q.restore();
  }
  q.fillStyle='#fff';q.font='60px Georgia,serif';q.textAlign='center';q.textBaseline='middle';q.fillText('GRAND PLAZA HOTEL',512,100,768);q.restore();
 }
 function screen(s){const key=[s.step,s.complete,s.score,s.room].join('|');if(key===screenKey)return;screenKey=key;monitor.update((q,c)=>{q.fillStyle='#132d2b';q.fillRect(0,0,c.width,c.height);q.fillStyle='#d6b86d';q.font='bold 28px sans-serif';q.fillText('GRAND PLAZA / RECEPTION',24,42);q.fillStyle='#fff';q.font='24px sans-serif';q.fillText(s.complete?'CHECK-IN COMPLETE':'Jordan Ellis',24,95);q.font='20px monospace';for(const [i,line]of ['AGP-2048','2 NIGHTS / KING','QUIET / PET-FRIENDLY','ROOM '+(s.room||'--'),'TOTAL $428'].entries())q.fillText(line,24,139+i*37);q.fillStyle='#6bddb6';q.fillText(s.complete?'KEY ISSUED':C.steps[s.step]?.title.toUpperCase(),24,358);});}
 function draw(s,planes){if(!ready)return;const shell=shellDrawn150;shellDrawn150=false;glazing.length=0;gl.disable(gl.CULL_FACE);
  if(sphereVisible(add(kiosk,[0,.6,0]),1.8,planes)){
   model('desk',[0,0,0],C.kioskDesk.scale,C.kioskDesk.yaw,kiosk);
   drawBatch(logo.batch,transform(add(kiosk,C.kioskDesk.logo),[2.7,.35,1],0,Math.PI));
  }
  if(sphereVisible(at([0,8,0]),10.5,planes))model('building',[0,0,0],1,0,origin,!shell);
  if(Math.hypot(camera[0]-origin[0],camera[2]-origin[2])>36||!sphereVisible(at([0,2,0]),6.5,planes))return;
  model('lobby',[0,0,0],1,0,origin,!shell);
  for(const w of C.windows){const p=w.axis===0?[w.wall,w.y,w.along]:[w.along,w.y,w.wall];model('window',p,[(w.width+.03)/.7065544,w.height/1.15,1],w.yaw);}
  for(const x of [-2.15,2.15])box([x,3.33,3.635],[.64,1.27,.012],[.19,.28,.31,1]);
  for(const o of objects)model(...o);
  screen(s);drawBatch(logo.batch,transform(at(C.reception.logo),[2.4,.34,1],0,Math.PI/2));
  for(const z of [-2.55,-.45])for(const y of [.19,.39])ball([-2.183,y,z],[.012,.012,.012],[.66,.44,.14,1]);
  drawBatch(logo.batch,transform(at([0,1.27,C.door151.front-.114]),[1.34,.20,1],0,Math.PI));
  // In-world monitor faces the employee, with a matching accessible computer panel.
  drawBatch(monitor.batch,transform(at(C.reception.monitor),[.276*C.reception.computerScale,.155*C.reception.computerScale,1],0,-Math.PI/2));
  const driving=window.Driving154?.mounted();
  if(guest&&!driving){guest.clock=time;CrowdGraphics.draw([], [guest],planes,time,'full');}
  if(doorman)RobotExhibit20.animatedAsset.drawOne(doorman);
  if(staff&&!driving)RobotExhibit20.animatedAsset.drawOne(staff);
  if(dog&&!driving)RobotExhibit20.animatedAsset.drawOne(dog);
  if(!driving)rod([-1.75,.29,-1.68],[-1.65,.19,-1.98],.005,[.28,.13,.06,1]);
  // The supplied rotor turns independently of its fixed drum and canopy.
  for(const part of models['revolving-door']){
   const matrix=mm(transform(at([0,0,C.door151.z]),[1,1,1],0,part.name==='door-rotor'?door:0),part.matrix);
   if(part.transparent)glazing.push({batch:part.batch,matrix});else drawBatch(part.batch,matrix);
  }
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  glazing.sort((a,b)=>Math.hypot(b.matrix[12]-camera[0],b.matrix[14]-camera[2])-Math.hypot(a.matrix[12]-camera[0],a.matrix[14]-camera[2]));
  for(const p of glazing)drawBatch(p.batch,p.matrix);
  gl.depthMask(true);gl.disable(gl.BLEND);
 }
 function update(dt){if(!ready||state.paused)return;time+=Math.min(.1,dt);if(Math.hypot(player.position[0]-origin[0],player.position[2]-(origin[2]+C.door151.z))<1.6)door+=dt*.85;for(const actor of window.Driving154?.mounted()?[doorman]:[dog,doorman,staff])if(actor&&Math.hypot(player.position[0]-actor.position[0],player.position[2]-actor.position[2])<25)RobotExhibit20.animatedAsset.pose(actor,'Idle',time,dt);}
 async function init(){cube=createCube();sphere=createSphere();logo=NetworkScene40.screen(2048,380,branding);logo.batch.alphaCutoff=.05;logo.batch.unlit=true;monitor=NetworkScene40.screen(512,384,()=>{});monitor.batch.unlit=true;
  for(const name of ['building','lobby','revolving-door','desk','computer','trolley','luggage','chandelier','side-table','lamp','console','sofa','coffee-table','reading-chair','reading-bookcase','window','heritage-window','wall-panel',C.stairs.asset,'opulent-details','victorian-details'])await load(name);
  objects.push(['opulent-details',[0,0,0]],...C.reading153,...C.waiting154,['desk',desk,C.reception.scale,C.reception.yaw],['computer',C.reception.computer,C.reception.computerScale,-Math.PI/2],['chandelier',[0,3.15,-.4],[1,.86,1]],[C.stairs.asset,C.stairs.position,C.stairs.scale,C.stairs.yaw],['trolley',[-1.50,0,-3.38],1,Math.PI/2],['luggage',[-1.65,0,-.96],1,Math.PI/2],['luggage',[-1.50,.07,-3.38],.85],['console',[-2.90,0,1.0],1,Math.PI/2]);
  for(const side of [-1,1]){
   const yaw=side<0?Math.PI/2:-Math.PI/2;
   for(const z of [-2.59,-1.33,-.07,1.19,2.45])objects.push(['lamp',[side*3.15,1.45,z],1,yaw]);
  }
  for(const x of [-2.15,2.15])objects.push(['heritage-window',[x,2.55,3.62],1,Math.PI]);
  for(const x of [-2.95,-1.35,0,1.35,2.95])for(const y of [0,2.1])objects.push(['wall-panel',[x,y,3.62],1,Math.PI]);
  await CrowdGraphics.prepareModels(()=>{});const person=characterState.models.get('roger_character');
  guest={id:'hotel-guest146',kind:'boothStaff',model:person,position:at(guestPoint),yaw:-Math.PI/2,phase:0,clock:0,waveUntil:0,mode:'idle',outfit:{...CrowdWardrobe.appearance(146,24680,person),flags:[1,0,0,0]}};
  const dogModel=await RobotExhibit20.animatedAsset.loadModel('./city106/dogs112/dog.glb?v=112','Hotel guest dog');dog=RobotExhibit20.animatedAsset.actor(dogModel,{position:at([-1.65,0,-2]),yaw:-Math.PI/2,scale:1});RobotExhibit20.animatedAsset.pose(dog,'Idle',0,1);
  for(const [name,position,scale,yaw] of [C.doorman154,C.staff154]){
   const model=await RobotExhibit20.animatedAsset.loadModel('./hotel146/assets/'+name+'.glb?v=154',name);
   const actor=RobotExhibit20.animatedAsset.actor(model,{position:at(position),yaw,scale});RobotExhibit20.animatedAsset.pose(actor,'Idle',0,1);
   if(name===C.doorman154[0])doorman=actor;else staff=actor;
  }
  ready=true;
 }
 return {init,draw,drawShell150,update,at,origin,kiosk,desk,guestPoint,contacts,models,get ready(){return ready;},snapshot:()=>({models:Object.keys(models),door,time,ready,people:[doorman,staff].filter(Boolean).map(a=>({name:a.model.label,position:a.position,mode:a.mode,triangles:a.model.triangles}))})};
})();
