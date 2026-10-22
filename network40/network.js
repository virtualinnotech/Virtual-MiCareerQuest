const Network40=(()=>{
 const G=NetworkScene40,game=NetworkCore40.create(),s=game.state,C=[-18,.24,-16],extent=[-20.8,-18.8,-15.2,-13.2],rackScale=.65;
 const racks=Array.from({length:9},(_,i)=>[C[0]-.41+(i%3)*.41,C[1],C[2]-1.8+Math.floor(i/3)*1.4]);
 const entrance=[C[0],C[1],extent[3]],swing=[{angle:0,velocity:0,side:1},{angle:0,velocity:0,side:1}];
 // Match the diagnostics cabinet to the racks, then size its laptop independently.
 const consoleScale=rackScale,laptopScale=.75,laptopAnchor=[0,2.3414545*.25,1.0681589*.23];
 const laptopFit=mm(transform(mul(laptopAnchor,1-laptopScale)),transform([0,0,0],[laptopScale,laptopScale,laptopScale]));
 let annexWall,entryDoor,entryGlass,entrySign,doorContact=false;
 const computer=[extent[2]-.38,C[1],C[2]+1.55],computerApproach=add(computer,[-.65,0,0]),beacons=[[-2.5,-2.5],[2.5,-2.5],[-2.5,2.5],[2.5,2.5]].map(([x,z])=>[C[0]+x,C[1]+1.45,C[2]+z]);
 let ready=false,error=null,room=[],rackModel=[],consoleModel=[],floor=[],patches=[],labels=[],portNumbers,doorFrame,doorGlass,bulb,cube,beam,screen,screenKey='',notice,actions,cableButton,consolePanel,inside=false,lastUI='',repairTarget=null;
 const lights={},clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),world=(r,p)=>add(racks[r],mul(p,rackScale));
 function inRoom(){return ready&&!state.overview&&player.position[0]>extent[0]&&player.position[0]<extent[2]&&player.position[2]>extent[1]&&player.position[2]<extent[3]-.12&&Math.abs(player.position[1]-C[1])<1.3;}
 function blocked(){return state.paused||window.CharacterInspector?.active||window.Robotics37?.active||window.Crane39?.active||window.Forklift34?.mounted||window.Farming36?.mounted||window.Ambulance35?.mounted||window.HubGuide?.snapshot().dialogOpen;}
 function nearest(){if(!inside||blocked())return -1;let best=-1,dist=.95;racks.forEach((p,i)=>{const d=Math.hypot(player.position[0]-p[0],player.position[2]-(p[2]+.42));if(player.position[2]>p[2]+.18&&d<dist){best=i;dist=d;}});return best;}
 function atComputer(){return inside&&!blocked()&&player.position[0]<computer[0]-.15&&Math.hypot(player.position[0]-computerApproach[0],player.position[2]-computerApproach[2])<.7;}
 function solid(name,lo,hi){const v=[];for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]])for(const x of [lo[0],hi[0]])v.push(x,y,z);registerCollider('Network40 '+name,'solidCollider',new Float32Array(v),new Uint32Array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]),false,{});baselineColliders.push(colliders.at(-1));}
 function obstacles(){for(let i=0;i<racks.length;i++){solid('rack '+(i+1),world(i,[-.31,0,-.24]),world(i,[.31,1.3,.24]));}
  solid('annex floor',[extent[0],C[1]-.10,extent[1]],[extent[2],C[1],extent[3]+.15]);
  solid('IT south wall west',[-21.9,0,-13.3125],[C[0]-.65,10.35,-13.0875]);
  solid('IT south wall east',[C[0]+.65,0,-13.3125],[-5.1,10.35,-13.0875]);
  solid('IT door lintel',[C[0]-.65,C[1]+1.25,-13.3125],[C[0]+.65,10.35,-13.0875]);
  solid('computer',add(computer,mul([-.55,0,-.23],consoleScale)),add(computer,mul([.25,1.29,.23],consoleScale)));
  solid('back wall',[extent[0],C[1],extent[1]],[extent[2],C[1]+1.5,extent[1]+.08]);solid('left wall',[extent[0],C[1],extent[1]],[extent[0]+.08,C[1]+1.5,extent[3]]);
  solid('right wall',[extent[2]-.08,C[1],extent[1]],[extent[2],C[1]+1.5,extent[3]]);
  refreshShipments();Crowd.invalidate();RobotExhibit20.invalidate();
 }
 function build(){
  cube=createCube();bulb=createSphere();
  const tiles=new G.Mesh([.67,.71,.71,1]),grid=new G.Mesh([.35,.4,.42,1]),metal=new G.Mesh([.27,.3,.32,1]),red=new G.Mesh([.65,.045,.035,1]);
  tiles.plane([0,.0003,0],[5.6,5.6]);for(let v=-2.8;v<2.81;v+=.4){grid.plane([v,.0006,0],[.006,5.6]);grid.plane([0,.0006,v],[5.6,.006]);}
  // Cable trays and red overhead pipework echo the supplied server-room reference.
  for(const x of [-1.6,-.25,1.1]){metal.box([x,1.5,-.7],[.23,.045,3.5]);for(let z=-2.35;z<1;z+=.18)grid.box([x,1.54,z],[.25,.025,.025]);red.line([x,1.7,-2.5],[x,1.7,1.1],.04);}
  red.line([-2.5,1.7,-2.5],[2.5,1.7,-2.5],.04);for(const x of [-2.5,2.5])red.line([x,1.7,-2.5],[x,.1,-2.5],.04);
  for(const x of [-2.5,2.5])for(const z of [-2.5,2.5])metal.box([x,.70,z],[.055,1.40,.055]);
  floor=[tiles.build(),grid.build(),metal.build(),red.build()];
  const walls=new G.Mesh([.43,.48,.50,1]);
  walls.box([0,.95,-2.8],[5.6,1.9,.08]);for(const x of [-2.8,2.8])walls.box([x,.95,0],[.08,1.9,5.6]);walls.box([0,1.9,0],[5.6,.06,5.6]);
  floor.push(walls.build());const facade=new G.Mesh([.48,.42,.32,1]);
  for(const [lo,hi]of [[-21.9,C[0]-.65],[C[0]+.65,-5.1]])facade.box([(lo+hi)/2-C[0],5.175-C[1],2.8],[hi-lo,10.35,.225]);
  facade.box([0,(1.25+10.35-C[1])/2,2.8],[1.3,10.35-C[1]-1.25,.225]);annexWall=facade.build({rough:.85});
  const door=new G.Mesh([.20,.28,.33,1]);door.box([.32,.23,0],[.63,.46,.035]);door.box([.32,1.17,0],[.63,.16,.035]);for(const x of [.025,.615])door.box([x,.78,0],[.04,.62,.035]);door.box([.32,.46,0],[.63,.04,.035]);door.box([.47,.53,.03],[.18,.025,.025]);door.box([.47,.53,-.03],[.18,.025,.025]);entryDoor=door.build();
  entryGlass=new G.Mesh([.37,.65,.72,.23]).box([.32,.78,0],[.55,.59,.009]).build();entrySign=G.label('SERVER ROOM');
  patches=[G.patch(),...NetworkCore40.faults.map(f=>G.patch(f.port))];
  const frame=new G.Mesh([.13,.17,.2,1]);for(const x of [0,.57])frame.box([x,.66,0],[.035,1.29,.035]);for(const y of [.035,1.285])frame.box([.285,y,0],[.57,.035,.035]);frame.box([.52,.67,.026],[.02,.12,.035]);doorFrame=frame.build();doorGlass=new G.Mesh([.025,.045,.06,.90]).box([.285,.66,0],[.52,1.20,.014]).build();
  labels=racks.map((_,i)=>G.label('SERVER '+String(i+1).padStart(2,'0')));
  portNumbers=G.screen(512,1024,q=>{q.fillStyle='#dce6e9';q.font='16px monospace';for(let n=0;n<50;n++){const p=G.port(n);q.fillText(String(n+1).padStart(2,'0'),(p[0]+.24)/.52*512,(1.205-p[1]-.026)/.93*1024);}}).batch;portNumbers.alphaCutoff=.5;
  for(const [name,color,emission] of [['green',[.08,.9,.28,1],[.1,1,.25]],['dim',[.015,.18,.05,1],[0,.12,0]],['amber',[1,.58,.015,1],[1,.45,0]]]){lights[name]=new G.Mesh(color).box([0,0,0],[1,1,1]).build({emission});lights[name].sharedKey='network40-led-'+name;}
  beam=new G.Mesh([1,.02,.02,.07]).box([0,0,1.15],[.3,.045,2.3]).build({unlit:true});
  screen=G.screen(640,360,paintScreen);
 }
 function paintScreen(q,c){q.fillStyle='#071c24';q.fillRect(0,0,c.width,c.height);q.fillStyle=s.phase==='complete'?'#70ef9d':'#ffb477';q.font='bold 32px monospace';q.fillText('NETWORK DIAGNOSTICS',24,45);q.fillStyle='#d8edef';q.font='23px monospace';q.fillText(s.phase==='complete'?'CONNECTION ESTABLISHED':s.phase==='testing'?'TEST IN PROGRESS...':'CONNECTION LOST',24,95);q.font='19px monospace';s.log.slice(-5).forEach((line,i)=>q.fillText(line.slice(0,48),24,145+i*30));q.fillStyle='#77d2d1';q.font='bold 24px monospace';q.fillText(s.phase==='complete'?'ALL SERVICES ONLINE':'RUN NETWORK TEST',24,332);}
 function loosePosition(fault){const f=NetworkCore40.faults[fault],p=G.port(f.port),t=s.repair?.fault===fault?clamp((s.repair.time-.4)/.9,0,1):s.connected[fault]?1:0,e=t*t*(3-2*t);return world(f.rack,[p[0],p[1],.248+.012*(1-e)]);}
 function segment(a,b,w,color){const d=sub(b,a),y=norm(d),x=norm(cross(Math.abs(y[1])>.9?[1,0,0]:[0,1,0],y)),z=cross(x,y),m=[...mul(x,w),0,...mul(y,len(d)),0,...mul(z,w),0,...mul(add(a,b),.5),1];drawBatch(cube,m,false,color);}
 function draw(planes){if(!ready)return;if(sphereVisible([-13.5,5.175,-13.2],10.2,planes)){gl.disable(gl.CULL_FACE);drawBatch(annexWall,transform(C));}if(!sphereVisible(add(C,[0,.8,0]),4.5,planes))return;
  gl.disable(gl.CULL_FACE);for(const b of floor)drawBatch(b,transform(C));
  const entryMatrix=i=>transform(add(entrance,[i? .65:-.65,0,0]),[i?-1:1,1,1],0,swing[i].angle);
  for(let i=0;i<2;i++)drawBatch(entryDoor,entryMatrix(i));
  drawBatch(entrySign,transform(add(entrance,[0,1.36,.14]),[.90,.15,1]));
  const flash=s.phase!=='complete'&&s.time%1<.5;bulb.emission=flash?[1,0,0]:[0,0,0];drawBatch(bulb,transform(add(entrance,[0,1.54,.15]),[.065,.075,.065]),false,flash?[1,.025,.01,1]:[.18,.02,.02,1]);bulb.emission=[0,0,0];
  const ledGroups={green:[],dim:[],amber:[]};
  racks.forEach((p,i)=>{
   for(const b of rackModel)drawBatch(b,transform(p,mul([.2,.215,.285],rackScale),0,-Math.PI/2));
   for(const b of patches[i===1?1:i===4?2:0])drawBatch(b,transform(p,[rackScale,rackScale,rackScale]));
   drawBatch(portNumbers,transform(world(i,[0,.74,.247]),mul([.52,.93,1],rackScale)));
   for(let n=0;n<50;n++){const q=G.port(n),pos=world(i,[q[0]+.022,q[1]+.019,.25]);ledGroups[game.led(i,n)].push({modelMatrix:transform(pos,mul([.009,.011,.012],rackScale))});}
   const doorMatrix=transform(world(i,[-.285,0,.3]),[rackScale,rackScale,rackScale],0,-s.angles[i]);
   drawBatch(doorFrame,doorMatrix);
   drawBatch(labels[i],mm(doorMatrix,transform([.285,1.22,.026],[.51,.13,1])));
  });
  for(const [name,list]of Object.entries(ledGroups))if(list.length)drawBuildingInstances(lights[name],list);
  for(let i=0;i<2;i++){const f=NetworkCore40.faults[i],p=world(f.rack,G.port(f.port)),end=loosePosition(i),side=world(f.rack,[.25,G.port(f.port)[1]-.06,.265]),bend=add(end,mul([.015,-.035,.02],rackScale));segment(side,bend,.004*rackScale,[.04,.37,.82,1]);segment(bend,end,.004*rackScale,[.04,.37,.82,1]);drawBatch(cube,transform(end,mul([.025,.019,.04],rackScale)),false,[.67,.79,.83,1]);drawBatch(cube,transform(add(end,[0,.012*rackScale,0]),mul([.012,.004,.025],rackScale)),false,[.82,.88,.9,1]);
   if(s.repair?.fault===i){repairTarget=end;if(state.firstPerson){segment(add(end,[.04,-.06,.22]),end,.035,[.10,.36,.52,1]);drawBatch(bulb,transform(add(end,[.025,-.025,.025]),[.027,.022,.037]),false,[.21,.47,.59,1]);for(const p of [[-.012,-.018,.007],[.021,.006,.005]])drawBatch(bulb,transform(add(end,p),[.009,.012,.025]),false,[.21,.47,.59,1]);}}
  }
  const computerRoot=transform(computer,[consoleScale,consoleScale,consoleScale],0,-Math.PI/2),laptopRoot=mm(computerRoot,laptopFit),importRoot=transform([0,0,0],[.23,.25,.25],0,-Math.PI/2);
  for(const b of consoleModel)drawBatch(b,mm(b.sourceMaterial==='console_auv'?laptopRoot:computerRoot,importRoot));
  // The command screen lies flush on the laptop's own lid (measured from
   // console.glb: centre [.0042,.7199,.2972], tilted back 17.3deg), 3 mm proud of
   // it. Standing upright in front of the lid with its own backing slab, it read
   // as a second monitor.
   drawBatch(screen.batch,mm(laptopRoot,transform([.0042,.7199+.298*.003,.2972+.955*.003],[.30,.168,1],-.302)));
  const alarm=s.phase!=='complete';for(let i=0;i<beacons.length;i++){const p=beacons[i],flash=alarm&&((s.time+i*.2)%1.2<.65);drawBatch(cube,transform(add(p,[0,-.06,0]),[.15,.07,.15]),false,[.2,.22,.24,1]);bulb.emission=flash?[1,.02,.01]:[0,0,0];drawBatch(bulb,transform(p,[.065,.075,.065]),false,flash?[1,.025,.01,1]:[.24,.025,.02,1]);}bulb.emission=[0,0,0];
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  racks.forEach((p,i)=>drawBatch(doorGlass,transform(world(i,[-.285,0,.3]),[rackScale,rackScale,rackScale],0,-s.angles[i])));
  for(let i=0;i<2;i++)drawBatch(entryGlass,entryMatrix(i));
  if(alarm)for(let i=0;i<beacons.length;i++)if((s.time+i*.2)%1.2<.65){const yaw=s.time*3+i*Math.PI/2,length=NetworkCore40.beamLength(beacons[i],yaw,extent);if(length>0)drawBatch(beam,transform(beacons[i],[1,1,length/2.3],0,yaw));}
  gl.depthMask(true);gl.disable(gl.BLEND);projectCable();
 }
 function projectCable(){if(!cableButton)return;const i=Number(cableButton.dataset.fault);if(cableButton.hidden||!Number.isInteger(i))return;const p=loosePosition(i),vp=mm(perspective(canvas.clientWidth/canvas.clientHeight),lookAt(camera,target)),v=tp(vp,...p),w=vp[3]*p[0]+vp[7]*p[1]+vp[11]*p[2]+vp[15],rect=canvas.getBoundingClientRect(),x=rect.left+(v[0]/w+1)*rect.width/2,y=rect.top+(1-v[1]/w)*rect.height/2;
  cableButton.style.visibility=w>.03&&x>20&&x<innerWidth-20&&y>120&&y<innerHeight-85?'visible':'hidden';cableButton.style.left=x+'px';cableButton.style.top=y+'px';
 }
 function openDoor(){const r=nearest();if(r>=0)game.door(r);}
 function reconnect(){const i=Number(cableButton.dataset.fault),f=NetworkCore40.faults[i];if(!f||nearest()!==f.rack||blocked())return;if(game.reconnect(i)){const p=racks[f.rack],q=G.port(f.port);player.position=[p[0]+q[0]*rackScale+.09,C[1]+PHYSICS.radii[1]+.015,p[2]+.44];player.yaw=0;player.walkAmount=0;repairTarget=loosePosition(i);}}
 function runTest(){if(atComputer())game.test();}
 function update(dt){if(!ready)return;inside=inRoom()&&!blocked();if(inside&&!s.started)game.start();if(!state.paused&&!document.hidden)game.tick(dt);
  if(!state.paused){const dz=player.position[2]-entrance[2],dx=player.position[0]-entrance[0],near=Math.abs(dz)<.65&&Math.abs(dx)<.88&&Math.abs(player.position[1]-C[1])<1.3;for(let i=0;i<2;i++){const d=swing[i];if(near&&!doorContact)d.side=dz>0?1:-1;const goal=near?d.side*(i?-1:1)*1.48:0,h=Math.min(dt,.033);d.velocity+=((goal-d.angle)*75-d.velocity*15)*h;d.angle+=d.velocity*h;}doorContact=near;}
  repairTarget=s.repair?loosePosition(s.repair.fault):null;
  const key=[s.phase,s.log.length].join('|');if(key!==screenKey){screenKey=key;screen.update(paintScreen);}
  updateUI();
 }
 function updateUI(){notice.hidden=!inside;actions.hidden=!inside;consolePanel.hidden=!atComputer();cableButton.hidden=true;if(!inside)return;
  const r=nearest(),f=NetworkCore40.faults.findIndex((f,i)=>f.rack===r&&!s.connected[i]);
  const key=[s.phase,s.message,r,s.doors.join(''),state.firstPerson,s.repair?.fault,s.tests].join('|');if(key!==lastUI){lastUI=key;notice.querySelector('strong').textContent=s.phase==='complete'?'Network restored':'IT: Network connection lost';notice.querySelector('[data-message]').textContent=s.message;notice.dataset.complete=String(s.phase==='complete');actions.querySelector('[data-door]').hidden=r<0;actions.querySelector('[data-door]').textContent=r<0?'Open cabinet':(s.doors[r]?'Close':'Open')+' server '+String(r+1).padStart(2,'0');actions.querySelector('[data-view]').textContent=state.firstPerson?'Third-person view':'First-person view';actions.querySelector('[data-hint]').textContent=r>=0&&s.doors[r]?(f>=0?'Inspect the amber port. Click its loose connector.':'All 50 port lights are green.'):s.phase==='complete'?'All network services are online.':'First-person view makes the ports easier to inspect.';consolePanel.querySelector('[data-log]').textContent=s.log.slice(-5).join('\n');}
  actions.querySelector('[data-door]').disabled=!!s.repair;consolePanel.querySelector('[data-test]').disabled=s.phase==='testing'||s.phase==='complete'||!!s.repair;
  if(r>=0&&f>=0&&s.angles[r]>1.3&&!s.repair){cableButton.hidden=false;cableButton.dataset.fault=String(f);projectCable();}
 }
 function ui(){const css=document.createElement('style');css.textContent=`#networkNotice40,#networkActions40,#networkComputer40{position:fixed;z-index:35;background:#10252df2;color:#edf8fa;border:1px solid #62939e;border-radius:5px;box-sizing:border-box;font:13px/1.4 system-ui}#networkNotice40{top:125px;left:50%;transform:translateX(-50%);width:min(660px,calc(100vw - 24px));padding:10px 14px;border-left:4px solid #ed775e}#networkNotice40 strong{font-size:16px}#networkNotice40 p{margin:5px 0 0}#networkNotice40[data-complete=true]{border-color:#77dba0}#networkActions40{bottom:100px;left:50%;transform:translateX(-50%);max-width:calc(100vw - 24px);padding:10px;display:flex;flex-wrap:wrap;gap:7px;justify-content:center;width:max-content}#networkActions40 p{margin:0;width:100%;text-align:center}#networkActions40 button,#networkComputer40 button{font:inherit;min-height:36px;border:1px solid #91aeb6;border-radius:3px;background:#284852;color:white;padding:6px 12px}#networkComputer40{right:14px;top:240px;width:300px;max-height:calc(100dvh - 420px);overflow:auto;padding:14px}#networkComputer40 h3{font-size:16px;margin:0 0 10px}#networkComputer40 pre{font:12px/1.5 monospace;white-space:pre-wrap;overflow-wrap:anywhere}#networkCable40{position:fixed;z-index:38;width:42px;height:42px;transform:translate(-50%,-50%);background:transparent;border:2px solid transparent;border-radius:50%;padding:0;cursor:pointer;box-shadow:none}#networkCable40:hover,#networkCable40:focus-visible{background:#ffd16d33;border-color:white}#networkNotice40[hidden],#networkActions40[hidden],#networkComputer40[hidden],#networkCable40[hidden]{display:none!important}`;document.head.append(css);
  notice=document.createElement('section');notice.id='networkNotice40';notice.hidden=true;notice.setAttribute('aria-live','polite');notice.innerHTML='<strong></strong><p data-message></p>';document.body.append(notice);
  actions=document.createElement('div');actions.id='networkActions40';actions.hidden=true;actions.innerHTML='<p data-hint></p><button data-door>Open cabinet</button><button data-view>First-person view</button>';actions.querySelector('[data-door]').onclick=openDoor;actions.querySelector('[data-view]').onclick=()=>{toggle('firstPerson');updateCamera(0,true);};document.body.append(actions);
  cableButton=document.createElement('button');cableButton.id='networkCable40';cableButton.hidden=true;cableButton.setAttribute('aria-label','Reconnect loose Ethernet connector');cableButton.title='Reconnect loose Ethernet connector';cableButton.onclick=reconnect;document.body.append(cableButton);
  consolePanel=document.createElement('section');consolePanel.id='networkComputer40';consolePanel.hidden=true;consolePanel.innerHTML='<h3>Network diagnostics</h3><pre data-log></pre><div class="network-computer-buttons"><button data-test>Run network test</button><button data-reset>Restart</button></div>';consolePanel.querySelector('[data-test]').onclick=runTest;consolePanel.querySelector('[data-reset]').onclick=()=>{if(atComputer()){game.reset();game.start();}};document.body.append(consolePanel);
  css.textContent+='#networkComputer40{display:flex;flex-direction:column;overflow:hidden}#networkComputer40 h3,.network-computer-buttons{flex-shrink:0}#networkComputer40 pre{min-height:0;overflow:auto;margin:6px 0 10px}.network-computer-buttons{display:flex;flex-wrap:wrap;gap:5px}#networkComputer40 button{padding:5px 8px}';
 }
 function repairPose(a){if(!a.player)return;if(!s.repair||!repairTarget){if(a.networkRest){for(const [i,q]of a.networkRest)a.pose[i].rotation=q;delete a.networkRest;}return;}const m=a.model,find=part=>m.j.nodes.findIndex(n=>(n.name||'').split(':').pop()==='Right'+part),upper=find('Arm'),elbow=find('ForeArm'),end=find('Hand');if(upper<0||elbow<0||end<0)return;
  if(!a.networkRest)a.networkRest=[upper,elbow].map(i=>[i,[...a.pose[i].rotation]]);
  const world=[],rebuild=()=>{for(const i of m.order)world[i]=mm(world[m.parents.get(i)]||IDENTITY,trs(a.pose[i]));};rebuild();const hip=world[m.skins[0].joints[0]],correction=a.bindHip?[hip[12]-a.bindHip[0],0,hip[14]-a.bindHip[1]]:[0,0,0],goal=add(tp(CharacterFitting.invert4(actorMatrix(a)),...repairTarget),correction);
  const multiply=([x,y,z,w],[a,b,c,d])=>[w*a+x*d+y*c-z*b,w*b-x*c+y*d+z*a,w*c+x*b-y*a+z*d,w*d-x*a-y*b-z*c];
  for(let pass=0;pass<7;pass++)for(const joint of [elbow,upper]){const inv=CharacterFitting.invert4(world[m.parents.get(joint)]||IDENTITY),origin=tp(inv,...world[joint].slice(12,15)),from=norm(sub(tp(inv,...world[end].slice(12,15)),origin)),to=norm(sub(tp(inv,...goal),origin)),w=1+clamp(dot(from,to),-1,1);if(w<1e-6)continue;delete a.pose[joint].matrix;a.pose[joint].rotation=multiply(norm([...cross(from,to),w]),a.pose[joint].rotation);rebuild();}
 }
 function constrainCamera(){if(!inside||state.firstPerson||state.overview||blocked())return;camera=[clamp(camera[0],extent[0]+.12,extent[2]-.12),Math.min(camera[1],C[1]+1.78),clamp(camera[2],extent[1]+.12,extent[3]-.12)];}
 function visit(){if(!ready||blocked())return;places.network40={label:'IT: server room',p:[entrance[0],C[1]+PHYSICS.radii[1]+.02,extent[3]+1.8],scaledPlayer:true,yaw:0};teleport('network40');state.radius=2.1;state.pitch=.15;updateCamera(0,true);}
 async function init(){try{ui();room=await G.load('room');rackModel=await G.load('rack');consoleModel=await G.load('console');build();obstacles();ready=true;if(new URLSearchParams(location.search).get('challenge')==='network')visit();}catch(e){error=e.message;console.error('Network challenge:',e);}}
 function crowdObstacles(){return ready?[[[extent[0],extent[1]],[extent[2],extent[1]],[extent[2],extent[3]],[extent[0],extent[3]]]]:[];}
 return {init,draw,update,visit,repairPose,constrainCamera,crowdObstacles,get repairing(){return !!s.repair;},snapshot:()=>({ready,error,inside,...structuredClone(s),alarm:s.phase!=='complete',entrance,swing:structuredClone(swing),rackScale,racks,computer,computerApproach,extent,nearest:nearest(),atComputer:atComputer(),leds:racks.map((_,r)=>Array.from({length:50},(_,p)=>game.led(r,p)))}),test:{game,loosePosition}};
})();
window.Network40=Network40;
{
 // Reserve the room footprint before the venue allocates employer booths.
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,walk=advancePlayer,grid=CrowdCore.buildGrid,view=updateCamera;
 updateCamera=function(dt,immediate=false){view(dt,immediate);Network40.constrainCamera();};
 RobotExhibit20.draw=function(planes){draw(planes);Network40.draw(planes);};RobotExhibit20.update=function(dt){update(dt);Network40.update(dt);};advancePlayer=function(dt,input){if(!Network40.repairing)walk(dt,input);};CrowdCore.buildGrid=function(base,polygons=[],staff=[]){return grid(base,[...polygons,...Network40.crowdObstacles()],staff);};
 const start=()=>{if(!state.ready){setTimeout(start,250);return;}Network40.init();};start();
}
