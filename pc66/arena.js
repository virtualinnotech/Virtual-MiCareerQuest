/* A walk-through esports pavilion, in human-scale metres before venue scaling. */
window.PCArena84=(()=>{
 const collectionIds=['aurora','polar','ember','sunset','glacier','stealth','gold','emerald','rose','inferno'];
 const collectionDisplays=collectionIds.map((id,i)=>({id,p:[i<5?-5.62:5.62,2.94,-3.3+(i%5)*1.7],yaw:i<5?Math.PI:0}));
 const stations=[
  {p:[-2.3,0,-3.45],yaw:0,label:'RACE 01'},
  {p:[.3,0,-3.45],yaw:0,label:'RACE 02'},
  {p:[2.9,0,-3.45],yaw:0,label:'RACE 03'},
  {p:[-4.88,0,.05],yaw:Math.PI/2,label:'DUEL 04'},
  {p:[-4.88,0,2.85],yaw:Math.PI/2,label:'STREAM 05'},
  {p:[4.82,0,-.65],yaw:-Math.PI/2,label:'BUILD LAB'}
 ];
 function create(){
  const S=NetworkScene40,solid=[],glass=[],labels=[],collisions=[],M=color=>new S.Mesh(color),dark=M([.025,.033,.045,1]),panel=M([.07,.08,.10,1]),white=M([.76,.82,.86,1]),chrome=M([.38,.48,.56,1]),cyan=M([.02,.70,.85,1]),pink=M([.87,.07,.48,1]),lime=M([.39,.84,.10,1]),amber=M([.95,.49,.06,1]);
  const wall=(p,d)=>{panel.box(p,d);collisions.push({p,d});};
  dark.box([0,.006,0],[12,.012,10]);
  wall([0,1.85,-5],[12,3.7,.10]);wall([-6,1.85,0],[.10,3.7,10]);
  for(const z of [-4.90,4.90])cyan.box([0,.016,z],[11.85,.009,.022]);for(const x of [-5.90,5.90])pink.box([x,.016,0],[.022,.009,9.8]);
  // Floor inlays mark three zones while leaving the central circulation path open.
  for(const x of [-3.4,3.5])for(let z=-1.5;z<4;z+=.65)cyan.box([x,.018,z],[.016,.008,.36]);
  for(const x of [-5.85,5.85]){wall([x,1.52,4.85],[.20,3.04,.22]);chrome.line([x,3,4.85],[x-Math.sign(x)*.55,3.65,4.85],.20);cyan.line([x,0,4.71],[x,3.0,4.71],.022);pink.line([x,3.0,4.71],[x-Math.sign(x)*.55,3.65,4.71],.022);}
  dark.box([0,3.64,4.85],[10.8,.28,.25]);white.box([0,3.79,4.85],[10.8,.025,.27]);
  // Open overhead truss, with real cross braces and hanging light bars.
  for(const x of [-5.80,5.80]){for(const y of [3.52,3.76])chrome.line([x,y,-4.88],[x,y,4.65],.038);for(let z=-4.8;z<4.5;z+=.6)chrome.line([x,3.52,z],[x,3.76,z+.6],.017);}
  for(const z of [-4.7,.1,4.6]){chrome.line([-5.8,3.72,z],[5.8,3.72,z],.035);for(const x of [-3,0,3]){dark.box([x,3.54,z],[1.15,.06,.11]);white.box([x,3.50,z],[1.05,.013,.07]);}}
  for(const x of [-5.75,5.75])cyan.box([x,3.45,0],[.014,.02,9.1]);
  function screen(p,size,yaw,paint,w=1024,h=256){const s=S.screen(w,h,paint);labels.push({screen:s,matrix:transform(p,[...size,1],0,yaw)});return s;}
  function caption(value,p,size,yaw=0,color='#b9faff',sub=''){const w=Math.min(4096,Math.round(256*size[0]/size[1])),h=Math.round(w*size[1]/size[0]);return screen(p,size,yaw,(q,c)=>{q.fillStyle='#111925';q.fillRect(0,0,c.width,c.height);q.fillStyle=color;q.fillRect(0,0,c.width,3);q.textAlign='center';const text=(value,y,height)=>{let f=height;q.font=`700 ${f}px sans-serif`;f*=Math.min(1,c.width*.92/q.measureText(value).width);q.font=`700 ${f}px sans-serif`;q.fillText(value,c.width/2,y);};text(value,c.height*(sub?.59:.74),c.height*(sub?.53:.65));if(sub){q.fillStyle='#e7edf4';text(sub,c.height*.88,c.height*.18);}},w,h);}
  caption('PC ARENA',[0,3.65,5.00],[5.5,.33],0,'#8df3ff','BUILD  /  PLAY  /  COMPETE');
  caption('PC ARENA',[0,3.65,4.70],[5.5,.33],Math.PI,'#8df3ff');
  caption('NIGHT RUN CHAMPIONSHIP',[.3,3.46,-4.92],[6.5,.30],0,'#fc78c7','THREE LANES. ONE FINISH LINE.');
  caption('HARDWARE GALLERY',[-4.55,3.38,-4.87],[2.35,.28],0,'#beff78');
  caption('BUILD LAB',[5.82,2.44,-.65],[2.2,.28],-Math.PI/2,'#b9faff');
  caption('STREAM + DUEL',[-5.91,2.72,1.30],[3.1,.31],Math.PI/2,'#fc78c7');
  function hex(mesh,c,r,yaw=0){const matrix=transform(c,[1,1,1],0,yaw),normal=norm(sub(tp(matrix,0,0,1),tp(matrix,0,0,0))),base=mesh.v.length/6;mesh.v.push(...c,...normal);for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;mesh.v.push(...tp(matrix,r*Math.cos(a),r*Math.sin(a),0),...normal);}for(let i=0;i<6;i++)mesh.i.push(base,base+1+i,base+1+(i+1)%6);}
  for(let row=0;row<3;row++)for(let col=0;col<12;col++){const z=-3.75+col*.69+(row%2)*.345,y=1.94+row*.59;hex((row+col)%5===0?cyan:(row+col)%4===0?pink:chrome,[-5.936,y,z],.39,Math.PI/2);hex(panel,[-5.916,y,z],.35,Math.PI/2);}
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){const x=-5.50+col*.54+(row%2)*.27,y=2.08+row*.47;hex((col+row)%2?lime:cyan,[x,y,-4.925],.29);hex(dark,[x,y,-4.91],.255);}
  const raceImage=new Image(),extraScreens=[];raceImage.src='./pc66/pictures/arena-race84.jpg';
  function racePaint(q,c,time=0){q.fillStyle='#07131e';q.fillRect(0,0,c.width,c.height);if(raceImage.complete&&raceImage.naturalWidth)q.drawImage(raceImage,0,0,c.width,c.height);q.fillStyle='#07131ed9';q.fillRect(0,0,c.width,60);q.fillStyle='#b8f7ff';q.font='700 25px sans-serif';q.fillText('NIGHT RUN  /  DEMO MATCH',25,40);q.fillStyle='#ff6dc7';q.fillRect(0,c.height-8,c.width*((time*.06)%1),8);}
  dark.box([.30,2.42,-4.86],[6.35,1.86,.12]);cyan.box([.30,1.48,-4.775],[6.36,.02,.016]);
  const mainScreen=screen([.30,2.42,-4.785],[6.12,1.70],0,racePaint,1536,640);
  // GLTF monitor UVs use the opposite vertical origin from native venue screens.
  const broadcastPaint=(q,c,time=0)=>{q.save();q.translate(0,c.height);q.scale(1,-1);racePaint(q,c,time);q.restore();};
  const broadcast=S.screen(1024,426,broadcastPaint);
  const standings=screen([4.72,2.42,-4.91],[1.77,1.67],0,(q,c)=>{q.fillStyle='#0c1721';q.fillRect(0,0,c.width,c.height);q.fillStyle='#8aeeef';q.font='bold 38px sans-serif';q.fillText('QUALIFYING',35,67);q.font='22px sans-serif';q.fillStyle='#7f94a7';q.fillText('EXHIBITION DEMO',35,112);for(const [i,name]of ['CYAN TEAM','PINK TEAM','LIME TEAM'].entries()){q.fillStyle=['#67e8ef','#ed6da8','#b7e967'][i];q.fillRect(32,157+i*107,5,67);q.font='bold 30px sans-serif';q.fillText('0'+(i+1),52,190+i*107);q.font='24px sans-serif';q.fillText(name,118,190+i*107);q.fillStyle='#e9eff5';q.fillText(['38.42','39.18','40.06'][i]+' s',118,225+i*107);}},512,512);
  for(const [i,s]of stations.entries()){
   const matrix=transform(s.p,[1,1,1],0,s.yaw);for(const [p,d]of [[[0,.38,0],[2.2,.76,1.06]],[[-.22,.70,1.08],[.67,1.4,.68]],[[0,1.195,-.585],[2.2,.65,.08]]])collisions.push({p,d,matrix});
   if(i===3||i===4)collisions.push({p:[.825,.38,.65],d:[.55,.76,.77],matrix});
   const a=tp(matrix,0,.70,.545);caption(s.label,a,[1.15,.09],s.yaw,['#7aedff','#ff92bc','#c3f783'][i%3]);
   const accent=i<3?cyan:i<5?pink:lime;accent.box([0,.71,.525],[2.1,.013,.016],matrix);
  }
  // Streaming station gets a portrait side display and a suspended upper display.
  const stream=transform(stations[4].p,[1,1,1],0,stations[4].yaw);
  for(const [p,size]of [[[-.87,1.16,-.11],[.42,.64]],[[0,1.81,-.45],[.82,.41]]]){dark.box(p,[size[0]+.025,size[1]+.025,.035],stream);extraScreens.push(screen(tp(stream,p[0],p[1],p[2]+.026),size,stations[4].yaw,racePaint,768,432));}
  // Glass hardware vitrine and warm-lit parts wall in the actual room corner.
  wall([-4.70,.37,-3.73],[1.8,.74,1.38]);dark.box([-4.70,.76,-3.73],[1.87,.06,1.44]);lime.box([-4.70,.795,-3.00],[1.82,.013,.018]);
  const clear=M([.35,.80,.87,.075]);clear.box([-4.70,1.49,-3.73],[1.77,1.40,1.31]);glass.push(clear.build({surfaceType:8,transparent:true,rough:.08}));
  for(const x of [-5.58,-3.82])for(const z of [-4.38,-3.08])chrome.box([x,1.48,z],[.026,1.39,.026]);
  caption('INSIDE THE BUILD',[-4.70,.48,-3.02],[1.48,.19],0,'#c3f783','GPU  /  MEMORY  /  MOTHERBOARD');
  // A separate demonstration bar supplies a second activity area without blocking the aisle.
  const benchYaw=-Math.PI/2,bench=transform([4.82,0,2.15],[1,1,1],0,benchYaw);
  panel.box([0,.48,0],[1.8,.96,1.1],bench);collisions.push({p:[0,.48,0],d:[1.8,.96,1.1],matrix:bench});
  white.box([0,.98,0],[1.9,.06,1.16],bench);pink.box([0,.04,.56],[1.82,.016,.02],bench);
  caption('GPU BENCH',tp(bench,0,.69,.565),[1.44,.16],benchYaw,'#ffc17b','COOLING + PERFORMANCE');
  const gpuDisplays=[];
  for(let i=0;i<3;i++){
   const x=-.61+i*.61;
   dark.box([x,1.035,0],[.53,.05,.47],bench);
   (i===0?cyan:i===1?pink:lime).box([x,1.064,.22],[.49,.008,.018],bench);
   chrome.box([x,1.14,-.12],[.08,.18,.07],bench);
   gpuDisplays.push({p:tp(bench,x,1.20,0),yaw:benchYaw});
  }
  // The reward is separate from the room batches so no invisible obstacle exists before placement.
  const showcasePosition=[4.95,0,-3.62],showcaseYaw=-Math.PI/4,showcaseSolid=[],showcaseGlass=[],stand=M([.025,.035,.045,1]),trim=M([.52,.65,.69,1]),light=M([.10,.92,.73,1]),pane=M([.38,.88,.87,.045]);
  stand.box([0,.425,0],[1.04,.85,.86]);trim.box([0,.87,0],[1.07,.04,.89]);
  stand.box([0,.899,0],[1.02,.018,.84]);
  for(const x of [-.50,.50])light.box([x,.91,0],[.009,.009,.80]);
  for(const z of [-.40,.40])light.box([0,.91,z],[1,.009,.009]);
  for(const x of [-.52,.52])for(const z of [-.42,.42])trim.box([x,1.27,z],[.012,.72,.012]);
  stand.box([0,1.645,0],[1.09,.05,.91]);
  light.box([0,1.615,.38],[.93,.008,.008]);
  for(const x of [-.53,.53])pane.box([x,1.27,0],[.008,.72,.84]);
  for(const z of [-.43,.43])pane.box([0,1.27,z],[1.06,.72,.008]);
  const showcaseLabel=S.label('Your Build');
  showcaseSolid.push(stand.build({rough:.3,metal:.45}),trim.build({metal:.7,rough:.24}),light.build({emission:[.12,1.3,.85]}));
  showcaseGlass.push(pane.build({surfaceType:8,transparent:true,rough:.08}));
  // A continuous glazed side leaves the front opening as the only public entrance.
  const sideGlass=M([.40,.78,.86,.13]);
  sideGlass.box([5.97,1.77,-.025],[.025,3.5,9.85]);
  glass.push(sideGlass.build({surfaceType:8,transparent:true,metal:.65,rough:.07}));
  collisions.push({p:[5.97,1.77,-.025],d:[.06,3.54,9.85]});
  for(const z of [-4.95,-1.65,1.65,4.9])chrome.box([5.97,1.78,z],[.055,3.56,.045]);
  for(const y of [.055,3.52])chrome.box([5.97,y,-.025],[.07,.045,9.85]);
  for(const [cluster,z]of [-3.35,-.10,3.05].entries())for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const center=[5.935,1.96+row*.55,z+col*.64+(row%2)*.32-.8],points=[];
   for(let i=0;i<=6;i++){const a=i*Math.PI/3+Math.PI/6;points.push([center[0],center[1]+.34*Math.sin(a),center[2]+.34*Math.cos(a)]);}
   (cluster===0?cyan:cluster===1?pink:lime).tube(points,.013);
  }
  // Upper galleries keep all ten rewards visible without covering the championship screen.
  for(const x of [-5.62,5.62]){dark.box([x,2.90,.10],[.68,.08,8.45]);cyan.box([x-Math.sign(x)*.345,2.915,.10],[.016,.025,8.42]);for(const z of [-3.8,.1,4]){chrome.line([x,2.85,z],[x+Math.sign(x)*.25,3.5,z],.025);}}
  for(const [i,d]of collectionDisplays.entries()){const x=d.p[0]-Math.sign(d.p[0])*.35;caption(['AURORA LOOP','POLAR NIGHT','EMBER CORE','SUNSET GLASS','GLACIER WHITE','STEALTH MESH','GOLD EDITION','EMERALD AIR','ROSE QUARTZ','INFERNO'][i],[x,2.82,d.p[2]],[1.30,.11],d.p[0]<0?Math.PI/2:-Math.PI/2,'#d8f8ff');}
  // Low open-front rails leave a broad, unobstructed entrance in the centre.
  for(const x of [-4.40,4.40]){wall([x,.46,4.64],[2.4,.92,.09]);cyan.line([x-1.2,.05,4.70],[x+1.2,.88,4.70],.016);}
  solid.push(dark.build({rough:.52}),panel.build(),white.build({rough:.32}),chrome.build({metal:.6,rough:.28}),cyan.build({emission:[.01,.9,1.1]}),pink.build({emission:[1,.02,.30]}),lime.build({emission:[.30,.9,.02]}),amber.build({emission:[1,.32,.01]}));
  function matrixPaint(q,c,time=0){
   q.fillStyle='#080d12';q.fillRect(0,0,c.width,c.height);
   const shift=Math.floor(time*.025*104);
   for(let x=0;x<104;x++)for(let y=0;y<16;y++){q.fillStyle=`hsl(${(((x+shift)%104)*2.8+y*2)%360},95%,64%)`;q.fillRect(x*5,y*6,3,4);}
  }
  const matrixLights=S.screen(512,96,matrixPaint);
  function filterMatrix(){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,matrixLights.batch.baseTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.generateMipmap(gl.TEXTURE_2D);gl.activeTexture(gl.TEXTURE0);}
  filterMatrix();
  let last=-1;function update(time){if(time-last<.08)return;last=time;matrixLights.update((q,c)=>matrixPaint(q,c,time));filterMatrix();for(const s of [mainScreen,...extraScreens])s.update((q,c)=>racePaint(q,c,time));broadcast.update((q,c)=>broadcastPaint(q,c,time));}
  return {matrixLights,sideWall:{x:5.97,height:3.54,length:9.85,entrance:'front'},showcasePosition,showcaseYaw,showcaseLabel,showcaseSolid,showcaseGlass,gpuDisplays,benchYaw,stations,collectionDisplays,solid,glass,labels,collisions,broadcast,update,galleryPosition:[-4.70,.82,-3.73],bounds:[[-6,0,-5],[6,3.85,5]],zones:3};
 }
 return {stations,create};
})();
