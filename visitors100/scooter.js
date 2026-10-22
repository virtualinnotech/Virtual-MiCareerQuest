/* Reward riding uses the venue's existing swept collision solver and fixed physics step. */
window.Scooter100=(()=>{
 const S=.4,home=[31.25,1.65];
 const rides={scooter:{label:'Scooter',parked:{x:home[0],z:home[1],yaw:Math.PI/2},parts:null,angles:{},offset:[0,.15,-.12]},segway:{label:'Segway',parked:{x:home[0],z:home[1]+.85,yaw:Math.PI/2},parts:null,angles:{},offset:[0,.12,.025]}};
 Object.assign(rides,RideDocks128.rides());
 const dataFor=id=>(rides[id].kind==='bike'?BikeData128:RideData103[rides[id].kind||id]);
 let activeId='scooter',leanX=0,leanZ=0,steer=0,braking=false,tail=null,head136=null,headBody136=null;
 const ride=()=>rides[activeId];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 let parts=null,loading=false,error=null,ring=null,mounted=false,speed=0,boost=false,brake=false,saved=null,lastUI=0,poseError=[];
 let poseCache=new WeakMap();
 const panel=document.createElement('div');panel.id='scooter100';panel.hidden=true;panel.setAttribute('aria-label','Scooter');document.body.append(panel);
 const icon=name=>lucide.createElement(lucide.icons[name]);
 const action=(name,symbol,fn)=>{const b=document.createElement('button');b.type='button';b.title=name;b.setAttribute('aria-label',name);b.append(icon(symbol));b.onclick=fn;panel.append(b);return b;};
 const mountBtn=action('Ride scooter (T)','Bike',()=>mount());
 const meter=document.createElement('output');meter.setAttribute('aria-label','Ride speed');panel.append(meter);
 const fastBtn=action('Turbo (hold Shift)','Zap',null),stopBtn=action('Brake (hold Space)','CirclePause',null),exitBtn=action('Get off scooter (T)','LogOut',()=>dismount());
 function hold(b,set){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);set(true);b.setAttribute('aria-pressed','true');});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{set(false);b.setAttribute('aria-pressed','false');});}
 hold(fastBtn,v=>boost=v);hold(stopBtn,v=>brake=v);
 const busy=()=>window.Rivian147?.mounted||window.Hotel146?.active||!!(window.FarmScene63?.active||window.Forklift34?.mounted||window.Ambulance35?.mounted||window.Farming36?.mounted||window.Robotics37?.active||window.Crane39?.active||window.MRI42?.active||window.Welding43?.active||window.Drone44?.mission||window.PCChallenge66?.active);
 const scale=()=>S*sectorScaleAt(player.position[0],player.position[2]);
 function root(id=activeId){const v=rides[id],parked=v.parked,on=mounted&&id===activeId,pose=on?walkingPose132():player,p=on?[pose.position[0],pose.position[1]-PHYSICS.radii[1],pose.position[2]]:[parked.x,parked.y??floorHeightAt(parked.x,parked.z),parked.z],s=S*sectorScaleAt(p[0],p[2]);return transform(p,[s,s,s],0,(on?pose.yaw:parked.yaw)+Math.PI);}
 const headAnchor136=id=>rides[id].kind==='bike'?[0,1.12,.46]:id==='segway'?[0,1.12,.35]:[0,1.10,.29];
 function headlights136(){
  if(!mounted||busy())return [];
  const r=root(),a=headAnchor136(activeId),s=Math.hypot(r[8],r[10]);
  return [{id:'Ride136 '+activeId+' headlight',p:tp(r,a[0],a[1],a[2]+.045),direction:norm([r[8]/s,-.14,r[10]/s]),outer:.72,radius:6.4,power:8,color:[1,.91,.76]}];
 }
 function nearest(){return Object.keys(rides).sort((a,b)=>distance(a)-distance(b))[0];}
 function distance(id){const p=rides[id].parked;return Math.hypot(player.position[0]-p.x,player.position[2]-p.z);}
 function near(id=nearest()){const p=rides[id].parked;return distance(id)<.65&&Math.abs(player.position[1]-PHYSICS.radii[1]-floorHeightAt(p.x,p.z))<.35;}
 async function init(){if(loading)return;loading=true;const m=new NetworkScene40.Mesh([.12,.95,.48,1]),points=[];for(let i=0;i<=48;i++)points.push([Math.cos(i*Math.PI/24)*.8,.018,Math.sin(i*Math.PI/24)*.8]);m.tube(points,.012);ring=m.build({unlit:true,emission:[.1,.8,.3]});tail=new NetworkScene40.Mesh([.65,.015,.025,1]).box([0,0,0],[.09,.035,.022]).build({unlit:true,emission:[.1,0,0]});
  headBody136=new NetworkScene40.Mesh([.025,.03,.035,1]).box([0,0,-.025],[.10,.07,.08]).build();
  head136=new NetworkScene40.Mesh([.85,.89,.90,1]).box([0,0,.019],[.078,.046,.012]).build({emission:[0,0,0]});
  const loaded={};
  for(const [id,v] of Object.entries(rides))try{const kind=v.kind||id;loaded[kind]??=await DroneAssets44.load(kind==='bike'?'bike':kind+'103',{base:kind==='bike'?'./city106/street128/':'./visitors100/'});v.parts=loaded[kind].map(p=>({...p,batch:{...p.batch}}));for(const w of dataFor(id).wheels)v.angles[w.name]=0;if(v.dockHome)RideDocks128.registerRide(id,v,root(id));}catch(e){v.error=e.message;error=e.message;console.warn(id,e);}
  await RideDocks128.init();StreetProps128.finish();
  parts=rides.scooter.parts;
 }
 function mount(id=nearest()){if(mounted||!rides[id]?.parts||!StudentProgress99.complete()||busy()||state.paused||state.overview||state.ghost||!near(id))return false;
  if(StreetProps128.disabled('Ride128 '+id))return false;
  activeId=id;const parked=ride().parked;StreetProps128.enable('Ride128 '+id,false);
  const target=[parked.x,(parked.y??floorHeightAt(parked.x,parked.z))+PHYSICS.radii[1]+.002,parked.z],sweep=resolveEllipsoid(player.position,sub(target,player.position));
  if(len(sub(sweep.position,target))>.025){StreetProps128.enable('Ride128 '+id,true);toast('Approach the '+ride().label.toLowerCase()+' from the open side.');return false;}
  saved={firstPerson:state.firstPerson,radius:state.radius};player.position=sweep.position;player.yaw=parked.yaw;player.vy=0;player.grounded=true;player.walkAmount=0;mounted=true;speed=0;leanX=leanZ=steer=0;braking=false;poseCache=new WeakMap();state.radius=Math.max(state.radius,1.25);keys.clear();StudentRewards100.claim();updateCamera(0,true);updateUI();return true;
 }
 function dismount(force=false){if(!mounted)return true;const r=root(),start=player.position;let exit=null;
  for(const dx of [.85,-.85,1.15,-1.15]){const p=tp(r,dx,0,-.1),target=[p[0],start[1],p[2]],out=resolveEllipsoid(start,sub(target,start));if(len(sub(out.position,target))<.025){const hit=raycast([p[0],start[1]+.1,p[2]],[0,-1,0],PHYSICS.radii[1]+.3);if(hit?.normal[1]>.55){exit=out.position;break;}}}
  if(!exit&&!force){toast('Move to a little more open floor before getting off.');return false;}
  ride().parked=ride().dockHome?{...ride().dockHome}:{x:start[0],y:start[1]-PHYSICS.radii[1],z:start[2],yaw:player.yaw};mounted=false;StreetProps128.enable('Ride128 '+activeId,true);speed=0;leanX=leanZ=steer=0;boost=brake=braking=false;Object.assign(state,saved);if(exit)player.position=exit;player.walkAmount=0;keys.clear();poseCache=new WeakMap();const a=characterState.player;
  if(a){a.previous=null;a.blend=1;for(let i=0;i<a.pose.length;i++){const n=a.model.j.nodes[i];a.pose[i]={translation:[...(n.translation||[0,0,0])],rotation:[...(n.rotation||[0,0,0,1])],scale:[...(n.scale||[1,1,1])]};}}
  updateCamera(0,true);updateUI();return true;
 }
 const walk=advancePlayer;advancePlayer=function(dt,input){if(!mounted)return walk(dt,input);if(state.paused)return;
  braking=brake||keys.has(' ');
  const turbo=input.fast||boost,target=braking?0:input.forward?(turbo?7.5:2.6):input.backward?-1:0,rate=braking?20:target===0?3:4;
  speed+=clamp(target-speed,-rate*dt,rate*dt);
  steer=(input.left?1:0)-(input.right?1:0);
  const yawDelta=braking?0:steer*dt*(1.1+1.1/(1+Math.abs(speed)))*(speed<0?-1:1);
  player.yaw+=yawDelta;
  const vx=-Math.sin(player.yaw)*speed,vz=-Math.cos(player.yaw)*speed;
  const drag=StreetProps128.strike({id:'Ride128 '+activeId,from:[player.position[0],player.position[2]],x:player.position[0]+vx*dt,z:player.position[2]+vz*dt,y:player.position[1]-PHYSICS.radii[1],yaw:player.yaw,width:.27,length:ride().kind==='bike'?.78:.48,height:.6,vx,vz,mass:95});speed*=1-drag;
  const oldSpeed=state.speed,before=[...player.position];state.speed=Math.abs(speed)/(1.5*PLAYER_SCALE);
  const radii=PHYSICS.radii;PHYSICS.radii=[Math.max(radii[0],.25),radii[1],Math.max(radii[2],.25)];
  try{walk(dt,{forward:speed>.001,backward:speed<-.001,fast:false});}finally{state.speed=oldSpeed;PHYSICS.radii=radii;}
  if(Math.abs(speed)>.1&&Math.hypot(player.position[0]-before[0],player.position[2]-before[2])<Math.abs(speed)*dt*.15)speed=0;
  const travelled=Math.hypot(player.position[0]-before[0],player.position[2]-before[2])*Math.sign(speed)/scale();
  for(const w of dataFor(activeId).wheels){const differential=activeId==='segway'?yawDelta*w.pivot[0]:0;ride().angles[w.name]+=(travelled-differential)/w.radius;}
  const ease=1-Math.exp(-dt*7),moving=Math.min(1,Math.abs(speed)/.8);
  leanX+=((activeId==='segway'?clamp(speed*.075,-.13,.20):.025*moving)-leanX)*ease;
  leanZ+=((-steer*.19*(activeId==='segway'&&!braking?Math.max(.45,moving):moving))-leanZ)*ease;
  player.walkAmount=0;
 };
 const rz=a=>[Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1];
 const lean=()=>[Math.round(leanX/ .006)*.006,Math.round(leanZ/ .006)*.006];
 const baseActorMatrix=actorMatrix;actorMatrix=function(a){if(!mounted||!a.player)return baseActorMatrix(a);const s=a.model.scale/S,[pitch,roll]=lean(),tilt=mm(mm(transform([0,.85,0],[1,1,1],pitch),rz(roll)),transform([0,-.85,0]));return mm(mm(mm(mm(root(),transform(ride().offset)),tilt),transform([0,0,0],[s,s,s])),transform(a.model.offset));};
 const travel=teleport;teleport=function(...args){if(mounted)dismount(true);return travel(...args);};
 const qmul=([x,y,z,w],[a,b,c,d])=>[w*a+x*d+y*c-z*b,w*b-x*c+y*d+z*a,w*c+x*b-y*a+z*d,w*d-x*a-y*b-z*c];
 const qrotate=(q,v)=>qmul(qmul(q,[...v,0]),[-q[0],-q[1],-q[2],q[3]]).slice(0,3);
 const between=(a,b)=>{const w=1+clamp(dot(a,b),-1,1);return w<1e-6?[...norm(cross(a,Math.abs(a[0])<.8?[1,0,0]:[0,1,0])),0]:norm([...cross(a,b),w]);};
 // Every lean change used to re-solve the full-body IK (hundreds of matrix
 // rebuilds) on each frame of a crash or turn. Solved poses are reused.
 function pose(a){if(!mounted||!a.player)return;const signature=activeId+':'+lean().join(',')+':'+JSON.stringify(BikeData128.fit);let solved=poseCache.get(a);if(!solved){solved=new Map();poseCache.set(a,solved);}let cached=solved.get(signature);if(cached){solved.delete(signature);solved.set(signature,cached);for(let i=0;i<a.pose.length;i++)a.pose[i]={translation:[...cached.pose[i].translation],rotation:[...cached.pose[i].rotation],scale:[...cached.pose[i].scale]};return;}
  const m=a.model;for(let i=0;i<a.pose.length;i++){const n=m.j.nodes[i];a.pose[i]={translation:[...(n.translation||[0,0,0])],rotation:[...(n.rotation||[0,0,0,1])],scale:[...(n.scale||[1,1,1])]};}
  const bindRotations=[];for(const i of m.order)bindRotations[i]=qmul(bindRotations[m.parents.get(i)]||[0,0,0,1],a.pose[i].rotation);
  if(ride().kind==='bike')for(const [part,angle]of [['Spine',BikeData128.fit?.spine??.84],['Neck',-.32],['Head',-.10]]){const joint=m.j.nodes.findIndex(n=>(n.name||'').split(':').pop()===part);if(joint>=0)a.pose[joint].rotation=qmul([Math.sin(angle/2),0,0,Math.cos(angle/2)],a.pose[joint].rotation);}
  const world=[],rebuild=()=>{for(const i of m.order)world[i]=mm(world[m.parents.get(i)]||IDENTITY,trs(a.pose[i]));},find=(side,part)=>m.j.nodes.findIndex(n=>(n.name||'').split(':').pop()===side+part);
  rebuild();const hip=world[m.skins[0].joints[0]],correction=a.bindHip?[hip[12]-a.bindHip[0],0,hip[14]-a.bindHip[1]]:[0,0,0],actor=actorMatrix(a),inverse=CharacterFitting.invert4(actor);poseError=[];
  for(const [si,side]of ['Left','Right'].entries())for(const limb of ['arm','leg']){
   const end=find(side,limb==='arm'?'Hand':'Foot'),contact=limb==='arm'?find(side,'HandMiddle1'):end,chain=limb==='arm'?[find(side,'ForeArm'),find(side,'Arm')]:[find(side,'Leg'),find(side,'UpLeg')];if(end<0||contact<0||chain.some(i=>i<0))continue;
   const grip=BikeData128.fit?.grip||[.295,1.291,.398];
   const anchor=ride().kind==='bike'?(limb==='arm'?[si===0?grip[0]:-grip[0],grip[1],grip[2]]:[si===0?.155:-.155,.34,si===0?.10:-.10]):activeId==='segway'?(limb==='arm'?[si===0?.16:-.16,1.24,.323]:[si===0?.15:-.15,.345,-.035]):(limb==='arm'?[si===0?.195:-.195,1.205,.218]:[si===0?.045:-.045,.285,si===0?.055:-.245]),targetWorld=tp(root(),...anchor);
   let target=add(tp(inverse,...targetWorld),correction),handRotation=null;
   if(limb==='arm'){
    const origin=tp(inverse,...tp(root(),0,0,0)),direction=v=>norm(sub(tp(inverse,...tp(root(),...v)),origin)),desired=direction([0,-.2,1]);
    const offset=sub(world[contact].slice(12,15),world[end].slice(12,15)),q1=between(norm(offset),desired),index=find(side,'HandIndex1'),pinky=find(side,'HandPinky1');
    const across=qrotate(q1,norm(sub(world[index].slice(12,15),world[pinky].slice(12,15)))),flat=norm(sub(across,mul(desired,dot(across,desired)))),wanted=direction([si===0?-1:1,0,0]);
    const angle=Math.atan2(dot(desired,cross(flat,wanted)),clamp(dot(flat,wanted),-1,1)),q2=[...mul(desired,Math.sin(angle/2)),Math.cos(angle/2)],adjust=qmul(q2,q1);
    const rotations=[];for(const i of m.order)rotations[i]=qmul(rotations[m.parents.get(i)]||[0,0,0,1],a.pose[i].rotation);
    handRotation=qmul(adjust,rotations[end]);target=sub(target,qrotate(adjust,offset));
   }
   if(limb==='leg'){
    // A two-bone solution with a forward/outward pole cannot flip its knee
    // backward or choose the crossed-leg solution while the torso leans.
    const upper=chain[1],knee=chain[0],h=world[upper].slice(12,15),k=world[knee].slice(12,15),f=world[end].slice(12,15);
    const l1=len(sub(k,h)),l2=len(sub(f,k)),axis=norm(sub(target,h)),distance=clamp(len(sub(target,h)),Math.abs(l1-l2)+.0001,l1+l2-.0001);
    const pole=add(tp(inverse,...tp(root(),si===0?.26:-.26,.68,.48)),correction),toward=sub(pole,h),bend=norm(sub(toward,mul(axis,dot(toward,axis))));
    const along=(l1*l1-l2*l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,l1*l1-along*along)),desiredKnee=add(add(h,mul(axis,along)),mul(bend,height));
    for(const [joint,child,goal]of [[upper,knee,desiredKnee],[knee,end,target]]){
     const inv=CharacterFitting.invert4(world[m.parents.get(joint)]||IDENTITY),origin=tp(inv,...world[joint].slice(12,15));
     a.pose[joint].rotation=qmul(between(norm(sub(tp(inv,...world[child].slice(12,15)),origin)),norm(sub(tp(inv,...goal),origin))),a.pose[joint].rotation);rebuild();
    }
   }else{
    const j=chain[0],angle=-.25;a.pose[j].rotation=qmul([Math.sin(angle/2),0,0,Math.cos(angle/2)],a.pose[j].rotation);rebuild();
    for(let iteration=0;iteration<64;iteration++){if(len(sub(world[end].slice(12,15),target))<.0005)break;for(const joint of chain){const inv=CharacterFitting.invert4(world[m.parents.get(joint)]||IDENTITY),origin=tp(inv,...world[joint].slice(12,15)),from=norm(sub(tp(inv,...world[end].slice(12,15)),origin)),to=norm(sub(tp(inv,...target),origin)),w=1+clamp(dot(from,to),-1,1);if(w<1e-6)continue;a.pose[joint].rotation=qmul(norm([...cross(from,to),w]),a.pose[joint].rotation);rebuild();}}
   }
   if(limb==='arm'){
    // Rotate the elbow plane toward a relaxed, lowered pole without releasing the grip.
    const joint=chain[1],inv=CharacterFitting.invert4(world[m.parents.get(joint)]||IDENTITY),origin=tp(inv,...world[joint].slice(12,15)),axis=norm(sub(tp(inv,...world[end].slice(12,15)),origin));
    const pole=add(tp(inverse,...tp(root(),si===0?.30:-.30,.92,-.06)),correction),from=sub(tp(inv,...world[chain[0]].slice(12,15)),origin),to=sub(tp(inv,...pole),origin),a1=norm(sub(from,mul(axis,dot(from,axis)))),a2=norm(sub(to,mul(axis,dot(to,axis)))),angle=Math.atan2(dot(axis,cross(a1,a2)),clamp(dot(a1,a2),-1,1));
    a.pose[joint].rotation=qmul([...mul(axis,Math.sin(angle/2)),Math.cos(angle/2)],a.pose[joint].rotation);rebuild();
   }
   if(limb==='leg'){const rotations=[];for(const i of m.order)rotations[i]=qmul(rotations[m.parents.get(i)]||[0,0,0,1],a.pose[i].rotation);const q=rotations[m.parents.get(end)];a.pose[end].rotation=qmul([-q[0],-q[1],-q[2],q[3]],bindRotations[end]);rebuild();}
   if(handRotation){const rotations=[];for(const i of m.order)rotations[i]=qmul(rotations[m.parents.get(i)]||[0,0,0,1],a.pose[i].rotation);const q=rotations[m.parents.get(end)];a.pose[end].rotation=qmul([-q[0],-q[1],-q[2],q[3]],handRotation);rebuild();}
   const actual=tp(actor,...sub(world[contact].slice(12,15),correction)),inRide=point=>tp(CharacterFitting.invert4(root()),...tp(actor,...sub(point,correction)));
   poseError.push({side,limb,error:len(sub(actual,targetWorld)),target:targetWorld,actual,...(limb==='leg'?{hip:inRide(world[chain[1]].slice(12,15)),knee:inRide(world[chain[0]].slice(12,15)),foot:inRide(world[end].slice(12,15))}:{})});
  }
  const gripAxis=norm(sub(tp(inverse,...tp(root(),1,0,0)),tp(inverse,...tp(root(),0,0,0))));
  for(const side of ['Left','Right'])for(const finger of ['HandIndex','HandMiddle','HandRing','HandPinky'])for(const segment of [1,2,3]){const i=find(side,finger+segment);if(i>=0){const inv=CharacterFitting.invert4(world[m.parents.get(i)]||IDENTITY),axis=norm(sub(tp(inv,...gripAxis),tp(inv,0,0,0))),angle=segment===1?.48:segment===2?1.05:.65;a.pose[i].rotation=qmul([...mul(axis,Math.sin(angle/2)),Math.cos(angle/2)],a.pose[i].rotation);rebuild();}}
  cached=a.pose.map(p=>({translation:[...p.translation],rotation:[...p.rotation],scale:[...p.scale]}));solved.set(signature,{signature,pose:cached});if(solved.size>192)solved.delete(solved.keys().next().value);
 }
 function updateUI(){const id=mounted?activeId:nearest(),v=rides[id],visible=state.ready&&!busy()&&!state.overview&&(mounted||near(id));panel.hidden=!visible;panel.setAttribute('aria-label',v.label);mountBtn.hidden=mounted;mountBtn.disabled=!StudentProgress99.complete()||!v.parts;mountBtn.title=v.error?v.label+' unavailable':StudentProgress99.complete()?'Ride '+v.label+' (T)':'Complete your missions to unlock';mountBtn.setAttribute('aria-label',mountBtn.title);mountBtn.dataset.ride=id;for(const n of [meter,fastBtn,stopBtn,exitBtn])n.hidden=!mounted;exitBtn.title='Get off '+v.label+' (T)';meter.textContent=Math.round(Math.abs(speed)/S*2.237)+' mph';}
 function draw(planes){if(!state.ready||window.FarmScene63?.active)return;if(!loading)init();const time=performance.now()/1000;
  RideDocks128.draw();
  for(const [id,v] of Object.entries(rides)){const r=StreetProps128.matrix('Ride128 '+id,root(id)),on=mounted&&activeId===id;if(!v.parts||!sphereVisible([r[12],r[13]+.3,r[14]],.8,planes))continue;
   const glow=!on&&StudentProgress99.complete(),pulse=.55+.4*Math.sin(time*3),lit=on&&braking;
   for(const p of v.parts){if(p.batch.hidden128)continue;let model=p.matrix;const w=dataFor(id).wheels.find(w=>w.name===p.name);if(w)model=mm(mm(mm(transform(w.pivot,[1,1,1],v.angles[w.name]),transform(mul(w.pivot,-1))),p.matrix),IDENTITY);
    if(p.name==='Cylinder.018')p.batch.emission=glow?[.05,pulse,.22]:[0,0,0];
    if(p.name==='Cube.017'){p.batch.emission=lit?[3,.015,.015]:[.13,0,0];p.batch.color=lit?[1,.025,.025,1]:[.32,.005,.008,1];}
    drawBatch(p.batch,mm(r,model));
   }
   tail.emission=lit?[3,.025,.02]:[.12,0,0];tail.color=lit?[1,.035,.025,1]:[.32,.005,.005,1];
   if(head136){const night=CityLighting131.snapshot().night,hm=mm(r,transform(headAnchor136(id)));head136.emission=on?[4*night,3.7*night,3.1*night]:[0,0,0];drawBatch(headBody136,hm);drawBatch(head136,hm);}
   for(const x of id==='segway'?[-.22,.22]:[0])drawBatch(tail,mm(r,transform([x,id==='segway'?.23:.345,id==='segway'?-.19:-.535])));
   if(glow&&ring){ring.emission=[.04,.35+pulse,.15];const s=1+.09*Math.sin(time*3);drawBatch(ring,mm(r,transform([0,0,0],[s,1,s])));}
  }
  if(performance.now()-lastUI>120){lastUI=performance.now();updateUI();}
 }
 const prior=RobotExhibit20.draw;RobotExhibit20.draw=function(planes){prior.call(this,planes);draw(planes);};
 function drawLighting(planes){for(const [id,v]of Object.entries(rides)){if(!v.parts)continue;const r=StreetProps128.matrix('Ride128 '+id,root(id));if(!sphereVisible([r[12],r[13]+.3,r[14]],.8,planes))continue;for(const p of v.parts)if(!p.batch.hidden128)drawBatch(p.batch,mm(r,p.matrix));}}
 function handleKey(e,type){if(type==='keyup'&&e.code==='Space')brake=braking=false;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||state.paused)return false;const key=e.key.toLowerCase();if((key==='t'&&(mounted||near()))||(mounted&&(e.code==='Space'||key==='g'))){e.preventDefault();e.stopImmediatePropagation();if(e.code==='Space'){brake=type==='keydown';}else if(type==='keydown'&&!e.repeat&&key==='t'){if(mounted)dismount();else mount();}return true;}return false;}
 const stop=()=>{speed=0;leanX=leanZ=steer=0;boost=brake=braking=false;keys.clear();};window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 return {preload:init,mount,dismount,pose,handleKey,drawLighting,headlights136,get mounted(){return mounted;},busy,snapshot:()=>({ready:Object.values(rides).every(v=>!!v.parts),error,mounted,activeId,speed,braking,lean:lean(),parked:{...ride().parked},unlocked:StudentProgress99.complete(),poseError,root:root(),rides:Object.fromEntries(Object.entries(rides).map(([id,v])=>[id,{parked:{...v.parked},ready:!!v.parts,error:v.error,wheels:{...v.angles},root:root(id)}]))})};
})();

