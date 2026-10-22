/* Character-scale workstation exported from the completed PC workshop. */
window.PCChallenge66=(()=>{
 let workshopPromise,workshopResolve,workshopReject;
 function workshopMessage(visible){frame?.contentWindow?.postMessage({type:'pc66-visibility',visible},location.origin);}
 function preloadWorkshop(){
  if(workshopPromise)return workshopPromise;
  workshopPromise=new Promise((resolve,reject)=>{workshopResolve=resolve;workshopReject=reject;});
  overlay=document.createElement('div');overlay.id='pcWorkshop66';overlay.style.cssText='position:fixed;inset:0;z-index:100000;background:#f4f6f5;visibility:hidden';overlay.inert=true;
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Build your own gaming PC');overlay.setAttribute('aria-modal','true');
  frame=document.createElement('iframe');frame.title='Gaming PC hardware workshop';frame.src='./pc66/index.html?v=20261020-loading155&preload=1';frame.style.cssText='border:0;width:100%;height:100%;display:block';overlay.append(frame);document.body.append(overlay);
  return workshopPromise;
 }
 const C=[-19.65,.24,10.65];const deskBuilds=['aurora','sunset','gold','stealth','rose',null];const collection={};const showcaseKey='micq.pc-builder66.showcase.v1';let showcaseId=null,showcaseAngle=0,showcaseCollider=false,tower=[],towerId=null,heroLoading=false,gpu=[];let rewardUnlocked=false;function refreshReward(){try{const r=JSON.parse(localStorage.getItem('micq.pc-builder66.collection.v1'));rewardUnlocked=!!(r?.unlocked&&r.certificate?.completed&&r.certificate.phase==='complete');}catch{rewardUnlocked=false;}}refreshReward();window.addEventListener('storage',e=>{if(e.key==='micq.pc-builder66.collection.v1')refreshReward();});let ready=false,active=false,prompt,frame,overlay,savedPaused,arena,parts=[],gallery=[],furniture={},stationMatrices=[],loading=false,displayError=null,rotation=Math.PI/2,scale=.4,fanSpin=0;
 // The surrounding exhibit uses display-resolution assets; the workshop retains full detail.
 async function loadDisplay(){if(loading||(parts.length&&gallery.length&&Object.keys(furniture).length===3&&Object.keys(collection).length===11&&gpu.length))return;loading=true;try{if(!parts.length)parts=await DroneAssets44.load('peripherals87',{base:'./pc66/models/'});if(!gallery.length)gallery=await DroneAssets44.load('gallery88',{base:'./pc66/models/'});for(const variant of ['white','carbon','oak'])if(!furniture[variant])furniture[variant]=await DroneAssets44.load('furniture87-'+variant,{base:'./pc66/models/'});for(const d of arena.collectionDisplays)if(!collection[d.id])collection[d.id]=await DroneAssets44.load('display88-'+d.id,{base:'./pc66/models/'});if(!collection.original)collection.original=await DroneAssets44.load('display88-original',{base:'./pc66/models/'});if(!gpu.length)gpu=await DroneAssets44.load('display90-gpu',{base:'./pc66/models/'});displayError=null;}catch(e){displayError=e.message;console.error('PC exhibit',e);}finally{loading=false;}}
 // Only the selected reward keeps full workshop geometry and every fan pivot.
 async function loadShowcase(){
  if(heroLoading||!showcaseId||towerId===showcaseId)return;
  const id=showcaseId;heroLoading=true;
  try{
   const next=await DroneAssets44.load('showcase92-'+id,{base:'./pc66/models/'});
   if(id!==showcaseId){DroneAssets44.release(next);return;}
   for(const p of next)if(p.matrixFascia||p.textureGlow){p.batch.color=[1,1,1,1];p.batch.emission=[0,0,0];p.batch.unlit=true;if(p.matrixFascia)p.batch.baseTexture=arena.matrixLights.batch.baseTexture;}
   DroneAssets44.release(tower);tower=next;towerId=id;displayError=null;
  }catch(e){displayError=e.message;console.error('Your Build display',e);}finally{heroLoading=false;}
 }
 const baseEmission=new WeakMap();let glowClock=0,glowTick=-1;
 function animateGlow(dt){glowClock+=Math.min(dt,.05);if(glowClock-glowTick<.08)return;glowTick=glowClock;let i=0;for(const p of [...gallery,...gpu,...tower,...Object.values(collection).flat()]){if(!baseEmission.has(p.batch))baseEmission.set(p.batch,[...p.batch.emission]);const base=baseEmission.get(p.batch);if(!base.some(v=>v>0))continue;const pulse=1.35+.35*Math.sin(glowClock*1.8+i++*.42);p.batch.emission=base.map(v=>v*pulse);}}
 function restoreShowcase(){refreshReward();try{const id=JSON.parse(localStorage.getItem(showcaseKey))?.id;if(rewardUnlocked&&(id==='original'||arena.collectionDisplays.some(d=>d.id===id)))showcaseId=id;}catch{}if(showcaseId)addShowcaseCollider();}
 function addShowcaseCollider(){if(showcaseCollider)return;const mesh=new NetworkScene40.Mesh([1,1,1,1]);mesh.box([0,.83,0],[1.09,1.66,.91],mm(transform(C,[scale,scale,scale],0,rotation),transform(arena.showcasePosition,[1,1,1],0,arena.showcaseYaw)));const v=[];for(let i=0;i<mesh.v.length;i+=6)v.push(...mesh.v.slice(i,i+3));registerCollider('PC90 completed build showcase','solidCollider',new Float32Array(v),new Uint32Array(mesh.i),false,{});baselineColliders.push(colliders.at(-1));showcaseCollider=true;refreshShipments();Crowd.invalidate();}
 function displayBuild(id,returnToBooth=true){refreshReward();if(!rewardUnlocked||!(id==='original'||arena.collectionDisplays.some(d=>d.id===id)))return;showcaseId=id;try{localStorage.setItem(showcaseKey,JSON.stringify({id}));}catch{}addShowcaseCollider();loadShowcase();if(returnToBooth){exit();visit();toast('Your build is on display in the PC Arena!');}}
 function blocked(){return state.paused||state.overview||window.FarmScene63?.active||window.HubGuide?.snapshot().dialogOpen||window.Forklift34?.mounted||window.Ambulance35?.mounted||window.Farming36?.mounted||window.FarmVehicles53?.mounted||window.Robotics37?.active||window.Crane39?.active||window.MRI42?.active||window.Welding43?.active||window.Drone44?.mission;}
 function near(){if(!ready||active||blocked()||Math.abs(player.position[1]-C[1])>1.4)return false;const dx=player.position[0]-C[0],dz=player.position[2]-C[2],x=(Math.cos(rotation)*dx-Math.sin(rotation)*dz)/scale,z=(Math.sin(rotation)*dx+Math.cos(rotation)*dz)/scale;if(Math.abs(x)>5.8||z< -4.95||z>6.7)return false;if(Math.hypot(x,z-5.2)<1.5)return true;return arena.stations.some(s=>{const p=tp(transform(s.p,[1,1,1],0,s.yaw),0,0,1.7);return Math.hypot(x-p[0],z-p[2])<1.9;});}
 function enter(){if(!near())return;active=true;savedPaused=state.paused;state.paused=true;keys.clear();if(document.pointerLockElement)document.exitPointerLock();prompt.hidden=true;
  preloadWorkshop().then(()=>{if(active){workshopMessage(true);frame.contentWindow.focus();}});overlay.style.visibility='visible';overlay.inert=false;
 }
 function exit(){if(!active)return;workshopMessage(false);overlay.style.visibility='hidden';overlay.inert=true;active=false;state.paused=savedPaused;keys.clear();canvas.focus();updateCamera(0,true);}
 function visit(){if(!ready)return;if(active)exit();places.pc66={label:'IT: PC Arena',p:tp(transform(C,[scale,scale,scale],0,rotation),0,(PHYSICS.radii[1]+.02)/scale,5.55),scaledPlayer:true,yaw:rotation};teleport('pc66');state.radius=2.8;state.pitch=.20;updateCamera(0,true);update();}
 function init(){const S=NetworkScene40;C[1]=floorPaintHeight68(C[0],C[2],C[1],0);scale=PLAYER_SCALE*sectorScaleAt(C[0],C[2]);
  arena=PCArena84.create();stationMatrices=arena.stations.map(s=>transform(s.p,[1,1,1],0,s.yaw));
  const m=new S.Mesh([1,1,1,1]),matrix=transform(C,[scale,scale,scale],0,rotation);
  for(const box of arena.collisions)m.box(box.p,box.d,mm(matrix,box.matrix||IDENTITY));
  const cv=[];for(let i=0;i<m.v.length;i+=6)cv.push(...m.v.slice(i,i+3));registerCollider('PC66 esports arena furniture','solidCollider',new Float32Array(cv),new Uint32Array(m.i),false,{});baselineColliders.push(colliders.at(-1));refreshShipments();Crowd.invalidate();
  prompt=document.createElement('button');prompt.id='pcPrompt66';prompt.hidden=true;prompt.textContent='T · Build your own gaming PC';prompt.style.cssText='position:fixed;bottom:135px;left:50%;transform:translateX(-50%);z-index:70;max-width:calc(100vw - 24px);padding:12px 18px;background:#17443c;color:white;border:1px solid #9cdec7;border-radius:4px;font:14px system-ui';prompt.onclick=enter;document.body.append(prompt);const style=document.createElement('style');style.textContent='.countryside63 #pcPrompt66{display:none!important}';document.head.append(style);ready=true;restoreShowcase();
  if(new URLSearchParams(location.search).get('challenge')==='pc')visit();
 }
 function draw(planes){if(!ready||active||!sphereVisible(add(C,[0,.7,0]),4,planes))return;
  const root=transform(C,[scale,scale,scale],0,rotation),c=Math.cos(fanSpin),s=Math.sin(fanSpin),spin=[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1],poses=stationMatrices.map(m=>mm(root,m));gl.disable(gl.CULL_FACE);
  const showcasePose=mm(root,transform(arena.showcasePosition,[1,1,1],0,arena.showcaseYaw));
  for(const batch of arena.solid)drawBatch(batch,root);
  if(showcaseId){for(const batch of arena.showcaseSolid)drawBatch(batch,showcasePose);drawBatch(arena.showcaseLabel,mm(showcasePose,transform([0,.69,.436],[.83,.16,1])));}
  for(const label of arena.labels)drawBatch(label.screen.batch,mm(root,label.matrix));
  for(const transparent of [false,true]){if(transparent){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}
   for(const [variant,list]of Object.entries(furniture)){const indexes=variant==='carbon'?[0,1,2]:variant==='oak'?[3,4]:[5];DroneAssets44.instances(list.filter(p=>!!p.batch.transparent===transparent),indexes.map(i=>poses[i]));}
   for(const p of parts)if(!!p.batch.transparent===transparent){const part=p.name.startsWith('s83-fan-')?{...p,matrix:mm(p.matrix,spin)}:p;if(p.name==='arena-monitor-screen'){DroneAssets44.instances([{...part,batch:{...part.batch,baseTexture:arena.broadcast.batch.baseTexture,unlit:true}}],poses.slice(0,5));}else DroneAssets44.instances([part],poses.slice(0,5));}
   for(const [id,list]of Object.entries(collection)){const locations=[];if(id==='original')locations.push(poses[5]);else{for(const [i,choice]of deskBuilds.entries())if(choice===id)locations.push(mm(poses[i],transform([.64,.765,-.12],[.20,.20,.20])));const d=arena.collectionDisplays.find(d=>d.id===id);if(d)locations.push(mm(root,transform(d.p,[.18,.18,.18],0,d.yaw)));}for(const p of list)if(!!p.batch.transparent===transparent){const part=p.name.startsWith('s83-fan-')?{...p,matrix:mm(p.matrix,spin)}:p;DroneAssets44.instances([part],locations);}}
   const gpuPoses=arena.gpuDisplays.map(d=>mm(root,transform(d.p,[.20,.20,.20],0,d.yaw)));
   for(const p of gpu)if(!!p.batch.transparent===transparent)DroneAssets44.instances([{...p,matrix:p.name.startsWith('s83-fan-')?mm(p.matrix,spin):p.matrix}],gpuPoses);
   if(showcaseId){const model=towerId===showcaseId?tower:[],pose=mm(showcasePose,transform([0,.915,0],[.20,.20,.20],0,Math.PI/2));for(const p of model)if(!!p.batch.transparent===transparent)drawBatch(p.batch,mm(pose,p.name.startsWith('s83-fan-')?mm(p.matrix,spin):p.matrix));if(transparent)for(const batch of arena.showcaseGlass)drawBatch(batch,showcasePose);}
   if(!transparent){const display=mm(root,transform(arena.galleryPosition,[.85,.85,.85]));for(const p of gallery)drawBatch(p.batch,mm(display,p.name.startsWith('s83-fan-')?mm(p.matrix,spin):p.matrix));}
   else for(const batch of arena.glass)drawBatch(batch,root);
  }gl.depthMask(true);gl.disable(gl.BLEND);
 }
 function update(dt=0){if(!ready)return;prompt.hidden=!near();const label=rewardUnlocked?'T · Choose a PC and play':'T · Build your own gaming PC';if(prompt.textContent!==label)prompt.textContent=label;if(!window.FarmScene63?.active&&!state.paused&&!state.overview&&Math.hypot(player.position[0]-C[0],player.position[2]-C[2])<9){loadDisplay();loadShowcase();if(!active&&!document.hidden){animateGlow(dt);fanSpin+=Math.min(dt,.05)*12;arena.update(performance.now()/1000);}}}
 window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='t'&&!e.repeat&&near()&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)){e.preventDefault();e.stopImmediatePropagation();enter();}},true);
 window.addEventListener('message',e=>{if(e.source!==frame?.contentWindow||e.origin!==location.origin)return;if(e.data?.type==='pc66-ready')workshopResolve?.();if(e.data?.type==='pc66-error')workshopReject?.(Error(e.data.message));});
 window.addEventListener('message',e=>{if(!active||e.source!==frame?.contentWindow||e.origin!==new URL(frame.src,document.baseURI).origin)return;if(e.data?.type==='pc66-display')displayBuild(e.data.id);if(e.data?.type==='pc66-select'&&showcaseId)displayBuild(e.data.id,false);if(e.data?.type==='pc66-close')exit();if(e.data?.type==='pc66-complete'){if(!employerModeParams())MissionSystem.recordChallenge('pc');toast('Gaming PC build complete. Hardware checks passed.');}});
 return {preload:async()=>{await loadDisplay();await loadShowcase();},preloadWorkshop,init,enter,exit,visit,draw,update,get active(){return active;},snapshot:()=>({ready,active,near:near(),position:C,displayReady:parts.length>0&&Object.keys(furniture).length===3&&!!collection.original,displayError,rotation,scale,fanSpin,model:'showcase90',sideWall:arena?.sideWall,showcaseId,showcaseAngle,showcaseCollider,showcasePCScale:.20,showcaseReady:!!showcaseId&&towerId===showcaseId,showcasePosition:arena?.showcasePosition,showcaseYaw:arena?.showcaseYaw,showcaseFans:new Set(tower.filter(p=>p.name.startsWith('s83-fan-')).map(p=>p.name)).size,showcaseMatrix:tower.filter(p=>p.matrixFascia).length,gpuReady:gpu.length>0,gpuCount:arena?.gpuDisplays.length,benchYaw:arena?.benchYaw,glowClock,animatedParts:[...gallery,...Object.values(collection).flat()].filter(p=>p.name.startsWith('s83-fan-')).length,collectionReady:Object.keys(collection).length===11,collectionBuilds:Object.keys(collection),deskBuilds,furnitureVariants:Object.keys(furniture),stations:arena?.stations.length,zones:arena?.zones,bounds:arena?.bounds,stationPositions:arena?.stations.map(s=>tp(transform(C,[scale,scale,scale],0,rotation),...s.p)),galleryReady:gallery.length>0,deskHeight:.765*scale,pcHeight:2.96*.20*scale,parts:parts.length,transparent:[...parts,...Object.values(collection).flat()].filter(p=>p.batch.transparent).length,illuminated:[...parts,...Object.values(collection).flat()].filter(p=>p.batch.emission.some(v=>v>0)).length})};
})();
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,renderVenue=render,walk=advancePlayer;
 RobotExhibit20.draw=function(planes){draw(planes);PCChallenge66.draw(planes);};RobotExhibit20.update=function(dt){update(dt);PCChallenge66.update(dt);};
 render=function(...args){if(!PCChallenge66.active)return renderVenue(...args);};advancePlayer=function(...args){if(!PCChallenge66.active)return walk(...args);};
 // Scene geometry is ready before the asynchronous shipping baseline is captured.
 const start=()=>{if(!state.ready||!Array.isArray(baselineColliders)){setTimeout(start,250);return;}PCChallenge66.init();};start();
}
