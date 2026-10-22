/* Supplied assets, bounded particles and shared GPU instances. No second render loop. */
window.HibachiScene145=(()=>{
 const origin=[-7.15,HospitalityCore140.floor,-28.65],surface=.440,models={},powerSwitch=[.29,.355,-.313],zones={rice:[-.22,surface,-.025],steak:[.19,surface,.13],chicken:[.18,surface,-.065],shrimp:[.12,surface,-.23]};
 const trays={steak:[-.59,surface,-.43],chicken:[-.59,surface,-.17],shrimp:[.59,surface,-.46],rice:[.59,surface,-.17]},plate=[.56,surface,.20];
 let cube,sphere,grain,curd,bubble,steam,flame,sign,ticket,powerIcon,ticketKey='',ready=false;
 const at=p=>add(origin,p),smooth=t=>t*t*(3-2*t),lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 async function load(name){
  const response=await fetch('./hibachi145/assets/'+name+'.glb?v=148');if(!response.ok)throw Error('Missing hibachi asset: '+name);
  const {json:j,bin}=parseGLB(await response.arrayBuffer()),world=[],parents=new Map(),textures=new Map(),parts=[];
  j.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)));
  function visit(i){world[i]=mm(world[parents.get(i)]||IDENTITY,trs(j.nodes[i]));for(const c of j.nodes[i].children||[])visit(c);}
  for(const i of j.scenes[j.scene||0].nodes)visit(i);
  for(let i=0;i<j.nodes.length;i++){const n=j.nodes[i];if(n.mesh==null)continue;for(const p of j.meshes[n.mesh].primitives){
   const v=accessor(j,bin,p.attributes.POSITION),idx=accessor(j,bin,p.indices),normal=p.attributes.NORMAL==null?geometryNormals(v,idx):accessor(j,bin,p.attributes.NORMAL),data=new Float32Array(v.length*2);
   for(let k=0;k<v.length;k+=3)data.set([...v.subarray(k,k+3),...normal.subarray(k,k+3)],k*2);
   const material=j.materials[p.material]||{},pbr=material.pbrMetallicRoughness||{},ti=pbr.baseColorTexture?.index;
   if(ti!=null&&!textures.has(ti))textures.set(ti,await embeddedGLBTexture(j,bin,ti));
   const batch=uploadBatch(data,idx,{color:pbr.baseColorFactor||[1,1,1,1],rough:name==='grill'?.48:.8,metal:name==='grill'?.12:0,baseTexture:textures.get(ti),uv:p.attributes.TEXCOORD_0==null?null:accessor(j,bin,p.attributes.TEXCOORD_0),doubleSided:true});
   parts.push({matrix:world[i],batch});
  }}
  gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);models[name]=parts;
 }
 function model(name,p,scale=1,yaw=0,rx=0,tint=null){for(const part of models[name]||[])drawBatch(part.batch,mm(transform(at(p),[scale,scale,scale],rx,yaw),part.matrix),false,tint);}
 function box(p,size,color){drawBatch(cube,transform(at(p),size),false,color);}
 function ball(p,size,color){drawBatch(sphere,transform(at(p),size),false,color);}
 function rod(a,b,width,color){const d=sub(b,a),y=norm(d),x=norm(cross(Math.abs(y[1])>.9?[1,0,0]:[0,1,0],y)),z=cross(x,y);drawBatch(cube,new Float32Array([...mul(x,width),0,...mul(y,len(d)),0,...mul(z,width),0,...at(mul(add(a,b),.5)),1]),false,color);}
 function bottle(p,tilt=0){
  const base=transform(at(p),[1,1,1],tilt,0);
  for(const [q,size,c]of [[[0,.045,0],[.033,.057,.033],[.91,.78,.36,1]],[[0,.112,0],[.015,.022,.015],[.91,.91,.88,1]],[[0,.143,0],[.005,.018,.005],[.91,.91,.88,1]]])drawBatch(sphere,mm(base,transform(q,size)),false,c);
 }
 function instances(batch,positions){if(positions.length)drawBuildingInstances(batch,positions.map(p=>({modelMatrix:transform(at(p.p),p.size,p.rx||0,p.yaw||0)})));}
 function particleBatch(fire,count){
  const texture=NetworkScene40.screen(64,128,(q,c)=>{
   q.scale(1,2);const g=q.createRadialGradient(32,32,0,32,32,30);
   for(const [stop,color]of fire?[[0,'#fff6bbee'],[.25,'#ffd257cc'],[.55,'#f58325aa'],[1,'#c6470700']]:[[0,'#dce4e23a'],[.45,'#dce4e222'],[1,'#dce4e200']])g.addColorStop(stop,color);
   q.fillStyle=g;q.fillRect(0,0,64,64);
  }).batch.baseTexture;
  const vertices=new Float32Array(count*24),indices=[],uv=[];
  for(let i=0;i<count;i++){const k=i*4;indices.push(k,k+1,k+2,k,k+2,k+3);uv.push(0,1,1,1,1,0,0,0);}
  const b=uploadBatch(vertices,new Uint32Array(indices),{color:[1,1,1,1],unlit:true,baseTexture:texture,uv:new Float32Array(uv)});
  b.data145=vertices;b.localBounds106=null;return b;
 }
 function particles(batch,points){
  const facing=norm(sub(camera,target)),right=norm(cross([0,1,0],facing)),up=cross(facing,right),data=batch.data145;
  for(let i=0;i<points.length;i++){const p=points[i];for(const [j,[x,y]]of [[-1,-1],[1,-1],[1,1],[-1,1]].entries()){
   const pos=at(add(p.p,add(mul(right,x*p.size[0]),mul(up,y*p.size[1]))));data.set([...pos,...facing],i*24+j*6);
  }}
  gl.bindBuffer(gl.ARRAY_BUFFER,batch.vbo);gl.bufferSubData(gl.ARRAY_BUFFER,0,data);drawBatch(batch,IDENTITY);
 }
 function ticketPaint(s){
  const key=[s.phase,s.mix>=1,...Object.entries(s.foods).map(([k,f])=>f.temp>=HibachiCore145.targets[k])].join('|');if(key===ticketKey)return;ticketKey=key;
  ticket.update((q,c)=>{
   q.fillStyle='#fffdf4';q.fillRect(0,0,c.width,c.height);q.fillStyle='#243237';q.font='bold 38px monospace';q.fillText('ORDER 04',34,63);q.font='23px monospace';q.fillText('HIBACHI COMBINATION',34,108);
   q.strokeStyle='#b6c0be';q.beginPath();q.moveTo(32,136);q.lineTo(480,136);q.stroke();
   const rows=[['Fried rice',s.mix>=1,'Egg + rice'],['Chicken',s.foods.chicken.temp>=165,'165 F'],['Steak',s.foods.steak.temp>=135,'135 F'],['Shrimp',s.foods.shrimp.temp>=165,'165 F']];
   rows.forEach(([name,done,temp],i)=>{const y=195+i*113;q.fillStyle=done?'#17634e':'#26353c';q.font='bold 29px monospace';q.fillText((done?'[x] ':'[ ] ')+name,32,y);q.font='22px monospace';q.fillText(temp,103,y+38);});
   q.fillStyle=s.served?'#17634e':'#b96622';q.font='bold 27px monospace';q.fillText(s.served?'ORDER SERVED':'TABLE 04',32,700);
  });
 }
 function foodPosition(k,s){
  let p=[...zones[k]];if(s.action?.id==='serve'||s.served){const t=s.served?1:smooth(Math.max(0,Math.min(1,(s.action.time/s.action.duration*1.55)-(['rice','steak','chicken','shrimp'].indexOf(k)*.14))));p=lerp(zones[k],add(plate,k==='rice'?[-.08,.018,0]:k==='steak'?[.045,.018,.06]:k==='chicken'?[.045,.018,-.06]:[-.02,.018,-.09]),t);p[1]+=Math.sin(t*Math.PI)*.18;}return p;
 }
 function draw(s,visual,planes){
  if(!ready||!sphereVisible(at([0,1.9,0]),2.3,planes))return;
  gl.disable(gl.CULL_FACE);model('grill',[0,0,0]);
  box([0,surface-.008,0],[.80,.012,.49],[.28,.30,.29,1]);
  const pulse=s.phase==='off'&&visual.active?1+.13*Math.sin(visual.time*4):1;
  box(add(powerSwitch,[0,0,.003]),[.09*pulse,.09*pulse,.009],s.power?[.08,.48,.24,1]:[1,.61,.12,1]);
  drawBatch(powerIcon,transform(at(add(powerSwitch,[0,0,-.007])),[.071,.071,1],0,Math.PI));
  drawBatch(sign,transform(at([0,.29,.425]),[.60,.075,1]));ticketPaint(s);drawBatch(ticket.batch,transform(at([0,1.10,-.246]),[.31,.45,1],0,Math.PI));
  // The supplied chimney stops below the venue ceiling; finish it with a duct.
  box([0,2.62,0],[.30,2.50,.24],[.24,.27,.27,1]);
  const chef=visual.active?[-1.04,0,.17]:[0,0,-.60],breath=Math.sin(visual.time*1.5)*.002;
  if(!window.Driving154?.mounted())model('chef',add(chef,[0,breath,0]),1,visual.active?Math.PI/2:0);
  for(const k of ['steak','chicken','shrimp'])if(!s.foods[k].placed&&s.action?.id!==k){model('plate',trays[k],.53);model(k==='steak'?'steak-raw':k==='chicken'?'chicken-raw':'shrimp',add(trays[k],[0,.011,0]),k==='shrimp'?.85:1,0,0,k==='shrimp'?[.7,.69,.64,1]:null);}
  if(!s.rice&&s.action?.id!=='rice')model('rice',trays.rice);
  model('plate',plate);bottle([-.60,surface,.19]);model('fork',[-.60,surface+.005,-.64],1,0);
  if(!visual.active)model('spatula',[.57,surface+.005,-.65]);
  const riceP=foodPosition('rice',s),riceScale=s.served||s.action?.id==='serve'?.62:1,grains=[],curds=[];
  if(!s.egg&&!s.action)ball([-.49,surface+.033,-.53],[.025,.033,.025],[.95,.86,.7,1]);
  if(s.egg&&s.scramble<.1)model('egg',add(zones.rice,[0,.008,0]),1.35);
  if(s.egg&&s.scramble>.02)for(let i=0;i<35;i++){
   const a=i*2.4+(visual.stirring?Math.sin(visual.time*3)*.5:0),r=(.015+Math.sqrt((i+.5)/35)*.08)*riceScale;
   curds.push({p:add(riceP,[Math.cos(a)*r,.006+(visual.stirring?Math.max(0,Math.sin(visual.time*8+i))*.025:0),Math.sin(a)*r*.72]),size:[.012,.006,.008],yaw:a});
  }
  if(s.rice||s.action?.id==='rice'&&s.action.time>.55)for(let i=0;i<125;i++){
   const a=i*2.399+(visual.stirring?Math.sin(visual.time*4+i*.04)*.45:0),r=Math.sqrt((i+.5)/125)*.12*riceScale,t=s.action?.id==='rice'?s.action.time/s.action.duration:1;
   if(i/125>Math.min(1,t*1.5))continue;
   const jump=visual.stirring?Math.max(0,Math.sin(visual.time*10+i))*.05:0;
   grains.push({p:add(riceP,[Math.cos(a)*r,.008+(1-r/.13)*.025+jump,Math.sin(a)*r*.75]),size:[.007,.0035,.0035],yaw:a+visual.time*(visual.stirring?1:0)});
  }
  if(s.action?.id==='rice'&&s.action.time>.6&&s.action.time<1.8)for(let i=0;i<30;i++){
   const drop=(visual.time*2+i*.137)%1;grains.push({p:add(zones.rice,[Math.sin(i*2.4)*.028,.025+(1-drop)*.19,Math.cos(i*2.4)*.025]),size:[.007,.0035,.0035],yaw:i});
  }
  grain.color=s.mix>.4?[.76,.61,.31,1]:[.96,.92,.77,1];instances(grain,grains);instances(curd,curds);
  for(const [k,f]of Object.entries(s.foods))if(f.placed){
   const p=foodPosition(k,s),cook=(f.temp-40)/(HibachiCore145.targets[k]-40),flip=s.action?.id==='flip'&&s.action.food===k?Math.sin(s.action.time/s.action.duration*Math.PI)*.14:0;
   p[1]+=flip;
   if(k==='shrimp'){for(let i=0;i<5;i++)model('shrimp',add(p,[(i%3-1)*.045,.002,Math.floor(i/3)*.052]),.70,i*.9,0,cook<.5?[.72+cook*.4,.70-cook*.15,.65-cook*.25,1]:null);}
   else model(k==='steak'?(cook>.6?'steak-cooked':'steak-raw'):(cook>.6?'chicken-cooked':'chicken-raw'),p,1,0,flip?Math.sin(s.action.time/s.action.duration*Math.PI*2)*.7:0);
  }
  if(visual.active&&s.action?.id!=='power'){
   const action=s.action,t=action?Math.min(1,action.time/action.duration):0,arc=Math.sin(t*Math.PI)*.14;
   let tip=visual.pointer||[-.22,surface+.03,-.02];
   if(visual.stirring){tip=[-.22+Math.sin(visual.time*9)*.09,surface+.015+Math.abs(Math.cos(visual.time*9))*.025,-.02+Math.cos(visual.time*7)*.07];}
   if(action?.id==='egg'){
    const center=add(zones.rice,[0,.10+arc,0]),split=Math.max(0,(t-.3))* .14;
    for(const side of [-1,1]){ball(add(center,[side*split,0,0]),[.027,.035,.021],[.94,.86,.70,1]);}
    if(t>.38)model('egg',zones.rice,Math.min(1,(t-.38)*4));
   }else if(action?.id==='rice'){
    const p=lerp(trays.rice,add(zones.rice,[0,.18,0]),smooth(Math.min(1,t*2)));model('rice',p,1,0,Math.sin(t*Math.PI)*1.6);
   }else if(action&&action.id in HibachiCore145.targets){
    const k=action.id,p=lerp(trays[k],zones[k],smooth(t));p[1]+=.025+arc;
    model(k==='steak'?'steak-raw':k==='chicken'?'chicken-raw':'shrimp',p);model('tongs',add(p,[0,.02,-.08]),1,0);
   }else if(s.flame>0){const p=[-.02,surface+.20,-.16];bottle(p,-.9);}
   else if(action?.id==='probe'){const p=add(zones[action.food],[0,.015,0]);rod(p,add(p,[0,.12,-.10]),.008,[.66,.7,.71,1]);box(add(p,[0,.14,-.12]),[.055,.035,.07],[.08,.18,.18,1]);}
   else{
    if(action?.id==='flip')tip=add(zones[action.food],[0,.02+arc,0]);
    if(action?.id==='serve')tip=foodPosition(['rice','steak','chicken','shrimp'][Math.min(3,Math.floor(t*4))],s);
    model('spatula',add(tip,[0,.008,-.08]),1,Math.PI+Math.sin(visual.time*8)*(visual.stirring?.18:0));
    if(visual.stirring){model('fork',add(tip,[.08,.01,-.06]),1,Math.PI-.25);}
   }
  }
  if(s.power&&s.grill>300&&(s.egg||Object.values(s.foods).some(f=>f.placed))&&!s.served){
   const sites=[...(s.egg?[zones.rice]:[]),...Object.keys(s.foods).filter(k=>s.foods[k].placed).map(k=>zones[k])],bubbles=[],vapors=[];
   for(let i=0;i<48;i++){const p=sites[i%sites.length],age=(visual.time*1.7+i*.137)%1,a=i*2.4,r=.04+age*.045;bubbles.push({p:add(p,[Math.cos(a)*r,.005,Math.sin(a)*r*.6]),size:[.003+age*.005,.002,.003+age*.005]});}
   for(let i=0;i<24;i++){const p=sites[i%sites.length],age=(visual.time*.43+i*.117)%1;vapors.push({p:add(p,[Math.sin(i*2.4+age*3)*.05,.03+age*.29,Math.cos(i*2.4)*.04]),size:[.025+age*.035,.04+age*.065]});}
   instances(bubble,bubbles);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);particles(steam,vapors);gl.depthMask(true);gl.disable(gl.BLEND);
  }
  if(s.flame>0){const points=[],envelope=Math.sin((1-s.flame/1.8)*Math.PI);for(let i=0;i<24;i++){const age=(visual.time*2.4+i*.127)%1;points.push({p:[Math.sin(i*2.4)*(.10-age*.07),surface+.03+age*.48*envelope,Math.cos(i*2.4)*.07],size:[.036*(1-age)+.007,.10*(1-age)+.03]});}
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);particles(flame,points);gl.depthMask(true);gl.disable(gl.BLEND);
  }
 }
 async function init(){
  cube=createCube();sphere=createSphere();
  const batch=(key,color)=>{const b=createSphere();b.color=color;b.sharedKey='hibachi145-'+key;return b;};
  grain=batch('rice',[.95,.89,.72,1]);curd=batch('egg',[1,.72,.18,1]);bubble=batch('sizzle',[.9,.76,.38,.9]);steam=particleBatch(false,24);flame=particleBatch(true,24);
  sign=NetworkScene40.label('HOSPITALITY | HIBACHI');ticket=NetworkScene40.screen(512,768,()=>{});
  powerIcon=NetworkScene40.screen(128,128,(q)=>{q.fillStyle='#172d2a';q.fillRect(0,0,128,128);q.strokeStyle='#fff';q.lineWidth=9;q.lineCap='round';q.beginPath();q.arc(64,68,31,-Math.PI*.32,Math.PI*1.32);q.stroke();q.beginPath();q.moveTo(64,26);q.lineTo(64,66);q.stroke();}).batch;powerIcon.unlit=true;
  for(const name of ['grill','chef','egg','rice','steak-raw','steak-cooked','chicken-raw','chicken-cooked','shrimp','plate','spatula','fork','tongs'])await load(name);
  ready=true;
 }
 return {init,draw,at,origin,surface,powerSwitch,zones,trays,plate,get ready(){return ready;}};
})();
