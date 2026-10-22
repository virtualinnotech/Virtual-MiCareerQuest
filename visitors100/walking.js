/* Supplied students share navigation and skeletal animation with the crowd. */
window.Visitors100=(()=>{
 const ids=['student2','green','casual','stride-a','stride-b','smiling','teenage'];
 const models=new Map(),palettes=[[[.22,.42,.82],[.22,.25,.3],[.18,.12,.07]],[[.8,.2,.25],[.12,.19,.3],[.45,.23,.08]],[[.2,.58,.38],[.3,.28,.24],[.075,.06,.05]],[[.55,.32,.7],[.15,.2,.25],[.65,.48,.22]]];
 let started=false,ready=false,error=null,lastSim=null,lastCount=0;
 function role(id,name){return id.startsWith('green')?(/Hair/.test(name)?3:/Outfit_Top/.test(name)?1:/Outfit_Bottom/.test(name)?2:0):id.startsWith('student2')?(/id80/.test(name)?3:/id72/.test(name)?1:/id68/.test(name)?2:0):0;}
 async function load(id){
  const response=await fetch('./visitors100/rigged102/'+id+'.glb?v=102');if(!response.ok)throw Error('Student model missing: '+id);
  const {json:j,bin}=parseGLB(await response.arrayBuffer()),parents=new Map(),order=[];
  j.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)));
  function visit(i){order.push(i);for(const c of j.nodes[i].children||[])visit(c);}for(const r of j.scenes[j.scene||0].nodes)visit(r);
  const clips=(j.animations||[]).map(a=>characterClip(j,bin,a));
  const model={id:'visitor102-'+id,j,parents,order,clips,idle:clips.find(c=>c.name==='Idle'),walk:clips.find(c=>c.name==='Walk'),parts:[],skins:(j.skins||[]).map(s=>({...s,ibm:accessor(j,bin,s.inverseBindMatrices)})),scale:CHARACTER_HEIGHT/1.78,offset:[0,0,0],lo:[-.5,0,-.5],hi:[.5,1.78,.5],preserveTopology102:true};
  if(!model.idle||!model.walk||!model.skins.length)throw Error('Student is missing its walking rig: '+id);
  const maps=new Map();async function texture(index){if(index==null)return null;if(!maps.has(index))maps.set(index,await embeddedGLBTexture(j,bin,index));return maps.get(index);}
  for(const [ni,node]of j.nodes.entries()){
   if(node.mesh===undefined)continue;
   for(const pr of j.meshes[node.mesh].primitives){
    const a={};for(const [key,index]of Object.entries(pr.attributes))a[key]=accessor(j,bin,index);
    if(node.skin===undefined||!a.JOINTS_0||!a.WEIGHTS_0)throw Error('Unskinned student surface: '+node.name);
    const p=a.POSITION,indices=pr.indices===undefined?Uint32Array.from({length:p.length/3},(_,i)=>i):accessor(j,bin,pr.indices),n=a.NORMAL||geometryNormals(p,indices),uv=a.TEXCOORD_0||new Float32Array(p.length/3*2),joints=new Float32Array(a.JOINTS_0),weights=new Float32Array(a.WEIGHTS_0),data=new Float32Array(p.length*2);
    for(let i=0;i<p.length;i+=3)data.set([p[i],p[i+1],p[i+2],n[i],n[i+1],n[i+2]],i*2);
    for(let i=0;i<weights.length;i+=4){const sum=weights[i]+weights[i+1]+weights[i+2]+weights[i+3]||1;for(let k=0;k<4;k++)weights[i+k]/=sum;}
    const mat=j.materials?.[pr.material]||{},pbr=mat.pbrMetallicRoughness||{};
    const batch=uploadBatch(data,indices,{uv,color:pbr.baseColorFactor||[1,1,1,1],baseTexture:await texture(pbr.baseColorTexture?.index),rough:.85,metal:0,emission:[0,0,0],doubleSided:true,forceOpaque:true,transparent:false,alphaCutoff:mat.alphaMode==='MASK'?(mat.alphaCutoff??.4):mat.alphaMode==='BLEND'?.28:-1,outfitRole:id.endsWith('-variants')?role(id,node.name):0});
    gl.bindVertexArray(batch.vao);
    for(const [key,at,value]of [['jointsBuffer',7,joints],['weightsBuffer',8,weights]]){batch[key]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,batch[key]);gl.bufferData(gl.ARRAY_BUFFER,value,gl.STATIC_DRAW);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,4,gl.FLOAT,false,0,0);}
    model.parts.push({name:node.name,node:ni,skin:node.skin,batch,source:{positions:p,normals:n,uv,indices,joints,weights}});
   }
  }
  gl.bindVertexArray(null);return model;
 }
 async function init(){
  if(started)return;started=true;
  for(const id of [...ids,'student2-variants','green-variants'])try{models.set(id,await load(id));}catch(e){error=e.message;console.warn('Walking student '+id,e);}
  while(!CrowdGraphics.ready)await new Promise(r=>setTimeout(r,200));
  for(const m of models.values())characterState.models.set(m.id,m);
  await CrowdGraphics.prepareModels();ready=true;assign();
 }
 function assigned(){return(crowdState.sim?.agents||[]).filter(a=>a.visitor102);}
 function assign(){
  if(!ready||!crowdState.sim)return;
  const sim=crowdState.sim,agents=sim.agents.filter(a=>!a.stationed&&!a.volunteer),available=ids.filter(id=>models.has(id));if(!available.length)return;
  // Replace crowd members rather than layering stationary duplicates over them.
  const selected=agents.slice(0,21),fresh=lastSim!==sim;
  for(const a of sim.agents)delete a.visitor102;
  for(const [i,a]of selected.entries()){
   const variant=i>=7&&(i%3!==0),id=variant?(i%2?'student2':'green'):available[i%available.length],key=id+(variant?'-variants':'');
   a.model=models.get(key)||models.get(id);a.visitor102=id;
   a.outfit={colors:[...(variant?palettes[i%4].flat():Array(9).fill(1)),1,1,1],flags:[0,0,0,0]};
   if(fresh&&i<7){const cell=CrowdCore.nearest(sim.grid,29+(i%4)*1.05,i<4?2.1:-2.1),p=CrowdCore.point(sim.grid,cell);a.x=a.px=a.renderX=p[0];a.z=a.pz=a.renderZ=p[1];a.target=null;a.pause=0;a.holdMode=null;a.localGoal=null;}
  }
  lastSim=sim;lastCount=sim.agents.length;
 }
 const originalAssign=assignCrowdModels;assignCrowdModels=function(){originalAssign();assign();};
 const previous=RobotExhibit20.draw;RobotExhibit20.draw=function(planes){previous.call(this,planes);if(state.ready&&characterState.status==='ready'&&!started)init().catch(e=>{error=e.message;console.warn('Walking students:',e);});if(ready&&(lastSim!==crowdState.sim||lastCount!==crowdState.sim?.agents.length))assign();};
 function visit(){
  if(window.Scooter100?.busy()){toast('Leave the current challenge first.');return;}
  const a=assigned().find(a=>a.moving)||assigned()[0];if(!a){toast('Students are still loading.');return;}
  MissionUI99.close();$('controlsPopup').classList.add('hidden');HubGuide.close();
  const g=crowdState.sim.grid,p=CrowdCore.point(g,CrowdCore.nearest(g,a.x-Math.sin(a.yaw)*1.2,a.z-Math.cos(a.yaw)*1.2));
  places.students102={label:'New walking students',p:[p[0],floorHeightAt(...p)+PHYSICS.radii[1],p[1]],yaw:Math.atan2(p[0]-a.x,p[1]-a.z),scaledPlayer:true};
  teleport('students102',true);state.firstPerson=false;state.orbitYaw=0;state.radius=1.1;updateCamera(0,true);
 }
 return {visit,snapshot:()=>({ready:ready&&models.size===9,error,models:[...models.keys()],visitors:assigned().map(a=>({id:a.visitor102,agentId:a.id,x:a.x,z:a.z,yaw:a.yaw,mode:a.mode,moving:a.moving,distance:a.distance,industry:CrowdCore.region(a.x,a.z)})),palettes})};
})();
