import * as THREE from 'three';
import {turboExhaust} from './turbo-exhaust.js?v=20261009-station83';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {glowRenderer} from './glow-renderer.js';
import {downtown,COURSE_LENGTH} from './race-world.js?v=20261009-station83';

let preloaded;
export function preloadTestTrack(){
 THREE.Cache.enabled=true;
 return preloaded??=Promise.all([
  ...['./models/race/ferrari.glb','./models/race/venice_sunset_1k.hdr','./vendor/draco/draco_decoder.wasm'].map(url=>new THREE.FileLoader().setResponseType('arraybuffer').loadAsync(url)),
  new THREE.FileLoader().loadAsync('./vendor/draco/draco_wasm_wrapper.js')
 ]);
}

export function testTrack(canvas,panel,onExit=()=>{},options={}){
 const M=window.Matter,held=new Set(),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(58,1,.12,320);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:!!options.embedded,powerPreference:'high-performance'});
 renderer.setPixelRatio(options.embedded?1:Math.min(devicePixelRatio,1.4));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.info.autoReset=false;const glow=glowRenderer(renderer);
 scene.background=new THREE.Color(0x07111e);scene.fog=new THREE.Fog(0x091421,65,210);
 scene.add(new THREE.HemisphereLight(0x96bbef,0x152030,.7));const sun=new THREE.DirectionalLight(0x9dbff3,.65);sun.position.set(-35,50,-70);scene.add(sun);
 const city=downtown(scene),engine=M.Engine.create({gravity:{x:0,y:0}}),body=M.Bodies.rectangle(0,0,1.85,4.2,{frictionAir:0,restitution:.05,inertia:Infinity});
 M.Composite.add(engine.world,[body,M.Bodies.rectangle(-8.1,-600,.3,1600,{isStatic:true}),M.Bodies.rectangle(8.1,-600,.3,1600,{isStatic:true})]);
 let phase='loading',last=performance.now(),elapsed=0,countdown=0,speed=0,steering=0,frame=0,stopped=false,player=null,exhaust=null,env=null,pmrem=null,audio=null,qualityClock=0,qualityFrames=0,slowWindows=0,contextLost=false,wrongWay=false,collisions=0,turbo=false;
 const rainPositions=new Float32Array(1000*6),rainSeed=[];
 for(let i=0;i<1000;i++)rainSeed.push({x:Math.random()*56-28,y:Math.random()*26,z:Math.random()*60-35});
 const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3).setUsage(THREE.DynamicDrawUsage));
 const rain=new THREE.LineSegments(rainGeometry,new THREE.LineBasicMaterial({color:0xb5d8ef,transparent:true,opacity:.4,depthWrite:false}));rain.frustumCulled=false;rain.name='Falling rain';scene.add(rain);
 const cars=[],rivals=[],decoder=new DRACOLoader().setDecoderPath('./vendor/draco/'),loader=new GLTFLoader().setDRACOLoader(decoder),disposable=new Set();
 panel.innerHTML=`<div class="race-top"><div class="race-brand"><small>AFTER RAIN</small><strong>DOWNTOWN SPRINT</strong></div><div class="race-distance"><span>0.70 MI</span><progress max="${COURSE_LENGTH}" value="0" aria-label="Race distance"></progress></div><div class="race-tools"><button data-action="sound" title="Mute engine" aria-label="Mute engine"><img src="icons/volume-2.svg" alt=""></button><button data-action="leave" title="Return to your PC" aria-label="Return to your PC"><img src="icons/x.svg" alt=""></button></div></div><div class="race-start"><span class="race-loading" role="status">Preparing downtown...</span><button class="race-ready" hidden>Ready!</button></div><div class="race-signal" hidden role="status" aria-live="polite"><div class="signal-lights"><i></i><i></i><i></i></div></div><div class="race-result" hidden><small>FINISH LINE</small><h2>Race complete</h2><p></p><div><button data-action="again">Race again</button><button data-action="return">Back to PC</button></div></div><div class="race-bottom"><div class="race-position"><strong>01</strong><span>/ 03</span><small>POSITION</small></div><div class="race-touch"><button data-key="a" aria-label="Steer left" title="Steer left"><img src="icons/arrow-right.svg" alt="" style="transform:rotate(180deg)"></button><button data-key="s" aria-label="Brake" title="Brake"><span class="brake-square" aria-hidden="true"></span></button><button data-key="d" aria-label="Steer right" title="Steer right"><img src="icons/arrow-right.svg" alt=""></button></div><div class="race-speed"><strong>000</strong><span>MPH</span><small>00:00.00</small></div></div>`;
 panel.querySelector('.race-touch').insertAdjacentHTML('beforeend','<button data-key="w" aria-label="Accelerate (hold W)" title="Accelerate (hold W)"><img src="icons/arrow-right.svg" alt="" style="transform:rotate(-90deg)"></button>');
 panel.querySelector('.race-touch').insertAdjacentHTML('beforeend','<button data-key="turbo" aria-label="Turbo (hold Space)" title="Turbo (hold Space)" aria-pressed="false"><img src="icons/zap.svg" alt=""></button>');
 const ui=s=>panel.querySelector(s),start=ui('.race-start'),ready=ui('.race-ready'),signal=ui('.race-signal'),result=ui('.race-result'),status=ui('.race-loading');
 function makeCar(template,color,x,z){
  const model=template.clone(true),root=new THREE.Group();root.add(model);scene.add(root);root.position.set(x,.02,z);
  const paint=new THREE.MeshPhysicalMaterial({color,metalness:.65,roughness:.25,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.25});disposable.add(paint);
  const glass=new THREE.MeshPhysicalMaterial({color:0x142c3b,metalness:.12,roughness:.14,clearcoat:1,clearcoatRoughness:.1});disposable.add(glass);
  model.traverse(n=>{if(!n.isMesh)return;n.frustumCulled=true;if(n.name==='body')n.material=paint;if(n.name==='glass')n.material=glass;if(n.name==='lights_red'){n.material=n.material.clone();n.material.color.set(0xc61a12);n.material.emissive.set(0xff2214);n.material.emissiveIntensity=3;disposable.add(n.material);}if(n.name==='leds'){n.material=n.material.clone();n.material.emissive.set(0xc1edff);n.material.emissiveIntensity=3;disposable.add(n.material);}});
  model.traverse(n=>{if(/^(interior_light|interior_dark|carpet|leather|steering_)/.test(n.name))n.visible=false;});
  const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d'),grad=q.createRadialGradient(64,64,15,64,64,64);grad.addColorStop(0,'rgba(0,0,0,.8)');grad.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=grad;q.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);disposable.add(t);const m=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});disposable.add(m);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.5,6),m);shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;root.add(shadow);
  const wheels=['wheel_fl','wheel_fr','wheel_rl','wheel_rr'].map(n=>model.getObjectByName(n)).filter(Boolean),steerPivots=[];
  for(const wheel of wheels.slice(0,2)){const pivot=new THREE.Group();pivot.position.copy(wheel.position);wheel.parent.add(pivot);pivot.add(wheel);wheel.position.set(0,0,0);steerPivots.push(pivot);}
  const car={root,model,wheels,steerPivots};cars.push(car);return car;
 }
 async function load(){
  try{
   const [gltf,hdr]=await Promise.all([loader.loadAsync('./models/race/ferrari.glb'),new HDRLoader().loadAsync('./models/race/venice_sunset_1k.hdr')]);
   if(stopped){hdr.dispose();gltf.scene.traverse(n=>{n.geometry?.dispose();if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>m.dispose());});return;}
   hdr.mapping=THREE.EquirectangularReflectionMapping;pmrem=new THREE.PMREMGenerator(renderer);env=pmrem.fromEquirectangular(hdr);scene.environment=env.texture;scene.environmentIntensity=.32;disposable.add(hdr);
   player=makeCar(gltf.scene,0x157ec5,0,0);exhaust=turboExhaust(player.root);
   for(const x of [-.67,.67]){const lamp=new THREE.SpotLight(0xc6e8ff,65,38,.42,.65,1.4);lamp.position.set(x,.65,-1.8);lamp.target.position.set(x,.1,-20);player.root.add(lamp,lamp.target);}
   for(const [i,color]of [0xee5835,0xe9d9bd].entries()){const car=makeCar(gltf.scene,color,i===0?-3.8:3.8,-6-i*7),rigid=M.Bodies.rectangle(car.root.position.x,car.root.position.z,1.85,4.2,{isStatic:true});M.Composite.add(engine.world,rigid);rivals.push({...car,body:rigid,baseX:car.root.position.x,distance:6+i*7,pace:27+i*.7});}
   phase='ready';status.hidden=true;ready.hidden=false;ready.focus();
  }catch(error){if(stopped)return;phase='error';status.textContent='The race could not load. Return to your PC and try again.';console.error('Downtown race:',error);}
 }
 function sound(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const context=new C(),gain=context.createGain(),osc=context.createOscillator(),filter=context.createBiquadFilter();osc.type='sawtooth';filter.type='lowpass';filter.frequency.value=360;gain.gain.value=.022;osc.connect(filter);filter.connect(gain);gain.connect(context.destination);osc.start();audio={context,gain,osc,muted:false};context.resume().catch(()=>{});}catch{}}
 function reset(){elapsed=0;speed=0;steering=0;countdown=0;wrongWay=false;collisions=0;held.clear();turbo=false;M.Body.setPosition(body,{x:0,y:0});M.Body.setVelocity(body,{x:0,y:0});M.Body.setAngle(body,0);M.Body.setAngularVelocity(body,0);camera.position.set(-5.2,2.5,7.1);if(player){player.root.rotation.y=0;player.model.rotation.z=0;for(const pivot of player.steerPivots)pivot.rotation.y=0;}for(const [i,r]of rivals.entries()){r.distance=6+i*7;M.Body.setPosition(r.body,{x:r.baseX,y:-r.distance});r.root.position.set(r.baseX,.02,-r.distance);}result.hidden=true;signal.hidden=true;start.hidden=false;ready.hidden=false;phase='ready';ready.focus();}
 ready.onclick=()=>{if(phase!=='ready')return;start.hidden=true;phase='countdown';countdown=0;signal.hidden=false;if(!audio)sound();};
 ui('[data-action="again"]').onclick=reset;ui('[data-action="leave"]').onclick=ui('[data-action="return"]').onclick=onExit;
 ui('[data-action="sound"]').onclick=()=>{if(!audio)sound();if(!audio)return;audio.muted=!audio.muted;const label=audio.muted?'Unmute engine':'Mute engine';ui('[data-action="sound"]').setAttribute('aria-label',label);ui('[data-action="sound"]').title=label;ui('[data-action="sound"]').setAttribute('aria-pressed',String(audio.muted));};
 let screenReady=null;
 if(options.embedded){for(const [label,icon,action]of [['Ready!','play',()=>ready.click()],['Mute engine','volume-2',()=>ui('[data-action="sound"]').click()],['End test drive','x',onExit]]){const b=document.createElement('button');b.className='monitor-command';b.title=label;b.setAttribute('aria-label',label);const image=document.createElement('img');image.src=`icons/${icon}.svg`;image.alt='';b.append(image);b.onclick=()=>{action();if(icon==='volume-2'){b.title=audio?.muted?'Unmute engine':'Mute engine';b.setAttribute('aria-label',b.title);}};ui('.race-touch').append(b);if(icon==='play')screenReady=b;}}
 for(const b of panel.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();held.add(b.dataset.key);b.setPointerCapture(e.pointerId);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>held.delete(b.dataset.key);}
 const key=e=>({ArrowLeft:'a',ArrowRight:'d',ArrowDown:'s',ArrowUp:'w',' ':'turbo'}[e.key]||e.key.toLowerCase());
 const down=e=>{if(e.key==='Enter'&&phase==='ready'){e.preventDefault();ready.click();return;}if(['a','d','s','w','turbo'].includes(key(e))){e.preventDefault();held.add(key(e));}},up=e=>held.delete(key(e)),blur=()=>{held.clear();if(audio)audio.gain.gain.value=0;};
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',blur);
 const loss=e=>{e.preventDefault();contextLost=true;blur();status.textContent='Graphics paused. Return to your PC and retry.';status.hidden=false;start.hidden=false;ready.hidden=true;};canvas.addEventListener('webglcontextlost',loss);
 M.Events.on(engine,'collisionStart',()=>{if(phase==='racing'){speed*=.24;collisions++;}});
 function finish(){phase='finished';held.clear();result.hidden=false;const place=1+rivals.filter(r=>r.distance>-body.position.y).length;ui('.race-result h2').textContent=place===1?'First across the line':'Race complete';ui('.race-result p').textContent=`${place} / 3  ·  ${elapsed.toFixed(2)} seconds`;ui('[data-action="again"]').focus();}
 let w=0,h=0;function resize(){const width=options.embedded?1728:Math.max(1,canvas.clientWidth),height=options.embedded?720:Math.max(1,canvas.clientHeight);if(width===w&&height===h)return;w=width;h=height;renderer.setSize(w,h,false);glow.resize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);const desired=new THREE.Vector3(),look=new THREE.Vector3(),previousPosition=new THREE.Vector3();
 function loop(now){if(stopped)return;frame=requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden||contextLost)return;resize();
  if(phase==='countdown'){countdown+=dt;const n=countdown<1?0:countdown<2?1:2;signal.dataset.light=String(n);signal.setAttribute('aria-label',['Red light','Yellow light','Green light'][n]);if(countdown>=2.8){phase='racing';elapsed=0;}}
  if(phase==='racing'){
   elapsed+=dt;if(elapsed>.7)signal.hidden=true;const braking=held.has('s'),accelerating=held.has('w');turbo=held.has('turbo')&&accelerating&&!braking;speed=THREE.MathUtils.damp(speed,braking?0:accelerating?(turbo?120:36):0,braking?4:turbo?1.35:accelerating?.65:1.1,dt);if(speed<.02)speed=0;
   const steer=(held.has('d')?1:0)-(held.has('a')?1:0),maxSteering=THREE.MathUtils.lerp(.58,.24,Math.min(Math.abs(speed)/32,1))*Math.min(1,36/Math.max(36,Math.abs(speed)));steering=THREE.MathUtils.damp(steering,steer*maxSteering,7,dt);
   const steps=Math.max(1,Math.ceil(dt/Math.min(1/90,.35/Math.max(1,Math.abs(speed))))),sub=dt/steps;
   for(let i=0;i<steps;i++){M.Body.setAngle(body,body.angle+speed/2.65*Math.tan(steering)*sub);M.Body.setAngularVelocity(body,0);M.Body.setVelocity(body,{x:Math.sin(body.angle)*speed/60,y:-Math.cos(body.angle)*speed/60});M.Engine.update(engine,sub*1000);}
   for(const [i,r]of rivals.entries()){r.distance+=r.pace*Math.min(elapsed/3,1)*dt;const x=r.baseX+Math.sin(elapsed*.38+i)*.5;M.Body.setPosition(r.body,{x,y:-r.distance});r.root.position.set(x,.02,-r.distance);}
   wrongWay=Math.cos(body.angle)<-.25&&Math.abs(speed)>2;
   if(-body.position.y>=COURSE_LENGTH&&Math.cos(body.angle)>0)finish();if(player){player.model.rotation.z=THREE.MathUtils.damp(player.model.rotation.z,-steer*.025,5,dt);player.root.rotation.y=-body.angle;for(const pivot of player.steerPivots)pivot.rotation.y=-steering;}
  }else {turbo=false;if(phase==='finished')speed=THREE.MathUtils.damp(speed,0,2,dt);}
  if(player){player.root.position.x=body.position.x;player.root.position.z=body.position.y;player.root.position.y=.022+Math.sin(elapsed*18)*.003*speed/32;for(const car of cars)for(const wheel of car.wheels)wheel.rotation.x-=speed*dt/.34;}
  const z=body.position.y,heading=body.angle,dx=Math.sin(heading),dz=-Math.cos(heading);if(phase==='ready'||phase==='loading'){desired.set(-5.2,w<h?3.3:2.5,z+(w<h?10.5:7.1));look.set(0,.9,z-1.1);}else{const distance=w<h?8:5.8;desired.set(body.position.x-dx*distance,2.15,z-dz*distance);look.set(body.position.x+dx*10,.8,z+dz*10);}
  // Carry the chase camera with the car before damping its relative offset.
  if(phase==='racing'||phase==='finished')camera.position.add(new THREE.Vector3(body.position.x,0,z).sub(previousPosition));previousPosition.set(body.position.x,0,z);
  camera.position.lerp(desired,phase==='loading'?1:1-Math.exp(-dt*6));camera.lookAt(look);camera.fov=THREE.MathUtils.damp(camera.fov,(w<h?67:57)+Math.min(Math.abs(speed)*.16,22),3,dt);camera.updateProjectionMatrix();city.update(z,body.position.x,heading);
  for(let i=0;i<rainSeed.length;i++){const drop=rainSeed[i];drop.y-=dt*22;if(drop.y<0)drop.y+=26;const n=i*6;rainPositions[n]=body.position.x+drop.x;rainPositions[n+1]=drop.y;rainPositions[n+2]=z+drop.z;rainPositions[n+3]=rainPositions[n]-.09;rainPositions[n+4]=drop.y+.75;rainPositions[n+5]=rainPositions[n+2]+.06;}rainGeometry.attributes.position.needsUpdate=true;
  if(audio){audio.osc.frequency.setTargetAtTime(42+speed*3.1,audio.context.currentTime,.08);audio.gain.gain.setTargetAtTime(audio.muted||phase==='ready'||phase==='finished'?0:.018,audio.context.currentTime,.1);}
  ui('.race-speed strong').textContent=String(Math.round(Math.abs(speed)*2.236936)).padStart(3,'0');ui('.race-speed small').textContent=`00:${elapsed.toFixed(2).padStart(5,'0')}`;ui('.race-position strong').textContent=String(1+rivals.filter(r=>r.distance>-z).length).padStart(2,'0');ui('.race-distance progress').value=Math.min(COURSE_LENGTH,-z);
  ui('[data-key="turbo"]').setAttribute('aria-pressed',String(turbo));
  exhaust?.update(now/1000,turbo&&phase==='racing');
  renderer.info.reset();glow.render(scene,camera);
  if(screenReady)screenReady.hidden=phase!=='ready';
  options.onFrame?.(canvas,{phase,countdown,elapsed,speed:Math.abs(speed),position:1+rivals.filter(r=>r.distance>-z).length,wrongWay,turbo});
  qualityClock+=dt;qualityFrames++;if(qualityFrames>=90){if(qualityClock/qualityFrames>.027)slowWindows++;else slowWindows=0;if(slowWindows>=2&&renderer.getPixelRatio()>.8){renderer.setPixelRatio(Math.max(.8,renderer.getPixelRatio()-.2));w=0;city.road.getRenderTarget().setSize(512,320);slowWindows=0;}qualityClock=0;qualityFrames=0;}
 }
 load();frame=requestAnimationFrame(loop);
 return {screenClick(x,y){if(phase==='ready'&&x>490&&x<790&&y>507&&y<594)ready.click();if(phase==='finished'&&y>400&&y<476){if(x>355&&x<625)reset();if(x>655&&x<925)onExit();}},reset,snapshot:()=>({phase,elapsed,speed,turbo,exhaust:exhaust?.snapshot(),chaseDistance:Math.hypot(camera.position.x-body.position.x,camera.position.z-body.position.y),mph:Math.abs(speed)*2.236936,distance:-body.position.y,x:body.position.x,heading:body.angle,steering,wrongWay,collisions,rain:rainSeed.length,night:true,cars:cars.length,wheels:cars.reduce((n,c)=>n+c.wheels.length,0),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,pixelRatio:renderer.getPixelRatio(),reflection:city.road.getRenderTarget().width}),dispose(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);observer.disconnect();decoder.dispose();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',blur);canvas.removeEventListener('webglcontextlost',loss);audio?.context.close().catch(()=>{});M.Events.off(engine);M.Composite.clear(engine.world,false);M.Engine.clear(engine);city.dispose();glow.dispose();env?.dispose();pmrem?.dispose();const geometries=new Set(),mats=new Set();scene.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>mats.add(m));});geometries.forEach(g=>g.dispose());mats.forEach(m=>{for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();});disposable.forEach(x=>x.dispose());renderer.dispose();panel.replaceChildren();}};
}
