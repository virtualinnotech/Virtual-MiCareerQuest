import * as THREE from 'three';

// All small contacts, fins and solder joints remain geometry when inspected up close.
export function detailedHardware(h){
 const {mesh,box,roundBox,cylinder,batch,screws,text,tube,bake,white,silver,steel,black,pcb,gold,led,rotors}=h;
 const darkBoard=new THREE.MeshStandardMaterial({color:0x171c20,roughness:.72,metalness:.18});
 const substrate=new THREE.MeshStandardMaterial({color:0x164954,roughness:.65,metalness:.2});
 function rainbow(radial=false){const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d'),gradient=radial?q.createConicGradient(0,128,128):q.createLinearGradient(0,0,0,256);for(let i=0;i<=12;i++)gradient.addColorStop(i/12,`hsl(${i*30},85%,64%)`);q.fillStyle=gradient;q.fillRect(0,0,256,256);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const m=led(0xffffff,2.2);m.emissiveMap=map;m.userData.gradientRGB=true;return m;}
 const ringRGB=rainbow(true),memoryRGB=rainbow();
 function decal(g,p,w,height,paint,axis='x',name='Hardware marking'){
  const c=document.createElement('canvas');c.width=1024;c.height=Math.max(128,Math.round(1024*height/w));paint(c.getContext('2d'),c);
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  const m=new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.44,metalness:.15});
  const o=mesh(g,new THREE.PlaneGeometry(w,height),m,p,name);if(axis==='x')o.rotation.y=-Math.PI/2;else if(axis==='back')o.rotation.y=Math.PI;else if(axis==='up')o.rotation.x=-Math.PI/2;return o;
 }
 function rog(q,c,color='#81ddfa'){
  q.save();q.scale(c.width/200,c.height/120);q.fillStyle=color;
  for(const points of [[[14,31],[53,51],[178,14],[115,65],[74,72],[136,42],[48,65]],[[20,43],[57,78],[94,90],[155,65],[133,94],[86,111],[51,99]]]){q.beginPath();points.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill();}q.restore();
 }
 function motherboardBack(g){
  box(g,[.431,1.824,-.44],[.006,1.30,1.235],darkBoard,'Matte motherboard rear PCB');
  const joints=[],pads=[],tracks=[];
  for(let row=0;row<28;row++)for(let col=0;col<29;col++){
   const y=1.205+row*.044,z=-1.018+col*.040;
   if(y>1.78&&y<2.25&&z>-.69&&z<-.23)continue;
   if((row*17+col*13)%7<3)joints.push([.438,y,z]);
   if((row*7+col*11)%13===0)pads.push([.439,y,z]);
   if(col%5===0&&row%3===0)tracks.push([.435,y,z]);
  }
  for(const y of [1.25,1.40,1.56])for(let i=0;i<64;i++)joints.push([.441,y,-.91+i*.011]);
  for(const z of [-.25,-.1596,-.0607,.04])for(let i=0;i<52;i++)joints.push([.440,1.67+i*.014,z]);
  batch(g,new THREE.SphereGeometry(.0038,6,4),silver,joints);
  batch(g,new THREE.BoxGeometry(.003,.009,.013),gold,pads);
  batch(g,new THREE.BoxGeometry(.001,.0017,.071),steel,tracks);
  const small=Array.from({length:38},(_,i)=>[.438,1.25+(i%10)*.119,-.91+Math.floor(i/10)*.27]);batch(g,new THREE.BoxGeometry(.007,.013,.020),black,small);
  // Four-sided socket stiffener leaves its central solder window exposed.
  for(const y of [1.82,2.22])roundBox(g,[.445,y,-.465],[.016,.052,.42],black,.003);
  for(const z of [-.65,-.28])roundBox(g,[.445,2.02,z],[.016,.35,.05],black,.003);
  const socketPads=[];for(let a=0;a<12;a++)for(let b=0;b<10;b++)socketPads.push([.439,1.90+a*.02,-.56+b*.02]);batch(g,new THREE.BoxGeometry(.004,.009,.012),silver,socketPads);
  screws(g,[1.82,2.22].flatMap(y=>[-.65,-.28].map(z=>[.46,y,z])),'x',.009);
  for(const y of [1.23,1.82,2.42])for(const z of [-1.0,.105]){cylinder(g,[.440,y,z],.020,.004,steel,'x');cylinder(g,[.443,y,z],.011,.005,black,'x');}
  g.userData.rearSolderJoints=joints.length;
 }
 function cpu(g){
  const root=new THREE.Group();root.name='AMD Ryzen 7 9800X3D';root.position.set(.351,2.02,-.465);root.rotation.y=-Math.PI/2;g.add(root);
  roundBox(root,[0,0,-.010],[.255,.255,.012],substrate,.002);
  const contacts=[];for(let i=0;i<22;i++)for(let j=0;j<22;j++)if(!(i>7&&i<14&&j>7&&j<14))contacts.push([-.111+i*.0105,-.111+j*.0105,-.018]);batch(root,new THREE.BoxGeometry(.006,.006,.002),gold,contacts);
  const outline=[[-.112,-.112],[-.065,-.112],[-.065,-.086],[.065,-.086],[.065,-.112],[.112,-.112],[.112,-.065],[.086,-.065],[.086,.065],[.112,.065],[.112,.112],[.065,.112],[.065,.086],[-.065,.086],[-.065,.112],[-.112,.112],[-.112,.065],[-.086,.065],[-.086,-.065],[-.112,-.065]];
  const shape=new THREE.Shape();outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  mesh(root,new THREE.ExtrudeGeometry(shape,{depth:.020,bevelEnabled:true,bevelSize:.0015,bevelThickness:.0015,bevelSegments:2,steps:1}),silver,[0,0,-.003],'Notched AM5 heat spreader');
  const caps=[];for(const side of [-1,1])for(let i=0;i<9;i++){caps.push([side*.104,-.055+i*.014,-.001]);caps.push([-.055+i*.014,side*.104,-.001]);}batch(root,new THREE.BoxGeometry(.005,.007,.006),silver,caps);
  decal(root,[0,0,.020],.158,.146,(q,c)=>{q.fillStyle='#383d3f';q.textAlign='center';q.font='bold 174px sans-serif';q.fillText('AMD',512,197);q.font='bold 134px sans-serif';q.fillText('RYZEN',512,359);q.font='bold 48px sans-serif';q.fillText('AMD Ryzen 7 9800X3D',512,472);q.font='27px monospace';q.fillText('100-000001084',585,565);q.fillText('MADE IN MALAYSIA',585,614);q.fillText('2024 AMD',585,662);for(let y=0;y<15;y++)for(let x=0;x<15;x++)if((x*11+y*7+x*y)%5<3)q.fillRect(83+x*10,551+y*10,8,8);},'z','Laser-etched Ryzen identification');
  g.userData.model='AMD Ryzen 7 9800X3D';bake(g);
 }
 function memory(g,z,color){
  box(g,[.346,2.032,z],[.158,.72,.021],darkBoard,'Memory PCB');
  for(const side of [-1,1]){
   const points=[[.274,1.678],[.378,1.678],[.398,1.716],[.398,2.35],[.375,2.385],[.274,2.385],[.259,2.35],[.259,1.714]];
   const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
   for(let i=0;i<12;i++){const y=1.735+i*.052,hole=new THREE.Path();hole.moveTo(.284,y);hole.lineTo(.296,y+.006);hole.lineTo(.301,y+.020);hole.lineTo(.289,y+.014);hole.closePath();shape.holes.push(hole);}
   mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:true,bevelSize:.002,bevelThickness:.001,bevelSegments:1,steps:1}),white,[0,0,z+side*.022],'Vengeance vented white heat spreader');
   const label=decal(g,[.337,2.032,z+side*.033],.48,.065,(q,c)=>{q.fillStyle='#14181b';q.fillRect(0,0,c.width,c.height);q.fillStyle='#e8edef';q.font='500 72px sans-serif';q.textAlign='center';q.fillText('VENGEANCE RGB PRO',512,86);},side>0?'z':'back','Corsair Vengeance badge');label.rotation.z=Math.PI/2;
   const brand=text(g,'CORSAIR',[.283,2.032,z+side*.033],.24,.024,'#65737c','z');brand.rotation.z=Math.PI/2;if(side<0)brand.rotation.y=Math.PI;
  }
  const pins=[];for(let i=0;i<61;i++)if(i!==30&&i!==31)for(const side of [-1,1])pins.push([.419,1.695+i*.0112,z+side*.012]);batch(g,new THREE.BoxGeometry(.019,.0065,.002),gold,pins);
  const smd=[];for(let i=0;i<10;i++)for(const side of [-1,1])smd.push([.402,1.72+i*.067,z+side*.012]);batch(g,new THREE.BoxGeometry(.015,.019,.005),black,smd);
  roundBox(g,[.251,2.032,z],[.019,.68,.039],memoryRGB,.004).name='Continuous RAM RGB diffuser';
  g.userData.model='Corsair Vengeance RGB Pro White';bake(g);
 }
 function gpuFan(g,p,up=false,rainbow=false){
  const root=new THREE.Group();root.name='ROG axial-tech cooling fan';root.userData.articulated=true;root.position.set(...p);root.scale.setScalar(1.08);root.rotation.x=up?-Math.PI/2:Math.PI/2;g.add(root);
  const ring=mesh(root,new THREE.TorusGeometry(.231,.009,8,64),silver,[0,0,0]);
  if(rainbow)mesh(root,new THREE.RingGeometry(.240,.253,96),ringRGB,[0,0,.002]);
  const rotor=new THREE.Group();rotor.name='Animated fan blades';rotor.userData.articulated=true;root.add(rotor);rotors.push(rotor);
  const blade=new THREE.Shape();blade.moveTo(.043,.023);blade.bezierCurveTo(.13,.005,.215,.045,.219,.098);blade.bezierCurveTo(.197,.155,.156,.181,.119,.189);blade.bezierCurveTo(.167,.089,.077,.07,.035,.055);blade.closePath();
  const geo=new THREE.ExtrudeGeometry(blade,{depth:.011,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1,curveSegments:12,steps:1});
  for(let i=0;i<7;i++){const o=mesh(rotor,geo,white,[0,0,-.010]);o.rotation.z=i*Math.PI*2/7;}
  cylinder(rotor,[0,0,.004],.064,.035,silver,'z',32);cylinder(rotor,[0,0,.025],.060,.008,white,'z',32);
  decal(rotor,[0,0,.030],.102,.067,(q,c)=>{const gradient=q.createLinearGradient(0,0,c.width,c.height);gradient.addColorStop(0,'#e9c179');gradient.addColorStop(.3,'#71dacd');gradient.addColorStop(.65,'#79b5f1');gradient.addColorStop(1,'#b899e2');rog(q,c,gradient);},'z','ROG fan hub');bake(rotor);bake(root);
 }
 function gpu(g){
  box(g,[.065,1.515,-.27],[.43,.19,1.60],black,'GPU vapor chamber');
  batch(g,new THREE.BoxGeometry(.61,.20,.0045),silver,Array.from({length:102},(_,i)=>[.055,1.515,-1.073+i*.016]));
  // Perforated covers have actual openings, not disks laid over a solid box.
  function cover(y,holes){const s=new THREE.Shape();s.moveTo(-.300,-1.115);s.lineTo(.410,-1.115);s.lineTo(.410,.575);s.lineTo(-.300,.575);s.closePath();for(const [x,z,r]of holes){const hole=new THREE.Path();hole.absarc(x,z,r,0,Math.PI*2,true);s.holes.push(hole);}const o=mesh(g,new THREE.ExtrudeGeometry(s,{depth:.019,bevelEnabled:true,bevelSize:.005,bevelThickness:.004,bevelSegments:2,curveSegments:40,steps:1}),white,[0,y,0],'Sculpted ROG GPU shroud');o.rotation.x=Math.PI/2;}
  // The cover shape's second coordinate becomes world Z after its X rotation.
  cover(1.399,[-.81,-.27,.27].map(z=>[.055,z,.256]));cover(1.674,[[.055,.27,.256],[.055,-.62,.123]]);
  for(const [i,z]of [-.81,-.27,.27].entries())gpuFan(g,[.055,1.376,z],false,i===2);gpuFan(g,[.055,1.687,.27],true,true);
  for(const z of [-1.105,.565])box(g,[.055,1.53,z],[.70,.255,.025],white);
  for(const y of [1.369,1.684])for(const side of [-1,1])for(const z of [-1.03,-.48,.06])tube(g,[[.055+side*.31,y,z],[.055+side*.30,y,z+.11],[.055+side*.19,y,z+.17]],.0028,steel);
  for(const x of [-.293,.403])for(const y of [1.414,1.631])box(g,[x,y,-.27],[.018,.027,1.66],white);
  box(g,[-.311,1.416,-.27],[.015,.050,1.62],white);box(g,[-.322,1.448,-.27],[.009,.014,1.60],led(0x639aff,2.2));
  text(g,'GEFORCE RTX',[-.326,1.415,-.68],.62,.039,'#76828c','x');text(g,'REPUBLIC OF GAMERS',[-.327,1.414,.11],.66,.022,'#72828d','x');
  const backPins=[];for(let a=0;a<13;a++)for(let b=0;b<10;b++)backPins.push([-.033+a*.014,1.661,-.69+b*.014]);batch(g,new THREE.BoxGeometry(.008,.004,.008),gold,backPins);
  for(const z of [-.97,-.24]){const mark=text(g,z<-.5?'GEFORCE RTX':'ROG  ASTRAL',[.055,1.680,z],.46,.045,'#8b949a','z');mark.rotation.x=-Math.PI/2;}
  for(const x of [-.263,.373])for(const z of [-1.07,-.49,.03,.535])screws(g,[[x,1.691,z]],'y',.013);
  // A connector at the outer top edge clears the fourth fan and existing coolant hoses.
  box(g,[-.268,1.689,.18],[.082,.028,.085],black,'12V GPU power socket');
  batch(g,new THREE.BoxGeometry(.009,.007,.011),gold,Array.from({length:12},(_,i)=>[-.29+(i%6)*.009,1.706,.158+Math.floor(i/6)*.025]));
  box(g,[.371,1.568,-.46],[.075,.027,.63],darkBoard);batch(g,new THREE.BoxGeometry(.075,.004,.012),gold,Array.from({length:32},(_,i)=>[.417,1.567,-.745+i*.018]));
  box(g,[.045,1.50,-1.223],[.74,.28,.022],silver);
  for(const [i,x]of [-.23,-.085,.06,.205,.35].entries()){roundBox(g,[x,1.55,-1.239],[.118,.053,.014],black,.004);box(g,[x,1.548,-1.249],[.083,.009,.005],steel);text(g,i<3?'DP':'HDMI',[x,1.597,-1.238],.082,.021,'#465159','back');}
  for(let i=0;i<13;i++)roundBox(g,[-.26+i*.052,1.444,-1.238],[.024,.071,.009],black,.002);screws(g,[[-.285,1.607,-1.242],[.374,1.397,-1.242]],'z');
  g.userData.model='ASUS ROG Astral GeForce RTX White';g.userData.fanCount=4;bake(g);
 }
 function powerSupply(g){
  box(g,[0,.299,-.805],[.86,.014,.79],white);
  for(const x of [-.423,.423])box(g,[x,.482,-.805],[.014,.38,.79],white);
  for(const z of [-1.193,-.417])box(g,[0,.482,z],[.86,.38,.014],white);
  const top=new THREE.Shape();top.moveTo(-.43,-1.20);top.lineTo(.43,-1.20);top.lineTo(.43,-.41);top.lineTo(-.43,-.41);top.closePath();const opening=new THREE.Path();opening.absarc(0,-.805,.294,0,Math.PI*2,true);top.holes.push(opening);const plate=mesh(g,new THREE.ExtrudeGeometry(top,{depth:.010,bevelEnabled:false,steps:1,curveSegments:48}),white,[0,.678,0]);plate.rotation.x=Math.PI/2;
  box(g,[-.434,.482,-.805],[.012,.34,.75],white,'ROG Thor white side panel');
  box(g,[-.444,.486,-.935],[.006,.151,.36],led(0x4eddeb,1.8));box(g,[-.449,.486,-.935],[.008,.125,.325],black);
  decal(g,[-.456,.486,-.935],.285,.086,(q,c)=>{q.fillStyle='#effcff';q.font='bold 245px sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText('1200W',512,c.height/2);},'x','1200W PSU capacity');text(g,'ROG THOR',[-.456,.355,-.985],.23,.026,'#6b7780','x');
  decal(g,[-.443,.5,-.548],.23,.17,(q,c)=>rog(q,c,'#35cedc'),'x','ROG power supply emblem');
  for(let i=0;i<3;i++)tube(g,[[-.444,.635,-.78+i*.027],[-.444,.61,-.74+i*.027],[-.444,.35,-.43+i*.013]],.002,steel);
  cylinder(g,[0,.642,-.805],.292,.008,black);gpuFan(g,[0,.684,-.805],true,false);
  for(let i=-8;i<=8;i++){const x=i*.033,l=Math.sqrt(Math.max(0,.29**2-x*x))*2;box(g,[x,.725,-.805],[.012,.012,l],white);}
  box(g,[0,.49,-1.222],[.85,.37,.018],white,'Perforated PSU rear');
  const holes=[];for(let y=0;y<12;y++)for(let x=0;x<23;x++){const px=-.397+x*.034+(y%2)*.017,py=.329+y*.028;if(px<-.13&&py>.42&&py<.60)continue;holes.push([px,py,-1.234]);}batch(g,new THREE.CylinderGeometry(.010,.010,.004,6),black,holes,[Math.PI/2,0,0]);
  roundBox(g,[-.265,.512,-1.239],[.155,.115,.016],steel,.006);roundBox(g,[-.265,.512,-1.250],[.123,.088,.008],black,.006);for(const x of [-.295,-.264,-.233])box(g,[x,.512,-1.257],[.010,.034,.009],silver);
  box(g,[-.125,.512,-1.240],[.072,.103,.015],black);text(g,'I  O',[-.125,.512,-1.251],.052,.033,'#eaf0f3','back');
  for(let row=0;row<2;row++)for(let col=0;col<4;col++){box(g,[-.28+col*.18,.415+row*.12,-.399],[.133,.077,.016],black);for(let pin=0;pin<6;pin++)box(g,[-.321+col*.18+(pin%3)*.039,.40+row*.12+Math.floor(pin/3)*.03,-.388],[.017,.017,.009],steel);}
  screws(g,[-.39,.39].flatMap(x=>[.331,.65].map(y=>[x,y,-1.24])),'z');g.userData.model='ASUS ROG Thor 1200W White';bake(g);
 }
 return {motherboardBack,cpu,memory,gpu,powerSupply};
}
