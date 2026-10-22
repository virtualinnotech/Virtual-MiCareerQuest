window.Hotel146=(()=>{
 const C=HotelCore146,scene=HotelScene146,game=C.create();
 let ready=false,error=null,active=false,prompt,top,panel,dialog,pending=false,view='guest',awarded=false,autoArmed=true,lookDrag=null;
 const busy=()=>window.Rivian147?.mounted||window.Hibachi145?.active||window.Scooter100?.mounted||window.FarmScene63?.active||window.Forklift34?.mounted||window.Ambulance35?.mounted||window.Farming36?.mounted||window.Crane39?.active||window.Robotics37?.active||window.MRI42?.active||window.Welding43?.active||window.PCChallenge66?.active||window.Drone44?.mission;
 const distance=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[2]);
 function nearKiosk(){return ready&&!active&&!busy()&&Math.abs(player.position[1]-PHYSICS.radii[1]-C.kiosk[1])<.35&&distance(player.position,add(C.kiosk,C.kioskDesk.approach))<1.10;}
 function nearDesk(){return ready&&!active&&!busy()&&[C.reception.guest,C.reception.employee].some(p=>distance(player.position,scene.at(p))<1.1)&&Math.abs(player.position[1]-PHYSICS.radii[1]-C.origin[1])<.3;}
 function available(){return !state.paused&&!state.overview&&!MissionUI99?.active&&!HubGuide.snapshot().dialogOpen;}
 function teleportPoint(id,label,p,yaw=0){places[id]={label,p:add(p,[0,PHYSICS.radii[1]+.012,0]),scaledPlayer:true,yaw};teleport(id);}
 function visit(){if(!ready||active||busy())return false;autoArmed=false;teleportPoint('hotel146-kiosk','Hospitality - Hotel Check-In',add(C.kiosk,C.kioskDesk.approach),Math.PI);state.firstPerson=false;state.radius=1.6;state.orbitYaw=0;state.pitch=.12;updateCamera(0,true);return true;}
 function enter(){if(!available()||(!nearKiosk()&&!nearDesk()))return false;
  active=true;autoArmed=false;keys.clear();player.walkAmount=0;player.vy=0;player.position=scene.at(add(C.reception.employee,[0,PHYSICS.radii[1]+.012,0]));state.firstPerson=true;state.overview=null;state.orbitYaw=0;lookAt('guest');if(document.pointerLockElement)document.exitPointerLock();document.body.classList.add('hotel146-active');top.hidden=panel.hidden=dialog.hidden=false;prompt.hidden=true;refresh();cameraView();canvas.focus();return true;
 }
 function leave(){if(!active)return;active=false;lookDrag=null;keys.clear();player.vy=0;autoArmed=false;document.body.classList.remove('hotel146-active');top.hidden=panel.hidden=dialog.hidden=true;
  state.firstPerson=true;state.orbitYaw=0;
  updateCamera(0,true);canvas.focus();
 }
 function lookAt(next){view=next;const eye=add(C.reception.employee,[0,.75,0]),point=next==='computer'?C.reception.monitor:add(C.reception.guest,[0,.64,0]),d=sub(point,eye);player.yaw=Math.atan2(-d[0],-d[2]);state.pitch=Math.atan2(d[1],Math.hypot(d[0],d[2]));state.orbitYaw=0;}
 function cameraView(){if(!active)return false;camera=scene.at(add(C.reception.employee,[0,.75,0]));target=add(camera,[-Math.sin(player.yaw)*Math.cos(state.pitch),Math.sin(state.pitch),-Math.cos(player.yaw)*Math.cos(state.pitch)]);return true;}
 function choose(index){if(!active||state.paused||pending||game.state.complete)return false;const ok=game.choose(index);pending=true;refresh();if(game.state.complete&&!awarded){awarded=true;if(!employerModeParams()){MissionSystem.recordChallenge('hotel');try{const previous=Number(localStorage.getItem('mcqHotelBest146'))||0;localStorage.setItem('mcqHotelBest146',String(Math.max(previous,game.state.score)));}catch{}}}return ok;}
 function next(){pending=false;refresh();}
 function reset(){if(!active)return;game.reset();pending=false;awarded=false;lookAt('guest');refresh();}
 function icon(name){const key=name.replace(/(^|-)([a-z])/g,(_,a,b)=>b.toUpperCase());const n=lucide.createElement(lucide.icons[key]);n.setAttribute('aria-hidden','true');return n;}
 function button(label,symbol,fn,iconOnly=false){const b=document.createElement('button');b.type='button';b.title=label;b.setAttribute('aria-label',label);if(symbol)b.append(icon(symbol));if(!iconOnly)b.append(document.createTextNode(label));b.onclick=fn;return b;}
 function refresh(){if(!panel)return;const s=game.state,step=C.steps[Math.min(s.step,C.steps.length-1)];
  top.querySelector('output').textContent=Math.round(s.score)+' / 100';top.querySelector('progress').value=s.complete?8:s.step;
  dialog.replaceChildren();const name=document.createElement('strong');name.textContent='Jordan Ellis';const quote=document.createElement('p');quote.textContent=s.complete?'Thank you for taking such good care of us. We are looking forward to our stay.':step.guest;dialog.append(name,quote);
  panel.querySelector('[data-stage]').textContent=s.complete?'Arrival complete':`${Math.min(s.step+1,8)} / 8  ${step.title}`;
  panel.querySelector('[data-room]').textContent=s.room||'Unassigned';panel.querySelector('[data-id]').textContent=s.verified?'Verified':'Pending';
  const content=panel.querySelector('[data-content]');content.replaceChildren();
  if(s.complete){const result=document.createElement('div');result.className='h146-result';result.innerHTML='<strong>'+s.score+'<small> / 100</small></strong><p>'+(s.score>=90?'Exceptional guest service':s.score>=70?'A welcoming arrival':'Check-in completed. Review the feedback and try again.')+'</p><p>Virtual guest tip: $'+s.tip+'</p>';content.append(result);content.append(button('Done','check',leave),button('New practice check-in','rotate-ccw',reset));}
  else if(pending){const feedback=document.createElement('p');feedback.className='h146-feedback';feedback.setAttribute('role','status');feedback.textContent=s.feedback;content.append(feedback,button(s.attempts?'Try again':'Continue','arrow-right',next));}
  else for(const [i,c]of step.choices.entries()){const b=button(c[0],null,()=>choose(i));b.className='h146-choice';b.dataset.choice=i;const number=document.createElement('span');number.textContent=String(i+1);b.prepend(number);content.append(b);}
 }
 function ui(){const css=document.createElement('link');css.rel='stylesheet';css.href='./hotel146/style.css?v=149';document.head.append(css);
  prompt=button('T - Hotel Check-In','concierge-bell',enter);prompt.id='hotelPrompt146';prompt.hidden=true;document.body.append(prompt);
  top=document.createElement('section');top.id='hotelTop146';top.hidden=true;top.innerHTML='<div><strong>GRAND PLAZA HOTEL</strong><span>Guest Services</span></div><progress max="8" value="0" aria-label="Check-in progress"></progress><output aria-label="Service score">0 / 100</output>';
  top.append(button('Look at guest','user-round',()=>lookAt('guest'),true),button('Look at computer','monitor',()=>lookAt('computer'),true),button('Restart practice','rotate-ccw',reset,true),button('Leave reception','x',leave,true));document.body.append(top);
  dialog=document.createElement('aside');dialog.id='hotelGuest146';dialog.hidden=true;dialog.setAttribute('aria-label','Guest conversation');document.body.append(dialog);
  panel=document.createElement('section');panel.id='hotelComputer146';panel.hidden=true;panel.setAttribute('aria-label','Reception computer');panel.innerHTML='<div class="h146-system"><strong>ARRIVALS</strong><span>Training reservation</span></div><h2 data-stage></h2><dl><div><dt>Guest</dt><dd>Jordan Ellis</dd></div><div><dt>Booking</dt><dd>AGP-2048</dd></div><div><dt>Stay</dt><dd>2 nights / King</dd></div><div><dt>Request</dt><dd>Quiet / One dog</dd></div><div><dt>Room</dt><dd data-room>Unassigned</dd></div><div><dt>ID / payment</dt><dd data-id>Pending</dd></div></dl><div class="h146-total"><span>2 x $189 + $50 pet fee</span><strong>$428</strong></div><div data-content></div>';document.body.append(panel);
  canvas.addEventListener('pointerdown',e=>{if(!active)return;e.preventDefault();e.stopImmediatePropagation();canvas.focus();canvas.setPointerCapture(e.pointerId);lookDrag={id:e.pointerId,x:e.clientX,y:e.clientY};},true);
  canvas.addEventListener('pointermove',e=>{if(!active||lookDrag?.id!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();player.yaw-=(e.clientX-lookDrag.x)*.004;state.pitch=Math.max(-.65,Math.min(.85,state.pitch-(e.clientY-lookDrag.y)*.003));lookDrag={id:e.pointerId,x:e.clientX,y:e.clientY};updateCamera(0,true);},true);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(lookDrag?.id===e.pointerId)lookDrag=null;},true);
 }
 function handleKey(e,type){if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName))return false;
  if(!active){if(type==='keydown'&&e.key.toLowerCase()==='t'&&available()&&(nearKiosk()||nearDesk())){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)enter();return true;}return false;}
  if(type==='keydown'&&!e.repeat){if(e.key==='Escape')leave();else if(/^[123]$/.test(e.key))choose(Number(e.key)-1);else if(e.key==='Enter'&&pending)next();}
  if(type==='keydown'){if(e.key==='ArrowLeft')player.yaw+=.09;else if(e.key==='ArrowRight')player.yaw-=.09;else if(e.key==='ArrowUp')state.pitch=Math.min(.85,state.pitch+.06);else if(e.key==='ArrowDown')state.pitch=Math.max(-.65,state.pitch-.06);}
  if(e.target?.closest?.('#hotelComputer146,#hotelTop146')&&['Tab','Enter',' '].includes(e.key))return false;e.preventDefault();e.stopImmediatePropagation();return true;
 }
 function collider(name,min,max,base=C.origin){const vertices=[];for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])for(const x of [min[0],max[0]])vertices.push(...add(base,[x,y,z]));registerCollider('Hotel146 '+name,'hotelInterior',new Float32Array(vertices),new Uint32Array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]),false,{});baselineColliders.push(colliders.at(-1));}
 async function init(){try{ui();await scene.init();for(const c of scene.contacts)collider(c.name,c.lo,c.hi);collider('reception desk',[-2.982,0,-3.026],[-2.178,.595,.026]);collider('Hospitality reception desk',[-1.758,0,-.402],[1.758,.595,.402],C.kiosk);
   // Derive furniture contacts from the same transforms used to draw them.
   for(const [name,position,scale,yaw] of [...C.reading153,...C.waiting154]){
    const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
    for(const part of scene.models[name]){
     const matrix=mm(transform(position,[scale,scale,scale],0,yaw),part.matrix);
     for(let i=0;i<part.positions.length;i+=3){const p=tp(matrix,...part.positions.subarray(i,i+3));for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}}
    }
    collider('furniture '+name,lo,hi);
   }
   for(const [name,p] of [C.doorman154,C.staff154])collider(name,add(p,[-.10,0,-.10]),add(p,[.10,.72,.10]));
   for(const part of scene.models[C.stairs.asset]){const matrix=mm(transform(scene.at(C.stairs.position),C.stairs.scale,0,C.stairs.yaw),part.matrix),vertices=new Float32Array(part.positions.length);for(let i=0;i<vertices.length;i+=3)vertices.set(tp(matrix,...part.positions.subarray(i,i+3)),i);registerCollider('Hotel146 supplied wooden stairs','hotelInterior',vertices,part.indices,false,{});baselineColliders.push(colliders.at(-1));}
   for(const part of scene.models['revolving-door'].filter(p=>p.name==='door-frame')){const matrix=mm(transform(scene.at([0,0,C.door151.z]),[1,1,1]),part.matrix),vertices=new Float32Array(part.positions.length);for(let i=0;i<vertices.length;i+=3)vertices.set(tp(matrix,...part.positions.subarray(i,i+3)),i);registerCollider('Hotel152 revolving door frame','hotelInterior',vertices,part.indices,false,{});baselineColliders.push(colliders.at(-1));}
   collider('upper hotel stories',[C.envelope151.lo[0],5.7,C.envelope151.lo[2]],C.envelope151.hi);
   refreshShipments();Crowd.invalidate();ready=true;refresh();if(new URLSearchParams(location.search).get('challenge')==='hotel')visit();
  }catch(e){error=e.message;console.error('Hotel146',e);if(prompt){prompt.hidden=false;prompt.textContent='Hotel assets unavailable - reload to retry';prompt.disabled=true;}}
 }
 function update(dt){if(!ready)return;scene.update(dt);if(active)return;const near=nearKiosk();if(!near)autoArmed=true;prompt.hidden=!available()||!(near||nearDesk());if(near&&autoArmed&&available()&&distance(player.position,add(C.kiosk,C.kioskDesk.approach))<.4)enter();}
 return {init,update,enter,exit:leave,visit,handleKey,cameraView,get active(){return active;},draw:p=>scene.draw(game.state,p),snapshot:()=>({...JSON.parse(JSON.stringify(game.state)),ready,error,active,view,pending,scene:scene.snapshot()}),test:{game,scene,choose,next,reset,nearKiosk,nearDesk}};
})();
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,view=updateCamera,walk=advancePlayer;
 RobotExhibit20.draw=function(p){draw(p);Hotel146.draw(p);};RobotExhibit20.update=function(dt){update(dt);Hotel146.update(dt);};
 updateCamera=function(dt,immediate=false){if(!Hotel146.cameraView())view(dt,immediate);};advancePlayer=function(...args){if(Hotel146.active){keys.clear();player.walkAmount=0;return;}return walk(...args);};
 const start=()=>{if(!state.ready||!Hospitality140.snapshot().ready||!window.lucide){setTimeout(start,250);return;}Hotel146.init();};start();
}
