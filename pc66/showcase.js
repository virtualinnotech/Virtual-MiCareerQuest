import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {detailedHardware} from './hardware85.js?v=20261009-hardware85';

const v=p=>new THREE.Vector3(...p);
export const layout={fanZ:[-.72,0,.72],bottomY:.81,topY:2.64,rear:[-.16,2.19,-1.135]};

export function showcase(){
 const grain=document.createElement('canvas');grain.width=grain.height=128;const grainContext=grain.getContext('2d');
 for(let x=0;x<128;x++){const shade=155+((x*73)%91);grainContext.fillStyle=`rgb(${shade},${shade},${shade})`;grainContext.fillRect(x,0,1,128);}
 const brushed=new THREE.CanvasTexture(grain);brushed.wrapS=brushed.wrapT=THREE.RepeatWrapping;brushed.repeat.set(3,1);
 const white=new THREE.MeshStandardMaterial({color:0xf3f4f6,metalness:.32,roughness:.28});
 const silver=new THREE.MeshStandardMaterial({color:0xc6cdd1,metalness:.83,roughness:.34,roughnessMap:brushed,bumpMap:brushed,bumpScale:.0008});
 const steel=new THREE.MeshStandardMaterial({color:0x78838c,metalness:.8,roughness:.36});
 const black=new THREE.MeshStandardMaterial({color:0x10151b,metalness:.15,roughness:.56});
 const pcb=new THREE.MeshStandardMaterial({color:0x33434d,metalness:.2,roughness:.65});
 const gold=new THREE.MeshStandardMaterial({color:0xcda65f,metalness:.8,roughness:.3});
 const cableWhite=new THREE.MeshStandardMaterial({color:0xe2e8ee,roughness:.76});
 const emitters=[],rotors=[],screens=[];
 function led(color,intensity=4){const m=new THREE.MeshStandardMaterial({color:0x3a4046,emissive:color,emissiveIntensity:0,roughness:.28});m.userData.rgb={color:new THREE.Color(color),intensity};emitters.push(m);return m;}
 function mesh(g,geometry,material,p,name=''){const o=new THREE.Mesh(geometry,material);o.position.set(...p);o.name=name;g.add(o);return o;}
 function box(g,p,size,m=white,name=''){return mesh(g,new THREE.BoxGeometry(...size),m,p,name);}
 function roundBox(g,p,size,m=white,r=.025){
  const [w,h,d]=size,x=-w/2,y=-h/2,s=new THREE.Shape();r=Math.min(r,w/3,h/3,d/3);
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const geo=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r,bevelThickness:r,curveSegments:4});geo.translate(0,0,-d/2+r);return mesh(g,geo,m,p);
 }
 function cylinder(g,p,r,h,m=silver,axis='y',segments=20){const o=mesh(g,new THREE.CylinderGeometry(r,r,h,segments),m,p);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 function batch(g,geometry,m,positions,rotation){const o=new THREE.InstancedMesh(geometry,m,positions.length),t=new THREE.Object3D();positions.forEach((p,i)=>{t.position.set(...p);t.rotation.set(...(rotation||[0,0,0]));t.updateMatrix();o.setMatrixAt(i,t.matrix);});g.add(o);return o;}
 function screws(g,positions,axis='z',radius=.010){
  const rot=axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0];batch(g,new THREE.CylinderGeometry(radius,radius,.007,12),steel,positions,rot);
  const d=axis==='x'?[.008,.002,radius*1.1]:axis==='z'?[radius*1.1,.002,.009]:[radius*1.1,.008,.002];batch(g,new THREE.BoxGeometry(...d),black,positions);
 }
 function text(g,words,p,w,h,color='#aeb8c2',axis='x',lit=false){
  const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='600 45px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(words,256,48);
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.4,metalness:.2});if(lit){m.emissive.set(0xffffff);m.emissiveMap=map;m.userData.rgb={color:new THREE.Color(0x64f6e2),intensity:3};emitters.push(m);}
  const o=mesh(g,new THREE.PlaneGeometry(w,h),m,p);if(axis==='x')o.rotation.y=-Math.PI/2;if(axis==='back')o.rotation.y=Math.PI;return o;
 }
 function tube(g,points,r,m=cableWhite,segments=40){return mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v)),segments,r,8,false),m,[0,0,0]);}
 // Merge fixed details by material; articulated fan blades and screens stay separate.
 function bake(g){
  g.updateMatrixWorld(true);const inverse=g.matrixWorld.clone().invert(),sets=new Map(),nodes=[];
  g.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.material.transparent||o.userData.keep)return;for(let a=o.parent;a&&a!==g;a=a.parent)if(a.userData.articulated)return;const list=sets.get(o.material)||[];list.push(o);sets.set(o.material,list);});
  for(const [m,list]of sets){if(list.length<2)continue;const geometries=list.map(o=>{const geo=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));return geo.index?geo.toNonIndexed():geo;});const geo=mergeGeometries(geometries,false);if(!geo)continue;const o=new THREE.Mesh(geo,m);o.name='Batched surface details';o.userData.partNames=list.map(o=>o.name).filter(Boolean);g.add(o);nodes.push(...list);for(const temp of geometries)temp.dispose();}
  for(const o of nodes)o.removeFromParent();g.userData.detailCount=nodes.length;return g;
 }
 function fan(g,p,color,axis='y',size=.65){
  const root=new THREE.Group();root.name='RGB cooling fan';root.userData.articulated=true;root.position.set(...p);root.scale.setScalar(size);if(axis==='y')root.rotation.x=-Math.PI/2;if(axis==='down')root.rotation.x=Math.PI/2;g.add(root);
  const shape=new THREE.Shape();shape.moveTo(-.5,-.5);shape.lineTo(.5,-.5);shape.lineTo(.5,.5);shape.lineTo(-.5,.5);shape.closePath();const hole=new THREE.Path();hole.absarc(0,0,.432,0,Math.PI*2,true);shape.holes.push(hole);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.105,bevelEnabled:true,bevelSize:.012,bevelThickness:.009,bevelSegments:2,curveSegments:24,steps:1});geo.translate(0,0,-.052);mesh(root,geo,white,[0,0,0]);
  const diffuser=led(color);diffuser.side=THREE.DoubleSide;for(const z of [-.065,.065]){const ring=mesh(root,new THREE.RingGeometry(.378,.431,64),diffuser,[0,0,z],'RGB fan diffuser');ring.userData.keep=true;}
  for(const x of [-.438,.438])for(const y of [-.438,.438])roundBox(root,[x,y,0],[.10,.10,.12],steel,.01);
  screws(root,[-1,1].flatMap(x=>[-1,1].map(y=>[x*.438,y*.438,.068])),'z',.027);
  const rotor=new THREE.Group();rotor.name='Animated fan blades';rotor.userData.articulated=true;root.add(rotor);rotors.push(rotor);
  const bladeShape=new THREE.Shape();bladeShape.moveTo(.05,.08);bladeShape.bezierCurveTo(.19,.095,.33,.20,.34,.29);bladeShape.quadraticCurveTo(.24,.39,.12,.38);bladeShape.bezierCurveTo(.18,.23,.09,.17,-.02,.11);bladeShape.closePath();
  const bladeGeo=new THREE.ExtrudeGeometry(bladeShape,{depth:.012,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:1,curveSegments:8,steps:1});
  for(let i=0;i<9;i++){const blade=mesh(rotor,bladeGeo,white,[0,0,0]);blade.rotation.z=i*Math.PI*2/9;}
  cylinder(rotor,[0,0,0],.108,.08,silver,'z',32);cylinder(rotor,[0,0,.047],.078,.014,steel,'z',32);
  // Rotor is a single draw per material, regardless of blade count.
  bake(rotor);bake(root);return root;
 }
 function enclosure(caseGroup,panel,shroud){
  roundBox(caseGroup,[0,.055,0],[1.28,.08,2.53],white,.022);
  for(const x of [-.46,.46])for(const z of [-.94,.94]){box(caseGroup,[x,.14,z],[.08,.13,.16],steel);const foot=cylinder(caseGroup,[x,.011,z],.055,.018,black);foot.name='Solid case foot';foot.userData.keep=true;}
  roundBox(caseGroup,[0,.24,0],[1.23,.10,2.43],white,.018);
  for(const x of [-.565,.565])roundBox(caseGroup,[x,2.91,0],[.10,.10,2.43],white,.014);
  for(const z of [-1.14,1.14])roundBox(caseGroup,[0,2.91,z],[1.09,.10,.15],white,.014);
  for(const x of [-.58,.58])box(caseGroup,[x,1.57,-1.16],[.065,2.60,.07],white);
  box(caseGroup,[.575,1.62,-.05],[.055,2.43,2.22],white);
  // Open frames leave real spaces for the glass, radiator and bottom intake fans.
  for(const x of [-.51,.51])for(const y of [.73,2.80])box(caseGroup,[x,y,0],[.16,.12,2.30],white);
  for(const z of [-1.10,1.10])for(const y of [.73,2.80])box(caseGroup,[0,y,z],[1.04,.12,.10],white);
  batch(caseGroup,new THREE.BoxGeometry(.91,.024,.017),white,Array.from({length:34},(_,i)=>[0,2.925,-1.05+i*.064]));
  // Rear expansion covers, I/O aperture, fan opening and power-supply aperture.
  for(const x of [-.535,.535])box(caseGroup,[x,1.64,-1.195],[.13,2.43,.032]);
  for(const y of [.77,1.05,1.71,2.64,2.81])box(caseGroup,[0,y,-1.195],[1.07,.055,.032]);
  box(caseGroup,[.19,2.18,-1.195],[.04,.87,.032]);
  for(let i=0;i<7;i++){
   const y=1.10+i*.082;box(caseGroup,[-.15,y,-1.20],[.64,.016,.025]);
   batch(caseGroup,new THREE.BoxGeometry(.017,.06,.026),white,Array.from({length:8},(_,k)=>[-.46+k*.088,y+.032,-1.20]));
  }
  batch(caseGroup,new THREE.BoxGeometry(.016,.73,.027),white,Array.from({length:10},(_,i)=>[-.51+i*.074,2.18,-1.196]));
  screws(caseGroup,[-.54,.54].flatMap(x=>[.48,.95,1.75,2.63,2.83].map(y=>[x,y,-1.218])),'z');
  for(const y of [1.30,1.82,2.34])for(const z of [-.94,-.45,.04])cylinder(caseGroup,[.47,y,z],.025,.085,gold,'x',12);
  // The lower bay includes actual front I/O connectors, mounting screws and a raised base.
  roundBox(shroud,[0,.475,0],[1.18,.38,2.30],white,.016);
  box(shroud,[-.598,.51,0],[.012,.24,2.18],black);
  box(shroud,[0,.51,1.165],[1.13,.24,.012],black);
  const matrixGeo=new THREE.PlaneGeometry(2.18,.24),matrixCanvas=document.createElement('canvas');matrixCanvas.width=512;matrixCanvas.height=96;const ctx=matrixCanvas.getContext('2d');ctx.fillStyle='#080d12';ctx.fillRect(0,0,512,96);
  for(let x=0;x<104;x++)for(let y=0;y<16;y++){ctx.fillStyle=`hsl(${(x*2.8+y*2)%360},95%,64%)`;ctx.fillRect(x*5,y*6,3,4);}
  const matrixMap=new THREE.CanvasTexture(matrixCanvas);matrixMap.colorSpace=THREE.SRGBColorSpace;matrixMap.magFilter=THREE.NearestFilter;matrixMap.wrapS=THREE.RepeatWrapping;
  const matrixMat=led(0xffffff,3);matrixMat.map=matrixMap;matrixMat.emissiveMap=matrixMap;
  matrixMat.userData.matrix=true;
  const matrix=mesh(shroud,matrixGeo,matrixMat,[-.608,.51,0],'RGB matrix fascia');matrix.rotation.y=-Math.PI/2;matrix.userData.keep=true;
  const frontMatrix=mesh(shroud,new THREE.PlaneGeometry(1.12,.24),matrixMat,[0,.51,1.175]);frontMatrix.userData.keep=true;
  roundBox(caseGroup,[.15,.275,1.225],[.69,.085,.015],steel,.005);
  for(const x of [.03,.19]){box(caseGroup,[x,.275,1.237],[.11,.037,.006],black);box(caseGroup,[x,.274,1.242],[.087,.010,.005],silver);}
  roundBox(caseGroup,[.36,.275,1.238],[.067,.025,.008],black,.006);cylinder(caseGroup,[-.05,.275,1.24],.018,.009,black,'z');cylinder(caseGroup,[-.20,.275,1.24],.029,.012,silver,'z');
  text(caseGroup,'HARDWARE LAB',[-.615,.284,-.67],.57,.056,'#626c74');
  const glass=new THREE.MeshPhysicalMaterial({color:0xe4eef4,transparent:true,opacity:.065,metalness:.02,roughness:.08,envMapIntensity:.45,depthWrite:false,side:THREE.DoubleSide});
  const side=box(panel,[-.615,1.59,0],[.006,2.54,2.33],glass,'Tempered side glass');side.renderOrder=5;
  const front=box(caseGroup,[0,1.74,1.202],[1.15,2.18,.006],glass,'Tempered front glass');front.renderOrder=5;
  const edge=new THREE.LineBasicMaterial({color:0xa4c5d1,transparent:true,opacity:.38});
  for(const [g,m]of [[panel,side],[caseGroup,front]]){const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),edge);e.position.copy(m.position);g.add(e);}
  const rails=[led(0x26dcff,3),led(0xf351bf,3)];for(const [i,x]of [-.53,.53].entries())for(const y of [.735,2.785])box(caseGroup,[x,y,0],[.014,.014,2.17],rails[i]);
  for(const z of [-1.07,1.07])box(caseGroup,[-.54,1.76,z],[.012,2.02,.012],rails[z<0?0:1]);
  bake(caseGroup);bake(shroud);
 }
 function motherboard(board){
  const d=new THREE.Group();d.name='Raised motherboard hardware';board.add(d);
  box(d,[.419,1.824,-.44],[.022,1.30,1.235],pcb);
  // Fine circuit paths and surface-mount components are real raised geometry.
  const traces=[];for(let i=0;i<38;i++){traces.push([.402,1.22+i*.031,-.71+(i%6)*.12]);}
  batch(d,new THREE.BoxGeometry(.002,.002,.28),silver,traces);
  const smd=[];for(let i=0;i<48;i++)smd.push([.396,1.22+(i%12)*.095,-.95+Math.floor(i/12)*.23]);batch(d,new THREE.BoxGeometry(.022,.027,.042),black,smd);
  const caps=[];for(let i=0;i<10;i++)caps.push([.365,1.74+i*.068,-.78]);for(let i=0;i<8;i++)caps.push([.365,2.28,-.68+i*.083]);batch(d,new THREE.CylinderGeometry(.022,.022,.069,12),silver,caps,[0,0,Math.PI/2]);
  for(const [y,z,h,w]of [[2.03,-.91,.76,.18],[2.39,-.47,.12,.65],[1.35,-.31,.17,.51],[1.57,-.57,.075,.64]]){
   roundBox(d,[.34,y,z],[.15,h,w],white,.009);
   batch(d,new THREE.BoxGeometry(.017,h*.85,.010),silver,Array.from({length:Math.floor(w/.025)},(_,i)=>[.26,y,z-w*.43+i*.025]));
  }
  text(d,'AM5  |  ROG',[.252,2.39,-.47],.52,.040,'#586876');text(d,'M.2 HEATSINK',[.252,1.35,-.31],.35,.035,'#64717d');
  const accent=led(0x985eff,3);box(d,[.255,2.445,-.47],[.008,.01,.60],accent);box(d,[.254,1.415,-.31],[.01,.009,.45],led(0x41f2b1,3));
  const diagnosticCanvas=document.createElement('canvas');diagnosticCanvas.width=256;diagnosticCanvas.height=512;const diagnosticTexture=new THREE.CanvasTexture(diagnosticCanvas);diagnosticTexture.colorSpace=THREE.SRGBColorSpace;
  box(d,[.246,2.06,-.915],[.021,.56,.16],black);
  const diagnostic=mesh(d,new THREE.PlaneGeometry(0.14,0.53),new THREE.MeshBasicMaterial({map:diagnosticTexture,toneMapped:false}),[.233,2.06,-.915],'Motherboard diagnostic display');diagnostic.rotation.y=-Math.PI/2;diagnostic.userData.keep=true;screens.push({canvas:diagnosticCanvas,texture:diagnosticTexture,kind:'board'});
  for(const y of [1.56,1.40,1.24]){box(d,[.373,y,-.47],[.09,.046,.73],white);box(d,[.323,y,-.47],[.006,.013,.67],black);box(d,[.334,y,-.06],[.09,.05,.045],white);}
  for(const z of [-.25,-.1596,-.0607,.04]){box(d,[.388,2.032,z],[.068,.75,.032],white);box(d,[.35,2.032,z],[.007,.71,.012],black);for(const y of [1.65,2.414])box(d,[.35,y,z],[.075,.048,.039],white);}
  cylinder(d,[.375,1.66,-.53],.052,.025,silver,'x',24);
  for(let i=0;i<4;i++)box(d,[.365,1.23+i*.045,.12],[.086,.033,.065],black);
  // Rear motherboard sockets: shield, USB pairs, Ethernet and audio jacks.
  box(d,[.355,2.16,-1.197],[.28,.90,.036],silver);
  for(let i=0;i<4;i++)for(const x of [.29,.42]){box(d,[x,1.93+i*.124,-1.223],[.077,.076,.015],black);box(d,[x,1.929+i*.124,-1.234],[.052,.014,.012],i%2?pcb:steel);}
  box(d,[.29,1.81,-1.225],[.081,.083,.023],black);batch(d,new THREE.BoxGeometry(.003,.029,.005),gold,Array.from({length:8},(_,i)=>[.261+i*.008,1.789,-1.24]));
  for(const [i,color]of [0x75edc0,0xeaa78a,0x819bbc].entries()){const m=new THREE.MeshStandardMaterial({color,metalness:.45,roughness:.4});cylinder(d,[.28+i*.075,1.742,-1.229],.021,.023,m,'z');cylinder(d,[.28+i*.075,1.742,-1.245],.010,.002,black,'z');}
  screws(d,[[.235,2.56,-1.228],[.468,1.733,-1.228]],'z');
  detailed.motherboardBack(d);bake(d);return d;
 }
 function cooler(g,radiator){
  g.userData.coolantRoutes=[];
  roundBox(g,[.29,2.02,-.465],[.16,.34,.36],white,.016);
  const screenCanvas=document.createElement('canvas');screenCanvas.width=screenCanvas.height=256;const texture=new THREE.CanvasTexture(screenCanvas);texture.colorSpace=THREE.SRGBColorSpace;
  box(g,[.173,2.02,-.465],[.018,.307,.326],black);
  const screenMat=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});const screen=mesh(g,new THREE.PlaneGeometry(.30,.28),screenMat,[.162,2.02,-.465],'CPU cooler display');screen.rotation.y=-Math.PI/2;screen.userData.keep=true;
  screens.push({canvas:screenCanvas,texture});
  for(const y of [1.861,2.179])box(g,[.161,y,-.465],[.008,.009,.33],led(0x41d9ff,3));
  roundBox(radiator,[0,2.754,0],[.72,.12,2.13],white,.014);
  batch(radiator,new THREE.BoxGeometry(.59,.027,.009),steel,Array.from({length:79},(_,i)=>[0,2.684,-.98+i*.025]));
  for(const [offset,color]of [[-.045,0x50ceff],[.045,0xee5dbc]]){
   const points=[[.23,1.88,-.465+offset],[-.03,1.82,-.31+offset],[-.18,1.94,.22+offset],[-.14,2.23,.79+offset],[.06,2.73,.97+offset]];
   g.userData.coolantRoutes.push(points);
   tube(g,points,.031,led(color,3.5),52).name='Glowing sealed coolant hose';
   for(const p of [points[0],points.at(-1)])cylinder(g,p,.044,.055,silver,'y');
  }
  bake(g);bake(radiator);
 }
 function cable(points,count=6,axis='z'){
  const g=new THREE.Group();g.name='Visible tied cable';const spacing=.013,index=axis==='y'?1:2;
  for(let i=0;i<count;i++){const offset=(i-(count-1)/2)*spacing;const ps=points.map(p=>{const q=[...p];q[index]+=offset;return q;});tube(g,ps,.0055,cableWhite,32);}
  const width=count*spacing+.016,size=axis==='y'?[.025,width,.025]:[.025,.025,width];
  for(const i of [1,points.length-2])box(g,points[i],size,steel,'Cable comb');
  const ties=new THREE.Group();ties.name='Cable zip ties';g.add(ties);for(const i of [1,points.length-2])box(ties,[points[i][0]-.016,points[i][1],points[i][2]],axis==='y'?[.004,width,.03]:[.004,.03,width],white);
  for(const p of [points[0],points.at(-1)])box(g,p,axis==='y'?[.03,width,.033]:[.03,.033,width],black,'Cable connector');
  bake(g);return g;
 }
 let lastScreen=-1;
 function update(time,power,rgb){
  for(const m of emitters){m.emissiveIntensity=power&&rgb?m.userData.rgb.intensity:0;m.emissive.copy(m.userData.rgb.color);m.color.setHex(power&&rgb?0x080a0d:0xa2aab2);if(m.userData.matrix&&power&&rgb)m.map.offset.x=time*.025;}
  if(time-lastScreen<.1)return;lastScreen=time;
  for(const s of screens){const ctx=s.canvas.getContext('2d');ctx.fillStyle='#060c17';ctx.fillRect(0,0,s.canvas.width,s.canvas.height);if(power&&s.kind==='board'){
   ctx.textAlign='center';ctx.fillStyle='#8aeefd';ctx.font='20px sans-serif';ctx.fillText('SYSTEM',128,44);for(const [i,label,value,color]of [[0,'CPU','36 C','#59e1f7'],[1,'MEMORY','32 GB','#d86cf4'],[2,'STATUS','READY','#76ffc6']]){ctx.fillStyle='#76909f';ctx.font='20px sans-serif';ctx.fillText(label,128,98+i*130);ctx.fillStyle=color;ctx.font='600 32px sans-serif';ctx.fillText(value,128,143+i*130);ctx.fillRect(32,163+i*130,192,.9);}ctx.fillStyle='#62798a';ctx.font='17px sans-serif';ctx.fillText('DEMO',128,490);
  }else if(power){
   const angle=time*.4;ctx.lineWidth=9;ctx.strokeStyle='#203343';ctx.beginPath();ctx.arc(128,122,87,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#37e8fa';ctx.beginPath();ctx.arc(128,122,87,angle,angle+Math.PI*1.5);ctx.stroke();ctx.fillStyle='#dbf7ff';ctx.textAlign='center';ctx.font='500 22px sans-serif';ctx.fillText('CPU',128,87);ctx.font='600 55px sans-serif';ctx.fillText('36°',128,144);ctx.fillStyle='#e273eb';ctx.font='17px sans-serif';ctx.fillText('LIQUID COOLING',128,185);ctx.fillStyle='#718b9e';ctx.font='13px sans-serif';ctx.fillText('DEMO',128,225);
  }s.texture.needsUpdate=true;}
 }
 const detailed=detailedHardware({mesh,box,roundBox,cylinder,batch,screws,text,tube,bake,white,silver,steel,black,pcb,gold,led,rotors});
 return {enclosure,motherboard,cooler,fan,cable,bake,rotors,emitters,screens,update,box,roundBox,cylinder,batch,screws,text,tube,white,silver,steel,black,led,...detailed};
}
