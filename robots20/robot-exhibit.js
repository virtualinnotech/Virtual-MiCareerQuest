/* DEV20 Manufacturing robots. Genuine supplied geometry; shared buffers for five dogs.
 * Uses the existing renderer and its normal loop, never another canvas/context.
 * All loading is local. No character decoder, external library, or human crowd needed.
 */
const RobotExhibit20=(()=>{
 'use strict';
 const N=ManufacturingDogNav20,KUKA_POINT=[25.1358189469,.55,-16.8142423276],KUKA_SCALE=.9255581,DOG_SCALE=.4;
 const data={status:'waiting',error:null,models:[],arm:null,dogs:[],sim:null,loading:null,time:0,playing:true,dirty:true,dirtyAt:0,drawCalls:0,visibleDogs:0,oldMeshesRemoved:0};
 const now=()=>performance.now();
 function message(text,error=false){const e=$('robotStatus20');if(e){e.textContent=text;e.style.color=error?'#ffd2a1':'';}}
 function prepareVenue(j){const removed=new Set();function mark(i){if(removed.has(i))return;removed.add(i);for(const c of j.nodes[i].children||[])mark(c);}
  j.nodes.forEach((n,i)=>{if(/^Animated_Robot base yaw$/i.test(n.name||''))mark(i);});
  if(!removed.size)throw Error('The expected Manufacturing arm display was not found. This update requires the v13-based DEV folder.');
  let count=0;for(const i of removed){const n=j.nodes[i];if(n.mesh!==undefined){delete n.mesh;count++;}n.extras={...n.extras,retiredRobotStatue20:true,walktestCollide:false};}
  j.animations=(j.animations||[]).map(a=>({...a,channels:a.channels.filter(c=>!removed.has(c.target?.node))})).filter(a=>a.channels.length);
  data.oldMeshesRemoved=count;j.extras={...j.extras,robotsRevision20:{oldArmRemoved:true,newArm:'robots20/kuka-animated.glb',dogs:5,confinedSector:'Manufacturing'}};
 }
 async function loadModel(url,label){
  const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw Error('Missing '+url+'. Copy the entire robots20 folder beside index.html.');const ab=await response.arrayBuffer();if(gl.isContextLost())throw Error('Graphics reset while loading robots. Restart the venue.');
  const {json:j,bin}=parseGLB(ab),parents=new Map(),order=[];j.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)));function visit(i){order.push(i);for(const c of j.nodes[i].children||[])visit(c);}for(const r of j.scenes[j.scene||0].nodes)visit(r);
  const model={label,j,parents,order,clips:(j.animations||[]).map(a=>characterClip(j,bin,a)),skins:(j.skins||[]).map(s=>({...s,ibm:accessor(j,bin,s.inverseBindMatrices)})),parts:[],textures:[],triangles:0};
  const maps=new Map();async function texture(index){if(index==null)return null;if(!maps.has(index)){const t=await embeddedGLBTexture(j,bin,index);maps.set(index,t);model.textures.push(t);}return maps.get(index);}
  try{
   for(let ni=0;ni<j.nodes.length;ni++){const node=j.nodes[ni];if(node.mesh===undefined)continue;for(const pr of j.meshes[node.mesh].primitives){
    if(pr.extensions?.KHR_draco_mesh_compression)throw Error('Robots must be uncompressed GLBs. Use the supplied DEV20 robot files.');
    const attrs={};for(const [k,i]of Object.entries(pr.attributes))attrs[k]=accessor(j,bin,i);const p=attrs.POSITION,indices=pr.indices===undefined?Uint32Array.from({length:p.length/3},(_,i)=>i):accessor(j,bin,pr.indices),n=attrs.NORMAL||geometryNormals(p,indices),uv=attrs.TEXCOORD_0||new Float32Array(p.length/3*2),interleaved=new Float32Array(p.length*2);
    for(let i=0;i<p.length;i+=3)interleaved.set([p[i],p[i+1],p[i+2],n[i],n[i+1],n[i+2]],i*2);
    const mat=j.materials?.[pr.material]||{},pbr=mat.pbrMetallicRoughness||{},baseTexture=await texture(pbr.baseColorTexture?.index),normalTexture=await texture(mat.normalTexture?.index);
    const batch=uploadBatch(interleaved,indices,{uv,color:pbr.baseColorFactor||[1,1,1,1],baseTexture,normalTexture,normalScale:mat.normalTexture?.scale??.7,metal:label==='Robot dog'?.42:(pbr.metallicFactor??0),rough:label==='Robot dog'?.46:(pbr.roughnessFactor??.5),emission:mat.emissiveFactor||[0,0,0],doubleSided:mat.doubleSided===true,transparent:mat.alphaMode==='BLEND',alphaCutoff:mat.alphaMode==='MASK'?(mat.alphaCutoff??.5):-1,forceOpaque:mat.alphaMode!=='BLEND',animated:true,name:node.name});
    if(node.skin!==undefined){if(!attrs.JOINTS_0||!attrs.WEIGHTS_0)throw Error('The robot dog is missing joint weights.');const weights=new Float32Array(attrs.WEIGHTS_0);for(let i=0;i<weights.length;i+=4){const s=weights[i]+weights[i+1]+weights[i+2]+weights[i+3]||1;for(let k=0;k<4;k++)weights[i+k]/=s;}
     gl.bindVertexArray(batch.vao);for(const [key,at,v]of [['jointsBuffer',7,new Float32Array(attrs.JOINTS_0)],['weightsBuffer',8,weights]]){batch[key]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,batch[key]);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,4,gl.FLOAT,false,0,0);}
    }
    model.parts.push({node:ni,skin:node.skin,batch});model.triangles+=indices.length/3;
   }}
   if(!model.clips.length)throw Error(label+' has no animation clip.');gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);return model;
  }catch(e){releaseModel(model);throw e;}
 }
 function releaseModel(m){for(const p of m.parts||[]){const b=p.batch;for(const key of ['vbo','ibo','uvbo','jointsBuffer','weightsBuffer','lineIbo'])if(b[key])gl.deleteBuffer(b[key]);if(b.vao)gl.deleteVertexArray(b.vao);}for(const t of m.textures||[])releaseEmbeddedTexture(t);m.parts=[];m.textures=[];}
 function actor(model,config){const a={model,...config,mode:null,blend:1,pose:model.j.nodes.map(n=>({translation:[...(n.translation||[0,0,0])],rotation:[...(n.rotation||[0,0,0,1])],scale:[...(n.scale||[1,1,1])],...(n.matrix?{matrix:n.matrix}:{})})),world:[],textures:[],previous:null};for(const skin of model.skins){const t=gl.createTexture(),d=new Float32Array(skin.joints.length*16);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,4,skin.joints.length,0,gl.RGBA,gl.FLOAT,d);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);a.textures.push({t,data:d});}gl.activeTexture(gl.TEXTURE0);return a;}
 function pose(a,mode,time,dt){const m=a.model,clip=m.clips.find(c=>c.name.toLowerCase()===mode.toLowerCase())||m.clips[0];if(a.mode!==mode){a.previous=a.mode?a.pose.map(p=>({...p,translation:[...p.translation],rotation:[...p.rotation],scale:[...p.scale]})):null;a.blend=a.previous?0:1;a.mode=mode;}
  a.blend=Math.min(1,a.blend+dt/.22);for(const ch of clip.channels){if(!['rotation','translation','scale'].includes(ch.path))continue;let v=sampleLandmarkChannel(ch,time%clip.duration);if(a.previous&&a.blend<1){const p=a.previous[ch.node][ch.path];v=ch.path==='rotation'?quaternionSlerp(p,v,a.blend):p.map((x,k)=>x+(v[k]-x)*a.blend);}a.pose[ch.node][ch.path]=v;delete a.pose[ch.node].matrix;}
  for(const i of m.order)a.world[i]=mm(a.world[m.parents.get(i)]||IDENTITY,trs(a.pose[i]));
  for(let si=0;si<m.skins.length;si++){const skin=m.skins[si],t=a.textures[si];for(let k=0;k<skin.joints.length;k++)t.data.set(mm(a.world[skin.joints[k]],skin.ibm.subarray(k*16,k*16+16)),k*16);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,t.t);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,4,skin.joints.length,gl.RGBA,gl.FLOAT,t.data);}gl.activeTexture(gl.TEXTURE0);
 }
 function obstacleSpec(){const s=DISCOVERY_LAYOUT.sectors.find(s=>s.industry==='Manufacturing'),bounds=[s.min[0],s.min[1],s.max[0],s.max[1]],rectangles=[];for(const o of colliders){if(o.boundary||o.hi[0]<bounds[0]||o.lo[0]>bounds[2]||o.hi[2]<bounds[1]||o.lo[2]>bounds[3])continue;const floor=floorHeightAt((o.lo[0]+o.hi[0])/2,(o.lo[2]+o.hi[2])/2);if(o.hi[1]<floor+.05||o.lo[1]>floor+.36)continue;rectangles.push([o.lo[0],o.lo[2],o.hi[0],o.hi[2]]);}
  const polygons=Array.from(shippedBooths.values()).filter(r=>r.industry==='Manufacturing').map(r=>footprint(r,r.placement));
  polygons.push(Array.from({length:32},(_,k)=>[KUKA_POINT[0]+.88*Math.sin(k/32*Math.PI*2),KUKA_POINT[2]+.88*Math.cos(k/32*Math.PI*2)]));
  const gateReservations=(DISCOVERY_LAYOUT.gates||[]).filter(g=>g.industry==='Manufacturing').map(g=>g.keepClear);
  return{bounds,rectangles,polygons,gateReservations};
 }
 function rebuild(){if(!data.arm)return;try{const g=N.build(obstacleSpec());if(data.sim)N.regrid(data.sim,g);else data.sim=N.make(g);for(let i=0;i<5;i++){const a=data.dogs[i],d=data.sim.agents[i];a.position=[d.x,floorHeightAt(d.x,d.z)+.003,d.z];a.yaw=d.yaw;}data.dirty=false;data.error=null;data.status='ready';message('KUKA arm ready. Five robot dogs roam only inside Manufacturing. Student entrances stay clear.');}catch(e){data.error=e.message;data.status='routing-error';message(e.message,true);data.dirty=false;}}
 function invalidate(){data.dirty=true;data.dirtyAt=now();}
 async function init(){ui();if(data.status==='ready'||data.loading)return data.loading;if(data.arm){invalidate();return;}data.status='loading';message('Loading your KUKA arm and robot dog... No student crowd is being loaded.');
  data.loading=(async()=>{const loaded=[];try{const arm=await loadModel('./robots20/kuka-animated.glb?rev=20','KUKA arm');loaded.push(arm);const dog=await loadModel('./robots20/robot-dog.glb?rev=20','Robot dog');loaded.push(dog);if(!dog.clips.some(c=>/^Walk$/i.test(c.name))||!dog.clips.some(c=>/^Idle$/i.test(c.name)))throw Error('Use the animated robot-dog file included in this update.');
    data.models=loaded;data.arm=actor(arm,{position:[...KUKA_POINT],yaw:Math.PI,scale:KUKA_SCALE});data.dogs=Array.from({length:5},(_,id)=>actor(dog,{id,position:[0,0,0],yaw:0,scale:DOG_SCALE}));pose(data.arm,arm.clips[0].name,0,1);for(const a of data.dogs)pose(a,'Idle',a.id*.7,1);rebuild();return true;
   }catch(e){if(!data.arm)loaded.forEach(releaseModel);data.error=e.message;data.status='error';message('Robots did not load: '+e.message,true);console.warn('Manufacturing robots:',e);return false;}finally{data.loading=null;}})();return data.loading;
 }
 function update(dt){if(!data.arm||gl.isContextLost()||document.hidden||state.paused)return;if(data.dirty&&now()-data.dirtyAt>350)rebuild();if(!data.playing||state.animateSculptures===false)return;dt=Math.max(0,Math.min(dt,.06));data.time+=dt;pose(data.arm,data.arm.model.clips[0].name,data.time,dt);
  if(data.sim&&!data.dirty&&data.status==='ready'){
   const people=[[player.position[0],player.position[2]]];for(const a of crowdState.sim?.agents||[])if(a.x>=9&&a.x<=32.4&&a.z>=-24.6&&a.z<=-3.6)people.push([a.renderX??a.x,a.renderZ??a.z]);for(const a of crowdState.staff||[])if(a.industry==='Manufacturing')people.push([a.position[0],a.position[2]]);
   N.tick(data.sim,dt,people);for(let i=0;i<5;i++){const a=data.dogs[i],d=data.sim.agents[i];a.position=[d.x,floorHeightAt(d.x,d.z)+.003,d.z];a.yaw=d.yaw;pose(a,d.moving?'Walk':'Idle',d.moving?d.walkClock:d.idleClock,dt);}
  }
 }
 function drawOne(a){const root=transform(a.position,[a.scale,a.scale,a.scale],0,a.yaw);for(const part of a.model.parts){const b=part.batch;b.boneTexture=part.skin!==undefined?a.textures[part.skin].t:null;const model=part.skin!==undefined?root:mm(root,a.world[part.node]);if(b.doubleSided)gl.disable(gl.CULL_FACE);else gl.enable(gl.CULL_FACE);if(b.transparent){gl.enable(gl.BLEND);gl.depthMask(false);}drawBatch(b,model);gl.depthMask(true);gl.disable(gl.BLEND);data.drawCalls++;}gl.disable(gl.CULL_FACE);}
 function draw(planes){data.drawCalls=0;data.visibleDogs=0;if(!data.arm||gl.isContextLost())return;if(sphereVisible([KUKA_POINT[0],KUKA_POINT[1]+.40,KUKA_POINT[2]],1.05,planes))drawOne(data.arm);
  if(data.status==='ready')for(const a of data.dogs){const center=[a.position[0],a.position[1]+.14,a.position[2]];if(sphereVisible(center,.34,planes)){drawOne(a);data.visibleDogs++;}}
  gl.uniform1i(uniforms.uSkinned,0);gl.activeTexture(gl.TEXTURE0);gl.bindVertexArray(null);
 }
 function visit(kind='arm'){if(!data.sim){init();message('Wait for the robots to finish loading, then choose a view.');return;}const d=kind==='dog'?data.sim.agents[Math.floor(data.time/6)%5]:null,target=d?[d.x,d.z]:[KUKA_POINT[0],KUKA_POINT[2]];let p=null;for(const dist of [1.5,1.8,2.1,2.4]){for(const a of [0,.8,-.8,1.6,-1.6,Math.PI]){const x=target[0]+Math.sin(a)*dist,z=target[1]+Math.cos(a)*dist;if(!N.allowed(data.sim.grid,x,z))continue;const floor=floorHeightAt(x,z),q=resolveEllipsoid([x,floor+PHYSICS.radii[1]+.003,z],[0,0,0]);if(Math.hypot(q.position[0]-x,q.position[2]-z)<.01){p=q.position;break;}}if(p)break;}
  if(!p){const xy=N.point(data.sim.grid,N.nearest(data.sim.grid,target[0],target[1]+2));p=[xy[0],floorHeightAt(...xy)+PHYSICS.radii[1]+.003,xy[1]];}
  const key=kind==='dog'?'manufacturing-dog20':'manufacturing-kuka20';places[key]={label:kind==='dog'?'Robot dogs - Manufacturing only':'KUKA robot arm - Manufacturing',p,scaledPlayer:true,yaw:Math.atan2(p[0]-target[0],p[2]-target[1])};if(!$('places').querySelector('[value="'+key+'"]')){const o=document.createElement('option');o.value=key;o.textContent=places[key].label;$('places').append(o);}teleport(key,true);state.radius=3.1*PLAYER_SCALE;state.pitch=.08;updateCamera(0,true);canvas.focus();
 }
 function ui(){if($('robotsPanel20'))return;data.playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;const panel=document.createElement('details');panel.id='robotsPanel20';panel.className='panel';panel.open=true;panel.style.marginBottom='8px';panel.innerHTML='<summary>Manufacturing robots / DEV 20</summary><p id="robotStatus20" class="ship-hint">Preparing the robot exhibit.</p><div class="buttonRow"><button id="visitKuka20">Robot arm</button><button id="visitDog20">Find robot dog</button></div><div class="buttonRow"><button id="robotPause20">Pause robots</button><button id="robotRetry20">Retry loading</button></div><p class="ship-foot">Five dogs stay inside Manufacturing, away from booths and doorway landings. Your player can still leave. These robots do not start the student crowd.</p>';$('rightTools').prepend(panel);
  $('visitKuka20').onclick=()=>visit('arm');$('visitDog20').onclick=()=>visit('dog');$('robotPause20').textContent=data.playing?'Pause robots':'Resume robots';$('robotPause20').onclick=()=>{data.playing=!data.playing;$('robotPause20').textContent=data.playing?'Pause robots':'Resume robots';canvas.focus();};$('robotRetry20').onclick=()=>init();
 }
 function snapshot(){return{version:20,status:data.status,error:data.error,oldStatueMeshCount:data.oldMeshesRemoved,loadedModels:data.models.map(m=>({name:m.label,triangles:m.triangles,drawParts:m.parts.length,clips:m.clips.map(c=>c.name)})),arm:{position:KUKA_POINT,scale:KUKA_SCALE,time:data.time},dogScale:DOG_SCALE,playing:data.playing,...(data.sim?N.snapshot(data.sim):{count:0}),rendering:{drawCalls:data.drawCalls,visibleDogs:data.visibleDogs}};}
 return{prepareVenue,init,update,draw,invalidate,visit,snapshot,testState:data,testObstacleSpec:obstacleSpec};
})();
window.RobotExhibit20=RobotExhibit20;
