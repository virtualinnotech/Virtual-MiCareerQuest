/* MRI room uses the uploaded model and the venue's shared character rig. */
const MRI42=(()=>{
 const game=MRICore42.create(),s=game.state,C=[36.65,0,-22.90],computer=[C[0]-1.05,0,C[2]+1.88];
 const S=NetworkScene40,parts=[],room=[],keys42=new Set(),names=['View 1','View 2','View 3','View 4'];
 const crops=[[18,27,177,202],[207,28,169,199],[390,29,163,198],[560,30,176,201]];
 let ready=false,error=null,active=false,patient=null,cube,sign,monitor,lamp,panel,prompt,scanButton,image42,sequence=0,zoom=1,brightness=1,lastPhase='',poseBlend=0;
 let doctorModel,patientModel,doctor=null,student=null,inside=false,doorSign;
 const doors=[{x:.76,z:2.7,width:.82,angle:0,direction:1},{x:.67,z:1.55,width:.88,angle:0,direction:1}];
 const inSuite=()=>Math.abs(player.position[0]-C[0])<1.66&&player.position[2]>C[2]-1.6&&player.position[2]<C[2]+2.69;
 const pos=(x,y,z)=>[C[0]+x,C[1]+y,C[2]+z],dist=p=>Math.hypot(player.position[0]-p[0],player.position[2]-p[2]);
 function collider(name,p,size){const v=[];for(const y of [-.5,.5])for(const z of [-.5,.5])for(const x of [-.5,.5])v.push(p[0]+x*size[0],p[1]+y*size[1],p[2]+z*size[2]);registerCollider('MRI42 '+name,'solidCollider',new Float32Array(v),new Uint32Array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]),false,{});baselineColliders.push(colliders.at(-1));}
 async function load(){
  const r=await fetch('./mri42/mri.glb');if(!r.ok)throw Error('MRI model could not load');const {json:j,bin}=parseGLB(await r.arrayBuffer()),world=[],parents=new Map(),cache=new Map();j.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>parents.set(k,i)));
  function visit(i){world[i]=mm(world[parents.get(i)]||IDENTITY,trs(j.nodes[i]));for(const c of j.nodes[i].children||[])visit(c);}for(const n of j.scenes[j.scene||0].nodes)visit(n);
  for(let i=0;i<j.nodes.length;i++){const node=j.nodes[i];if(node.mesh==null)continue;for(const p of j.meshes[node.mesh].primitives){const v=accessor(j,bin,p.attributes.POSITION),idx=accessor(j,bin,p.indices),n=accessor(j,bin,p.attributes.NORMAL),data=new Float32Array(v.length*2);for(let k=0;k<v.length;k+=3)data.set([...v.subarray(k,k+3),...n.subarray(k,k+3)],k*2);const m=j.materials[p.material].pbrMetallicRoughness,ti=m.baseColorTexture?.index;if(ti!=null&&!cache.has(ti))cache.set(ti,await embeddedGLBTexture(j,bin,ti));parts.push({matrix:world[i],moving:!!node.extras?.movingBed,batch:uploadBatch(data,idx,{color:m.baseColorFactor||[1,1,1,1],baseTexture:cache.get(ti),uv:accessor(j,bin,p.attributes.TEXCOORD_0),rough:.65,doubleSided:true})});}}
  gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);
 }
 function build(){
  cube=createCube();const white=new S.Mesh([.79,.84,.84,1]),teal=new S.Mesh([.11,.42,.43,1]),dark=new S.Mesh([.12,.16,.17,1]);
  const wallTexture=document.createElement('canvas');wallTexture.width=wallTexture.height=256;const paint=wallTexture.getContext('2d');paint.fillStyle='#dce2df';paint.fillRect(0,0,256,256);
  let seed=47;for(let i=0;i<18000;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed&255,y=(seed>>>8)&255;paint.fillStyle=i%2?'rgba(91,110,108,.07)':'rgba(255,255,255,.18)';paint.fillRect(x,y,1,1);}
  paint.fillStyle='#c2cdca';paint.fillRect(0,0,2,256);paint.fillStyle='#f1f4f2';paint.fillRect(2,0,1,256);
  const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,wallTexture);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.activeTexture(gl.TEXTURE0);
  // Floor finish is flush with the existing venue floor, not a raised platform.
  white.plane([C[0],floorPaintHeight68(C[0],C[2]),C[2]+.55],[3.4,4.3]);
  const wall=(name,p,size)=>{const m=new S.Mesh([1,1,1,1]);m.box(p,size);const uv=[];for(let i=0;i<m.v.length;i+=6){const side=Math.abs(m.v[i+3])>.5,top=Math.abs(m.v[i+4])>.5;uv.push((side?m.v[i+2]-C[2]:m.v[i]-C[0])*1.5,(top?m.v[i+2]-C[2]:m.v[i+1]-C[1])*1.5);}room.push(m.build({uv:new Float32Array(uv),baseTexture:texture,rough:.92}));collider(name,p,size);};
  wall('rear',pos(0,.75,-1.6),[3.4,1.5,.07]);
  for(const x of [-1.7,1.7])wall('side '+x,pos(x,.75,.55),[.07,1.5,4.3]);
  wall('front left',pos(-.47,.75,2.7),[2.46,1.5,.07]);wall('front right',pos(1.64,.75,2.7),[.12,1.5,.07]);wall('entrance header',pos(1.17,1.34,2.7),[.82,.32,.07]);
  wall('ceiling',pos(0,1.52,.55),[3.47,.06,4.37]);
  for(const x of [-1.65,1.65])teal.box(pos(x,.44,.55),[.025,.08,4.25]);
  for(const x of [-1.655,1.655])dark.box(pos(x,.04,.55),[.02,.08,4.20]);dark.box(pos(0,.04,-1.55),[3.3,.08,.025]);
  // The long observation window separates the technician from the scanner.
  wall('window sill',pos(-.515,.15,1.55),[2.37,.30,.055]);wall('window header',pos(-.515,1.36,1.55),[2.37,.28,.055]);
  for(const x of [-1.67,.64])wall('window post '+x,pos(x,.76,1.55),[.045,.92,.055]);
  collider('observation glass',pos(-.515,.76,1.55),[2.27,.92,.02]);
  wall('scanner door right',pos(1.625,.75,1.55),[.15,1.5,.055]);wall('scanner door header',pos(1.11,1.34,1.55),[.88,.32,.055]);
  const ceilingLight=new S.Mesh([.93,.99,1,1]);for(const z of [-.6,2.1])ceilingLight.box(pos(0,1.477,z),[.9,.015,.26]);room.push(ceilingLight.build());
  white.box([computer[0],C[1]+.32,computer[2]],[.8,.045,.34]);for(const x of [-.32,.32])dark.box([computer[0]+x,C[1]+.15,computer[2]],[.035,.3,.25]);
  dark.box([computer[0],C[1]+.46,computer[2]-.07],[.32,.20,.025]);dark.box([computer[0],C[1]+.36,computer[2]-.07],[.04,.10,.04]);dark.box([computer[0],C[1]+.35,computer[2]+.05],[.25,.013,.08]);collider('workstation',[computer[0],C[1]+.29,computer[2]],[.8,.58,.34]);
  collider('magnet',pos(0,.65,-.46),[1.52,1.3,.85]);collider('table',pos(0,.16,.6),[.34,.32,1.1]);
  teal.box(pos(.61,.48,.10),[.1,.16,.08]);
  room.push(white.build(),teal.build(),dark.build());sign=S.label('MRI | CONTROL ROOM');doorSign=S.label('MRI SCANNER');monitor=S.screen(512,320,(q,c)=>{q.fillStyle='#071b20';q.fillRect(0,0,c.width,c.height);q.fillStyle='#81e0cf';q.font='bold 28px sans-serif';q.fillText('BRAIN MRI',24,60);q.font='21px sans-serif';q.fillText('Scan computer',24,110);q.fillText('CASE 042 / ALEX MORGAN',24,180);});
  lamp=S.label('SCREENING REQUIRED');refreshShipments();Crowd.invalidate();RobotExhibit20.invalidate();
 }
 function patientInit(){if(patient||!patientModel)return;patient=createActor(patientModel,{position:pos(0,.1,.6),yaw:0,mriPatient:true,canWave:false});patient.outfit=MRIPeople42.outfit();}
 function pose(a){MRIPeople42.pose(a);if(!a.mriPatient)return;const bend=1-poseBlend;for(let i=0;i<a.model.j.nodes.length;i++){const name=a.model.j.nodes[i].name||'',r=/upleg|thigh/i.test(name)?-Math.PI/2*bend:/(?:left|right)leg|calf/i.test(name)?Math.PI/2*bend:null;if(r!=null)MRIPeople42.rotateWorld(a,i,0,r);}}
 function patientMatrix(a){const m=a.model,hip=a.world[m.skins[0].joints[0]],scale=m.scale*sectorScaleAt(C[0],C[2]),anchor=pos(0,.315+.020*poseBlend,.99-.43*poseBlend-s.bed*.66);return mm(transform(anchor,[scale,scale,scale],-Math.PI/2*poseBlend,0),transform([-hip[12],-hip[13],-hip[14]]));}
 function draw(planes){if(!ready||!sphereVisible(pos(0,.5,0),5,planes))return;gl.disable(gl.CULL_FACE);for(const b of room)drawBatch(b,IDENTITY);for(const p of parts)drawBatch(p.batch,mm(transform(pos(0,0,p.moving?-s.bed*.66:0)),p.matrix));
  drawBatch(sign,transform(pos(.05,1.34,2.745),[1.20,.16,1]));drawBatch(doorSign,transform(pos(1.11,1.34,1.59),[.79,.12,1]));drawBatch(monitor.batch,transform([computer[0],C[1]+.46,computer[2]-.055],[.29,.175,1]));drawBatch(lamp,transform(pos(.7,.8,.1),[.52,.09,1]));
  drawBatch(cube,transform(pos(.61,.50,.15),[.065,.065,.02]),false,s.phase==='scanning'?[1,.6,.05,1]:[.12,.9,.55,1]);
  if(patient)drawActor(patient,planes);
  const panes=[];
  for(const d of doors){const base=transform(pos(d.x,0,d.z),[1,1,1],0,d.angle),piece=(p,size,col)=>drawBatch(cube,mm(base,transform(p,size)),false,col),w=d.width;
   for(const [p,size] of [[[w/2,.27,0],[w,.54,.045]],[[w/2,1.10,0],[w,.16,.045]],[[.09,.78,0],[.18,.48,.045]],[[w-.09,.78,0],[.18,.48,.045]]])piece(p,size,[.43,.69,.71,1]);
   for(const z of [-.04,.04])piece([w-.12,.52,z],[.035,.12,.025],[.69,.73,.75,1]);
   panes.push(mm(base,transform([w/2,.78,0],[w-.36,.48,.012])));
  }
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);drawBatch(cube,transform(pos(-.515,.76,1.55),[2.27,.92,.012]),false,[.55,.81,.86,.13]);for(const m of panes)drawBatch(cube,m,false,[.55,.81,.86,.18]);gl.depthMask(true);gl.disable(gl.BLEND);
 }
 function blocked(){return Forklift34.mounted||Farming36.mounted||Ambulance35.mounted||Crane39.active||Robotics37.active||state.overview;}
 function nearby(){if(!ready||blocked()||state.paused||!inside)return '';if(player.position[2]>C[2]+1.58&&dist(computer)<1)return 'computer';if(player.position[2]<C[2]+1.5&&dist(pos(.6,0,.25))<.65&&['positioned','repeat'].includes(s.phase))return 'scanner';if(player.position[2]<C[2]+1.5&&dist(pos(0,0,.9))<1.05)return 'patient';return '';}
 function interact(){const target=nearby();if(target==='computer'){if(!active){active=true;game.begin();}openPanel();return;}if(target==='scanner'){game.scan();panel.hidden=true;canvas.focus();return;}if(target==='patient'){if(!active){active=true;game.begin();openPanel();}else if(s.phase==='ready'){game.assist();panel.hidden=true;canvas.focus();}else openPanel();}}
 function close(){panel.hidden=true;canvas.focus();}
 function exit(){active=false;close();keys.clear();}
 function restart(){game.reset();sequence=0;zoom=1;brightness=1;poseBlend=0;active=true;game.begin();openPanel();}
 function visit(){if(!ready)return;places.mri42={label:'Health Science - MRI',p:pos(1.17,PHYSICS.radii[1]+.02,3.8),scaledPlayer:true,yaw:0};teleport('mri42');state.radius=1.8;state.pitch=.12;updateCamera(0,true);}
 function scanDraw(){const c=document.getElementById('mriScan42');if(!c||!image42?.complete)return;const q=c.getContext('2d'),[x,y,w,h]=crops[sequence];q.fillStyle='#000';q.fillRect(0,0,512,512);q.save();q.translate(256,256);q.scale(zoom,zoom);q.filter=`brightness(${brightness})`;q.drawImage(image42,x,y,w,h,-215,-245,430,490);if(s.attempt===1){q.globalAlpha=.28;q.drawImage(image42,x,y,w,h,-196,-245,430,490);q.globalAlpha=.18;q.drawImage(image42,x,y,w,h,-232,-245,430,490);}q.restore();q.fillStyle='#f4f7f8';q.font='18px monospace';q.font='12px monospace';q.fillText('PATIENT RIGHT',8,285);q.fillText('PATIENT LEFT',405,285);q.fillText(names[sequence],14,25);q.font='12px monospace';q.fillText('REFERENCE IMAGE / FICTIONAL CASE',14,499);const m=s.marks[sequence];if(m){const px=256+(m[0]-.5)*430*zoom,py=256+(m[1]-.5)*490*zoom;q.strokeStyle='#5af1bd';q.lineWidth=2;q.beginPath();q.arc(px,py,13,0,Math.PI*2);q.moveTo(px-20,py);q.lineTo(px+20,py);q.moveTo(px,py-20);q.lineTo(px,py+20);q.stroke();}monitor?.update((ctx,cv)=>{ctx.fillStyle='#071b20';ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(c,96,0,320,320);});}
 function openPanel(){if(!active)return;if(['review','interpret'].includes(s.phase)&&dist(computer)>=.85){toast('Review the images at the MRI computer, across the glass partition.');return;}panel.hidden=false;renderPanel();}
 function renderPanel(){
  const body=panel.querySelector('.mri-content');body.replaceChildren();panel.querySelector('[role=status]').textContent=s.message;
  const html=(markup)=>{const d=document.createElement('div');d.innerHTML=markup;body.append(d);return d;};
  if(s.phase==='screening'){
   html('<h3>Alex Morgan, 47</h3><p>Alex has headaches and sometimes has trouble using their right hand. The doctor wants brain images to investigate.</p><p class="mri-note">Fictional training case. Reference images are not this fictional patient\'s medical record.</p>');
   ['Check the name and birthday: Alex Morgan / May 3, 1979','Ask trained staff to confirm that implants and medical devices are safe for this MRI','Remove metal belongings and give the patient ear protection','Explain how to stay still and call for help. Check that Alex agrees to the scan'].forEach((t,i)=>{const label=document.createElement('label');label.className='mri-check';const c=document.createElement('input');c.type='checkbox';c.checked=s.checks[i];c.onchange=()=>s.checks[i]=c.checked;label.append(c,document.createTextNode(t));body.append(label);});const b=html('<button data-prepare>Patient ready</button>');b.querySelector('button').onclick=()=>{if(game.prepare())close();else panel.querySelector('[role=status]').textContent='Complete all four safety checks before positioning the patient.';};
  }else if(['review','interpret'].includes(s.phase)){
   html('<p class="mri-case">CASE 042 · Brain MRI · Alex Morgan, 47<br>Headaches and trouble using the right hand</p><p class="mri-note">These are different views of the same area. Left and right mean Alex\'s sides, not your sides. Imagine facing Alex: their left is on your right.</p>');
   const tabs=html('<div class="mri-tabs" role="tablist" aria-label="MRI sequence"></div>').firstChild;names.forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;b.setAttribute('role','tab');b.setAttribute('aria-selected',i===sequence);b.onclick=()=>{sequence=i;s.viewed.push(i);renderPanel();};tabs.append(b);});
   const area=html('<div class="mri-work"><div><canvas id="mriScan42" width="512" height="512" aria-label="MRI image; select an area of concern"></canvas><div class="mri-adjust"><label>Zoom <input id="mriZoom42" type="range" min="1" max="2.5" step=".1" value="'+zoom+'"></label><label>Brightness <input id="mriBrightness42" type="range" min=".5" max="1.8" step=".1" value="'+brightness+'"></label></div></div><div id="mriAssessment42"></div></div>');
   const scan=area.querySelector('canvas');scan.onclick=e=>{const r=scan.getBoundingClientRect(),x=((e.clientX-r.left)/r.width*512-256)/(430*zoom)+.5,y=((e.clientY-r.top)/r.height*512-256)/(490*zoom)+.5;game.mark(sequence,x,y);scanDraw();};
   area.querySelector('#mriZoom42').oninput=e=>{zoom=+e.target.value;scanDraw();};area.querySelector('#mriBrightness42').oninput=e=>{brightness=+e.target.value;scanDraw();};
   const assessment=area.querySelector('#mriAssessment42');
   if(s.phase==='review'){assessment.innerHTML='<h3>Is the image clear?</h3><p>Look at the edges of the head. Are they sharp, or do they look doubled and blurry?</p><button data-quality="adequate">The image is clear</button><button data-quality="repeat">Blurry: scan again</button><p class="mri-note">Scan '+s.attempt+' · Scan time compressed for gameplay. The first scan has simulated blur.</p>';assessment.querySelectorAll('[data-quality]').forEach(b=>b.onclick=()=>{game.quality(b.dataset.quality);renderPanel();});}
   else{assessment.innerHTML='<h3>Find it and report it</h3><p>Click an unusual area. Switch views and mark the same area again. Then answer below.</p><label>Which side of Alex?<select id="mriSide42"><option value="">Choose</option><option value="left">Left</option><option value="right">Right</option><option value="both">Both sides equally</option></select></label><label>What looks different?<select id="mriFinding42"><option value="">Choose</option><option value="fluid">Normal-looking fluid on both sides</option><option value="focal">An unusual area on one side</option><option value="motion">The whole image is blurry</option></select></label><label>Next action<select id="mriHandoff42"><option value="">Choose</option><option value="diagnose">Tell Alex exactly what illness they have</option><option value="radiologist">Send the marked images to the imaging doctor</option><option value="dismiss">Ignore the unusual area</option></select></label><button id="mriSubmit42">Check my answer</button>';assessment.querySelector('#mriSubmit42').onclick=()=>{game.submit(document.getElementById('mriSide42').value,document.getElementById('mriFinding42').value,document.getElementById('mriHandoff42').value);renderPanel();};}
   scanDraw();
  }else if(s.phase==='complete'){html('<h3>You completed the MRI check!</h3><p>You found an unusual area in more than one view, spotted a blurry scan, and sent the images to the imaging doctor. The doctor decides what the finding means.</p><p>+200 points</p><button id="mriOk42">Ok</button> <button id="mriAgain42">Try again</button>');document.getElementById('mriOk42').onclick=exit;document.getElementById('mriAgain42').onclick=restart;}
  else{html('<h3>'+({ready:'Patient preparation',positioning:'Helping Alex lie down',positioned:'Alex is ready',scanning:'Taking pictures',repeat:'Scan again'}[s.phase]||'MRI')+'</h3><p>'+s.message+'</p><button id="mriBack42">Return to room</button>');document.getElementById('mriBack42').onclick=close;}
 }
 function ui(){
  const css=document.createElement('link');css.rel='stylesheet';css.href='./mri42/mri.css?v=1';document.head.append(css);panel=document.createElement('section');panel.id='mriPanel42';panel.hidden=true;panel.setAttribute('aria-label','MRI workstation');panel.innerHTML='<div class="mri-heading"><strong>MRI / IMAGE CHECK</strong><button aria-label="Close workstation">×</button></div><div class="mri-content"></div><p role="status"></p><small>Educational simulation · Not a medical test</small>';panel.querySelector('button').onclick=close;document.body.append(panel);prompt=document.createElement('button');prompt.id='mriPrompt42';prompt.hidden=true;prompt.onclick=interact;document.body.append(prompt);
  window.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName))return;if(e.key==='Escape'&&!panel.hidden){e.stopImmediatePropagation();close();return;}if(e.key.toLowerCase()==='t'&&nearby()){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)interact();}},true);
  scanButton=document.createElement('button');scanButton.id='mriScanButton42';scanButton.hidden=true;scanButton.title='Start MRI scan';scanButton.setAttribute('aria-label','Press MRI scanner button');scanButton.onclick=()=>{if(nearby()==='scanner')game.scan();};document.body.append(scanButton);
  image42=new Image();image42.src='./mri42/teaching-reference.png';image42.onload=scanDraw;
 }
 function update(dt){if(!ready)return;patientInit();
  for(const d of doors){const near=Math.hypot(player.position[0]-(C[0]+d.x+d.width/2),player.position[2]-(C[2]+d.z))<.82;if(near&&Math.abs(d.angle)<.1)d.direction=player.position[2]>C[2]+d.z?1:-1;d.angle+=((near?d.direction*1.40:0)-d.angle)*(1-Math.exp(-dt*7));}
  const entered=inSuite();
  if(entered&&!inside&&characterState.player&&doctorModel){student=characterState.player;MRIPeople42.gait(doctorModel,characterState.models.get('brad_character')||student.model);doctor=doctor||createActor(doctorModel,{player:true,name:'MRI clinician'});doctor.outfit=MRIPeople42.outfit();characterState.actors[characterState.actors.indexOf(student)]=doctor;characterState.player=doctor;poseActor(doctor,0,true);inside=true;toast('MRI role: clinician. Begin at the computer.');}
  if(!entered&&inside){const i=characterState.actors.indexOf(doctor);if(i>=0)characterState.actors[i]=student;characterState.player=student;inside=false;close();}
  if(!state.paused)game.tick(dt);poseBlend=s.phase==='positioning'?Math.min(1,s.time/2):['positioned','scanning','review','interpret','repeat','complete'].includes(s.phase)?1:0;if(patient){patient.position=pos(0,.25,.56-s.bed*.66);poseActor(patient,dt,true);}const near=nearby();prompt.hidden=!near||!panel.hidden;prompt.textContent=near==='computer'?'T · MRI workstation':near==='scanner'?'T · Start MRI scan':!active?'T · MRI challenge':s.phase==='ready'?'T · Help patient lie down':'T · Patient status';scanButton.hidden=near!=='scanner'||!panel.hidden;
  if(!scanButton.hidden){const p=pos(.61,.50,.15),vp=mm(perspective(canvas.clientWidth/canvas.clientHeight),lookAt(camera,target)),v=tp(vp,...p),w=vp[3]*p[0]+vp[7]*p[1]+vp[11]*p[2]+vp[15],r=canvas.getBoundingClientRect();scanButton.hidden=w<=0;scanButton.style.left=r.left+(v[0]/w+1)*r.width/2+'px';scanButton.style.top=r.top+(1-v[1]/w)*r.height/2+'px';}
  if(s.phase!==lastPhase){lastPhase=s.phase;lamp=S.label(s.phase==='scanning'?'SCAN IN PROGRESS':s.phase==='idle'||s.phase==='screening'?'SCREENING REQUIRED':'PATIENT CLEARED');if(!panel.hidden)renderPanel();}}
 async function init(){try{C[1]=floorHeightAt(C[0],C[2]);computer[1]=C[1];ui();await load();doctorModel=await MRIPeople42.load('doctor');patientModel=await MRIPeople42.load('patient');build();ready=true;if(new URLSearchParams(location.search).get('challenge')==='mri')visit();}catch(e){error=e.message;console.error('MRI42',e);}}
 return {init,draw,update,pose,patientMatrix,visit,interact,exit,restart,get inside(){return inside;},get active(){return active;},get panelOpen(){return panel&&!panel.hidden;},snapshot:()=>({...s,active,ready,error,poseBlend,position:C,inside,doctor:inside,doors:doors.map(d=>d.angle)}),test:{game,openPanel,computer,patient:()=>patient}};
})();
window.MRI42=MRI42;
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update,walk=advancePlayer,grid=CrowdCore.buildGrid;
 CrowdCore.buildGrid=function(base,polygons=[],staff=[]){const c=MRI42.snapshot().position;return grid(base,[...polygons,[[c[0]-1.85,c[2]-1.8],[c[0]+1.85,c[2]-1.8],[c[0]+1.85,c[2]+3.2],[c[0]-1.85,c[2]+3.2]]],staff);};
 RobotExhibit20.draw=function(planes){draw(planes);MRI42.draw(planes);};RobotExhibit20.update=function(dt){update(dt);MRI42.update(dt);};
 advancePlayer=function(...args){if(MRI42.panelOpen){keys.clear();player.walkAmount=0;return;}return walk(...args);};
 const cameraUpdate=updateCamera,actorDraw=drawActor;let closeCamera=false;
 updateCamera=function(...args){cameraUpdate(...args);closeCamera=false;if(!MRI42.inside)return;const c=MRI42.snapshot().position;camera[0]=Math.max(c[0]-1.58,Math.min(c[0]+1.58,camera[0]));camera[1]=Math.max(c[1]+.12,Math.min(c[1]+1.40,camera[1]));camera[2]=Math.max(c[2]-1.48,Math.min(c[2]+2.59,camera[2]));
  if(!state.firstPerson&&Math.hypot(camera[0]-player.position[0],camera[2]-player.position[2])<.44){closeCamera=true;camera=add(player.position,[0,.52*PLAYER_SCALE,0]);const yaw=player.yaw+state.orbitYaw;target=add(camera,[-Math.sin(yaw),Math.sin(state.pitch),-Math.cos(yaw)]);}
 };
 drawActor=function(a,planes){if(a.player&&closeCamera)return;return actorDraw(a,planes);};
 const start=()=>{if(!state.ready){setTimeout(start,250);return;}MRI42.init();};start();
}
