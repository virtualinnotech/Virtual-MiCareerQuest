/* Manufacturing robot cell, using the venue renderer and navigation system. */
const Robotics37=(()=>{
 'use strict';
 // Align the enclosure with the inside faces of Manufacturing's corner curtains.
 const SCALE=.6,X=9.06+2.5*SCALE,Z=-24.54+2.2*SCALE,Y=.24,bounds=[X-2.5*SCALE,Z-2.2*SCALE,X+2.5*SCALE,Z+2.2*SCALE],consolePoint=[X-.9*SCALE,Z+2.6*SCALE];
 const robot=RobotCore37.create(),s=robot.state,steel=[.20,.24,.25,1],orange=[.95,.27,.025,1],blue=[.025,.34,.65,1],silver=[.55,.62,.65,1];
 let ready=false,active=false,saved,cube,cylinder,beaconBeam,clock=0,speed=1,panel,prompt,lastUI='',staticParts=[],screenTexture;
 const world=p=>[X+p[0]*SCALE,Y+p[1]*SCALE,Z+p[2]*SCALE],busy=()=>['running','dropping'].includes(s.phase);
 const other=()=>window.Farming36?.mounted||window.Forklift34?.mounted||window.Ambulance35?.mounted;
 function signal(){return {color:busy()?'yellow':s.tested||s.phase==='complete'?'green':'red',lit:clock%1<.5};}
 const near=()=>ready&&!other()&&!state.overview&&Math.hypot(player.position[0]-consolePoint[0],player.position[2]-consolePoint[1])<1.15&&Math.abs(player.position[1]-Y)<1.5;
 const box=(p,size,color,rx=0,ry=0)=>drawBatch(cube,transform(world(p),mul(size,SCALE),rx,ry),false,color);
 function cylinderMesh(){
  const v=[],idx=[],n=24;
  for(let i=0;i<n;i++){
   const a=i/n*2*Math.PI,b=(i+1)/n*2*Math.PI,base=v.length/6;
   for(const [angle,y] of [[a,-.5],[b,-.5],[b,.5],[a,.5]])v.push(Math.cos(angle),y,Math.sin(angle),Math.cos(angle),0,Math.sin(angle));
   idx.push(base,base+1,base+2,base,base+2,base+3);
   for(const side of [-1,1]){const q=v.length/6;v.push(0,side*.5,0,0,side,0,Math.cos(a),side*.5,Math.sin(a),0,side,0,Math.cos(b),side*.5,Math.sin(b),0,side,0);idx.push(q,q+1,q+2);}
  }
  return uploadBatch(new Float32Array(v),new Uint32Array(idx),{rough:.4,metal:.4});
 }
 function rod(a,b,r,color,mesh=cylinder){
  const axis=norm(sub(b,a)),u=norm(cross(Math.abs(axis[1])>.95?[1,0,0]:[0,1,0],axis)),w=cross(u,axis),p=world(mul(add(a,b),.5)),l=len(sub(b,a));
  drawBatch(mesh,[...mul(u,r*SCALE),0,...mul(axis,l*SCALE),0,...mul(w,r*SCALE),0,...p,1],false,color);
 }
 function sphere(p,r,color){drawBatch(avatarSphere,transform(world(p),[r*SCALE,r*SCALE,r*SCALE]),false,color);}
 function collider(name,lo,hi){
  const p=new Float32Array([lo[0],lo[1],lo[2],hi[0],lo[1],lo[2],hi[0],hi[1],lo[2],lo[0],hi[1],lo[2],lo[0],lo[1],hi[2],hi[0],lo[1],hi[2],hi[0],hi[1],hi[2],lo[0],hi[1],hi[2]]);
  registerCollider(name,'solidCollider',p,new Uint32Array([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5]),false,{});
  baselineColliders.push(colliders.at(-1));
 }
 async function init(){
  await RobotConsole37.load();
  cube=createCube();cylinder=cylinderMesh();
  const beamVertices=[],beamIndices=[];
  for(let i=0;i<16;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8,n=beamVertices.length/6;beamVertices.push(0,-.5,0,0,1,0,Math.cos(a),.5,Math.sin(a),0,1,0,Math.cos(b),.5,Math.sin(b),0,1,0);beamIndices.push(n,n+1,n+2);}
  beaconBeam=uploadBatch(new Float32Array(beamVertices),new Uint32Array(beamIndices),{unlit:true,color:[1,1,1,1]});
  const addBox=(p,size,color)=>staticParts.push({p,size,color});
  addBox([0,.015,0],[5,.03,4.4],[.27,.30,.30,1]);
  for(const x of [-2.45,2.45])addBox([x,.04,0],[.055,.02,4.3],[.9,.72,.035,1]);
  for(const z of [-2.15,2.15])addBox([0,.04,z],[4.85,.02,.055],[.9,.72,.035,1]);
  for(const x of [-2.5,0,2.5])for(const z of [-2.2,2.2]){addBox([x,1,z],[.065,2,.065],steel);addBox([x,.07,z],[.22,.10,.22],steel);}
  for(const x of [-2.5,2.5])for(const h of [.12,1.98])addBox([x,h,0],[.06,.055,4.4],steel);
  for(const z of [-2.2,2.2])for(const h of [.12,1.98])addBox([0,h,z],[5,.055,.06],steel);
  // Reserve the entire enclosed cell; the console remains reachable outside it.
  collider('Robotics37 enclosed cell',[bounds[0],Y,bounds[1]],[bounds[2],Y+2*SCALE,bounds[3]]);
  collider('Robotics37 controller',[consolePoint[0]-.15,Y,consolePoint[1]-.12],[consolePoint[0]+.15,Y+.66,consolePoint[1]+.12]);
  addBox([0,.29,0],[.65,.58,.65],steel);
  for(const z of [-1.6,.35])for(const x of [-1.75,-.95])addBox([x,.40,z],[.07,.8,.07],steel);
  addBox([-1.35,.86,-.65],[.91,.14,2.8],silver);addBox([-1.35,.945,-.65],[.73,.045,2.75],[.055,.07,.08,1]);
  for(const x of [-1.82,-.88])addBox([x,.98,-.65],[.055,.14,2.85],silver);
  addBox([1.15,.88,.32],[.85,.13,1.62],silver);
  for(const x of [.79,1.51])for(const z of [-.4,1.05])addBox([x,.43,z],[.055,.86,.055],steel);
  for(let i=0;i<3;i++){const p=RobotCore37.slot(i);addBox([p[0],.965,p[2]],[.31,.045,.28],[.09,.12,.13,1]);
   for(const dx of [-.18,.18])addBox([p[0]+dx,.99,p[2]],[.035,.075,.35],silver);
  }
  const screen=document.createElement('canvas');screen.width=512;screen.height=256;const ctx=screen.getContext('2d');ctx.fillStyle='#08242c';ctx.fillRect(0,0,512,256);ctx.fillStyle='#63e0d0';ctx.font='bold 32px Arial';ctx.fillText('ROBOT CONTROL',26,52);ctx.font='23px Arial';ctx.fillText('Robotic Error Challenge',26,100);ctx.fillStyle='#e8ffff';ctx.fillText('Press T to begin',26,190);
  screenTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,screenTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,screen);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const p=[-.9,.87,2.591],positions=[[-.184,-.184],[.184,-.184],[.184,.184],[-.184,.184]],v=[];
  for(const [x,y] of positions)v.push(...world([p[0]+x,p[1]+y,p[2]]),0,0,1);
  screenTexture=uploadBatch(new Float32Array(v),new Uint32Array([0,1,2,0,2,3]),{uv:new Float32Array([0,1,1,1,1,0,0,0]),baseTexture:screenTexture,unlit:true,color:[1,1,1,1]});
  ui();ready=true;refreshShipments();Crowd.invalidate();RobotExhibit20.invalidate();
  if(new URLSearchParams(location.search).get('challenge')==='robotics')visit();
 }
 function visit(){if(!ready||other()||active)return;places.robotics37={label:'Manufacturing: robotics challenge',p:[consolePoint[0],Y+PHYSICS.radii[1]+.015,consolePoint[1]+.8],scaledPlayer:true,yaw:0};teleport('robotics37');state.radius=3;updateCamera(0,true);}
 function enter(){
  if(active||!near()||state.paused||HubGuide.snapshot().dialogOpen)return;
  saved={radius:state.radius,pitch:state.pitch,orbitYaw:state.orbitYaw,firstPerson:state.firstPerson,overview:state.overview};active=true;keys.clear();player.walkAmount=0;
  document.body.classList.add('robotics37-active');panel.hidden=false;updateUI(true);updateCamera(0,true);$('robotTest37').focus();
 }
 function exit(){if(!active)return;robot.stop();active=false;keys.clear();Object.assign(state,saved);document.body.classList.remove('robotics37-active');panel.hidden=true;$('robotFeedback37').hidden=true;updateCamera(0,true);canvas.focus();}
 function cameraView(){
  if(!active)return false;
  const center=world([-.1,1,0]),dir=norm([.35,.48,1]),distance=8.5*SCALE;
  const right=norm(cross([0,1,0],dir)),up=norm(cross(dir,right));
  const offset=mul(right,distance*Math.tan(Math.PI/6)*(canvas.clientWidth/canvas.clientHeight)*.5);
  target=add(center,offset);camera=add(target,mul(dir,distance));return true;
 }
 function update(dt){
  if(!ready)return;clock+=dt;
  if(active&&!state.paused&&!HubGuide.snapshot().dialogOpen)robot.tick(Math.min(dt,.05),s.mode==='test'?speed:1);
  prompt.hidden=active||!near();if(active)updateUI();
 }
 function component(p,angle=0){
  box(p,[.23,.10,.19],blue,0,angle);
  for(const dx of [-.065,.065])rod([p[0]+dx,p[1]+.05,p[2]],[p[0]+dx,p[1]+.053,p[2]],.025,[.015,.045,.065,1]);
 }
 function draw(planes){
  if(!ready||!sphereVisible(world([0,1,0]),4*SCALE,planes))return;
  gl.disable(gl.CULL_FACE);
  for(const p of staticParts)box(p.p,p.size,p.color);
  RobotConsole37.draw(transform([consolePoint[0]-2.013*.085,Y+3.31029*.085,consolePoint[1]+1.91*.085],[.085,.085,.085]));
  drawBatch(screenTexture);
  for(let i=0;i<14;i++){const z=-2+((i*.2+(busy()?clock*.23:0))%2.7);box([-1.35,.971,z],[.71,.012,.015],[.2,.23,.24,1]);}
  for(let i=0;i<3;i++)component([-1.35,1.035,-2+((i*.35+(busy()?clock*.12:0))%1.05)]);
  for(let i=0;i<s.completed;i++)component(RobotCore37.slot(i));
  if(s.held||s.completed===0||busy())component(s.part,s.phase==='dropping'?clock*2:0);
  const shoulder=[0,1.03,0],wrist=add(s.tcp,[0,.19,0]),d=sub(wrist,shoulder),distance=Math.min(len(d),2.39),direction=norm(d),bend=norm(sub([0,1,0],mul(direction,direction[1])));
  const elbow=add(add(shoulder,mul(direction,distance*.5)),mul(bend,Math.sqrt(Math.max(.01,1.25**2-(distance*.5)**2))));
  rod([0,.58,0],[0,.76,0],.30,orange);rod([0,.76,0],shoulder,.19,orange);
  rod(shoulder,elbow,.12,orange);rod(elbow,wrist,.105,orange);
  rod(add(shoulder,[.08,0,.10]),add(elbow,[.08,0,.10]),.035,steel);rod(add(elbow,[.08,0,.10]),add(wrist,[.08,0,.10]),.028,steel);
  for(const p of [shoulder,elbow,wrist]){sphere(p,.16,orange);rod(add(p,[-.17,0,0]),add(p,[.17,0,0]),.10,steel);}
  rod(wrist,add(s.tcp,[0,.09,0]),.10,steel);
  const gap=s.closed?.13:.30;
  for(const side of [-1,1]){box([s.tcp[0]+side*gap/2,s.tcp[1]+.035,s.tcp[2]],[.04,.19,.065],silver);}
  rod([2.25,1.98,1.98],[2.25,2.38,1.98],.035,steel);
  const lamp=signal();
  const colors=[[1,.025,.025,1],[1,.7,.015,1],[.035,1,.25,1]],selected=['red','yellow','green'].indexOf(lamp.color),angle=clock*Math.PI*2;
  for(let i=0;i<3;i++){const on=i===selected,color=colors[i];cylinder.unlit=on;rod([2.25,2.15+i*.14,1.98],[2.25,2.28+i*.14,1.98],.105,on?color.map((c,k)=>k===3?c:c*(lamp.lit?1:.4)):color.map((c,k)=>k===3?c:c*.12));}cylinder.unlit=false;
  // Twin rotating reflector beams, with a bright core and soft additive glow.
  const bulb=[2.25,2.215+selected*.14,1.98],color=colors[selected],oldUnlit=avatarSphere.unlit;
  avatarSphere.unlit=true;
  for(const side of [-1,1])sphere(add(bulb,[Math.cos(angle)*.11*side,0,Math.sin(angle)*.11*side]),.045,[1,.9,.75,1]);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);
  const eyeAngle=Math.atan2(camera[2]-world(bulb)[2],camera[0]-world(bulb)[0]),flare=Math.pow(Math.abs(Math.cos(angle-eyeAngle)),14);
  sphere(bulb,.19,[...color.slice(0,3),.1+flare*.4]);
  for(const side of [-1,1])rod(bulb,add(bulb,[Math.cos(angle)*1.05*side,0,Math.sin(angle)*1.05*side]),.19,[...color.slice(0,3),.13+flare*.1],beaconBeam);
  avatarSphere.unlit=oldUnlit;gl.depthMask(true);gl.disable(gl.BLEND);
  // Draw transparent safety panels last so the machinery remains visible through them.
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  for(const x of [-2.5,2.5])box([x,1.05,0],[.02,1.8,4.32],[.45,.78,.82,.09]);
  for(const z of [-2.2,2.2])box([0,1.05,z],[4.94,1.8,.02],[.45,.78,.82,.09]);
  gl.depthMask(true);gl.disable(gl.BLEND);
 }
 function updateUI(force=false){
  const key=[s.phase,s.index,s.completed,s.message,s.program.join(',')].join('|');if(!force&&key===lastUI)return;lastUI=key;
  $('robotStatus37').textContent=s.message;$('robotStatus37').dataset.phase=s.phase;
  $('robotFeedback37').hidden=!active||!['failed','passed','complete','stopped'].includes(s.phase);$('robotFeedbackMessage37').textContent=s.message;$('robotFeedback37').dataset.phase=s.phase;
  $('robotOk37').hidden=!['passed','complete'].includes(s.phase);
  $('robotCount37').textContent=s.mode==='test'?'Test cycle':s.completed+' / 3 components';
  $('robotRun37').disabled=!s.tested||busy()||s.phase==='complete';$('robotTest37').disabled=busy()||s.phase==='complete';$('robotStop37').disabled=!busy();$('robotReset37').disabled=busy();
  const list=$('robotCommands37');list.replaceChildren();
  s.program.forEach((id,i)=>{
   const row=document.createElement('li'),failed=['failed','dropping'].includes(s.phase)&&i===Math.min(s.index,s.program.length-1);
   row.className=failed?'error':s.phase==='editing'?'':i<s.index?'done':s.phase==='running'&&i===s.index?'current':'';
   if(row.className==='current')row.setAttribute('aria-current','step');
   if(row.className==='error')row.setAttribute('aria-label','Step '+(i+1)+' failed: '+RobotCore37.commands[id]);
   row.draggable=!busy()&&s.phase!=='complete';
   const number=document.createElement('span');number.className='step';number.textContent=i+1;
   const name=document.createElement('span');name.className='command-name';name.textContent=RobotCore37.commands[id];row.append(number,name);
   for(const [d,symbol] of [[-1,'↑'],[1,'↓']]){const b=document.createElement('button');b.textContent=symbol;b.title=(d<0?'Move up: ':'Move down: ')+name.textContent;b.setAttribute('aria-label',b.title);b.disabled=busy()||s.phase==='complete'||i+d<0||i+d>=s.program.length;b.onclick=()=>{robot.move(i,d);updateUI(true);};row.append(b);}
   row.ondragstart=e=>e.dataTransfer.setData('text/plain',String(i));row.ondragover=e=>e.preventDefault();row.ondrop=e=>{e.preventDefault();let from=Number(e.dataTransfer.getData('text/plain'));if(!Number.isInteger(from)||from<0||from>=s.program.length)return;while(from!==i){const d=Math.sign(i-from);if(!robot.move(from,d))break;from+=d;}updateUI(true);};list.append(row);
  });
 }
 function ui(){
  const style=document.createElement('style');style.textContent=`
   #robotController37{position:fixed;inset:0 0 0 50%;z-index:100;background:#09272e;color:#efffff;border-left:2px solid #29c5b5;padding:24px;overflow:auto;font:15px Arial;letter-spacing:0;box-sizing:border-box}
   #robotController37 header{position:static;inset:auto;transform:none;width:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;background:none;padding:0;border:0}#robotController37 h2{font-size:26px;margin:14px 0 8px;line-height:1.15}#robotController37 .eyebrow{color:#7fdfd3;font-size:12px;font-weight:bold}
   #robotController37 button{background:#17414a;color:#edffff;border:1px solid #56838a;border-radius:4px;min-height:36px;padding:7px 12px;cursor:pointer;font:inherit}#robotController37 button:disabled{opacity:.4;cursor:default}#robotController37 button:focus-visible{outline:3px solid #f2c54b;outline-offset:2px}
   #robotController37 p{line-height:1.5;margin:8px 0 16px;color:#c4dddd}#robotCommands37{list-style:none;padding:0;margin:12px 0;display:grid;gap:7px}#robotCommands37 li{display:grid;grid-template-columns:28px minmax(0,1fr) 36px 36px;align-items:center;gap:8px;background:#12343b;border:1px solid #3b6067;border-radius:4px;padding:7px 10px;min-height:44px;box-sizing:border-box}#robotCommands37 li.current{background:#1b5859;border-color:#62ead4}#robotCommands37 button{padding:0;width:36px;height:32px;min-height:32px}#robotCommands37 .step{color:#76dece;font-variant-numeric:tabular-nums}#robotCommands37 .command-name{overflow-wrap:anywhere}
   #robotActions37{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}#robotTest37,#robotRun37{background:#007b78!important}#robotStop37{background:#97372e!important}#robotStatus37{padding:12px 0;line-height:1.45;border-top:1px solid #426169;color:#b3ebde}#robotStatus37[data-phase=failed]{color:#ffb4a5}#robotStatus37[data-phase=complete]{color:#8ef5b1}#robotSpeed37{accent-color:#52d7c6;max-width:180px;width:40%;vertical-align:middle}
   #robotCommands37 li.done,#robotCommands37 li.current{border-color:#43c879;background:#175536;color:#effff4}#robotCommands37 li.current{box-shadow:inset 3px 0 #8effad}#robotCommands37 li.done .step,#robotCommands37 li.current .step{color:#a4ffc0}
   #robotCommands37 li.error{border-color:#ff7979;background:#842d32;color:#fff}#robotCommands37 li.error .step{color:#fff}
   #robotPrompt37{position:fixed;bottom:105px;left:50%;transform:translateX(-50%);z-index:40;background:#123a42;color:white;border:1px solid #69cfc3;padding:12px 18px;border-radius:4px}
   #robotFeedback37{position:fixed;left:16px;bottom:110px;width:calc(50% - 32px);box-sizing:border-box;padding:16px;background:#123c35;color:#dbfff2;border:1px solid #68c8a8;border-radius:4px;z-index:101;font:15px/1.45 Arial}#robotFeedback37[data-phase=failed],#robotFeedback37[data-phase=stopped]{background:#4c2420;border-color:#eb998a;color:#fff0ed}#robotFeedback37[hidden]{display:none!important}
   #robotController37[hidden],#robotPrompt37[hidden]{display:none!important}body.robotics37-active #forkliftPanel34,body.robotics37-active #farmPanel36,body.robotics37-active #ambulancePanel35,body.robotics37-active #forkliftPrompt34,body.robotics37-active #farmPrompt36,body.robotics37-active #ambulancePrompt35{display:none!important}
   body.robotics37-active > header,body.robotics37-active #skillHud,body.robotics37-active #missionIconBtn,body.robotics37-active #controlsIconBtn,body.robotics37-active #touchControls,body.robotics37-active #rightTools,body.robotics37-active #leftTools{display:none!important}
   @media(max-height:850px) and (min-width:761px){#robotController37{padding:16px}#robotController37 h2{font-size:23px;margin:9px 0}#robotCommands37{gap:4px;margin:8px 0}#robotCommands37 li{min-height:39px;padding:3px 8px}#robotController37 p{margin:6px 0 10px}#robotActions37{margin:10px 0}}
   
   #robotController37{inset:auto;border:0;padding:9px 12px;background:#09252d;font:12px Arial;box-shadow:inset 0 0 18px #031418;scrollbar-width:thin;scrollbar-color:#45878b #09252d}
   #robotController37 header{gap:5px}#robotController37 .eyebrow{font-size:9px}#robotController37 h2{font-size:17px;margin:4px 0}#robotController37 p{font-size:11px;line-height:1.3;margin:4px 0 6px}
   #robotController37 button{min-height:25px;padding:3px 6px;font-size:11px;border-radius:2px}#robotCommands37{gap:2px;margin:5px 0;grid-template-columns:1fr}#robotCommands37 li{grid-template-columns:16px minmax(0,1fr) 25px 25px;min-height:32px;padding:2px 4px;gap:3px;font-size:11px}#robotCommands37 button{width:25px;height:25px;min-height:25px}#robotActions37{margin:7px 0;gap:5px}#robotStatus37{padding:6px 0;font-size:11px;line-height:1.3}
   
   #robotController37{padding:8px 10px;overflow:hidden;font:12px Arial}#robotController37 header{height:22px}#robotController37 .eyebrow{font-size:9px}#robotController37 h2{font-size:16px;margin:3px 0}#robotController37 p{font-size:11px;line-height:13px;margin:3px 0}#robotCount37{font-size:10px;line-height:13px}#robotCommands37{gap:2px;margin:4px 0;grid-template-columns:1fr}#robotCommands37 li{height:22px;min-height:22px;padding:0 5px;grid-template-columns:20px minmax(0,1fr) 26px 26px;font-size:12px}#robotCommands37 button{height:20px;min-height:20px;width:26px}#robotController37 button{font-size:11px}#robotActions37{margin:4px 0;gap:4px}#robotStatus37{padding:3px 0;font-size:10px;line-height:12px}#robotController37 label{font-size:11px}
  `;document.head.append(style);
  panel=document.createElement('section');panel.id='robotController37';panel.hidden=true;panel.setAttribute('aria-label','Robot controller');panel.innerHTML=`<header><span class="eyebrow">MANUFACTURING / ROBOTICS TECHNICIAN</span><button id="robotExit37" title="Leave controller (T or Escape)" aria-label="Leave controller">&#10005;</button></header><h2>Robotic Error Challenge</h2><p>Troubleshoot the robot. Rearrange the commands, test your sequence, and repair the error before running production.</p><div id="robotCount37">Test cycle</div><ol id="robotCommands37"></ol><label for="robotSpeed37">Test speed <input id="robotSpeed37" type="range" min="0.5" max="1.5" step="0.25" value="1"><output id="robotSpeedValue37">1×</output></label><div id="robotActions37"><button id="robotTest37">&#9654; Test cycle</button><button id="robotRun37">&#9654;&#9654; Run production</button><button id="robotStop37">&#9632; Emergency stop</button><button id="robotReset37" title="Reset challenge">&#8634; Reset</button></div><div id="robotStatus37" role="status" aria-live="polite"></div>`;document.body.append(panel);
  prompt=document.createElement('button');prompt.id='robotPrompt37';prompt.hidden=true;prompt.textContent='Press T - Robotic Error Challenge';prompt.onclick=enter;document.body.append(prompt);
  const feedback=document.createElement('div');feedback.id='robotFeedback37';feedback.hidden=true;
  const message=document.createElement('div');message.id='robotFeedbackMessage37';message.setAttribute('role','status');feedback.append(message);
  const ok=document.createElement('button');ok.id='robotOk37';ok.type='button';ok.textContent='Ok';ok.hidden=true;ok.onclick=exit;ok.style.cssText='margin-top:10px;min-width:72px;min-height:36px;padding:6px 16px;background:#dbfff2;color:#123c35;border:1px solid #68c8a8;border-radius:4px;font:inherit;cursor:pointer';feedback.append(ok);document.body.append(feedback);
  $('robotTest37').onclick=()=>{robot.start('test');updateUI(true);};$('robotRun37').onclick=()=>{robot.start('production');updateUI(true);};$('robotStop37').onclick=()=>{robot.stop();updateUI(true);};$('robotReset37').onclick=()=>{robot.reset();updateUI(true);};$('robotExit37').onclick=exit;
  $('robotSpeed37').oninput=e=>{speed=Number(e.target.value);$('robotSpeedValue37').textContent=speed+'×';};
  const visitButton=document.createElement('button');visitButton.textContent='Robotics challenge';visitButton.id='robotVisit37';visitButton.onclick=visit;($('robotsPanel20')||$('rightTools')).append(visitButton);
  window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const k=e.key.toLowerCase();if(k==='t'&&(active||near())){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)(active?exit:enter)();}else if(active&&k==='escape'){e.preventDefault();e.stopImmediatePropagation();exit();}else if(active&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)){e.stopImmediatePropagation();}},true);
  window.addEventListener('blur',()=>{if(active){robot.stop();updateUI(true);}});
 }
 function crowdObstacles(){return ready?[[[bounds[0]-.2,bounds[1]-.2],[bounds[2]+.2,bounds[1]-.2],[bounds[2]+.2,bounds[3]+.2],[bounds[0]-.2,bounds[3]+.2]]]:[];}
 return {init,update,draw,visit,enter,exit,cameraView,crowdObstacles,drawConsoleView(){if(active)RobotConsole37.closeup(panel);},get active(){return active;},snapshot:()=>({ready,active,signal:signal(),...structuredClone(s)}),test:{robot,bounds,consolePoint}};
})();
window.Robotics37=Robotics37;
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,walk=advancePlayer,view=updateCamera,grid=CrowdCore.buildGrid;
 RobotExhibit20.draw=function(planes){draw(planes);Robotics37.draw(planes);};
 RobotExhibit20.update=function(dt){update(dt);Robotics37.update(dt);};
 advancePlayer=function(dt,input){if(!Robotics37.active)walk(dt,input);};
 updateCamera=function(dt,immediate=false){if(!Robotics37.cameraView())view(dt,immediate);};
 CrowdCore.buildGrid=function(base,polygons=[],staff=[]){return grid(base,[...polygons,...Robotics37.crowdObstacles()],staff);};
 const start=()=>{if(!state.ready||window.Farming36?.snapshot().status!=='ready'){setTimeout(start,250);return;}Robotics37.init().catch(e=>console.error('Robotics challenge:',e));};start();
}
