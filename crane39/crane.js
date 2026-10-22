/* Shared model buffers render both the working crane and the indoor miniature. */
const Crane39=(()=>{
 const C=CraneCore39,site=C.site,game=C.create(),s=game.state,keys=new Set();
 let ready=false,error=null,active=false,saved,panel,prompt,cube,crane=[],pipes=[],building=[],obstacles=[],zoom=29;
 let orbit=-2.77,elevation=.8,viewMode='overview',drag=null;
 const cabOrigin=[-.68,11.28,.48];
 function cabPoint(p){const q=add(cabOrigin,p),c=Math.cos(s.yaw),n=Math.sin(s.yaw);return add(site.tower,[q[0]*c+q[2]*n,q[1],q[2]*c-q[0]*n]);}
 const gold=[1,.65,.06,1],steel=[.18,.22,.24,1],green=[.12,.85,.43,1];
 async function load(url,split=false){
  const response=await fetch(url);if(!response.ok)throw Error('Could not load '+url);
  const {json:j,bin}=parseGLB(await response.arrayBuffer()),out=[],cache=new Map();
  async function texture(i){if(i==null)return null;if(!cache.has(i))cache.set(i,await embeddedGLBTexture(j,bin,i));return cache.get(i);}
  for(const n of j.nodes){if(n.mesh===undefined)continue;
   if(split&&['7','8'].includes(n.name))continue;
   for(const p of j.meshes[n.mesh].primitives){
    const a=Object.fromEntries(Object.entries(p.attributes).map(([k,v])=>[k,accessor(j,bin,v)])),pos=a.POSITION;
    const indices=p.indices===undefined?Uint32Array.from({length:pos.length/3},(_,i)=>i):accessor(j,bin,p.indices);
    const normals=a.NORMAL||geometryNormals(pos,indices),data=new Float32Array(pos.length*2);
    for(let i=0;i<pos.length;i+=3)data.set([...pos.subarray(i,i+3),...normals.subarray(i,i+3)],i*2);
    const m=j.materials?.[p.material]||{},pbr=m.pbrMetallicRoughness||{},material={color:pbr.baseColorFactor||[1,1,1,1],uv:a.TEXCOORD_0,baseTexture:await texture(pbr.baseColorTexture?.index),rough:.75,metal:.15,doubleSided:true};
    const groups=[[],[]];
    for(let i=0;i<indices.length;i+=3){const tri=Array.from(indices.subarray(i,i+3));let x=0,y=0,z=0;for(const k of tri){x+=pos[k*3]/3;y+=pos[k*3+1]/3;z+=pos[k*3+2]/3;}
     if(split&&x< -1.35&&y>125&&y<133&&z>.6&&z<2.8)continue;
     if(split&&z>8&&y<125)continue;
     groups[split&&(y>=124||(z< -3&&y>100))?1:0].push(...tri);
    }
    groups.forEach((idx,upper)=>{if(idx.length)out.push({batch:uploadBatch(data,new Uint32Array(idx),material),upper});});
   }
  }
  gl.activeTexture(gl.TEXTURE0);gl.bindVertexArray(null);return out;
 }
 function box(p,size,color){drawBatch(cube,transform(p,size),false,color);}
 function line(a,b,width,color){const d=sub(b,a),y=norm(d),ref=Math.abs(y[1])>.9?[1,0,0]:[0,1,0],x=norm(cross(ref,y)),z=cross(x,y),mid=mul(add(a,b),.5),m=new Float32Array([x[0]*width,x[1]*width,x[2]*width,0,y[0]*len(d),y[1]*len(d),y[2]*len(d),0,z[0]*width,z[1]*width,z[2]*width,0,...mid,1]);drawBatch(cube,m,false,color);}
 function model(parts,m){for(const p of parts)drawBatch(p.batch,m);}
 function craneAt(p,scale,yaw){const fixed=transform(p,[.3*scale,.09*scale,.3*scale]),turn=transform(p,[.3*scale,.09*scale,.3*scale],0,yaw);for(const part of crane)drawBatch(part.batch,part.upper?turn:fixed);drawCab(p,scale,yaw);}
 function drawCab(p,scale,yaw){
  const root=transform(p,[scale,scale,scale],0,yaw),blue=[.055,.23,.43,1],black=[.055,.065,.07,1],seat=[.43,.22,.045,1];
  const b=(q,size,color)=>drawBatch(cube,mm(root,transform(add(cabOrigin,q),size)),false,color);
  // Keep the central footwell clear so the operator can sight the load below.
  b([0,.02,-.38],[.64,.045,.45],blue);
  for(const x of [-.30,.30])b([x,.02,.13],[.04,.045,.5],blue);
  b([0,.02,.37],[.64,.045,.025],blue);
  b([0,.85,-.12],[.67,.045,1.0],blue);b([0,.43,-.60],[.64,.85,.035],blue);
  for(const x of [-.31,.31]){b([x,.43,-.34],[.035,.85,.035],blue);for(let i=0;i<8;i++){const y=.08+i*.095,z=.38-.15*Math.pow((y-.4)/.45,2);b([x,y,z],[.032,.105,.035],blue);}b([x,.36,0],[.03,.035,.71],blue);}
  for(const y of [.15,.38])b([0,y,.365],[.62,.014,.014],black);
  b([0,.18,-.30],[.24,.25,.24],[.22,.25,.26,1]);b([0,.31,-.25],[.27,.075,.26],seat);b([0,.48,-.40],[.27,.34,.05],seat);b([0,.68,-.40],[.16,.13,.05],seat);
  for(const x of [-.22,.22]){b([x,.39,-.03],[.10,.08,.31],[.25,.28,.29,1]);b([x,.48,.055],[.015,.13,.015],black);b([x,.55,.055],[.04,.04,.04],black);}
  b([-.245,.43,.14],[.11,.10,.10],black);
 }
 function seatedPose(a){if(!active||!a.player)return;for(let i=0;i<a.model.j.nodes.length;i++){const name=a.model.j.nodes[i].name||'',r=/upleg|thigh/i.test(name)?Math.PI/2:/(?:left|right)leg|calf/i.test(name)?-Math.PI/2:null;if(r===null)continue;delete a.pose[i].matrix;const [x,y,z,w]=a.model.j.nodes[i].rotation||[0,0,0,1],sn=Math.sin(r/2),c=Math.cos(r/2);a.pose[i].rotation=[x*c+w*sn,y*c+z*sn,z*c-y*sn,w*c-x*sn];}
  const m=a.model,w=[];for(const i of m.order)w[i]=mm(w[m.parents.get(i)]||IDENTITY,trs(a.pose[i]));
  const hip=w[m.skins[0].joints[0]],scale=m.scale*sectorScaleAt(site.tower[0],site.tower[2]),seat=cabPoint([0,.395,-.25]);
  player.position[1]=seat[1]+PHYSICS.radii[1]-(hip[13]+m.offset[1])*scale;
 }
 // Reuse the avatar's skinned geometry and textures, selecting only leg triangles.
 function firstPersonPart(part,a){
  if(part.craneLegs!==undefined)return part.craneLegs;
  const src=part.source,skin=a.model.skins[part.skin],indices=[];
  const leg=Array.from(skin.joints,n=>/upleg|thigh|(?:left|right)leg|calf|foot|toe/i.test(a.model.j.nodes[n].name||''));
  const weight=v=>{let w=0;for(let k=0;k<4;k++)if(leg[src.joints[v*4+k]])w+=src.weights[v*4+k];return w;};
  for(let i=0;i<src.indices.length;i+=3)if([0,1,2].every(k=>weight(src.indices[i+k])>.5))indices.push(...src.indices.subarray(i,i+3));
  if(!indices.length)return part.craneLegs=null;
  const data=new Float32Array(src.positions.length*2);for(let i=0;i<src.positions.length;i+=3)data.set([...src.positions.subarray(i,i+3),...src.normals.subarray(i,i+3)],i*2);
  const batch=uploadBatch(data,new Uint32Array(indices),{...part.batch,uv:src.uv});
  gl.bindVertexArray(batch.vao);for(const [index,buffer]of [[7,part.batch.jointsBuffer],[8,part.batch.weightsBuffer]]){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,4,gl.FLOAT,false,0,0);}gl.bindVertexArray(null);
  return part.craneLegs=batch;
 }
 function draw(planes){if(!ready)return;
  if(sphereVisible(add(site.statue,[0,5,0]),14,planes)){craneAt(site.statue,.735,-2.35);box(add(site.statue,[0,.035,0]),[1.8,.07,1.8],steel);}
  if(!sphereVisible(add(site.tower,[0,6,0]),19,planes))return;
  craneAt(site.tower,1,s.yaw);
  model(building,transform([site.building[0]-4.19*.25,site.building[1],site.building[2]-9.576*.25],[.25,.25,.25]));
  const h=game.hook(),top=[h[0],site.boom,h[2]];
  box(top,[.45,.22,.45],gold);line(top,h,.035,steel);box(h,[.16,.20,.16],gold);
  line(add(h,[0,-.1,0]),add(h,[0,-.22,0]),.04,steel);line(add(h,[0,-.22,0]),add(h,[.1,-.22,0]),.04,steel);line(add(h,[.1,-.22,0]),add(h,[.1,-.14,0]),.04,steel);
  if(active){const overRoof=h[0]>site.building[0]-2.4&&h[0]<site.building[0]+2.55&&h[2]>site.building[2]-2.4&&h[2]<site.building[2]+2.8,y=overRoof?site.roof+.04:.035;
   box([h[0],y,h[2]],[.35,.025,.035],green);box([h[0],y,h[2]],[.035,.025,.35],green);
  }
  C.targets.forEach((t,i)=>{const col=s.bundles.some(b=>b.delivered&&b.slot===i)?green:[1,.72,.05,1];for(const dx of [-.39,.39])box([t[0]+dx,t[1]+.035,t[2]],[.035,.035,1.2],col);for(const dz of [-.6,.6])box([t[0],t[1]+.035,t[2]+dz],[.8,.035,.035],col);});
  s.bundles.forEach((b,i)=>{model(pipes,transform([b.p[0]+2.351*.16,b.p[1],b.p[2]+1.583*.16],[.16,.16,.16]));
   for(const z of [-.32,.32]){box([b.p[0],b.p[1]+.69,b.p[2]+z],[.7,.025,.035],gold);if(s.held===i)line([b.p[0],b.p[1]+.68,b.p[2]+z],h,.025,gold);}
  });
  for(const d of s.debris)box(d.p,[.10,.08,.12],[.55,.48,.37,1]);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  drawBatch(cube,mm(transform(site.tower,[1,1,1],0,s.yaw),transform(add(cabOrigin,[0,.02,.125]),[.56,.006,.465])),false,[.55,.8,.88,.08]);
  gl.depthMask(true);gl.disable(gl.BLEND);
 }
 function addCollider(name,lo,hi){const v=[];for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]])for(const x of [lo[0],hi[0]])v.push(x,y,z);
  registerCollider(name,'solidCollider',new Float32Array(v),new Uint32Array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]),false,{});baselineColliders.push(colliders.at(-1));
 }
 function prepareCollision(){
  obstacles=colliders.filter(c=>/^City_/.test(c.name)&&c.hi[1]>2&&Math.hypot((c.lo[0]+c.hi[0])/2-site.tower[0],(c.lo[2]+c.hi[2])/2-site.tower[2])<20).map(c=>({lo:c.lo,hi:c.hi,body:Matter.Bodies.rectangle((c.lo[0]+c.hi[0])/2,(c.lo[2]+c.hi[2])/2,Math.max(.01,c.hi[0]-c.lo[0]),Math.max(.01,c.hi[2]-c.lo[2]),{isStatic:true})}));
  addCollider('Crane39 indoor tower',[site.statue[0]-.9,0,site.statue[2]-.9],[site.statue[0]+.9,10.8,site.statue[2]+.9]);
  addCollider('Crane39 tower',[site.tower[0]-.8,0,site.tower[2]-.8],[site.tower[0]+.8,11,site.tower[2]+.8]);
  addCollider('Crane39 construction building',[site.building[0]-2.4,0,site.building[2]-2.4],[site.building[0]+2.55,3.36,site.building[2]+2.8]);
  refreshShipments();Crowd.invalidate();RobotExhibit20.invalidate();
 }
 function collision(st,h){
  const u=[Math.sin(st.yaw),Math.cos(st.yaw)];
  for(const o of obstacles){
   if(o.hi[1]>=site.boom&&Matter.Query.ray([o.body],{x:site.tower[0]-u[0]*5,y:site.tower[2]-u[1]*5},{x:site.tower[0]+u[0]*11.1,y:site.tower[2]+u[1]*11.1},.35).length)return [(o.lo[0]+o.hi[0])/2,site.boom,(o.lo[2]+o.hi[2])/2];
   if(h[1]-(st.held>=0?1:.1)<o.hi[1]&&h[0]>o.lo[0]-.4&&h[0]<o.hi[0]+.4&&h[2]>o.lo[2]-.5&&h[2]<o.hi[2]+.5)return [h[0],Math.min(h[1],o.hi[1]),h[2]];
  }
  if(st.held>=0&&h[1]-1<site.roof-.08&&h[0]>site.building[0]-2.6&&h[0]<site.building[0]+2.75&&h[2]>site.building[2]-2.6&&h[2]<site.building[2]+3)return h;
  return null;
 }
 function other(){return window.Forklift34?.snapshot().mounted||window.Farming36?.snapshot().mounted||window.Ambulance35?.snapshot().mounted||window.Robotics37?.active;}
 function near(){return ready&&!active&&!other()&&!state.overview&&Math.abs(player.position[1]-site.statue[1])<1.2&&(Math.hypot(player.position[0]-site.statue[0],player.position[2]-site.statue[2])<1.9||Math.hypot(player.position[0]-site.tower[0],player.position[2]-site.tower[2])<2.5);}
 function enter(){if(!near()||state.paused||HubGuide.snapshot().dialogOpen)return;active=true;saved={view:{radius:state.radius,pitch:state.pitch,orbitYaw:state.orbitYaw,firstPerson:state.firstPerson,overview:state.overview},position:[...player.position],yaw:player.yaw};keys.clear();state.firstPerson=false;state.overview=false;player.position=[site.tower[0],11.3,site.tower[2]];player.walkAmount=0;document.body.classList.add('crane39-active');panel.hidden=false;cameraView();}
 function exit(){if(!active)return;active=false;keys.clear();Object.assign(state,saved.view);player.position=saved.position;player.yaw=saved.yaw;panel.hidden=true;document.body.classList.remove('crane39-active');updateCamera(0,true);canvas.focus();}
 function cameraView(){if(!active)return false;state.firstPerson=viewMode==='cabin';const yaw=orbit+(state.firstPerson?s.yaw:0),dir=[Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation)];if(state.firstPerson){camera=cabPoint([0,.73,-.15]);target=add(camera,dir);}else{target=viewMode==='hook'?game.hook():[77,5,53];camera=add(target,mul(dir,zoom));}return true;}
 function visit(){if(!ready||active||other())return;places.crane39={label:'Construction: crane challenge',p:[site.statue[0]-1.2,floorHeightAt(site.statue[0],site.statue[2])+PHYSICS.radii[1]+.02,site.statue[2]-1.2],scaledPlayer:true,yaw:-2.35};teleport('crane39');state.radius=3.5;updateCamera(0,true);}
 function update(dt){if(!ready)return;prompt.hidden=!near()||state.paused;
  if(active&&!state.paused&&!HubGuide.snapshot().dialogOpen){const axis=(a,b)=>Number(keys.has(a))-Number(keys.has(b));game.tick(dt,{turn:axis('left','right'),hoist:axis('up','down'),trolley:axis('out','in')},collision);player.position=add(cabPoint([0,.395,-.25]),[0,PHYSICS.radii[1]-.38,0]);player.yaw=s.yaw+Math.PI;player.walkAmount=0;}
  if(active){panel.querySelector('[data-status]').textContent=s.message;panel.querySelector('[data-count]').textContent=`${s.delivered}/3 bundles delivered${s.points?' | +'+s.points+' points':''}`;panel.querySelector('[data-height]').textContent=`Hook ${s.hookY.toFixed(1)} m | Reach ${s.radius.toFixed(1)} m`;panel.querySelector('[data-action="attach"]').disabled=s.held>=0||s.phase==='complete';panel.querySelector('[data-action="release"]').disabled=s.held<0;}
 }
 function ui(){
  const style=document.createElement('style');style.textContent=`#cranePanel39{position:fixed;bottom:92px;right:14px;width:282px;box-sizing:border-box;max-height:calc(100dvh - 220px);overflow:auto;background:#152329f5;border:1px solid #6d818b;border-radius:6px;padding:12px;color:#fff;z-index:35;font:13px/1.35 system-ui}#cranePanel39 h2{font-size:17px;margin:0 0 8px}#cranePanel39 p{margin:7px 0}#cranePanel39 .crane-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}#cranePanel39 button{min-height:34px;font:inherit;padding:5px;border:1px solid #89959a;border-radius:3px;background:#294149;color:white;touch-action:none}#cranePanel39 button:active{background:#527480}#cranePrompt39{position:fixed;bottom:135px;left:50%;transform:translateX(-50%);background:#17323d;color:white;padding:14px;border:1px solid #edbb4c;border-radius:5px;z-index:20}#cranePanel39[hidden],#cranePrompt39[hidden]{display:none!important}body.crane39-active #forkliftPanel34,body.crane39-active #farmPanel36,body.crane39-active #ambulancePanel35,body.crane39-active #challengeEntryPrompt38{display:none!important}`;document.head.append(style);
  panel=document.createElement('section');panel.id='cranePanel39';panel.hidden=true;panel.setAttribute('aria-label','Crane controls');panel.innerHTML='<h2>Construction: crane lift</h2><strong data-count></strong><p data-height></p><div class="crane-grid"><button data-hold="left" title="Rotate left">&#8634; Rotate left</button><button data-hold="right" title="Rotate right">&#8635; Rotate right</button><button data-hold="up">&#8593; Hook up</button><button data-hold="down">&#8595; Hook down</button><button data-hold="in">&#8592; Trolley in</button><button data-hold="out">&#8594; Trolley out</button><button data-action="attach">Hook bundle</button><button data-action="release">Release load</button><button data-action="zoomIn" aria-label="Zoom in">+</button><button data-action="zoomOut" aria-label="Zoom out">−</button><button data-action="reset">Restart</button><button data-action="exit">Exit crane</button></div><p data-status role="status"></p>';document.body.append(panel);
  prompt=document.createElement('button');prompt.id='cranePrompt39';prompt.textContent='Press T - Crane challenge';prompt.hidden=true;prompt.onclick=enter;document.body.append(prompt);
  for(const b of panel.querySelectorAll('[data-hold]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.hold);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.hold);}
  const select=document.createElement('select');select.setAttribute('aria-label','Crane camera');select.innerHTML='<option value="overview">Crane overview</option><option value="hook">Follow hook</option><option value="cabin">First-person cabin</option>';select.style.cssText='width:100%;padding:8px;margin:6px 0';panel.prepend(select);select.onchange=()=>{viewMode=select.value;orbit=viewMode==='cabin'?0:-2.77;elevation=viewMode==='cabin'?-.65:.6;zoom=viewMode==='hook'?4:29;cameraView();select.blur();canvas.focus();};
  const changeZoom=f=>{if(viewMode==='cabin'){viewMode='hook';select.value=viewMode;zoom=4;}zoom=Math.max(.12,Math.min(100,zoom*f));};
  const actions={attach:game.attach,release:game.release,reset:()=>{keys.clear();game.reset();},exit,zoomIn:()=>changeZoom(.8),zoomOut:()=>changeZoom(1.25)};
  for(const b of panel.querySelectorAll('[data-action]'))b.onclick=()=>actions[b.dataset.action]();
  const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',KeyQ:'in',KeyE:'out'};
  window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable)return;if(!active){if(e.code==='KeyT'&&near()&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();enter();}return;}if(map[e.code]||['KeyT','Escape','KeyF','KeyR'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(map[e.code])keys.add(map[e.code]);else if(!e.repeat){if(e.code==='KeyF')game.attach();else if(e.code==='KeyR')game.release();else exit();}}},true);
  window.addEventListener('keyup',e=>{if(map[e.code])keys.delete(map[e.code]);},true);window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
  window.addEventListener('wheel',e=>{if(!active||panel.contains(e.target))return;e.preventDefault();e.stopImmediatePropagation();changeZoom(Math.exp(e.deltaY*.0015));},{capture:true,passive:false});
  window.addEventListener('pointerdown',e=>{if(!active||e.target!==canvas)return;e.preventDefault();e.stopImmediatePropagation();drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);},true);
  window.addEventListener('pointermove',e=>{if(!active||!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();orbit-=(e.clientX-drag.x)*.006;elevation=Math.max(-1.5,Math.min(1.5,elevation+(e.clientY-drag.y)*.006));drag.x=e.clientX;drag.y=e.clientY;cameraView();},true);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(name,()=>drag=null,true);
 }
 async function init(){try{ui();cube=createCube();crane=await load('./crane39/crane.glb',true);pipes=await load('./crane39/pipes.glb');building=await load('./crane39/building_construction.glb');site.statue[1]=floorHeightAt(site.statue[0],site.statue[2])+.01;prepareCollision();ready=true;if(new URLSearchParams(location.search).get('challenge')==='crane')visit();}catch(e){error=e.message;console.error('Crane challenge:',e);}}
 return {init,draw,update,enter,exit,visit,cameraView,seatedPose,firstPersonPart,hold:(direction,down)=>{if(active&&['in','out'].includes(direction))down?keys.add(direction):keys.delete(direction);},get cabinView(){return active&&viewMode==='cabin';},get active(){return active;},snapshot:()=>({ready,error,active,viewMode,zoom,orbit,elevation,...structuredClone(s),obstacles:obstacles.map(o=>({lo:o.lo,hi:o.hi}))}),test:{game,collision,site}};
})();
window.Crane39=Crane39;
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,walk=advancePlayer,view=updateCamera;
 RobotExhibit20.draw=function(planes){draw(planes);Crane39.draw(planes);};RobotExhibit20.update=function(dt){update(dt);Crane39.update(dt);};
 advancePlayer=function(dt,input){if(!Crane39.active)walk(dt,input);};updateCamera=function(dt,immediate=false){if(!Crane39.cameraView())view(dt,immediate);};
 const start=()=>{if(!state.ready){setTimeout(start,250);return;}Crane39.init();};start();
}
