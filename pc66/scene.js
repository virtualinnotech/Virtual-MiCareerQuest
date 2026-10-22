import {awardDisplay} from './award-display.js?v=20261009-showcase92';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {panelReflections} from './glass.js?v=20261007-board73';
import {showcase,layout} from './showcase.js?v=20261009-collection86';
import {glowRenderer} from './glow-renderer.js?v=20261009-detail78';
import {gamingDesktop} from './desktop.js?v=20261009-collection86';
import {prebuilt} from './prebuilt.js?v=20261009-collection86';

export async function workshop(container,onTarget,options={}){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x080a0d);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;container.append(renderer.domElement);
 const effects=glowRenderer(renderer),hardware=showcase();let collection=null,collectionId='original';
 function choosePC(id){if(id===collectionId)return;collection?.root.removeFromParent();collection?.dispose();collection=id==='original'?null:prebuilt(id);collectionId=id;if(collection)scene.add(collection.root);desktop.setBuild(collection?.spec);if(currentState)setView(currentState,currentStep,reference);}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.01,100),controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.minDistance=.55;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.88;
 scene.add(new THREE.HemisphereLight(0xffffff,0x556075,.5));const sun=new THREE.DirectionalLight(0xfff8f2,1.7);sun.position.set(-4,7,5);scene.add(sun);const fill=new THREE.DirectionalLight(0xc2d5ff,.9);fill.position.set(3,3,-4);scene.add(fill);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=sun.shadow.camera.bottom=-3;sun.shadow.camera.right=sun.shadow.camera.top=3;sun.shadow.camera.near=.1;sun.shadow.camera.far=20;sun.shadow.normalBias=.008;sun.shadow.bias=-.0001;sun.target.position.set(0,1.5,0);scene.add(sun.target);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x15191e,roughness:1,metalness:0}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
 const grid=new THREE.GridHelper(10,40,0x444e58,0x343b43);grid.position.y=-.016;scene.add(grid);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,15,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.5,3.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.010;scene.add(shadow);
 const loader=new GLTFLoader(),groups={},goals={},centers={};
 function group(id){if(!groups[id]){groups[id]=new THREE.Group();groups[id].name=id;scene.add(groups[id]);}return groups[id];}
 const glassEnvironment=panelReflections();scene.environment=glassEnvironment;
 hardware.enclosure(group('case'),group('panel'),group('shroud'));hardware.cooler(group('cooler'),group('topFans'));
 for(const [i,z]of layout.fanZ.entries())hardware.fan(group('frontFans'),[0,layout.bottomY,z],[0x21eecc,0x3ebeff,0xb254ff][i]);
 hardware.fan(group('rearFan'),layout.rear,0x8258ff,'z');
 for(const [i,z]of layout.fanZ.entries())hardware.fan(group('topFans'),[0,layout.topY,z],[0x48d9ff,0xbd59ff,0xff51b4][i],'down');
 hardware.gpu(group('gpu'));hardware.memory(group('ramA'),-.1596,0x42d9ff);hardware.memory(group('ramB'),-.0607,0xfb62c4);
 hardware.powerSupply(group('psu'));
 const rotors=hardware.rotors;
 const fanPreview=new THREE.Group();fanPreview.name='fans';scene.add(fanPreview);groups.fans=fanPreview;fanPreview.add(group('frontFans').children[0].clone(true));
 function fit(object,size){const outer=new THREE.Group(),box=new THREE.Box3().setFromObject(object),c=box.getCenter(new THREE.Vector3()),dim=box.getSize(new THREE.Vector3());object.position.sub(c);outer.add(object);outer.scale.setScalar(size/Math.max(dim.x,dim.y,dim.z));return outer;}
 const processor=(await loader.loadAsync('./models/cpu-socket.glb')).scene,cpuMeshes=[],socketMeshes=[];processor.updateMatrixWorld(true);processor.traverse(o=>{if(o.isMesh)(o.name.includes('LOD3')?cpuMeshes:socketMeshes).push(o);});
 for(const [id,meshes,size,x]of [['socket',socketMeshes,.32,.413]]){const inner=new THREE.Group();for(const o of meshes)inner.attach(o);const fitted=fit(inner,size);fitted.rotation.z=Math.PI/2;fitted.position.set(x,2.02,-.465);group(id).add(fitted);}
 hardware.cpu(group('cpu'));
 const drive=fit((await loader.loadAsync('./models/hard-drive.glb')).scene,.68);drive.position.set(-.06,.35,.55);group('drive').add(drive);
 const paste=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.008,20),new THREE.MeshStandardMaterial({color:0xaaaaa4}));paste.rotation.z=Math.PI/2;paste.position.set(.308,2.02,-.465);group('paste').add(paste);
 function box(id,p,d,color){const o=new THREE.Mesh(new THREE.BoxGeometry(...d),new THREE.MeshStandardMaterial({color,roughness:.6}));o.position.set(...p);group(id).add(o);return o;}
 const driveBox=new THREE.Box3().setFromObject(drive),driveSize=driveBox.getSize(new THREE.Vector3()),driveCenter=driveBox.getCenter(new THREE.Vector3());
 box('drive',[driveCenter.x,driveBox.max.y+.005,driveCenter.z],[driveSize.x,.012,driveSize.z],0xaeb8b7);
 box('drive',[driveCenter.x,driveBox.max.y+.013,driveCenter.z],[driveSize.x*.68,.003,driveSize.z*.62],0xe3e6db);
 // Sockets and alignment marks remain visible with the cooler removed.
 function marker(id,x,y,z){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([x,y,z,x,y-.023,z,x,y,z+.023],3));geo.computeVertexNormals();group(id).add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xe6b948,side:THREE.DoubleSide})));}
 marker('socket',.385,2.145,-.595);marker('cpu',.336,2.135,-.58);
 hardware.motherboard(group('board'));group('slots');
 const endpoints={tray:[.43,1.75,-.44],panel:[-.54,1.35,0],socket:[.30,2.02,-.465],A2:[.31,2.1,-.157],B2:[.31,2.1,-.06],psuBay:[-.10,.38,-.60],driveBay:[-.17,.27,.56],PCIE_X16_1:[.25,1.56,-.45],ATX_24:[.395,1.85,.12],EPS_8:[.395,2.42,-.82],GPU_8:[-.02,1.64,-.12],SATA_DATA:[.37,1.28,.12],SATA_POWER:[-.18,.27,.69],CPU_FAN:[.395,2.41,-.34],CHA_FAN:[.395,1.38,-.91],PWR_SW:[.39,1.20,.07],USB_HEADER:[.39,1.34,-.21],AAFP:[.39,1.21,-.84],FRONT_FANS:[0,1.39,1.01],REAR_FAN:[0,2.10,-1.01],TOP_FANS:[0,2.34,.22],PUMP_POWER:[.105,1.0,-.82],USB_2:[.39,1.20,-.08],bench:[0,0,0]};
 for(const key of ['ATX_24','EPS_8','SATA_DATA','CPU_FAN','CHA_FAN','PWR_SW','USB_HEADER','USB_2','AAFP'])box('ports',endpoints[key],[.07,key==='ATX_24'?.15:.035,.035],key==='PWR_SW'?0xdeb943:0x273334);
 box('cooler',[.37,1.03,-.70],[.112,.16,.22],0x273334);
 endpoints.PUMP_POWER=[.30,1.03,-.70];
 endpoints.BOTTOM_FANS=[0,layout.bottomY,0];endpoints.REAR_FAN=layout.rear;endpoints.TOP_FANS=[0,layout.topY,0];endpoints.GPU_8=[-.268,1.71,.18];endpoints.panel=[-.615,1.59,0];
 box('cooler',[.49,1.03,-.70],[.16,.18,.24],0x414f5b);
 const cables={},cableMap={atx:'ATX_24',eps:'EPS_8',pcie:'GPU_8','sata-data':'SATA_DATA','sata-power':'SATA_POWER','cpu-fan':'CPU_FAN','case-fans':'CHA_FAN','front-panel':'PWR_SW','front-usb':'USB_HEADER','front-audio':'AAFP','pump-power':'PUMP_POWER','pump-usb':'USB_2'};
 const routes={atx:[[.53,1.85,.30],[.20,1.85,.34],[.14,1.85,.23]],eps:[[.53,2.49,-.82],[.28,2.54,-.82],[.25,2.46,-.82]],pcie:[[.48,.62,.94],[-.43,.71,.94],[-.49,1.12,.87],[-.49,1.79,.78],[-.46,1.79,.42],[-.30,1.79,.18],[-.268,1.77,.18]],'sata-data':[[-.12,.27,.62],[.49,.70,.69],[.49,1.16,.24],[.27,1.20,.20]],'sata-power':[[-.02,.45,-.62],[.02,.32,-.17],[.10,.28,.48]],'cpu-fan':[[.28,2.12,-.5],[.34,2.36,-.50],[.34,2.43,-.40]],'case-fans':[[0,.81,-.72],[.3,.91,-.96],[.34,1.30,-.96]],'front-panel':[[.2,.27,1.18],[.48,.80,.88],[.45,1.07,.24]],'front-usb':[[.12,.27,1.18],[.45,.82,.88],[.42,1.09,-.19]],'front-audio':[[-.05,.27,1.18],[.43,.84,.88],[.43,1.07,-.82]],'pump-power':[[-.02,.45,-.62],[.31,.71,-.70],[.31,.92,-.70]],'pump-usb':[[.30,1.03,-.70],[.27,1.08,-.52],[.29,1.08,-.10]]};
 for(const [id,key]of Object.entries(cableMap)){const cable=hardware.cable([...routes[id],endpoints[key]],id==='atx'?12:id==='eps'||id==='pcie'?8:3,id==='atx'?'y':'z');scene.add(cable);cables[id]=cable;}
 for(const [id,g]of Object.entries(groups)){const c=new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());for(const child of g.children)child.position.sub(c);g.position.copy(c);centers[id]=c;goals[id]=c.clone();}
 const flow=new THREE.Group();flow.name='Fan airflow';scene.add(flow);const flowSets={};
 function arrow(id,p,d,color,length=.38){const helper=new THREE.ArrowHelper(new THREE.Vector3(...d),new THREE.Vector3(...p),length,color,.10,.06);flow.add(helper);(flowSets[id]||=[]).push(helper);}
 for(const z of layout.fanZ)arrow('frontFans',[0,.85,z],[0,1,0],0x29b4e5,.30);
 arrow('rearFan',[-.16,2.19,-1.24],[0,0,-1],0xfa9754);
 for(const z of layout.fanZ)arrow('topFans',[0,2.96,z],[0,1,0],0xfa9754);
 const award=awardDisplay(scene,camera,controls,groups,cables,()=>collection?.root);
 const desktop=gamingDesktop(scene,hardware);desktop.root.visible=desktop.cables.visible=false;
 scene.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(!m.isMeshPhysicalMaterial)m.envMapIntensity=.22;});
 scene.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&!o.material.transparent&&!o.material.userData.rgb){o.receiveShadow=true;let moving=false;for(let a=o.parent;a;a=a.parent)if(a.name==='Animated fan blades')moving=true;o.castShadow=!moving&&o!==floor&&o!==shadow;}});
 let mode='learn',selected='case',reference=false,targets=[],lastView='',frame=0,active=true,suspended=!!options.suspended,currentState=null,currentStep=null,hideGlass=false,showFlow=false,rgbOn=true;
 const rgbLights=[new THREE.PointLight(0x45ccff,0,2.5,2),new THREE.PointLight(0xe862c8,0,2.5,2)];rgbLights[0].position.set(-.22,2.40,-.50);rgbLights[1].position.set(-.20,1.04,.45);scene.add(...rgbLights);
 function powered(){return reference&&mode!=='boot'||mode==='learn'||mode==='complete'||mode==='boot'&&currentState?.boot>=2;}
 function lighting(){hardware.update(performance.now()/1000,powered(),rgbOn);for(const light of rgbLights)light.intensity=powered()&&rgbOn?.26:0;}
 function viewer(value){
  if(value.rotation!==undefined)controls.autoRotate=value.rotation;
  if(value.glass!==undefined)hideGlass=!value.glass;
  if(value.airflow!==undefined)showFlow=value.airflow;
  if(value.rgb!==undefined)rgbOn=value.rgb;
  if(currentState)setView(currentState,currentStep,reference);
 }
 const targetLayer=document.getElementById('targets'),nameLabel=document.getElementById('part-name'),pins=[];
 function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);effects.resize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 function home(){if(mode==='boot'||mode==='complete'){controls.target.set(-2.2,1.35,-.1);controls.maxDistance=40;camera.position.copy(controls.target).add(new THREE.Vector3(-5.8,2.7,7.0).multiplyScalar(Math.max(1,1.35/camera.aspect)));}else{const c=controls.target.clone();camera.position.copy(c).add(new THREE.Vector3(-4.9,.60,3.3).multiplyScalar(Math.max(1,.65/camera.aspect)*(container.clientHeight<420?1.12:1.08)));controls.maxDistance=10;}controls.update();}
 function focusMonitor(){controls.autoRotate=false;controls.target.copy(desktop.monitorCenter());camera.position.copy(controls.target).addScaledVector(desktop.normal(),Math.max(3.9,7.6/camera.aspect));camera.position.y+=.07;controls.update();}
 function focus(id,overview=false){const g=groups[id],c=overview||id==='case'?new THREE.Vector3(0,1.58,0):new THREE.Vector3(0,1.1,0);controls.target.copy(c);home();if(!overview&&id!=='case'){const size=new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).length(),distance=Math.max(.7,size*1.9)*Math.max(1,.7/camera.aspect);camera.position.copy(c).add((id==='board'?new THREE.Vector3(-1,.20,.28):new THREE.Vector3(-1,.32,.5)).normalize().multiplyScalar(distance));controls.update();}}
 function setView(s,step,ref=false){award.close();currentState=s;currentStep=step;mode=s.phase;reference=ref;selected=s.phase==='learn'?s.lessonPart:step?.part;const installed=new Set(s.installed),full=ref||s.phase==='boot'||s.phase==='complete';
  shadowUpdateAt=performance.now()+550;
  lighting();
  for(const [id,g]of Object.entries(groups)){
   g.rotation.set(0,0,0);goals[id].copy(centers[id]);
   const partId=id==='slots'||id==='ports'||id==='socket'?'board':id;
   g.visible=full||id==='case'||installed.has(partId);
   if(id==='fans')g.visible=false;
   if(id==='shroud')g.visible=full;
   if(id==='panel')g.visible=ref||s.phase==='complete'||s.phase==='boot'&&s.boot>=1||(s.phase==='build'&&!installed.has('panel'));
   if(id==='paste')g.visible=!full&&installed.has('paste')&&!installed.has('cooler');
   if(s.phase==='learn'&&!ref){g.visible=selected==='case'?id!=='paste'&&id!=='fans':id===selected||(selected==='ramA'&&id==='ramB')||(selected==='board'&&['socket','slots','ports'].includes(id));if(g.visible&&selected!=='case')goals[id].sub(centers[selected]).add(new THREE.Vector3(0,1.1,0));}
   if(s.phase==='build'&&!ref&&id===step?.part&&step.kind==='place'&&!installed.has(step.id)){g.visible=true;goals[id].add(new THREE.Vector3(-1.25,.15,.1));g.rotation.x=s.orientation*Math.PI/2;}
  }
  for(const [id,c]of Object.entries(cables))c.visible=(full||installed.has(id)||mode==='learn'&&selected==='case')&&!(mode==='learn'&&selected!=='case'&&!ref);
  if(collection){collection.root.visible=s.phase==='complete';if(collection.root.visible){for(const g of Object.values(groups))g.visible=false;for(const c of Object.values(cables))c.visible=false;}collection.update(0,rgbOn,!hideGlass);}
  if(hideGlass&&!(s.phase==='build'&&step?.id==='panel'))groups.panel.visible=false;
  for(const [id,arrows]of Object.entries(flowSets))for(const helper of arrows)helper.visible=showFlow&&(groups[id].visible||collection?.root.visible);
  desktop.update(s,performance.now()/1000,powered());grid.visible=s.phase!=='boot'&&s.phase!=='complete';
  const key=s.phase==='boot'||s.phase==='complete'?'desktop':s.phase==='learn'&&!ref?selected:'assembly';if(key!==lastView){lastView=key;for(const [id,g]of Object.entries(groups))g.position.copy(goals[id]);if(key==='desktop')home();else focus(selected||'case',key==='assembly'||selected==='case');}
  nameLabel.textContent=ref?'Assembled reference':mode==='learn'?'Hardware inspection':mode==='build'?(step?.orientation!=null?'Alignment: '+s.orientation*90+' degrees':'Assembly workbench'):'Completed build';
  rebuildTargets(s,step);
 }
 function coordinates(step){
  if(step.kind==='fasten'){
   if(step.target==='tray'||step.target==='boardScrew')return Array.from({length:9},(_,i)=>[.408,1.30+Math.floor(i/3)*.52,-.94+(i%3)*.49]);
   if(step.target==='coolerMount')return [[.30,1.84,-.66],[.30,2.20,-.66],[.30,1.84,-.27],[.30,2.20,-.27]];
   if(step.target==='coolerScrew')return [[.23,1.92,-.56],[.23,2.12,-.56],[.23,1.92,-.37],[.23,2.12,-.37]];
   if(step.target==='psuScrew')return [[-.37,.20,-1.10],[.34,.20,-1.10],[-.37,.67,-1.10],[.34,.67,-1.10]];
   return [[-.10,1.53,-1.09],[.17,1.53,-1.09]];
  }
  return [endpoints[step.target]||[.1,1.7,0]];
 }
 function rebuildTargets(s,step){targetLayer.replaceChildren();pins.length=0;targets=[];if(s.phase==='boot'&&s.boot===1){addPin([-.20,.275,1.255],'power',0,'Power',false);return;}if(s.phase!=='build'||!step||step.kind==='instruction'||reference)return;
  const points=coordinates(step);points.forEach((p,i)=>addPin(p,step.target,i,points.length>1?String(i+1):step.target,s.fasteners.includes(i),false,points.length>1));
 }
 function addPin(p,target,index,label,done,wrong=false,numbered=false){const button=document.createElement('button');button.className='target'+(done?' done':'')+(wrong?' wrong':'')+(!numbered&&!done?' single-target':'');button.title=target+(numbered?' '+(index+1):'');button.setAttribute('aria-label',numbered?target+' mounting point '+(index+1):target);button.dataset.target=target;button.dataset.index=index;button.textContent=done?'✓':numbered?String(index+1):'';if(label.length>2){const span=document.createElement('span');span.textContent=label==='panel'?'Side panel':label;button.append(span);}button.onclick=()=>onTarget(target,index);button.ondragover=e=>e.preventDefault();button.ondrop=e=>{e.preventDefault();onTarget(target,index);};targetLayer.append(button);pins.push({button,point:new THREE.Vector3(...p)});targets.push({target,index,point:p});}
 const ray=new THREE.Raycaster();let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const rect=container.getBoundingClientRect();if(desktop.root.visible){ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);const hit=ray.intersectObject(desktop.screen)[0];if(hit){const action=desktop.click(hit.uv);if(action)onTarget(typeof action==='string'?action:'monitor',action);return;}}if(mode!=='build'&&mode!=='boot')return;let closest=null,distance=38;for(const pin of pins){const p=pin.point.clone().project(camera),x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2,d=Math.hypot(e.clientX-x,e.clientY-y);if(d<distance){closest=pin;distance=d;}}closest?.button.click();});
 let lastTime=performance.now(),shadowUpdateAt=lastTime+550;renderer.info.autoReset=false;
 function animate(now=performance.now()){if(!active||suspended){frame=0;return;}frame=requestAnimationFrame(animate);const delta=Math.min((now-lastTime)/1000,.05);lastTime=now;if(document.hidden)return;controls.update();if(powered())for(const rotor of rotors)rotor.rotation.z=(rotor.rotation.z+delta*12)%(Math.PI*2);hardware.update(now/1000,powered(),rgbOn);if(collection?.root.visible)collection.update(delta,rgbOn,!hideGlass);if(currentState)desktop.update(currentState,now/1000,powered());award.update(delta);for(const [id,g]of Object.entries(groups))g.position.lerp(goals[id],.16);if(shadowUpdateAt&&now>=shadowUpdateAt){renderer.shadowMap.needsUpdate=true;shadowUpdateAt=0;}for(const pin of pins){const p=pin.point.clone().project(camera);pin.button.style.left=(p.x+1)*container.clientWidth/2+'px';pin.button.style.top=(1-p.y)*container.clientHeight/2+'px';pin.button.style.visibility=p.z>-1&&p.z<1&&Math.abs(p.x)<.93&&Math.abs(p.y)<.85?'visible':'hidden';}renderer.info.reset();effects.render(scene,camera);}
 function suspend(value){suspended=value;if(value){cancelAnimationFrame(frame);frame=0;}else if(!frame){lastTime=performance.now();animate();}}
 const all=[];scene.traverse(o=>{if(o.isMesh)all.push(o);});home();await renderer.compileAsync(scene,camera);effects.render(scene,camera);animate();
 return {award,setView,choosePC,get collection(){return collection;},viewer,home,focusMonitor,desktop,cables,suspend,zoom:factor=>{camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();},snapshot:()=>({suspended,selectedPC:collectionId,meshes:all.length,visible:Object.entries(groups).filter(([,g])=>g.visible).map(([id])=>id),targets,frame,camera:camera.position.toArray(),powered:powered(),desktop:desktop.snapshot(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,viewer:{rotation:!!controls.autoRotate,glass:!hideGlass,airflow:showFlow,rgb:rgbOn}}),renderer,scene,groups,camera,controls,dispose(){active=false;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();effects.dispose();desktop.dispose();scene.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){m.map?.dispose();m.dispose();}});glassEnvironment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
