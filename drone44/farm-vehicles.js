/* Farm-only utility driving and persistent crop damage, using shared Matter physics. */
function createFarmVehicle53(options={}){
 const truck=!!options.parts,spawn=options.spawn||{x:-28.65,z:49.25,yaw:Math.PI,speed:0},width=options.width||.67,length=options.length||1.28,wheelbase=options.wheelbase||.95,track=options.track||.56;
 const car={...spawn},held=new Set(),Y=truck?.141:.16;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const driverSeat=options.driverSeat||[.15,.43,-.08],steeringCenter=options.steeringCenter||[.1344,.5108,.1118],wheelRadius=options.wheelRadius||.155;
 let steering=0,wheelRoll=0;
 let health=100,impacts=0,debrisMesh,breakdown;
 const debris=[];
 function impact(hit){if(!mounted||health<=0)return;health=Math.max(0,health-Math.min(38,Math.max(3,Math.round(hit.speed*6))));impacts++;
  for(let i=0;i<Math.min(18,5+Math.round(hit.speed*2));i++){const angle=Math.random()*Math.PI*2,force=.5+Math.random()*hit.speed*.5;debris.push({x:hit.x,y:Y+.5,z:hit.z,vx:Math.cos(angle)*force,vy:1+Math.random()*2,vz:Math.sin(angle)*force,life:1.2+Math.random(),size:.035+Math.random()*.045,spin:Math.random()*6,color:i%3?[.16,.19,.17,1]:[.7,.74,.75,1]});}if(debris.length>80)debris.splice(0,debris.length-80);
  if(!health){held.clear();keys.clear();physics.stop();car.speed=0;breakdown.hidden=false;}
 }
 function recover(){if(mounted)exit(true);health=100;impacts=0;debris.length=0;breakdown.hidden=true;Object.assign(car,spawn);physics.reset(car.x,car.z,car.yaw);setParkedCollider();player.position=[car.x,Y+PHYSICS.radii[1]+.02,car.z-1.1];player.vy=0;player.grounded=true;updateCamera(0,true);canvas.focus();}
 function parkAtGarage(){if(!ready)return false;if(mounted)exit(true);health=100;impacts=0;debris.length=0;breakdown.hidden=true;steering=0;held.clear();Object.assign(car,spawn);physics.reset(car.x,car.z,car.yaw);setParkedCollider();return true;}
 const around=(p,rotation)=>mm(transform(p),mm(rotation,transform(p.map(v=>-v))));
 function steeringMatrix(){const angle=steering*.9,axis=norm([0,.66,-.75]);return around(steeringCenter,trs({rotation:[...axis.map(v=>v*Math.sin(angle/2)),Math.cos(angle/2)]}));}
 function frontAngle(left){const angle=steering*.65;if(Math.abs(angle)<.001)return 0;const radius=wheelbase/Math.tan(Math.abs(angle)),inner=(steering>0)===left;return Math.sign(angle)*Math.atan(wheelbase/(radius+(inner?-track/2:track/2)));}
 function partMatrix(p){
  if(p.name.startsWith('DriverDoor_'))return around([.30,.45,.23],transform([0,0,0],[1,1,1],0,-door*1.12));
  if(p.name.startsWith('SteeringWheel_'))return steeringMatrix();
  const wheel=/^Wheel_([FR])([LR])_/.exec(p.name);if(!wheel)return IDENTITY;
  const front=wheel[1]==='F',left=wheel[2]==='L',pivot=options.wheels?.[wheel[1]+wheel[2]]||[left?.279:-.279,.1584,front?.4516:-.4784];
  return around(pivot,transform([0,0,0],[1,1,1],wheelRoll,front?frontAngle(left):0));
 }
 let ready=false,error=null,parts,physics,mounted=false,transition=0,leaving=false,door=0,saved,warningUntil=0,time=0,prompt,warning,controls,parkedCollider;
 const parked=[];
 const local=(x,y,z)=>tp(transform([car.x,Y,car.z],[1,1,1],0,car.yaw),x,y,z);
 const busy=()=>window.FarmTruck67?.mounted||(truck&&FarmVehicles53.mounted)||Farming36.mounted||Ambulance35.mounted||Forklift34.mounted||Drone44.active||Crane39.active||Welding43.active||MRI42.active;
 const near=()=>window.FarmScene63?.active&&ready&&!busy()&&!state.paused&&!state.overview&&!HubGuide.snapshot().dialogOpen&&Math.hypot(player.position[0]-car.x,player.position[2]-car.z)<(truck?1.9:1.35);
 const rectangle=(name,x,z,w,d)=>({name,minY:.14,maxY:2,points:[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]]});
 function initPhysics(){
  const shapes=FarmBoundary48.collisions.filter(c=>!(c.x===-46&&c.z===34.1)).map(c=>rectangle('Farm fence',c.x,c.z,c.width,c.depth));
  // The UTV fits the central aisle; solid bays keep it away from horses.
  for(const z of [32.55,35.65])shapes.push(rectangle('Horse stalls',-46,z,10,1.5));
  for(const x of [-51,-41])for(const z of [32.45,35.75])shapes.push(rectangle('Barn doorway',x,z,.15,1.9));
  const b=FarmBoundary48.bounds;
  for(const x of [b.left,b.right])shapes.push(rectangle('Farm limit',x,(b.north+b.south)/2,.2,b.south-b.north));
  for(const z of [b.north,b.south])shapes.push(rectangle('Farm limit',(b.left+b.right)/2,z,b.right-b.left,.2));
  for(const silo of Farming36.test.silos)if(silo.x!=null&&silo.z!=null)shapes.push({name:'Grain silo',x:silo.x,z:silo.z,radius:1.2,minY:.14,maxY:5});
  for(let row=0;row<5;row++)for(let k=0;k<4;k++)for(const side of [-1,1])shapes.push(rectangle('Irrigation tower',-116+k*14,-19+row*12+side*1.55,.35,.8));
  for(const p of DroneCore44.pumps)shapes.push(rectangle('Pump control',p.x,p.z,.18,.18));
  for(const [x,z] of FarmBoundary48.treePositions)shapes.push({name:'Tree trunk',x,z,radius:.1,minY:.14,maxY:2});
  if(options.obstacles)for(const c of options.obstacles)shapes.push(rectangle(c.name,c.x,c.z,c.width,c.depth));
  physics=AmbulancePhysics35.create(shapes,impact, {width,length,height:options.height||.86,maxSpeed:truck?5:4.5,reverseSpeed:2,steerAngle:.65,wheelbase,lateralGrip:25});physics.reset(car.x,car.z,car.yaw);debrisMesh=createCube();
  if(truck){const body=Matter.Bodies.rectangle(0,0,.67*100,1.28*100,{isStatic:true,label:'Parked UTV'});Matter.Composite.add(physics.engine.world,body);parked.push({body,controller:FarmVehicles53});}
  for(const [name,width,length] of [['tractor',1.05,2.3],['combine',3.2,3.7]]){const body=Matter.Bodies.rectangle(0,0,width*100,length*100,{isStatic:true,label:'Parked '+name});Matter.Composite.add(physics.engine.world,body);parked.push({body,name});}
 }
 function setParkedCollider(){
  if(parkedCollider){baselineColliders=baselineColliders.filter(c=>c!==parkedCollider);const i=colliders.indexOf(parkedCollider);if(i>=0)colliders.splice(i,1);parkedCollider=null;}
  if(!mounted){const m=new NetworkScene40.Mesh([1,1,1,1]);m.box([0,(options.height||.82)/2,0],[width,options.height||.82,length]);const v=[],root=transform([car.x,Y,car.z],[1,1,1],0,car.yaw);for(let i=0;i<m.v.length;i+=6)v.push(...tp(root,...m.v.slice(i,i+3)));registerCollider(truck?'Farm67 parked GMC':'UTV53 parked','solidCollider',new Float32Array(v),new Uint32Array(m.i),false,{});parkedCollider=colliders.at(-1);baselineColliders.push(parkedCollider);}refreshShipments();
 }
 function enter(){if(mounted||!near())return;if(!health){breakdown.hidden=false;return;}saved={radius:state.radius,pitch:state.pitch,orbitYaw:state.orbitYaw,firstPerson:state.firstPerson,ghost:state.ghost};mounted=true;transition=truck?.35:1.8;leaving=false;held.clear();keys.clear();setParkedCollider();Object.assign(state,{firstPerson:false,ghost:false,radius:truck?3.2:2.2,pitch:.3});seat();canvas.focus();}
 function exit(immediate=false){if(!mounted)return;held.clear();keys.clear();physics.stop();car.speed=0;if(!immediate){if(transition)return;transition=truck?.35:1.8;leaving=true;return;}mounted=false;breakdown.hidden=prompt.hidden=controls.hidden=warning.hidden=true;document.body.classList.remove('utv-driving');transition=0;door=0;const b=FarmBoundary48.bounds,choices=[local(width/2+.35,0,0),local(-width/2-.35,0,0),local(0,0,-length/2-.3)];const p=choices.find(p=>p[0]>b.left+.5&&p[0]<b.right-.5&&p[2]>b.north+.5&&p[2]<b.south-.5)||choices[0];player.position=[p[0],Y+PHYSICS.radii[1]+.02,p[2]];player.vy=0;player.grounded=true;Object.assign(state,saved);setParkedCollider();updateCamera(0,true);}
 function seat(a=characterState.player,hip=null){const p=local(...driverSeat);let offset=[0,.4,0];if(a){const m=a.model;if(!a.utvBindHip){const world=[];for(const i of m.order)world[i]=mm(world[m.parents.get(i)]||IDENTITY,trs(m.j.nodes[i]));a.utvBindHip=world[m.skins[0].joints[0]].slice(12,15);}const s=m.scale*sectorScaleAt(car.x,car.z),h=a.utvBindHip;offset=tp(mm(transform([0,0,0],[s,s,s],0,car.yaw),transform(m.offset)),h[0],hip?.[13]??h[1],h[2]);}player.position=[p[0]-offset[0],p[1]-offset[1]+PHYSICS.radii[1],p[2]-offset[2]];player.yaw=car.yaw+Math.PI;player.walkAmount=0;player.vy=0;player.grounded=true;}
 function pose(a){if(!mounted||!a.player)return;const qmul=([x,y,z,w],[a,b,c,d])=>[w*a+x*d+y*c-z*b,w*b-x*c+y*d+z*a,w*c+x*b-y*a+z*d,w*d-x*a-y*b-z*c],m=a.model;for(let i=0;i<m.j.nodes.length;i++){const n=m.j.nodes[i],name=n.name||'',angle=/upleg|thigh/i.test(name)?(m.seatedLegSign||1)*Math.PI/2:/(?:left|right)leg|calf/i.test(name)?-(m.seatedLegSign||1)*Math.PI/2:/ForeArm/.test(name)?-.7:null;if(angle===null)continue;delete a.pose[i].matrix;a.pose[i].rotation=qmul(n.rotation||[0,0,0,1],[Math.sin(angle/2),0,0,Math.cos(angle/2)]);}
  // Reuse the venue's two-joint arm solver so hands stay on the steering wheel.
  const world=[],rebuild=()=>{for(const i of m.order)world[i]=mm(world[m.parents.get(i)]||IDENTITY,trs(a.pose[i]));};rebuild();const hip=world[m.skins[0].joints[0]];seat(a,hip);const inverse=CharacterFitting.invert4(actorMatrix(a)),correction=[hip[12]-a.utvBindHip[0],0,hip[14]-a.utvBindHip[2]];a.utvGripTargets=[];
  for(const [side,dx] of [['Left',.085],['Right',-.085]]){const find=part=>m.j.nodes.findIndex(n=>(n.name||'').split(':').pop()===side+part),upper=find('Arm'),elbow=find('ForeArm'),palm=find('HandMiddle1'),hand=palm>=0?palm:find('Hand');if(Math.min(upper,elbow,hand)<0)continue;const grip=local(...tp(steeringMatrix(),steeringCenter[0]+dx,steeringCenter[1],steeringCenter[2]));a.utvGripTargets.push({side,hand,point:grip});const goal=add(tp(inverse,...grip),correction);for(let iteration=0;iteration<18;iteration++)for(const joint of [elbow,upper]){const pi=CharacterFitting.invert4(world[m.parents.get(joint)]||IDENTITY),origin=tp(pi,...world[joint].slice(12,15)),from=norm(sub(tp(pi,...world[hand].slice(12,15)),origin)),to=norm(sub(tp(pi,...goal),origin)),w=1+clamp(dot(from,to),-1,1);if(w<1e-6)continue;delete a.pose[joint].matrix;a.pose[joint].rotation=qmul(norm([...cross(from,to),w]),a.pose[joint].rotation);rebuild();}}
 }
 function view(){if(!mounted)return false;target=local(0,truck?.65:.55,0);const yaw=car.yaw+Math.PI+(state.orbitYaw||0),r=state.radius*Math.max(1,.85/(canvas.clientWidth/canvas.clientHeight));camera=add(target,[Math.sin(yaw)*Math.cos(state.pitch)*r,Math.sin(state.pitch)*r,Math.cos(yaw)*Math.cos(state.pitch)*r]);return true;}
 function damage(v,width,length){if(Math.abs(v.speed)<.04)return;const a=Drone44.damage(v.x,v.z,v.yaw,width,length),b=Farming36.test.crop.damage(v.x,v.z,v.yaw,width,length);if(a+b)warningUntil=time+7;}
 function update(dt){if(!ready)return;if(window.FarmScene63&&!FarmScene63.active){prompt.hidden=controls.hidden=warning.hidden=true;document.body.classList.remove('utv-driving');return;}dt=Math.min(dt,.08);time+=dt;prompt.hidden=mounted||!near();controls.hidden=!mounted;document.body.classList.toggle('utv-driving',mounted);
  if(!state.paused&&!document.hidden){
   for(let i=debris.length-1;i>=0;i--){const p=debris[i];p.life-=dt;if(p.life<=0){debris.splice(i,1);continue;}p.vy-=7*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.spin+=dt*9;if(p.y<Y+p.size/2){p.y=Y+p.size/2;p.vy=Math.abs(p.vy)*.28;p.vx*=.7;p.vz*=.7;}}
   for(const p of parked){const v=p.controller?p.controller.snapshot():Farming36.test.vehicles[p.name];Matter.Body.setPosition(p.body,{x:v.x*100,y:v.z*100});Matter.Body.setAngle(p.body,-v.yaw);}
   if(mounted){if(transition){transition=Math.max(0,transition-dt);door=truck?0:Math.sin((1-transition/1.8)*Math.PI);if(!transition&&leaving){exit(true);return;}}
    else if(health>0){const has=k=>held.has(k)||keys.has(k),input=(has('a')||has('arrowleft')?1:0)-(has('d')||has('arrowright')?1:0),before={x:car.x,z:car.z};steering+=(input-steering)*(1-Math.exp(-dt*12));Object.assign(car,physics.step(dt,{throttle:(has('w')||has('arrowup')?1:0)-(has('s')||has('arrowdown')?1:0),steer:steering,brake:has(' ')},Y));if(!health){physics.stop();car.speed=0;}wheelRoll+=((car.x-before.x)*Math.sin(car.yaw)+(car.z-before.z)*Math.cos(car.yaw))/wheelRadius;
     // Enforce the complete footprint even at open pedestrian farm entrances.
     const b=FarmBoundary48.bounds,ex=Math.abs(Math.cos(car.yaw))*width/2+Math.abs(Math.sin(car.yaw))*length/2,ez=Math.abs(Math.sin(car.yaw))*width/2+Math.abs(Math.cos(car.yaw))*length/2,x=clamp(car.x,b.left+.15+ex,b.right-.15-ex),z=clamp(car.z,b.north+.15+ez,b.south-.15-ez);if(x!==car.x||z!==car.z){const normalSpeed=Math.abs(car.speed*(x!==car.x?Math.sin(car.yaw):Math.cos(car.yaw)));if(normalSpeed>.65)impact({speed:normalSpeed,x:car.x,z:car.z,name:'Farm fence'});car.x=x;car.z=z;car.speed=0;physics.reset(x,z,car.yaw);toast(truck?'The GMC stays on the farm.':'The UTV stays on the farm.');}damage(car,width,length);
    }if(mounted)seat();
   }
   if(!truck&&Farming36.mounted){const s=Farming36.snapshot(),v=s.vehicles[s.vehicle];damage(v,s.vehicle==='tractor'?1.02:1.65,1.7);}
  }else if(mounted){physics.stop();car.speed=0;held.clear();}
  warning.hidden=time>warningUntil||warningUntil===0;
 }
 function draw(planes){if(!window.FarmScene63?.active||!ready)return;for(const p of debris)drawBatch(debrisMesh,transform([p.x,p.y,p.z],[p.size,p.size*.35,p.size*.7],p.spin,p.spin*.7),false,p.color);if(!sphereVisible([car.x,.6,car.z],(truck?2:1.4),planes))return;const root=transform([car.x,Y,car.z],[1,1,1],0,car.yaw);for(const transparent of [false,true]){if(transparent){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}for(const p of parts){if((p.batch.color[3]<.4)!==transparent)continue;if(transparent)p.batch.alphaCutoff=-1;drawBatch(p.batch,mm(root,mm(partMatrix(p),p.matrix)));}}gl.depthMask(true);gl.disable(gl.BLEND);}
 function visit(){if(!ready)return;const place=truck?'truck67':'utv53',p=truck?local(width/2+.35,0,0):[car.x,Y,car.z-1.2];places[place]={label:truck?'Farm GMC':'Farm UTV',scene:'farm',p:[p[0],.14+PHYSICS.radii[1]+.02,p[2]],scaledPlayer:true,yaw:Math.PI};teleport(place);state.radius=truck?3:2.4;state.pitch=.2;updateCamera(0,true);}
 async function init(){try{parts=options.parts||await DroneAssets44.load('utv');initPhysics();setParkedCollider();
  const css=document.createElement('style');css.textContent=`#utvPrompt53,#cropWarning53,#utvControls53{position:fixed;left:50%;transform:translateX(-50%);z-index:70;box-sizing:border-box;border:1px solid #a9caba;background:#18352eef;color:white;border-radius:6px;padding:10px 14px;font:13px/1.4 system-ui;max-width:calc(100vw - 24px)}#utvPrompt53{bottom:150px}#cropWarning53{bottom:145px;width:560px;background:#382d18ef;border-color:#dbb865;text-align:center}#utvControls53{bottom:100px;display:flex;gap:6px;padding:5px}#utvControls53 button{width:34px;height:34px;padding:0;border:1px solid #719887;background:#294a3b;color:white;border-radius:50%;touch-action:none}#utvPrompt53[hidden],#cropWarning53[hidden],#utvControls53[hidden]{display:none}body.utv-driving #cameraBtn{display:none!important}`;if(truck)css.textContent=css.textContent.replaceAll('53','67')+'#utvBreakdown67{position:fixed;inset:30% 20%;z-index:90;background:#18352eef;color:white;padding:24px;border-radius:6px}#utvBreakdown67[hidden]{display:none}';document.head.append(css);
  prompt=document.createElement('button');prompt.id='utvPrompt'+(truck?'67':'53');prompt.textContent=truck?'T · Drive farm GMC':'T · Drive farm UTV';prompt.onclick=enter;prompt.hidden=true;document.body.append(prompt);
  breakdown=document.createElement('section');breakdown.id='utvBreakdown'+(truck?'67':'56');breakdown.hidden=true;breakdown.innerHTML='<h2>UTV broken down</h2><p>Too many impacts damaged the UTV. Recover it to the garage to continue. Your irrigation mission will be saved.</p><button>Recover to garage</button>';if(truck)breakdown.innerHTML=breakdown.innerHTML.replaceAll('UTV','GMC truck');breakdown.querySelector('button').onclick=recover;document.body.append(breakdown);
  warning=document.createElement('div');warning.id='cropWarning'+(truck?'67':'53');warning.setAttribute('role','status');warning.textContent='Damaging crops will affect your yield. Keep vehicles on designated paths to gain the highest crop yields.';warning.hidden=true;document.body.append(warning);
  controls=document.createElement('div');controls.id='utvControls'+(truck?'67':'53');controls.hidden=true;for(const [key,label,symbol] of [['w','Forward','↑'],['s','Reverse','↓'],['a','Steer left','←'],['d','Steer right','→'],[' ','Brake','■'],['exit','Exit UTV','×']]){const b=document.createElement('button');b.textContent=symbol;b.title=truck&&key==='exit'?'Exit GMC truck':label;b.setAttribute('aria-label',b.title);if(key==='exit')b.onclick=()=>exit();else{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.add(key);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>held.delete(key);}controls.append(b);}document.body.append(controls);
  window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||state.paused)return;const k=e.key.toLowerCase();if(k==='t'&&(mounted||near())){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)(mounted?exit:enter)();}else if(mounted&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','escape'].includes(k)){e.preventDefault();e.stopImmediatePropagation();if(k==='escape')exit();else held.add(k);}},{capture:true});window.addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{held.clear();if(mounted){physics.stop();car.speed=0;}});
  const exhibit=new URLSearchParams(location.search).get('exhibit');ready=true;if(exhibit===(truck?'truck':'utv')||(!truck&&exhibit==='truck'))visit();
 }catch(e){error=e.message;console.error('FarmVehicles53',e);}}
 return {init,update,draw,view,pose,enter,exit,visit,recover,parkAtGarage,get mounted(){return mounted;},snapshot:()=>({ready,error,mounted,health,impacts,broken:health===0,debris:debris.length,door,transition,steering,wheelRoll,...car}),test:{car,held,driverSeat,steeringCenter,partMatrix,frontAngle,get parts(){return parts;},get physics(){return physics;},place(x,z,yaw){Object.assign(car,{x,z,yaw,speed:0});steering=0;physics.reset(x,z,yaw);if(mounted)seat();else setParkedCollider();},damage}};
}
window.FarmVehicles53=createFarmVehicle53();
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,view=updateCamera,walk=advancePlayer,tele=teleport;
 RobotExhibit20.draw=function(p){draw(p);FarmVehicles53.draw(p);};RobotExhibit20.update=function(dt){update(dt);FarmVehicles53.update(dt);};updateCamera=function(...a){if(!window.FarmTruck67?.view()&&!FarmVehicles53.view())view(...a);};advancePlayer=function(...a){if(FarmVehicles53.mounted||window.FarmTruck67?.mounted){keys.clear();return;}walk(...a);};teleport=function(...a){if(FarmVehicles53.mounted)FarmVehicles53.exit(true);if(window.FarmTruck67?.mounted)FarmTruck67.exit(true);return tele(...a);};
 const start=()=>{if(typeof Stables52==='undefined'||!Stables52.snapshot().ready||!Drone44.snapshot().ready){setTimeout(start,250);return;}FarmVehicles53.init();};start();
}