window.StudentRewards100=(()=>{
 const KEY='mcqScooterReward_v1';let seen=false,claimed=false,paused=false,focus=null;
 try{const s=JSON.parse(localStorage.getItem(KEY));seen=!!s?.seen;claimed=!!s?.claimed;}catch{}
 const dialog=document.createElement('dialog');dialog.id='reward100';dialog.setAttribute('aria-labelledby','rewardTitle100');dialog.append(lucide.createElement(lucide.icons.Gift));
 const title=document.createElement('h2');title.id='rewardTitle100';title.textContent='Please visit the information booth for your prize.';dialog.append(title);
 const actions=document.createElement('div');actions.className='reward-actions';dialog.append(actions);
 function save(){try{localStorage.setItem(KEY,JSON.stringify({seen,claimed}));}catch{}}
 function close(){if(!dialog.open)return;dialog.close();state.paused=paused;keys.clear();focus?.focus?.();}
 for(const [text,fn]of [['Visit information booth',()=>{close();HubGuide.visit();}],['Later',close]]){const b=document.createElement('button');b.textContent=text;b.onclick=fn;actions.append(b);}
 document.body.append(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 function check(){if(window.Loading155?.blocked||seen||claimed||!StudentProgress99.complete()||!state.ready||state.paused||MissionUI99.active||Scooter100.busy()||employerModeParams())return;seen=true;save();paused=state.paused;focus=document.activeElement;state.paused=true;keys.clear();if(document.pointerLockElement)document.exitPointerLock();dialog.showModal();}
 StudentProgress99.subscribe(check);setInterval(check,500);
 return {close,get active(){return dialog.open;},claim(){claimed=true;seen=true;save();},cheat(){MissionUI99.close();StudentProgress99.completeForTesting();if(!seen)check();if(!dialog.open)toast('All missions complete. Bikes, scooters, the Segway and the Rivian are unlocked.');},snapshot:()=>({seen,claimed})};
})();
