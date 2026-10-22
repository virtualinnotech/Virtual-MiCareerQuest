window.Hibachi145=(()=>{
 'use strict';
 const C=HibachiCore145,scene=HibachiScene145,game=C.create(),s=game.state;
 const visual={active:false,time:0,stirring:false,pointer:null},temps={},buttons={};
 let ready=false,error=null,saved=null,prompt,top,panel,order,summary,status,grillMeter,grillText,workMeter;
 let selected='steak',ticketView=false,held=false,dragging=false,motion=0,lastPointer=null,uiClock=0,audio=null,muted=false,awarded=false;
 const cap=x=>x[0].toUpperCase()+x.slice(1);
 const blocked=()=>window.Rivian147?.mounted||window.Hotel146?.active||window.FarmScene63?.active||window.Scooter100?.mounted||window.Forklift34?.mounted||window.Ambulance35?.mounted||window.Farming36?.mounted||window.Crane39?.active||window.Robotics37?.active||window.MRI42?.active||window.Welding43?.active||window.PCChallenge66?.active||window.Drone44?.mission;
 const near=()=>ready&&!visual.active&&!state.paused&&!state.overview&&!blocked()&&!MissionUI99?.active&&!HubGuide.snapshot().dialogOpen&&Math.abs(player.position[1]-PHYSICS.radii[1]-scene.origin[1])<.45&&Math.hypot(player.position[0]-scene.origin[0],player.position[2]-(scene.origin[2]+.7))<1.2;
 function soundInit(){
  if(audio){audio.context.resume().catch(()=>{});return;}
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  try{const context=new Audio(),noise=context.createBuffer(1,context.sampleRate,context.sampleRate),data=noise.getChannelData(0);let last=0;
   for(let i=0;i<data.length;i++){last=(last+(Math.random()*2-1)*.08)/1.03;data[i]=last;}
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noise;source.loop=true;filter.type='highpass';filter.frequency.value=850;gain.gain.value=0;source.connect(filter).connect(gain).connect(context.destination);source.start();audio={context,gain};
  }catch{}
 }
 function audioUpdate(){if(audio)audio.gain.gain.setTargetAtTime(!muted&&visual.active&&!state.paused&&!document.hidden&&s.power&&s.egg ? .11 : 0,audio.context.currentTime,.1);}
 function command(id,food=selected){if(!visual.active||state.paused)return false;if(id in C.targets)selected=id;const ok=game.act(id,food);if(ok){ticketView=false;sceneTicketButton();soundInit();refresh();}return ok;}
 function sceneTicketButton(){buttons.ticket?.setAttribute('aria-pressed',ticketView);}
 function enter(){
  if(!near())return false;
  saved={position:[...player.position],yaw:player.yaw,firstPerson:state.firstPerson,radius:state.radius,pitch:state.pitch,orbitYaw:state.orbitYaw};
  visual.active=true;ticketView=false;held=dragging=false;motion=0;keys.clear();player.walkAmount=0;player.position=scene.at([0,PHYSICS.radii[1]+.002,-.60]);player.yaw=Math.PI;state.firstPerson=true;state.overview=null;
  if(document.pointerLockElement)document.exitPointerLock();document.body.classList.add('hibachi145-active');top.hidden=panel.hidden=order.hidden=false;prompt.hidden=true;soundInit();refresh();cameraView();canvas.focus();return true;
 }
 function exit(){
  if(!visual.active)return;visual.active=false;held=dragging=false;motion=0;keys.clear();visual.stirring=false;
  player.position=[...saved.position];player.yaw=saved.yaw;Object.assign(state,{firstPerson:saved.firstPerson,radius:saved.radius,pitch:saved.pitch,orbitYaw:saved.orbitYaw});
  document.body.classList.remove('hibachi145-active');top.hidden=panel.hidden=order.hidden=true;audioUpdate();updateCamera(0,true);canvas.focus();
 }
 function reset(){if(!visual.active)return;game.reset();held=dragging=false;ticketView=false;visual.stirring=false;awarded=false;refresh();canvas.focus();}
 function visit(){if(!ready||blocked()||visual.active)return false;places.hibachi145={label:'Hospitality - Hibachi Grill',p:scene.at([0,PHYSICS.radii[1]+.02,1]),scaledPlayer:true,yaw:0};teleport('hibachi145');state.firstPerson=false;state.radius=1.55;state.orbitYaw=.3;state.pitch=.12;updateCamera(0,true);return true;}
 function cameraView(){if(!visual.active)return false;camera=scene.at(ticketView?[0,.86,-.86]:[0,1.06,-.90]);target=scene.at(ticketView?[0,1.11,-.245]:[0,.445,-.02]);return true;}
 function project(p){const v=scene.at(p),vp=mm(perspective(canvas.clientWidth/canvas.clientHeight),lookAt(camera,target)),q=tp(vp,...v),w=vp[3]*v[0]+vp[7]*v[1]+vp[11]*v[2]+vp[15],r=canvas.getBoundingClientRect();return[r.left+(q[0]/w+1)*r.width/2,r.top+(1-q[1]/w)*r.height/2];}
 function hit(e){
  const r=canvas.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width*2-1,ny=1-(e.clientY-r.top)/r.height*2,f=norm(sub(target,camera)),right=norm(cross(f,[0,1,0])),up=cross(right,f),t=1/perspective(r.width/r.height)[5];
  const d=norm(add(f,add(mul(right,nx*t*r.width/r.height),mul(up,ny*t)))),distance=(scene.origin[1]+scene.surface-camera[1])/d[1];
  if(distance<=0||!Number.isFinite(distance))return null;const p=sub(add(camera,mul(d,distance)),scene.origin);return Math.abs(p[0])<.75&&p[2]>-.76&&p[2]<.45?p:null;
 }
 function handleKey(e,type){
  if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName))return false;
  if(!visual.active){if(type==='keydown'&&e.key.toLowerCase()==='t'&&near()){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)enter();return true;}return false;}
  if(MissionUI99?.active)return false;
  if(type==='keydown'&&(e.key==='Escape'||e.key.toLowerCase()==='t')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)exit();return true;}
  if(e.target?.closest?.('#hibachiPanel145,#hibachiTop145,#hibachiOrder145'))return false;
  if(e.code==='Space'){held=type==='keydown';e.preventDefault();}
  if(type==='keydown'&&!e.repeat&&e.key.toLowerCase()==='u'){ticketView=!ticketView;sceneTicketButton();}
  e.stopImmediatePropagation();return true;
 }
 function refresh(){
  if(!top)return;
  grillText.textContent=Math.round(s.grill)+String.fromCharCode(176)+'F';grillMeter.value=s.grill;status.textContent=s.message;
  summary.textContent=s.phase==='complete'?'Order served':'Hospitality / Hibachi Grill';
  workMeter.hidden=!['scramble','mix','preheat'].includes(s.phase);workMeter.value=s.phase==='preheat'?(s.grill-70)/280:s[s.phase]||0;
  for(const [id,b]of Object.entries(buttons))if(!['exit','reset','ticket','sound'].includes(id))b.disabled=!game.allowed(id,selected)||state.paused;
  for(const [k,node]of Object.entries(temps)){const f=s.foods[k];node.querySelector('output').textContent=f.placed?Math.round(f.temp)+String.fromCharCode(176)+'F':'--';node.classList.toggle('ready',f.temp>=C.targets[k]);node.classList.toggle('selected',selected===k);node.querySelector('progress').value=f.placed?(f.temp-40)/(C.targets[k]-40):0;}
  order.querySelector('[data-rice-status]').textContent=s.mix>=1?'Ready':s.egg?'In progress':'Pending';
  panel.querySelector('[data-phase]').textContent={off:'Grill',preheat:'Preheating',egg:'Egg',scramble:'Scramble the egg',rice:'Rice',mix:'Fried rice',proteins:'Proteins',cooking:'Cooking',serve:'Ready to serve',complete:'Complete'}[s.phase];
  buttons.reset.title=s.served?'Cook another order':'Restart order';sceneTicketButton();
 }
 function update(dt){
  if(!ready)return;prompt.hidden=!near();
  if(!visual.active){visual.time+=Math.min(dt,.05);return;}
  if(state.paused||document.hidden){held=dragging=false;motion=0;visual.stirring=false;audioUpdate();return;}
  const stir=!ticketView&&!s.action&&['scramble','mix'].includes(s.phase)&&(held||motion>0);
  visual.stirring=!!stir;visual.time+=Math.min(dt,.1);game.tick(dt,stir?1:0);motion=Math.max(0,motion-dt);
  if(s.phase==='complete'&&!awarded){awarded=true;if(!employerModeParams())MissionSystem.recordChallenge('hibachi');}
  audioUpdate();uiClock+=dt;if(uiClock>.1){uiClock=0;refresh();}
 }
 function icon(name){const key=name.replace(/(^|-)([a-z0-9])/g,(_,a,b)=>b.toUpperCase());const n=lucide.createElement(lucide.icons[key]||(name==='shrimp'?lucide.icons.Fish:lucide.icons.Utensils));n.setAttribute('aria-hidden','true');return n;}
 function button(parent,id,label,symbol,fn,iconOnly=false){const b=document.createElement('button');b.type='button';b.dataset.action=id;b.title=label;b.setAttribute('aria-label',label);b.append(icon(symbol));if(!iconOnly)b.append(document.createTextNode(label));b.onclick=fn;parent.append(b);buttons[id]=b;return b;}
 function ui(){
  const css=document.createElement('link');css.rel='stylesheet';css.href='./hibachi145/style.css?v=145';document.head.append(css);
  prompt=document.createElement('button');prompt.id='hibachiPrompt145';prompt.hidden=true;prompt.append(icon('chef-hat'),document.createTextNode('T - Hibachi Grill'));prompt.onclick=enter;document.body.append(prompt);
  top=document.createElement('section');top.id='hibachiTop145';top.hidden=true;top.setAttribute('aria-label','Hibachi challenge');
  const title=document.createElement('div');summary=document.createElement('strong');status=document.createElement('span');status.setAttribute('role','status');title.append(summary,status);top.append(title);
  button(top,'ticket','Look at hood ticket','clipboard-list',()=>{ticketView=!ticketView;held=false;sceneTicketButton();},true);
  button(top,'sound','Mute cooking sounds','volume-2',()=>{muted=!muted;buttons.sound.replaceChildren(icon(muted?'volume-x':'volume-2'));buttons.sound.title=muted?'Enable cooking sounds':'Mute cooking sounds';buttons.sound.setAttribute('aria-label',buttons.sound.title);buttons.sound.setAttribute('aria-pressed',muted);audioUpdate();},true);
  button(top,'reset','Restart order','rotate-ccw',reset,true);button(top,'exit','Leave grill','x',exit,true);document.body.append(top);
  order=document.createElement('aside');order.id='hibachiOrder145';order.hidden=true;order.setAttribute('aria-label','Order temperatures');order.innerHTML='<h2>ORDER 04</h2><div class="h145-rice"><span>Fried rice</span><strong data-rice-status>Pending</strong></div><div data-temperatures></div><div class="h145-grill"><span>Grill</span><output></output><progress max="375" value="70" aria-label="Grill temperature"></progress></div>';
  for(const [k,target]of Object.entries(C.targets)){const b=document.createElement('button');b.type='button';b.dataset.food=k;b.innerHTML='<span>'+cap(k)+'</span><output>--</output><small>Target '+target+'&#176;F</small><progress max="1" value="0" aria-label="'+cap(k)+' cooking progress"></progress>';b.onclick=()=>{selected=k;refresh();};b.title='Select '+k;order.querySelector('[data-temperatures]').append(b);temps[k]=b;}
  grillText=order.querySelector('.h145-grill output');grillMeter=order.querySelector('.h145-grill progress');document.body.append(order);
  panel=document.createElement('section');panel.id='hibachiPanel145';panel.hidden=true;panel.setAttribute('aria-label','Cooking tools');panel.innerHTML='<div class="h145-stage"><strong data-phase></strong><progress max="1" value="0" aria-label="Preparation progress"></progress><span>Virtual kitchen</span></div><div class="h145-tools"></div>';
  workMeter=panel.querySelector('progress');const tools=panel.querySelector('.h145-tools');
  for(const [id,label,symbol]of [['power','Turn on grill','power'],['egg','Crack egg','egg'],['scramble','Scramble','utensils'],['rice','Pour rice','cooking-pot'],['mix','Mix rice','utensils-crossed'],['steak','Steak','beef'],['chicken','Chicken','drumstick'],['shrimp','Shrimp','shrimp'],['flip','Turn food','rotate-cw'],['probe','Thermometer','thermometer'],['flame','Flame flourish','flame'],['serve','Serve order','concierge-bell']]){
   const b=button(tools,id,label,symbol,()=>command(id));
   if(['scramble','mix'].includes(id)){
    b.title='Hold to '+label.toLowerCase();b.onpointerdown=e=>{if(b.disabled)return;e.preventDefault();held=true;b.setPointerCapture(e.pointerId);};
    b.onpointerup=b.onpointercancel=b.onlostpointercapture=b.onblur=()=>held=false;
    b.onkeydown=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();held=true;}};b.onkeyup=()=>held=false;
   }
  }
  document.body.append(panel);
  canvas.addEventListener('pointerdown',e=>{if(!visual.active)return;e.preventDefault();e.stopImmediatePropagation();if(ticketView){ticketView=false;sceneTicketButton();return;}const switchPoint=project(scene.powerSwitch);if(s.phase==='off'&&Math.hypot(e.clientX-switchPoint[0],e.clientY-switchPoint[1])<28){command('power');return;}const p=hit(e);if(!p)return;visual.pointer=p;dragging=true;lastPointer=p;canvas.setPointerCapture(e.pointerId);
   const tray=Object.keys(scene.trays).find(k=>Math.hypot(p[0]-scene.trays[k][0],p[2]-scene.trays[k][2])<.13);
   if(tray)command(tray);else if(s.phase==='egg')command('egg');else if(s.phase==='rice')command('rice');else if(['cooking','serve'].includes(s.phase)){const food=Object.keys(C.targets).find(k=>Math.hypot(p[0]-scene.zones[k][0],p[2]-scene.zones[k][2])<.12);if(food){selected=food;command('flip',food);}}
  },true);
  canvas.addEventListener('pointermove',e=>{if(!visual.active)return;e.stopImmediatePropagation();const p=hit(e);if(!p)return;visual.pointer=p;if(dragging&&lastPointer&&Math.abs(p[0])<.4&&p[2]>-.26&&p[2]<.25&&Math.hypot(p[0]-lastPointer[0],p[2]-lastPointer[2])>.002)motion=.16;lastPointer=p;},true);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{dragging=false;lastPointer=null;},true);
  canvas.addEventListener('wheel',e=>{if(visual.active){e.preventDefault();e.stopImmediatePropagation();ticketView=e.deltaY<0;sceneTicketButton();}},{capture:true,passive:false});
  window.addEventListener('blur',()=>{held=dragging=false;motion=0;if(audio)audio.gain.gain.value=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){held=dragging=false;motion=0;}audioUpdate();});
 }
 function collider(label,min,max){const vertices=[];for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])for(const x of [min[0],max[0]])vertices.push(...scene.at([x,y,z]));registerCollider('Hibachi145 '+label,'hospitalityChallenge',new Float32Array(vertices),new Uint32Array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]),false,{});baselineColliders.push(colliders.at(-1));}
 async function init(){
  try{ui();await scene.init();collider('grill',[-.42,0,-.27],[.42,.42,.42]);collider('left counter',[-.71,0,-.75],[-.42,.42,.42]);collider('right counter',[.42,0,-.75],[.71,.42,.42]);refreshShipments();Crowd.invalidate();ready=true;refresh();
   if(new URLSearchParams(location.search).get('challenge')==='hibachi')visit();
  }catch(e){error=e.message;console.error('Hibachi145',e);if(prompt){prompt.hidden=false;prompt.textContent='Hibachi assets unavailable - reload to retry';prompt.disabled=true;}}
 }
 return {init,update,enter,exit,reset,visit,near,handleKey,cameraView,get active(){return visual.active;},draw:p=>scene.draw(s,visual,p),snapshot:()=>({...JSON.parse(JSON.stringify(s)),ready,error,active:visual.active,origin:scene.origin,ticketView,selected,stirring:visual.stirring}),test:{game,project,command,scene,visual}};
})();
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,view=updateCamera,walk=advancePlayer;
 RobotExhibit20.draw=function(p){draw(p);Hibachi145.draw(p);};RobotExhibit20.update=function(dt){update(dt);Hibachi145.update(dt);};
 updateCamera=function(dt,immediate=false){if(!Hibachi145.cameraView())view(dt,immediate);};
 advancePlayer=function(...args){if(Hibachi145.active){keys.clear();player.walkAmount=0;return;}return walk(...args);};
 const start=()=>{if(!state.ready||!Hospitality140.snapshot().ready||!window.lucide){setTimeout(start,250);return;}Hibachi145.init();};start();
}
